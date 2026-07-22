-- Connor's String Theory — migration 0001: trainer-side access
-- Run in the Supabase SQL editor AFTER supabase/schema.sql (which is
-- already applied to the live project). This is the first file in
-- supabase/migrations/ — going forward, schema.sql represents "what a
-- fresh database looks like" and changes after the fact land here as
-- numbered, incremental files instead of hand-editing schema.sql, since
-- re-running it whole would now fail on "relation already exists".
--
-- Adds: trainer-wide read access to bookings/dogs/profiles (a trainer
-- needs to see every client, not just their own row), a trainer update
-- path for bookings (confirm a session, add a summary), and a simple
-- income/expense ledger for Connor's own self-employed bookkeeping.

-- ── Trainer-wide SELECT access ──────────────────────────────────────────
-- Existing owner-scoped policies (user_id = auth.uid()) stay as they are;
-- these are additive — Postgres ORs multiple permissive policies together
-- for the same command, so a client's own-row access is unaffected.

create policy "Trainers can read every booking" on connorst.bookings
  for select using (
    exists (select 1 from connorst.profiles where id = auth.uid() and role = 'trainer')
  );

create policy "Trainers can read every dog" on connorst.dogs
  for select using (
    exists (select 1 from connorst.profiles where id = auth.uid() and role = 'trainer')
  );

create policy "Trainers can read every profile" on connorst.profiles
  for select using (
    exists (select 1 from connorst.profiles p where p.id = auth.uid() and p.role = 'trainer')
  );

-- ── Trainer write access to bookings ─────────────────────────────────────
-- Confirming a session or adding a summary is a trainer action, distinct
-- from the client's own narrow update policy (date/time/notes/status,
-- pending-only). This one has no such restriction — the trainer can move
-- a booking through any status and set session_summary.
create policy "Trainers can update any booking" on connorst.bookings
  for update using (
    exists (select 1 from connorst.profiles where id = auth.uid() and role = 'trainer')
  );

-- The client-side column grant (see schema.sql) restricted `authenticated`
-- to a handful of columns table-wide, which would otherwise also box in
-- this new trainer policy — column grants aren't per-policy, only
-- per-role. Trainers need the full column set back.
grant update on connorst.bookings to authenticated;

-- ── income_entries (Connor's own bookkeeping — "HMRC" log) ─────────────
-- Simple ledger, not a real accounting system: a running list Connor adds
-- to by hand (optionally linked to a booking for quick income entries),
-- with a category to separate income from outgoings. No tax calculation,
-- no filing integration — just a record he can total up himself.
create table connorst.income_entries (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references connorst.bookings(id),
  entry_date date not null default current_date,
  amount numeric(10, 2) not null,
  kind text not null check (kind in ('income', 'expense')),
  category text,
  notes text,
  created_at timestamptz not null default now()
);

alter table connorst.income_entries enable row level security;

create policy "Trainers can manage the income log" on connorst.income_entries
  for all using (
    exists (select 1 from connorst.profiles where id = auth.uid() and role = 'trainer')
  ) with check (
    exists (select 1 from connorst.profiles where id = auth.uid() and role = 'trainer')
  );
