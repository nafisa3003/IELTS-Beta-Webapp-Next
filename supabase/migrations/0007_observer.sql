-- 0007_observer.sql
-- Observer pattern: test_attempts is the subject. Scoring itself (Strategy
-- pattern — objective auto-score vs. rubric/AI-assisted) runs in the app
-- layer and writes band_score + test_results. This trigger is the
-- fan-out: the moment an attempt transitions from ungraded to graded, it
-- notifies two independent observers without test_attempts knowing about
-- either one — an admin_logs entry, and an XP award appended to xp_ledger.

create or replace function public.on_attempt_graded()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  attempt_userid uuid;
  xp_amount int;
begin
  if new.band_score is not null and old.band_score is null then
    select u.userid into attempt_userid
    from public.students s
    join public.users u on u.userid = s.userid
    where s.studentid = new.studentid;

    xp_amount := greatest(round(new.band_score * 10), 10);

    insert into public.xp_ledger (userid, amount, reason)
    values (attempt_userid, xp_amount, 'practice_test_completed');

    -- Best-effort log entry attributed to the system; skipped if no admin
    -- rows exist yet (e.g. fresh dev database).
    insert into public.admin_logs (adminid, action, details)
    select a.adminid, 'test_attempt_graded',
           jsonb_build_object('attemptid', new.attemptid, 'band_score', new.band_score)
    from public.admins a
    limit 1;
  end if;

  return new;
end;
$$;

create trigger trg_attempt_graded
  after update on public.test_attempts
  for each row execute function public.on_attempt_graded();
