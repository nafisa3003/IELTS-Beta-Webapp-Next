create extension if not exists pgcrypto;

-- 0001_identity.sql
-- Identity chain: auth.users -> persons -> users -> {students | teachers | admins}
-- Supabase owns credentials end-to-end. No password column anywhere here.

create type public.user_role as enum ('student', 'teacher', 'admin');

create table public.persons (
  personid uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  dob date,
  gender text,
  phone text,
  address text,
  created_at timestamptz not null default now()
);

create table public.users (
  userid uuid primary key references auth.users(id) on delete cascade,
  personid uuid not null unique references public.persons(personid) on delete cascade,
  email text not null unique,
  role public.user_role not null,
  created_at timestamptz not null default now()
);

create table public.students (
  studentid uuid primary key default gen_random_uuid(),
  userid uuid not null unique references public.users(userid) on delete cascade,
  target_band numeric(2,1),
  current_band numeric(2,1),
  days_active int not null default 0
);

create table public.teachers (
  teacherid uuid primary key default gen_random_uuid(),
  userid uuid not null unique references public.users(userid) on delete cascade,
  specialization text
);

create table public.admins (
  adminid uuid primary key default gen_random_uuid(),
  userid uuid not null unique references public.users(userid) on delete cascade
);

-- Helper: current caller's role/ids, used across every RLS policy below.
create or replace function public.current_app_role()
returns public.user_role
language sql stable security definer set search_path = public as $$
  select role from public.users where userid = auth.uid();
$$;

create or replace function public.current_student_id()
returns uuid
language sql stable security definer set search_path = public as $$
  select studentid from public.students where userid = auth.uid();
$$;

create or replace function public.current_teacher_id()
returns uuid
language sql stable security definer set search_path = public as $$
  select teacherid from public.teachers where userid = auth.uid();
$$;

alter table public.persons enable row level security;
alter table public.users enable row level security;
alter table public.students enable row level security;
alter table public.teachers enable row level security;
alter table public.admins enable row level security;

create policy "own person row" on public.persons
  for select using (personid in (select personid from public.users where userid = auth.uid()));

create policy "own user row" on public.users
  for select using (userid = auth.uid() or public.current_app_role() = 'admin');

create policy "admin manages roles" on public.users
  for update using (public.current_app_role() = 'admin');

create policy "own student row" on public.students
  for select using (userid = auth.uid() or public.current_app_role() in ('teacher', 'admin'));

create policy "student updates own row" on public.students
  for update using (userid = auth.uid());

create policy "own teacher row" on public.teachers
  for select using (userid = auth.uid() or public.current_app_role() = 'admin');

create policy "own admin row" on public.admins
  for select using (userid = auth.uid());
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
-- 0003_courses.sql

create table public.courses (
  courseid uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  level text,
  duration text,
  created_at timestamptz not null default now()
);

create table public.teacher_courses (
  teachercourseid uuid primary key default gen_random_uuid(),
  teacherid uuid not null references public.teachers(teacherid) on delete cascade,
  courseid uuid not null references public.courses(courseid) on delete cascade,
  assigned_at timestamptz not null default now(),
  is_active boolean not null default true,
  unique (teacherid, courseid)
);

create table public.enrollments (
  enrollid uuid primary key default gen_random_uuid(),
  studentid uuid not null references public.students(studentid) on delete cascade,
  courseid uuid not null references public.courses(courseid) on delete cascade,
  status text not null default 'active' check (status in ('active', 'completed', 'dropped')),
  enroll_date timestamptz not null default now(),
  unique (studentid, courseid)
);

-- "Lessons" in the product UI = contents rows scoped to a course.
create table public.contents (
  contentid uuid primary key default gen_random_uuid(),
  courseid uuid not null references public.courses(courseid) on delete cascade,
  title text not null,
  content_type text not null check (content_type in ('Video', 'PDF', 'YouTube', 'Notes')),
  youtube_link text,
  file_url text,
  created_at timestamptz not null default now()
);

create table public.live_classes (
  classid uuid primary key default gen_random_uuid(),
  teachercourseid uuid not null references public.teacher_courses(teachercourseid) on delete cascade,
  meeting_link text not null,
  class_date timestamptz not null
);

alter table public.courses enable row level security;
alter table public.teacher_courses enable row level security;
alter table public.enrollments enable row level security;
alter table public.contents enable row level security;
alter table public.live_classes enable row level security;

-- Courses: everyone (role-scoped downstream by contents/enrollments) can read.
create policy "read courses" on public.courses for select using (true);
create policy "admin writes courses" on public.courses
  for all using (public.current_app_role() = 'admin');

create policy "read teacher_courses" on public.teacher_courses
  for select using (
    public.current_app_role() = 'admin'
    or teacherid = public.current_teacher_id()
  );
create policy "admin manages teacher_courses" on public.teacher_courses
  for all using (public.current_app_role() = 'admin');

create policy "student manages own enrollments" on public.enrollments
  for select using (
    studentid = public.current_student_id()
    or public.current_app_role() = 'admin'
    or exists (
      select 1 from public.teacher_courses tc
      where tc.courseid = enrollments.courseid
        and tc.teacherid = public.current_teacher_id()
    )
  );
create policy "student self-enrolls" on public.enrollments
  for insert with check (studentid = public.current_student_id());
create policy "student or admin updates enrollment status" on public.enrollments
  for update using (studentid = public.current_student_id() or public.current_app_role() = 'admin');

create policy "read contents if enrolled or staff" on public.contents
  for select using (
    public.current_app_role() in ('admin')
    or exists (
      select 1 from public.enrollments e
      where e.courseid = contents.courseid and e.studentid = public.current_student_id()
    )
    or exists (
      select 1 from public.teacher_courses tc
      where tc.courseid = contents.courseid and tc.teacherid = public.current_teacher_id()
    )
  );
create policy "teacher/admin write contents" on public.contents
  for insert with check (
    public.current_app_role() = 'admin'
    or exists (
      select 1 from public.teacher_courses tc
      where tc.courseid = contents.courseid and tc.teacherid = public.current_teacher_id()
    )
  );
create policy "teacher/admin update contents" on public.contents
  for update using (
    public.current_app_role() = 'admin'
    or exists (
      select 1 from public.teacher_courses tc
      where tc.courseid = contents.courseid and tc.teacherid = public.current_teacher_id()
    )
  );
create policy "teacher/admin delete contents" on public.contents
  for delete using (
    public.current_app_role() = 'admin'
    or exists (
      select 1 from public.teacher_courses tc
      where tc.courseid = contents.courseid and tc.teacherid = public.current_teacher_id()
    )
  );

create policy "live_classes visible to enrolled/staff" on public.live_classes
  for select using (
    public.current_app_role() = 'admin'
    or exists (
      select 1 from public.teacher_courses tc
      where tc.teachercourseid = live_classes.teachercourseid
        and tc.teacherid = public.current_teacher_id()
    )
    or exists (
      select 1 from public.teacher_courses tc
      join public.enrollments e on e.courseid = tc.courseid
      where tc.teachercourseid = live_classes.teachercourseid
        and e.studentid = public.current_student_id()
    )
  );
create policy "teacher manages own live_classes" on public.live_classes
  for all using (
    exists (
      select 1 from public.teacher_courses tc
      where tc.teachercourseid = live_classes.teachercourseid
        and tc.teacherid = public.current_teacher_id()
    )
    or public.current_app_role() = 'admin'
  );
-- 0004_assessment.sql

create table public.practice_tests (
  testid uuid primary key default gen_random_uuid(),
  courseid uuid not null references public.courses(courseid) on delete cascade,
  title text not null,
  category text not null check (category in ('Academic', 'General')),
  duration int not null,
  total_marks int not null
);

create table public.questions (
  questionid uuid primary key default gen_random_uuid(),
  testid uuid not null references public.practice_tests(testid) on delete cascade,
  question text not null,
  skill text not null check (skill in ('Listening', 'Reading', 'Writing', 'Speaking')),
  marks int not null default 1
);

create table public.answer_options (
  optionid uuid primary key default gen_random_uuid(),
  questionid uuid not null references public.questions(questionid) on delete cascade,
  option_text text not null,
  is_correct boolean not null default false
);

create table public.test_attempts (
  attemptid uuid primary key default gen_random_uuid(),
  studentid uuid not null references public.students(studentid) on delete cascade,
  testid uuid not null references public.practice_tests(testid) on delete cascade,
  start_time timestamptz not null default now(),
  submit_time timestamptz,
  score numeric(5,2),
  band_score numeric(2,1)
);

create table public.test_results (
  resultid uuid primary key default gen_random_uuid(),
  attemptid uuid not null unique references public.test_attempts(attemptid) on delete cascade,
  overall_band numeric(2,1),
  listening numeric(2,1),
  reading numeric(2,1),
  writing numeric(2,1),
  speaking numeric(2,1),
  feedback text
);

alter table public.practice_tests enable row level security;
alter table public.questions enable row level security;
alter table public.answer_options enable row level security;
alter table public.test_attempts enable row level security;
alter table public.test_results enable row level security;

create policy "read practice_tests if enrolled or staff" on public.practice_tests
  for select using (
    public.current_app_role() = 'admin'
    or exists (
      select 1 from public.enrollments e
      where e.courseid = practice_tests.courseid and e.studentid = public.current_student_id()
    )
    or exists (
      select 1 from public.teacher_courses tc
      where tc.courseid = practice_tests.courseid and tc.teacherid = public.current_teacher_id()
    )
  );
create policy "admin writes practice_tests" on public.practice_tests
  for all using (public.current_app_role() = 'admin');

create policy "read questions via test access" on public.questions
  for select using (
    exists (
      select 1 from public.practice_tests t where t.testid = questions.testid
    )
  );
create policy "admin writes questions" on public.questions
  for all using (public.current_app_role() = 'admin');

-- Correct answers are never exposed to students pre-submission: only
-- admins/teachers can select is_correct directly; students read options
-- through a view that omits it (see 0004b) or after the attempt is graded.
create policy "staff read answer_options" on public.answer_options
  for select using (public.current_app_role() in ('admin', 'teacher'));
create policy "admin writes answer_options" on public.answer_options
  for all using (public.current_app_role() = 'admin');

create policy "student manages own attempts" on public.test_attempts
  for select using (
    studentid = public.current_student_id()
    or public.current_app_role() = 'admin'
    or exists (
      select 1 from public.practice_tests t
      join public.teacher_courses tc on tc.courseid = t.courseid
      where t.testid = test_attempts.testid and tc.teacherid = public.current_teacher_id()
    )
  );
create policy "student starts own attempt" on public.test_attempts
  for insert with check (studentid = public.current_student_id());
create policy "system updates attempt on submit" on public.test_attempts
  for update using (studentid = public.current_student_id());

create policy "read own test_results" on public.test_results
  for select using (
    exists (
      select 1 from public.test_attempts a
      where a.attemptid = test_results.attemptid
        and (
          a.studentid = public.current_student_id()
          or public.current_app_role() = 'admin'
          or exists (
            select 1 from public.practice_tests t
            join public.teacher_courses tc on tc.courseid = t.courseid
            where t.testid = a.testid and tc.teacherid = public.current_teacher_id()
          )
        )
    )
  );
create policy "system writes test_results" on public.test_results
  for insert with check (
    exists (
      select 1 from public.test_attempts a
      where a.attemptid = test_results.attemptid and a.studentid = public.current_student_id()
    )
  );

-- Student-safe view: answer options without is_correct, for pre-submission rendering.
create view public.answer_options_public as
  select optionid, questionid, option_text from public.answer_options;

grant select on public.answer_options_public to authenticated;
-- 0005_support_ops.sql

create table public.support_tickets (
  ticketid uuid primary key default gen_random_uuid(),
  studentid uuid not null references public.students(studentid) on delete cascade,
  adminid uuid references public.admins(adminid) on delete set null,
  subject text not null,
  message text not null,
  status text not null default 'Open' check (status in ('Open', 'InProgress', 'Resolved')),
  created_at timestamptz not null default now()
);

create table public.announcements (
  announcementid uuid primary key default gen_random_uuid(),
  adminid uuid not null references public.admins(adminid) on delete cascade,
  title text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table public.admin_logs (
  logid uuid primary key default gen_random_uuid(),
  adminid uuid not null references public.admins(adminid) on delete cascade,
  action text not null,
  timestamp timestamptz not null default now(),
  details jsonb
);

alter table public.support_tickets enable row level security;
alter table public.announcements enable row level security;
alter table public.admin_logs enable row level security;

create policy "own or admin support_tickets" on public.support_tickets
  for select using (studentid = public.current_student_id() or public.current_app_role() = 'admin');
create policy "student opens ticket" on public.support_tickets
  for insert with check (studentid = public.current_student_id());
create policy "admin resolves ticket" on public.support_tickets
  for update using (public.current_app_role() = 'admin');

create policy "read announcements" on public.announcements for select using (true);
create policy "admin writes announcements" on public.announcements
  for all using (public.current_app_role() = 'admin');

create policy "admin reads logs" on public.admin_logs
  for select using (public.current_app_role() = 'admin');
create policy "system writes logs" on public.admin_logs
  for insert with check (public.current_app_role() = 'admin');
-- 0006_extensions.sql
-- Non-ERD-native extensions, kept from V1 by explicit decision (see
-- V2-ARCHITECTURE.md §3.5). Gamification is event-driven off assessment
-- activity via the Observer pattern (0007_observer.sql), not a native
-- ERD relationship.

create table public.vocab_words (
  wordid uuid primary key default gen_random_uuid(),
  word text not null unique,
  definition text not null,
  example text
);

create table public.user_saved_words (
  userid uuid not null references public.users(userid) on delete cascade,
  wordid uuid not null references public.vocab_words(wordid) on delete cascade,
  saved_at timestamptz not null default now(),
  primary key (userid, wordid)
);

create table public.user_custom_cards (
  cardid uuid primary key default gen_random_uuid(),
  userid uuid not null references public.users(userid) on delete cascade,
  front text not null,
  back text not null,
  created_at timestamptz not null default now()
);

-- Append-only: rows are inserted by the Observer trigger, never updated.
create table public.xp_ledger (
  entryid uuid primary key default gen_random_uuid(),
  userid uuid not null references public.users(userid) on delete cascade,
  amount int not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table public.streaks (
  userid uuid primary key references public.users(userid) on delete cascade,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_active_date date
);

create table public.achievements (
  achievementid uuid primary key default gen_random_uuid(),
  userid uuid not null references public.users(userid) on delete cascade,
  code text not null,
  earned_at timestamptz not null default now(),
  unique (userid, code)
);

alter table public.vocab_words enable row level security;
alter table public.user_saved_words enable row level security;
alter table public.user_custom_cards enable row level security;
alter table public.xp_ledger enable row level security;
alter table public.streaks enable row level security;
alter table public.achievements enable row level security;

create policy "read vocab_words" on public.vocab_words for select using (true);
create policy "admin writes vocab_words" on public.vocab_words
  for all using (public.current_app_role() = 'admin');

create policy "own saved_words" on public.user_saved_words
  for all using (userid = auth.uid());

create policy "own custom_cards" on public.user_custom_cards
  for all using (userid = auth.uid());

create policy "read own xp_ledger" on public.xp_ledger
  for select using (userid = auth.uid() or public.current_app_role() = 'admin');
create policy "system writes xp_ledger" on public.xp_ledger
  for insert with check (true);

create policy "read own streak" on public.streaks
  for select using (userid = auth.uid() or public.current_app_role() = 'admin');
create policy "system writes streak" on public.streaks
  for all using (userid = auth.uid());

create policy "read own achievements" on public.achievements
  for select using (userid = auth.uid() or public.current_app_role() = 'admin');
create policy "system writes achievements" on public.achievements
  for insert with check (true);
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

-- ===== 0008_capture_dob.sql =====
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

-- ===== 0009_profile_settings.sql =====
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

-- ===== 0010_readable_ids_batches.sql =====
-- 0010_readable_ids_batches.sql
-- V3: human-readable IDs + course batches, requested directly by the user.
-- None of this is in the ERD — same documented-extension pattern as
-- 0006_extensions.sql and 0009_profile_settings.sql. The real PKs
-- (studentid/teacherid/adminid/courseid, all uuid) are untouched; these
-- are additional display-only columns plus one small new table.

-- ============ Part 1: human-readable IDs ============
-- S00001 / T00001 / A00001 style codes, generated by role via a
-- per-role sequence + BEFORE INSERT trigger, never user-editable.

alter table public.students add column if not exists display_id text unique;
alter table public.teachers add column if not exists display_id text unique;
alter table public.admins add column if not exists display_id text unique;

create sequence if not exists public.student_display_seq;
create sequence if not exists public.teacher_display_seq;
create sequence if not exists public.admin_display_seq;

create or replace function public.set_student_display_id()
returns trigger language plpgsql as $$
begin
  if new.display_id is null then
    new.display_id := 'S' || lpad(nextval('public.student_display_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;

create or replace function public.set_teacher_display_id()
returns trigger language plpgsql as $$
begin
  if new.display_id is null then
    new.display_id := 'T' || lpad(nextval('public.teacher_display_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;

create or replace function public.set_admin_display_id()
returns trigger language plpgsql as $$
begin
  if new.display_id is null then
    new.display_id := 'A' || lpad(nextval('public.admin_display_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_student_display_id on public.students;
create trigger trg_student_display_id before insert on public.students
  for each row execute function public.set_student_display_id();

drop trigger if exists trg_teacher_display_id on public.teachers;
create trigger trg_teacher_display_id before insert on public.teachers
  for each row execute function public.set_teacher_display_id();

drop trigger if exists trg_admin_display_id on public.admins;
create trigger trg_admin_display_id before insert on public.admins
  for each row execute function public.set_admin_display_id();

-- Backfill any rows that existed before this migration, oldest first so
-- IDs read as a natural signup order, then fast-forward each sequence
-- past the backfilled count so new signups never collide with them.
do $$
declare
  cnt int;
begin
  update public.students s set display_id = sub.code
  from (
    select studentid, 'S' || lpad(row_number() over (order by studentid)::text, 5, '0') as code
    from public.students where display_id is null
  ) sub
  where s.studentid = sub.studentid;
  select count(*) into cnt from public.students;
  perform setval('public.student_display_seq', cnt, true);

  update public.teachers t set display_id = sub.code
  from (
    select teacherid, 'T' || lpad(row_number() over (order by teacherid)::text, 5, '0') as code
    from public.teachers where display_id is null
  ) sub
  where t.teacherid = sub.teacherid;
  select count(*) into cnt from public.teachers;
  perform setval('public.teacher_display_seq', cnt, true);

  update public.admins a set display_id = sub.code
  from (
    select adminid, 'A' || lpad(row_number() over (order by adminid)::text, 5, '0') as code
    from public.admins where display_id is null
  ) sub
  where a.adminid = sub.adminid;
  select count(*) into cnt from public.admins;
  perform setval('public.admin_display_seq', cnt, true);
end $$;

-- ============ Part 2: course codes ============
alter table public.courses add column if not exists course_code text unique;

create sequence if not exists public.course_code_seq;

create or replace function public.set_course_code()
returns trigger language plpgsql as $$
begin
  if new.course_code is null then
    new.course_code := 'C' || lpad(nextval('public.course_code_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_course_code on public.courses;
create trigger trg_course_code before insert on public.courses
  for each row execute function public.set_course_code();

do $$
declare cnt int;
begin
  update public.courses c set course_code = sub.code
  from (
    select courseid, 'C' || lpad(row_number() over (order by courseid)::text, 4, '0') as code
    from public.courses where course_code is null
  ) sub
  where c.courseid = sub.courseid;
  select count(*) into cnt from public.courses;
  perform setval('public.course_code_seq', cnt, true);
end $$;

-- ============ Part 3: course batches ============
-- A batch is a scheduled cohort/intake of a course — lets the same course
-- run multiple times with its own start date, seat count, and enrollment
-- deadline, and gives enrollment a real, non-fabricated basis for urgency
-- CTAs ("Batch 3 — 4 seats left" / "closes in 3 days") instead of making
-- up a seasonal sale.

create table public.course_batches (
  batchid uuid primary key default gen_random_uuid(),
  courseid uuid not null references public.courses(courseid) on delete cascade,
  batch_number int not null,
  batch_code text not null,
  starts_on date,
  seats_total int,
  enrollment_deadline date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (courseid, batch_number)
);

alter table public.course_batches enable row level security;
create policy "read batches" on public.course_batches for select using (true);
create policy "admin writes batches" on public.course_batches
  for all using (public.current_app_role() = 'admin');

-- Enrollment optionally ties to a specific batch. Nullable: existing
-- enrollments and any course without batches configured stay valid.
alter table public.enrollments add column if not exists batchid uuid references public.course_batches(batchid) on delete set null;

-- 0011_role_promotion_fix.sql
-- V3 bugfix: promoting a user's role via the admin Users page only ever
-- updated users.role — there was no RLS policy letting anyone but the
-- signup trigger (which runs security definer) insert into
-- students/teachers/admins. So a "promoted" teacher/admin could get past
-- the middleware's role check but had no actual teacherid/adminid behind
-- them, meaning every real feature for that role silently found nothing.
-- This adds the missing insert policies so admin-driven promotion can
-- actually create the subtype row it's supposed to.

create policy "admin creates student row" on public.students
  for insert with check (public.current_app_role() = 'admin');

create policy "admin creates teacher row" on public.teachers
  for insert with check (public.current_app_role() = 'admin');

create policy "admin creates admin row" on public.admins
  for insert with check (public.current_app_role() = 'admin');


-- 0012_user_onboarding_table.sql

CREATE TABLE IF NOT EXISTS public.user_onboarding (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  has_taken_ielts boolean,
  current_band numeric(2,1),
  target_band numeric(2,1),
  test_type text CHECK (test_type IN ('academic', 'general')),
  exam_date date,
  focus_areas text[] DEFAULT '{}',
  onboarding_completed boolean DEFAULT false,
  onboarding_step integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own onboarding"
  ON public.user_onboarding FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding"
  ON public.user_onboarding FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding"
  ON public.user_onboarding FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- 0013_persons_visibility_and_streaks.sql

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

-- 0016_add_custom_card_fields.sql
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

-- 0017_persons_owner_update.sql

create policy "own person row update" on public.persons
  for update using (
    personid in (select personid from public.users where userid = auth.uid())
  )
  with check (
    personid in (select personid from public.users where userid = auth.uid())
  );

-- 0018_admin_read_all_admins.sql

drop policy if exists "own admin row" on public.admins;
create policy "own admin row" on public.admins
  for select using (userid = auth.uid() or public.current_app_role() = 'admin');

-- 0019_teacher_reads_student_users.sql
create policy "teacher reads student users" on public.users
  for select using (
    public.current_app_role() = 'teacher'
    and role = 'student'
  );

-- 0020_reading_listening_upgrade.sql

alter table public.practice_tests
  add column audio_url text;

create table public.passages (
  passageid uuid primary key default gen_random_uuid(),
  testid uuid not null references public.practice_tests(testid) on delete cascade,
  title text not null,
  passage_text text not null,
  order_index int not null default 1
);

alter table public.questions
  add column passageid uuid references public.passages(passageid) on delete cascade;

create table public.written_responses (
  responseid uuid primary key default gen_random_uuid(),
  attemptid uuid not null references public.test_attempts(attemptid) on delete cascade,
  questionid uuid not null references public.questions(questionid) on delete cascade,
  answer_text text not null default '',
  unique (attemptid, questionid)
);

alter table public.passages enable row level security;
alter table public.written_responses enable row level security;

create policy "read passages via test access" on public.passages
  for select using (
    exists (select 1 from public.practice_tests t where t.testid = passages.testid)
  );
create policy "admin writes passages" on public.passages
  for all using (public.current_app_role() = 'admin');

create policy "student manages own written_responses" on public.written_responses
  for select using (
    exists (
      select 1 from public.test_attempts a
      where a.attemptid = written_responses.attemptid
        and (
          a.studentid = public.current_student_id()
          or public.current_app_role() = 'admin'
          or exists (
            select 1 from public.practice_tests t
            join public.teacher_courses tc on tc.courseid = t.courseid
            join public.questions q on q.testid = t.testid
            where q.questionid = written_responses.questionid and tc.teacherid = public.current_teacher_id()
          )
        )
    )
  );
create policy "system writes written_responses" on public.written_responses
  for insert with check (
    exists (
      select 1 from public.test_attempts a
      where a.attemptid = written_responses.attemptid and a.studentid = public.current_student_id()
    )
  );

-- 0021_listening_audio_storage_policy.sql

-- Allow admins to upload audio files into the listening-audio bucket
create policy "admin uploads listening audio"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'listening-audio'
  and public.current_app_role() = 'admin'
);

-- Allow admins to update/replace existing audio files
create policy "admin updates listening audio"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'listening-audio'
  and public.current_app_role() = 'admin'
);

-- Allow admins to delete audio files
create policy "admin deletes listening audio"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'listening-audio'
  and public.current_app_role() = 'admin'
);

-- Public read (needed for the <audio> tag to actually play the file for students)
create policy "anyone reads listening audio"
on storage.objects
for select
to public
using (bucket_id = 'listening-audio');

-- 0023_student_reads_teacher_courses.sql

create or replace function public.student_is_enrolled_in_course(p_courseid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.enrollments e
    where e.courseid = p_courseid
      and e.studentid = public.current_student_id()
      and e.status = 'active'
  );
$$;

create policy "student reads enrolled teacher_courses"
on public.teacher_courses
for select
to authenticated
using (public.student_is_enrolled_in_course(teacher_courses.courseid));
