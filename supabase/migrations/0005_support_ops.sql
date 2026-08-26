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
