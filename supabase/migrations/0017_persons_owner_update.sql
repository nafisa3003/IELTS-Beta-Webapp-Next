-- 0017_persons_owner_update.sql

create policy "own person row update" on public.persons
  for update using (
    personid in (select personid from public.users where userid = auth.uid())
  )
  with check (
    personid in (select personid from public.users where userid = auth.uid())
  );
