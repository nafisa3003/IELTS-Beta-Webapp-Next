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
