-- 0008_capture_dob.sql
-- V3: persons.dob already existed in the schema (0001_identity.sql) but
-- handle_new_user() never read it from signup metadata, so it was always
-- null. This replaces the trigger function to also capture dob, so we can
-- see the age-group distribution of users. No new columns, no data loss —
-- additive only, safe to run on top of an already-applied 0001-0007.

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

  -- dob is optional at the DB layer (nullable column); the signup form
  -- requires it, but the trigger stays defensive for rows created any
  -- other way (e.g. an admin inviting a user directly in Supabase).
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

  return new;
end;
$$;
