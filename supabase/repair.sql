-- Connor's String Theory — full schema repair / setup script
-- Safe to run against a fresh database OR the existing live project —
-- every statement is idempotent (IF NOT EXISTS / CREATE OR REPLACE / drop
-- policy or trigger before recreating it). Consolidates schema.sql +
-- migrations/0001_trainer_access.sql + migrations/0002_tax_pot.sql, plus
-- the pieces that were missing entirely: ensure_profile() self-repair,
-- the trainer's SELECT policy on messages, the storage bucket itself, and
-- (this revision) connorst.is_trainer() to fix an infinite-recursion bug
-- in every "trainer can read everything" policy inherited from the
-- original migration — see the comment above that function for why.
--
-- REQUIRED MANUAL STEP, BEFORE running this script does anything useful:
--   Supabase Dashboard → Project Settings → API → Exposed schemas → add
--   `connorst` (and save). Without this, every request the app makes to
--   any connorst table/function 404s or errors "Invalid schema
--   connorst" no matter how correct everything below is — PostgREST
--   simply won't route to a schema it hasn't been told to expose.
--
-- Run this whole file in the Supabase SQL editor. It targets the same
-- project as Tenant Passport but everything lives in its own `connorst`
-- schema — nothing here touches `public` or any Tenant Passport table.

create schema if not exists connorst;

grant usage on schema connorst to anon, authenticated;
alter default privileges in schema connorst grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema connorst grant execute on functions to authenticated;

-- ── profiles ────────────────────────────────────────────────────────────
create table if not exists connorst.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'client' check (role in ('client', 'trainer')),
  referral_code text not null unique,
  referred_by uuid references connorst.profiles(id),
  notification_prefs jsonb not null default '{"push_enabled": true, "homework_reminders": true, "message_alerts": true, "session_reminders": true}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tax Pot column (migration 0002) — safe no-op if it's already there.
alter table connorst.profiles add column if not exists tax_rate numeric not null default 30;

create or replace function connorst.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace trigger profiles_set_updated_at
  before update on connorst.profiles
  for each row execute function connorst.set_updated_at();

create or replace function connorst.generate_referral_code()
returns text language plpgsql as $$
declare
  candidate text;
  taken boolean;
begin
  loop
    candidate := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    select exists(select 1 from connorst.profiles where referral_code = candidate) into taken;
    exit when not taken;
  end loop;
  return candidate;
end;
$$;

create or replace function connorst.handle_new_user()
returns trigger language plpgsql security definer set search_path = connorst, public as $$
declare
  v_referrer uuid;
begin
  if new.raw_user_meta_data ? 'referral_code' and length(coalesce(new.raw_user_meta_data->>'referral_code', '')) > 0 then
    select id into v_referrer from connorst.profiles
      where referral_code = upper(new.raw_user_meta_data->>'referral_code');
  end if;

  insert into connorst.profiles (id, full_name, referral_code, referred_by)
  values (new.id, new.raw_user_meta_data->>'full_name', connorst.generate_referral_code(), v_referrer)
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Named connorst_on_auth_user_created, not the more obvious
-- on_auth_user_created — auth.users is one physical table shared with
-- Tenant Passport, and trigger names aren't namespaced per schema, only
-- per table. Every trigger on auth.users needs a name unique across BOTH
-- apps, not just within connorst.
drop trigger if exists connorst_on_auth_user_created on auth.users;
create trigger connorst_on_auth_user_created
  after insert on auth.users
  for each row execute function connorst.handle_new_user();

-- Self-repair RPC: called by the app whenever a signed-in user has no
-- matching profiles row yet (the trigger above didn't fire in time, or —
-- Connor's case — the account was created directly in the dashboard in a
-- way that raced it) or the initial fetch otherwise came back empty. Never
-- silently treated as "must be a client" — this either returns the real
-- row or the app shows a recoverable error instead.
create or replace function connorst.ensure_profile()
returns connorst.profiles
language plpgsql
security definer
set search_path = connorst, public
as $$
declare
  v_profile connorst.profiles;
begin
  select * into v_profile from connorst.profiles where id = auth.uid();
  if found then
    return v_profile;
  end if;

  insert into connorst.profiles (id, full_name, referral_code)
  values (auth.uid(), null, connorst.generate_referral_code())
  on conflict (id) do nothing;

  select * into v_profile from connorst.profiles where id = auth.uid();
  return v_profile;
end;
$$;

grant execute on function connorst.ensure_profile() to authenticated;

-- Every "trainers can read/write everything" policy below needs to check
-- "is the current user a trainer?", which means reading profiles.role.
-- Doing that with an inline `exists (select 1 from connorst.profiles
-- where id = auth.uid() and role = 'trainer')` directly inside a POLICY
-- ON connorst.profiles causes Postgres to recurse: evaluating that
-- policy requires evaluating profiles' own SELECT policies again,
-- including itself — "infinite recursion detected in policy for relation
-- profiles". And because every OTHER trainer-check policy (on dogs,
-- bookings, messages, media, ...) also queries profiles, touching ANY of
-- those tables under RLS pulls in the same broken policy and recurses
-- too — this is what broke session booking and dog creation, not just
-- the profiles table directly.
--
-- Fix: do the role check inside a SECURITY DEFINER function instead. It
-- runs as the function owner (which has bypassrls in Supabase), so its
-- internal query against profiles never re-triggers profiles' own RLS —
-- breaking the recursion cycle entirely. This is the standard Supabase-
-- recommended pattern for exactly this situation.
create or replace function connorst.is_trainer()
returns boolean
language sql
security definer
set search_path = connorst, public
stable
as $$
  select exists (
    select 1 from connorst.profiles where id = auth.uid() and role = 'trainer'
  );
$$;

grant execute on function connorst.is_trainer() to authenticated;

alter table connorst.profiles enable row level security;

drop policy if exists "Users can read their own profile" on connorst.profiles;
create policy "Users can read their own profile" on connorst.profiles
  for select using (id = auth.uid());

drop policy if exists "Users can update their own profile" on connorst.profiles;
create policy "Users can update their own profile" on connorst.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "Trainers can read every profile" on connorst.profiles;
create policy "Trainers can read every profile" on connorst.profiles
  for select using (connorst.is_trainer());

-- ── dogs ────────────────────────────────────────────────────────────────
create table if not exists connorst.dogs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  breed text,
  date_of_birth date,
  photo_url text,
  medical_notes text,
  emergency_contact_name text,
  emergency_contact_phone text,
  current_focus text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace trigger dogs_set_updated_at
  before update on connorst.dogs
  for each row execute function connorst.set_updated_at();

alter table connorst.dogs enable row level security;

drop policy if exists "Users can manage their own dogs" on connorst.dogs;
create policy "Users can manage their own dogs" on connorst.dogs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Trainers can read every dog" on connorst.dogs;
create policy "Trainers can read every dog" on connorst.dogs
  for select using (connorst.is_trainer());

-- ── bookings / availability_slots / enquiries ───────────────────────────
create table if not exists connorst.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  dog_id uuid references connorst.dogs(id),
  service_id text not null,
  service_name text not null,
  date date not null,
  time text not null,
  owner_name text not null,
  email text not null,
  phone text not null,
  dog_name text not null,
  dog_breed text not null,
  notes text default '',
  status text not null default 'pending_confirmation'
    check (status in ('pending_confirmation', 'confirmed', 'paid', 'cancelled')),
  session_summary text,
  ai_summary text,
  points_awarded boolean not null default false,
  created_at timestamptz not null default now()
);

-- Tax Pot columns (migration 0002).
alter table connorst.bookings add column if not exists price numeric;
alter table connorst.bookings add column if not exists income_logged boolean not null default false;

create table if not exists connorst.availability_slots (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  time text not null,
  available boolean not null default true,
  created_at timestamptz not null default now(),
  unique (date, time)
);

create table if not exists connorst.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table connorst.bookings enable row level security;
alter table connorst.availability_slots enable row level security;
alter table connorst.enquiries enable row level security;

drop policy if exists "Anyone can read availability" on connorst.availability_slots;
create policy "Anyone can read availability" on connorst.availability_slots
  for select using (true);

drop policy if exists "Anyone can create a booking" on connorst.bookings;
create policy "Anyone can create a booking" on connorst.bookings
  for insert with check (true);

drop policy if exists "Anyone can submit an enquiry" on connorst.enquiries;
create policy "Anyone can submit an enquiry" on connorst.enquiries
  for insert with check (true);

drop policy if exists "Users can read their own bookings" on connorst.bookings;
create policy "Users can read their own bookings" on connorst.bookings
  for select using (user_id = auth.uid());

drop policy if exists "Users can cancel or amend their own pending bookings" on connorst.bookings;
create policy "Users can cancel or amend their own pending bookings" on connorst.bookings
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid() and status in ('pending_confirmation', 'cancelled'));

drop policy if exists "Trainers can read every booking" on connorst.bookings;
create policy "Trainers can read every booking" on connorst.bookings
  for select using (connorst.is_trainer());

drop policy if exists "Trainers can update any booking" on connorst.bookings;
create policy "Trainers can update any booking" on connorst.bookings
  for update using (connorst.is_trainer());

-- RLS governs rows, not columns — a client's update policy is column-
-- restricted so they can't rewrite price-bearing fields or self-approve a
-- booking to 'paid'. Re-run safe: revoke first, then grant exactly the
-- client-writable set back to the `authenticated` role, then hand the full
-- column set back too (trainers need it — column grants aren't per-policy,
-- only per-role, so this order matters and must run every time).
revoke update on connorst.bookings from authenticated;
grant update (date, time, notes, status) on connorst.bookings to authenticated;
grant update on connorst.bookings to authenticated;

-- ── exercises + homework_assignments (Training) ─────────────────────────
create table if not exists connorst.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  description text not null,
  technique_notes text,
  created_at timestamptz not null default now()
);

alter table connorst.exercises enable row level security;

drop policy if exists "Authenticated users can read the exercise catalog" on connorst.exercises;
create policy "Authenticated users can read the exercise catalog" on connorst.exercises
  for select using (auth.role() = 'authenticated');

create table if not exists connorst.homework_assignments (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid not null references connorst.dogs(id) on delete cascade,
  exercise_id uuid references connorst.exercises(id),
  title text not null,
  notes text,
  status text not null default 'assigned' check (status in ('assigned', 'completed')),
  is_milestone boolean not null default false,
  due_date date,
  ai_summary text,
  assigned_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table connorst.homework_assignments enable row level security;

drop policy if exists "Owners can read their dog's homework" on connorst.homework_assignments;
create policy "Owners can read their dog's homework" on connorst.homework_assignments
  for select using (dog_id in (select id from connorst.dogs where user_id = auth.uid()));

drop policy if exists "Owners can update their dog's homework" on connorst.homework_assignments;
create policy "Owners can update their dog's homework" on connorst.homework_assignments
  for update using (dog_id in (select id from connorst.dogs where user_id = auth.uid()))
  with check (dog_id in (select id from connorst.dogs where user_id = auth.uid()));

drop policy if exists "Trainers can manage all homework" on connorst.homework_assignments;
create policy "Trainers can manage all homework" on connorst.homework_assignments
  for all using (connorst.is_trainer()) with check (connorst.is_trainer());

revoke update on connorst.homework_assignments from authenticated;
grant update (status, completed_at) on connorst.homework_assignments to authenticated;
grant update on connorst.homework_assignments to authenticated;

-- ── messages (Coach) ─────────────────────────────────────────────────────
create table if not exists connorst.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  sender_id uuid not null references auth.users(id),
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

alter table connorst.messages enable row level security;

drop policy if exists "Users can read their own thread" on connorst.messages;
create policy "Users can read their own thread" on connorst.messages
  for select using (user_id = auth.uid());

-- This was the actual gap that made trainer-side messaging impossible even
-- once the schema was exposed: the insert policy below always let a
-- trainer post into any client's thread, but there was no matching SELECT
-- policy, so a trainer could never read a thread that wasn't their own.
drop policy if exists "Trainers can read every thread" on connorst.messages;
create policy "Trainers can read every thread" on connorst.messages
  for select using (connorst.is_trainer());

drop policy if exists "Client sends in own thread, trainer sends in any thread" on connorst.messages;
create policy "Client sends in own thread, trainer sends in any thread" on connorst.messages
  for insert with check (
    sender_id = auth.uid()
    and (user_id = auth.uid() or connorst.is_trainer())
  );

-- ── media (photo/video/voice attachments) ───────────────────────────────
create table if not exists connorst.media (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  dog_id uuid references connorst.dogs(id),
  message_id uuid references connorst.messages(id),
  homework_assignment_id uuid references connorst.homework_assignments(id),
  kind text not null check (kind in ('photo', 'video', 'voice')),
  storage_path text not null,
  caption text,
  created_at timestamptz not null default now()
);

alter table connorst.media enable row level security;

drop policy if exists "Users can manage their own media" on connorst.media;
create policy "Users can manage their own media" on connorst.media
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Trainers can read every client's media" on connorst.media;
create policy "Trainers can read every client's media" on connorst.media
  for select using (connorst.is_trainer());

-- ── point_transactions (Community Points ledger) ────────────────────────
create table if not exists connorst.point_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  amount integer not null,
  reason text not null check (reason in (
    'booking_session', 'referral_convert', 'review', 'merch_purchase',
    'community_support', 'directed_out', 'directed_in'
  )),
  direction text check (direction in ('own_dog', 'community')),
  created_at timestamptz not null default now()
);

alter table connorst.point_transactions enable row level security;

drop policy if exists "Users can read their own point ledger" on connorst.point_transactions;
create policy "Users can read their own point ledger" on connorst.point_transactions
  for select using (user_id = auth.uid());
-- No insert/update/delete policy for clients at all — every write goes
-- through the SECURITY DEFINER functions below.

-- security_invoker = true is load-bearing: without it, a view over an
-- RLS'd table runs with the *view owner's* rights, not the caller's, and
-- every user would see every other user's balance.
create or replace view connorst.point_balances
  with (security_invoker = true) as
select
  user_id,
  coalesce(sum(amount) filter (where direction is null), 0) as undirected_balance,
  coalesce(sum(amount) filter (where direction = 'own_dog'), 0) as own_dog_balance,
  coalesce(sum(amount) filter (where direction = 'community'), 0) as community_balance,
  coalesce(sum(amount) filter (where reason <> 'directed_out'), 0) as lifetime_earned
from connorst.point_transactions
group by user_id;

create or replace function connorst.direct_points(p_amount integer, p_direction text)
returns void language plpgsql security definer set search_path = connorst, public as $$
declare
  v_undirected integer;
begin
  if p_direction not in ('own_dog', 'community') then
    raise exception 'invalid direction';
  end if;
  if p_amount <= 0 then
    raise exception 'amount must be positive';
  end if;

  select coalesce(sum(amount), 0) into v_undirected
    from connorst.point_transactions
    where user_id = auth.uid() and direction is null;

  if v_undirected < p_amount then
    raise exception 'insufficient undirected points';
  end if;

  insert into connorst.point_transactions (user_id, amount, reason, direction)
    values (auth.uid(), -p_amount, 'directed_out', null);
  insert into connorst.point_transactions (user_id, amount, reason, direction)
    values (auth.uid(), p_amount, 'directed_in', p_direction);
end;
$$;

grant execute on function connorst.direct_points(integer, text) to authenticated;

create or replace function connorst.community_pool_total()
returns bigint language sql security definer set search_path = connorst, public stable as $$
  select coalesce(sum(amount), 0)::bigint
  from connorst.point_transactions
  where direction = 'community';
$$;

grant execute on function connorst.community_pool_total() to authenticated, anon;

create or replace function connorst.award_booking_points()
returns trigger language plpgsql security definer set search_path = connorst, public as $$
declare
  v_referrer uuid;
  v_prior_count integer;
begin
  if new.user_id is null then
    return new;
  end if;

  if new.status in ('confirmed', 'paid')
     and old.status not in ('confirmed', 'paid')
     and not new.points_awarded then

    insert into connorst.point_transactions (user_id, amount, reason, direction)
      values (new.user_id, 20, 'booking_session', null);

    select count(*) into v_prior_count
      from connorst.bookings
      where user_id = new.user_id and status in ('confirmed', 'paid') and id <> new.id;

    if v_prior_count = 0 then
      select referred_by into v_referrer from connorst.profiles where id = new.user_id;
      if v_referrer is not null then
        insert into connorst.point_transactions (user_id, amount, reason, direction)
          values (v_referrer, 100, 'referral_convert', null);
      end if;
    end if;

    new.points_awarded := true;
  end if;

  return new;
end;
$$;

create or replace trigger booking_points_trigger
  before update on connorst.bookings
  for each row execute function connorst.award_booking_points();

-- ── income_entries (trainer's bookkeeping / Tax Pot) ────────────────────
create table if not exists connorst.income_entries (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references connorst.bookings(id),
  entry_date date not null default current_date,
  amount numeric(10, 2) not null,
  kind text not null check (kind in ('income', 'expense')),
  category text,
  notes text,
  created_at timestamptz not null default now()
);

-- Tax Pot columns (migration 0002).
alter table connorst.income_entries add column if not exists tax_rate numeric;
alter table connorst.income_entries add column if not exists tax_set_aside numeric not null default 0;

alter table connorst.income_entries enable row level security;

drop policy if exists "Trainers can manage the income log" on connorst.income_entries;
create policy "Trainers can manage the income log" on connorst.income_entries
  for all using (connorst.is_trainer()) with check (connorst.is_trainer());

-- Fires once, the moment a booking's status changes to 'paid' — uses
-- whatever tax_rate is on the trainer's profile at that moment and
-- snapshots it onto the entry, so a later rate change doesn't retroactively
-- rewrite historical entries.
create or replace function connorst.log_booking_income()
returns trigger language plpgsql security definer set search_path = connorst, public as $$
declare
  v_rate numeric;
begin
  if new.status = 'paid'
     and old.status is distinct from 'paid'
     and not new.income_logged
     and new.price is not null then

    select tax_rate into v_rate from connorst.profiles where role = 'trainer' limit 1;
    v_rate := coalesce(v_rate, 30);

    insert into connorst.income_entries (booking_id, amount, kind, category, tax_rate, tax_set_aside, entry_date)
      values (new.id, new.price, 'income', new.service_name, v_rate, round(new.price * v_rate / 100, 2), current_date);

    new.income_logged := true;
  end if;

  return new;
end;
$$;

create or replace trigger booking_income_trigger
  before update on connorst.bookings
  for each row execute function connorst.log_booking_income();

-- ── Storage bucket + RLS (private media: dog photos, training photos,
--    video, voice notes) ────────────────────────────────────────────────
-- file_size_limit is a server-side backstop matching the app's own
-- pre-upload check (lib/media.ts) — the client-side check keeps a bad
-- upload from ever starting, this is what actually stops it if a request
-- gets through anyway. 45MB, not 50MB, to stay under Supabase's free-plan
-- per-file limit with a little headroom.
insert into storage.buckets (id, name, public, file_size_limit)
  values ('connorst-media', 'connorst-media', false, 47185920)
  on conflict (id) do update set file_size_limit = excluded.file_size_limit;

-- Path convention: {auth.uid()}/{...}.{ext} — first path segment is the
-- owning user's id, so every file a client uploads (dog photo, training
-- photo/video, voice note) is covered by the same two policies.
drop policy if exists "Users can read their own media objects" on storage.objects;
create policy "Users can read their own media objects" on storage.objects
  for select using (bucket_id = 'connorst-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can upload their own media objects" on storage.objects;
create policy "Users can upload their own media objects" on storage.objects
  for insert with check (bucket_id = 'connorst-media' and (storage.foldername(name))[1] = auth.uid()::text);

-- Trainer needs to read every client's uploaded media (training photos,
-- future video/voice) — this was missing entirely before; clients could
-- upload but Connor could never actually view what they sent.
drop policy if exists "Trainers can read every media object" on storage.objects;
create policy "Trainers can read every media object" on storage.objects
  for select using (
    bucket_id = 'connorst-media' and connorst.is_trainer()
  );
