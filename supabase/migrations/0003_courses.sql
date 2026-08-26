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
