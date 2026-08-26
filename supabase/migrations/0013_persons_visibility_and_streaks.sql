create policy "admin reads all persons" on public.persons
  for select using (public.current_app_role() = 'admin');

create policy "teacher reads student persons" on public.persons
  for select using (
    public.current_app_role() = 'teacher'
    and personid in (select u.personid from public.users u where u.role = 'student')
  );

insert into public.students (userid)
select u.userid from public.users u
where u.role = 'student' and not exists (select 1 from public.students s where s.userid = u.userid);

insert into public.teachers (userid)
select u.userid from public.users u
where u.role = 'teacher' and not exists (select 1 from public.teachers t where t.userid = u.userid);

insert into public.admins (userid)
select u.userid from public.users u
where u.role = 'admin' and not exists (select 1 from public.admins a where a.userid = u.userid);

create or replace function public.on_attempt_graded()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  attempt_userid uuid;
  xp_amount int;
  existing public.streaks%rowtype;
begin
  if new.band_score is not null and old.band_score is null then
    select u.userid into attempt_userid
    from public.students s
    join public.users u on u.userid = s.userid
    where s.studentid = new.studentid;

    xp_amount := greatest(round(new.band_score * 10), 10);

    insert into public.xp_ledger (userid, amount, reason)
    values (attempt_userid, xp_amount, 'practice_test_completed');

    insert into public.admin_logs (adminid, action, details)
    select a.adminid, 'test_attempt_graded',
           jsonb_build_object('attemptid', new.attemptid, 'band_score', new.band_score)
    from public.admins a
    limit 1;

    select * into existing from public.streaks where userid = attempt_userid;

    if existing.userid is null then
      insert into public.streaks (userid, current_streak, longest_streak, last_active_date)
      values (attempt_userid, 1, 1, current_date);
    elsif existing.last_active_date = current_date then
      -- already active today, no change
      null;
    elsif existing.last_active_date = current_date - 1 then
      update public.streaks
        set current_streak = existing.current_streak + 1,
            longest_streak = greatest(existing.longest_streak, existing.current_streak + 1),
            last_active_date = current_date
        where userid = attempt_userid;
    else
      update public.streaks
        set current_streak = 1,
            last_active_date = current_date
        where userid = attempt_userid;
    end if;
  end if;

  return new;
end;
$$;