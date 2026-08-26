-- 0009_profile_settings.sql
-- V3: profile picture + settings, requested directly by the user this
-- session. Neither is in the ERD. Following the same explicit-extension
-- pattern as 0006_extensions.sql (vocabulary/gamification) rather than
-- silently bending the ERD — additive only, every ERD table/column is
-- untouched.

-- Extension 1: avatar_url on persons. A single nullable column, not a new
-- table — a profile picture is 1:1 with a person, doesn't warrant its own
-- entity.
alter table public.persons add column if not exists avatar_url text;

-- Extension 2: user_settings. App-level preferences (notifications,
-- reminders) that don't belong on any ERD entity. Theme (light/dark) is
-- intentionally NOT stored here — it's a client-side next-themes
-- preference, no account round-trip needed for that one.
create table public.user_settings (
  userid uuid primary key references public.users(userid) on delete cascade,
  email_notifications boolean not null default true,
  streak_reminders boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

create policy "own settings" on public.user_settings
  for all using (userid = auth.uid());

-- Give every existing user a default settings row so the profile page
-- never has to handle "row doesn't exist yet" as a special case.
insert into public.user_settings (userid)
select userid from public.users
on conflict (userid) do nothing;

-- Auto-create a settings row for every future signup too, chained onto
-- the same Factory Method trigger rather than a second trigger — simplest
-- way to guarantee the row always exists.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  new_person_id uuid;
  requested_role public.user_role;
  requested_dob date;
begin
  requested_role := coalesce(
    (new.raw_user_meta_data->>'role')::public.user_role,
    'student'
  );

  begin
    requested_dob := (new.raw_user_meta_data->>'dob')::date;
  exception when others then
    requested_dob := null;
  end;

  insert into public.persons (first_name, last_name, dob)
  values (
    coalesce(new.raw_user_meta_data->>'first_name', 'New'),
    coalesce(new.raw_user_meta_data->>'last_name', 'User'),
    requested_dob
  )
  returning personid into new_person_id;

  insert into public.users (userid, personid, email, role)
  values (new.id, new_person_id, new.email, requested_role);

  case requested_role
    when 'student' then
      insert into public.students (userid) values (new.id);
    when 'teacher' then
      insert into public.teachers (userid) values (new.id);
    when 'admin' then
      insert into public.admins (userid) values (new.id);
  end case;

  insert into public.user_settings (userid) values (new.id);

  return new;
end;
$$;

-- Storage bucket for avatars. Public-read (avatars are meant to be seen
-- app-wide), write restricted to the owner via a userid-prefixed path
-- convention: avatars/{userid}/{filename}.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatar images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "users upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
