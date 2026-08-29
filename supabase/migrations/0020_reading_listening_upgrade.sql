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
