-- Recreate the trigger safely if this migration is ever re-run.
drop trigger if exists trg_sync_onboarding_bands
on public.user_onboarding;

create trigger trg_sync_onboarding_bands
after insert or update of current_band, target_band
on public.user_onboarding
for each row
execute function public.sync_onboarding_bands();

update public.students s
set
  current_band = coalesce(o.current_band, s.current_band),
  target_band = coalesce(o.target_band, s.target_band)
from public.user_onboarding o
where s.userid = o.user_id
  and (o.current_band is not null or o.target_band is not null);


-- Adds the fields the Custom Cards CRUD UI needs (example sentence + difficulty)
-- Safe to run once; guards with IF NOT EXISTS equivalents via DO blocks.

ALTER TABLE public.user_custom_cards
  ADD COLUMN IF NOT EXISTS example text,
  ADD COLUMN IF NOT EXISTS difficulty text;

ALTER TABLE public.user_custom_cards
  DROP CONSTRAINT IF EXISTS user_custom_cards_difficulty_check;

ALTER TABLE public.user_custom_cards
  ADD CONSTRAINT user_custom_cards_difficulty_check
  CHECK (difficulty IS NULL OR difficulty IN ('easy', 'medium', 'hard'));