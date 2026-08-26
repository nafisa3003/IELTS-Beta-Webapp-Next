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
