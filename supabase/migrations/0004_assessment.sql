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
