-- 0018_admin_read_all_admins.sql

drop policy if exists "own admin row" on public.admins;
create policy "own admin row" on public.admins
  for select using (userid = auth.uid() or public.current_app_role() = 'admin');
