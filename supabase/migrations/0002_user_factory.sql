-- 0002_user_factory.sql
-- Factory Method pattern: one entry point (handle_new_user) that reads the
-- role requested at signup (auth.users.raw_user_meta_data->>'role') and
-- creates the correct concrete subtype row (student/teacher/admin), after
-- inserting the shared Person + Users rows. Runs as a single transaction
-- via the AFTER INSERT trigger on auth.users, so a failed subtype insert
-- rolls back the whole signup.

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  new_person_id uuid;
  requested_role public.user_role;
begin
  requested_role := coalesce(
    (new.raw_user_meta_data->>'role')::public.user_role,
    'student'
  );

  insert into public.persons (first_name, last_name)
  values (
    coalesce(new.raw_user_meta_data->>'first_name', 'New'),
    coalesce(new.raw_user_meta_data->>'last_name', 'User')
  )
  returning personid into new_person_id;

  insert into public.users (userid, personid, email, role)
  values (new.id, new_person_id, new.email, requested_role);

  -- Factory Method: dispatch to the correct concrete subtype table.
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
