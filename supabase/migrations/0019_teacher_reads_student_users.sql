-- 0019_teacher_reads_student_users.sql
create policy "teacher reads student users" on public.users
  for select using (
    public.current_app_role() = 'teacher'
    and role = 'student'
  );
