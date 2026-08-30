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