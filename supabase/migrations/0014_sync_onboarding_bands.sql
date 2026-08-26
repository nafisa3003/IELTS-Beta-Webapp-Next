-- 0014_sync_onboarding_bands.sql

create or replace function public.sync_onboarding_bands()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.current_band is not null or new.target_band is not null then

    update public.students
    set
      current_band = coalesce(new.current_band, current_band),
      target_band = coalesce(new.target_band, target_band)
    where userid = new.user_id;

  end if;

  return new;
end;
$$;


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