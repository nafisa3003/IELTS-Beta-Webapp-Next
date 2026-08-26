-- 0016_fix_streak_and_gamification.sql

-- 1. FIX: Create the missing trigger that was never attached

DROP TRIGGER IF EXISTS attempt_graded_trigger ON public.test_attempts;

CREATE TRIGGER attempt_graded_trigger
AFTER UPDATE OF band_score ON public.test_attempts
FOR EACH ROW
WHEN (OLD.band_score IS NULL AND NEW.band_score IS NOT NULL)
EXECUTE FUNCTION public.on_attempt_graded();

-- 2. NEW: General activity tracker for non-test activities

CREATE OR REPLACE FUNCTION public.record_activity(p_userid UUID, p_activity_type TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing streaks%rowtype;
  xp_amount int;
  streak_updated boolean := false;
  new_current int;
  new_longest int;
  result JSONB;
BEGIN
  -- XP amounts per activity
  xp_amount := CASE p_activity_type
    WHEN 'daily_login' THEN 1
    WHEN 'vocab_card' THEN 5
    WHEN 'save_word' THEN 2
    WHEN 'enroll' THEN 10
    WHEN 'lesson_view' THEN 5
    WHEN 'test_complete' THEN 0  -- handled by trigger, but fallback
    ELSE 1
  END;

  -- Award XP (prevent duplicate daily login XP)
  IF p_activity_type != 'daily_login' OR NOT EXISTS (
    SELECT 1 FROM xp_ledger 
    WHERE userid = p_userid 
      AND reason = 'daily_login' 
      AND created_at::date = current_date
  ) THEN
    INSERT INTO xp_ledger (userid, amount, reason)
    VALUES (p_userid, xp_amount, p_activity_type);
  END IF;

  -- Update streak
  SELECT * INTO existing FROM streaks WHERE userid = p_userid;

  IF existing.userid IS NULL THEN
    INSERT INTO streaks (userid, current_streak, longest_streak, last_active_date)
    VALUES (p_userid, 1, 1, current_date);
    new_current := 1;
    new_longest := 1;
    streak_updated := true;
  ELSIF existing.last_active_date = current_date THEN
    new_current := existing.current_streak;
    new_longest := existing.longest_streak;
  ELSIF existing.last_active_date = current_date - interval '1 day' THEN
    new_current := existing.current_streak + 1;
    new_longest := GREATEST(existing.longest_streak, new_current);
    UPDATE streaks
      SET current_streak = new_current,
          longest_streak = new_longest,
          last_active_date = current_date
      WHERE userid = p_userid;
    streak_updated := true;
  ELSE
    new_current := 1;
    new_longest := GREATEST(existing.longest_streak, 1);
    UPDATE streaks
      SET current_streak = 1,
          longest_streak = new_longest,
          last_active_date = current_date
      WHERE userid = p_userid;
    streak_updated := true;
  END IF;

  -- Check achievements
  PERFORM public.check_achievements(p_userid);

  result := jsonb_build_object(
    'xp_awarded', xp_amount,
    'streak_updated', streak_updated,
    'current_streak', new_current,
    'longest_streak', new_longest
  );

  RETURN result;
END;
$$;

-- 3. NEW: Achievement checker

CREATE OR REPLACE FUNCTION public.check_achievements(p_userid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_xp int;
  current_streak_val int;
  longest_streak_val int;
  test_count int;
  vocab_count int;
  achievement_code TEXT;
BEGIN
  -- Get stats
  SELECT COALESCE(SUM(amount), 0) INTO total_xp FROM xp_ledger WHERE userid = p_userid;
  SELECT current_streak, longest_streak INTO current_streak_val, longest_streak_val
    FROM streaks WHERE userid = p_userid;
  SELECT COUNT(*) INTO test_count FROM test_attempts a
    JOIN students s ON s.studentid = a.studentid
    WHERE s.userid = p_userid AND a.band_score IS NOT NULL;
  SELECT COUNT(*) INTO vocab_count FROM vocab_words WHERE userid = p_userid;

  -- First Steps
  IF test_count >= 1 THEN
    INSERT INTO achievements (userid, code) VALUES (p_userid, 'first_steps')
      ON CONFLICT (userid, code) DO NOTHING;
  END IF;

  -- Vocab Builder
  IF vocab_count >= 10 THEN
    INSERT INTO achievements (userid, code) VALUES (p_userid, 'vocab_builder')
      ON CONFLICT (userid, code) DO NOTHING;
  END IF;

  -- On Fire (7 days)
  IF current_streak_val >= 7 THEN
    INSERT INTO achievements (userid, code) VALUES (p_userid, 'on_fire')
      ON CONFLICT (userid, code) DO NOTHING;
  END IF;

  -- Unstoppable (30 days)
  IF current_streak_val >= 30 THEN
    INSERT INTO achievements (userid, code) VALUES (p_userid, 'unstoppable')
      ON CONFLICT (userid, code) DO NOTHING;
  END IF;

  -- Legendary (100 days)
  IF current_streak_val >= 100 THEN
    INSERT INTO achievements (userid, code) VALUES (p_userid, 'legendary')
      ON CONFLICT (userid, code) DO NOTHING;
  END IF;

  -- XP milestones
  IF total_xp >= 100 THEN
    INSERT INTO achievements (userid, code) VALUES (p_userid, 'xp_100')
      ON CONFLICT (userid, code) DO NOTHING;
  END IF;
  IF total_xp >= 500 THEN
    INSERT INTO achievements (userid, code) VALUES (p_userid, 'xp_500')
      ON CONFLICT (userid, code) DO NOTHING;
  END IF;
  IF total_xp >= 1000 THEN
    INSERT INTO achievements (userid, code) VALUES (p_userid, 'xp_1000')
      ON CONFLICT (userid, code) DO NOTHING;
  END IF;
END;
$$;


-- 4. FIX: Ensure achievements table has unique constraint

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'achievements_userid_code_unique'
  ) THEN
    CREATE UNIQUE INDEX achievements_userid_code_unique 
      ON public.achievements(userid, code);
  END IF;
EXCEPTION WHEN duplicate_table THEN
  NULL;
END $$;


-- 5. NEW: Daily challenge tracking

CREATE TABLE IF NOT EXISTS public.daily_challenges (
  challengeid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  userid uuid NOT NULL REFERENCES public.users(userid) ON DELETE CASCADE,
  challenge_type text NOT NULL,
  target int NOT NULL DEFAULT 1,
  progress int NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  assigned_date date NOT NULL DEFAULT current_date,
  UNIQUE(userid, challenge_type, assigned_date)
);

ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read own challenges" ON public.daily_challenges;

CREATE POLICY "read own challenges" ON public.daily_challenges
  FOR SELECT USING (userid = auth.uid());
CREATE POLICY "system writes challenges" ON public.daily_challenges
  FOR ALL USING (public.current_app_role() = 'admin');


-- 6. NEW: Function to get or create today's challenge

CREATE OR REPLACE FUNCTION public.get_daily_challenge(p_userid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  challenge daily_challenges%rowtype;
  challenge_types text[] := ARRAY['complete_test', 'create_vocab', 'save_words', 'study_lesson'];
  selected_type text;
  result JSONB;
BEGIN
  SELECT * INTO challenge FROM daily_challenges
  WHERE userid = p_userid AND assigned_date = current_date;

  IF challenge.challengeid IS NULL THEN
    selected_type := challenge_types[1 + (extract(dow from current_date)::int % 4)];
    
    INSERT INTO daily_challenges (userid, challenge_type, target, assigned_date)
    VALUES (p_userid, selected_type, 
      CASE selected_type
        WHEN 'complete_test' THEN 1
        WHEN 'create_vocab' THEN 3
        WHEN 'save_words' THEN 5
        WHEN 'study_lesson' THEN 1
      END,
      current_date
    )
    RETURNING * INTO challenge;
  END IF;

  result := jsonb_build_object(
    'type', challenge.challenge_type,
    'target', challenge.target,
    'progress', challenge.progress,
    'completed', challenge.completed
  );
  
  RETURN result;
END;
$$;