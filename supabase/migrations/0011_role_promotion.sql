create policy "admin creates student row" on public.students
  for insert with check (public.current_app_role() = 'admin');

create policy "admin creates teacher row" on public.teachers
  for insert with check (public.current_app_role() = 'admin');

create policy "admin creates admin row" on public.admins
  for insert with check (public.current_app_role() = 'admin');