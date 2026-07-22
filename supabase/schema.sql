-- Connor's String Theory — Supabase schema
-- Run in the Supabase SQL editor on the shared project (same project as
-- Tenant Passport). Prerequisites, both done once via the dashboard before
-- running this file:
--   1. Project Settings → API → Exposed schemas → add `connorst`.
--   2. Storage → New bucket → name `connorst-media`, private.

create schema if not exists connorst;

-- Custom schemas don't inherit the default anon/authenticated grants that
-- `public` gets automatically — without these, every request 401s/404s
-- regardless of how correct the RLS policies below are.
grant usage on schema connorst to anon, authenticated;
alter default privileges in schema connorst grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema connorst grant execute on functions to authenticated;

-- ── profiles ────────────────────────────────────────────────────────────
-- 1:1 extension of auth.users. Created automatically by the trigger below
-- the moment an auth.users row exists — including one created directly in
-- the dashboard (e.g. Connor's own account, which never goes through the
-- public signup screen).
create table connorst.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'client' check (role in ('client', 'trainer')),
  referral_code text not null unique,
  referred_by uuid references connorst.profiles(id),
  notification_prefs jsonb not null default '{"push_enabled": true, "homework_reminders": true, "message_alerts": true, "session_reminders": true}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function connorst.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on connorst.profiles
  for each row execute function connorst.set_updated_at();

create function connorst.generate_referral_code()
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

create function connorst.handle_new_user()
returns trigger language plpgsql security definer set search_path = connorst, public as $$
declare
  v_referrer uuid;
begin
  if new.raw_user_meta_data ? 'referral_code' and length(coalesce(new.raw_user_meta_data->>'referral_code', '')) > 0 then
    select id into v_referrer from connorst.profiles
      where referral_code = upper(new.raw_user_meta_data->>'referral_code');
  end if;

  insert into connorst.profiles (id, full_name, referral_code, referred_by)
  values (new.id, new.raw_user_meta_data->>'full_name', connorst.generate_referral_code(), v_referrer);

  return new;
end;
$$;

-- Named connorst_on_auth_user_created, not the more obvious
-- on_auth_user_created — auth.users is one physical table shared with
-- Tenant Passport, and trigger names aren't namespaced per schema, only
-- per table. Tenant Passport already has its own trigger on this table
-- (very likely under the generic name from Supabase's own docs example,
-- which is exactly what collided here) — every trigger on auth.users needs
-- a name unique across BOTH apps, not just within connorst.
create trigger connorst_on_auth_user_created
  after insert on auth.users
  for each row execute function connorst.handle_new_user();

alter table connorst.profiles enable row level security;

create policy "Users can read their own profile" on connorst.profiles
  for select using (id = auth.uid());
create policy "Users can update their own profile" on connorst.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
-- No insert policy: rows are only ever created by the trigger above.

-- ── dogs ────────────────────────────────────────────────────────────────
-- 1:many owner→dogs. v1 UI only surfaces one dog per client (the schema
-- supports more; a multi-dog switcher is a known future addition, not
-- built this pass).
create table connorst.dogs (
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

create trigger dogs_set_updated_at
  before update on connorst.dogs
  for each row execute function connorst.set_updated_at();

alter table connorst.dogs enable row level security;

create policy "Users can manage their own dogs" on connorst.dogs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── bookings / availability_slots / enquiries ───────────────────────────
-- Moved from `public` into `connorst`, and `bookings` extended with
-- nullable user_id/dog_id — null means an anonymous public booking (the
-- existing book.tsx flow, unchanged), populated means a portal booking.
create table connorst.bookings (
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

create table connorst.availability_slots (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  time text not null,
  available boolean not null default true,
  created_at timestamptz not null default now(),
  unique (date, time)
);

create table connorst.enquiries (
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

create policy "Anyone can read availability" on connorst.availability_slots
  for select using (true);
create policy "Anyone can create a booking" on connorst.bookings
  for insert with check (true);
create policy "Anyone can submit an enquiry" on connorst.enquiries
  for insert with check (true);

-- New: portal users can read their own bookings (the old public flow had
-- no select policy at all — anonymous bookings are still unreadable by
-- the anon key, only these owned rows are now visible, and only to their
-- owner).
create policy "Users can read their own bookings" on connorst.bookings
  for select using (user_id = auth.uid());

-- Self-service cancel is always allowed; reschedule (date/time/notes) only
-- while still pending_confirmation — a confirmed session can't be
-- silently rewritten by the client once Connor's committed to it. The
-- Sessions screen routes that case to a pre-filled Coach message instead.
create policy "Users can cancel or amend their own pending bookings" on connorst.bookings
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid() and status in ('pending_confirmation', 'cancelled'));

-- RLS governs rows, not columns — without this, the update policy above
-- would still let a client set their own booking straight to 'paid' or
-- rewrite price-bearing fields. Lock the writable column set down
-- explicitly.
revoke update on connorst.bookings from authenticated;
grant update (date, time, notes, status) on connorst.bookings to authenticated;

-- ── exercises + homework_assignments (Training) ─────────────────────────
-- Exercise catalog is trainer-authored (via the dashboard for now — no
-- trainer UI is being built this pass), read-only for clients.
create table connorst.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  description text not null,
  technique_notes text,
  created_at timestamptz not null default now()
);

alter table connorst.exercises enable row level security;

create policy "Authenticated users can read the exercise catalog" on connorst.exercises
  for select using (auth.role() = 'authenticated');

create table connorst.homework_assignments (
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

create policy "Owners can read their dog's homework" on connorst.homework_assignments
  for select using (dog_id in (select id from connorst.dogs where user_id = auth.uid()));

create policy "Owners can update their dog's homework" on connorst.homework_assignments
  for update using (dog_id in (select id from connorst.dogs where user_id = auth.uid()))
  with check (dog_id in (select id from connorst.dogs where user_id = auth.uid()));

-- Clients can only ever mark things done, not rewrite the assignment.
revoke update on connorst.homework_assignments from authenticated;
grant update (status, completed_at) on connorst.homework_assignments to authenticated;

-- ── messages (Coach) ─────────────────────────────────────────────────────
-- One thread per client, keyed by user_id. Trainer's replies land in the
-- same thread with sender_id = trainer's own auth.uid().
create table connorst.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  sender_id uuid not null references auth.users(id),
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

alter table connorst.messages enable row level security;

create policy "Users can read their own thread" on connorst.messages
  for select using (user_id = auth.uid());

-- Plumbing for a future trainer UI: a trainer can post into any thread, a
-- client only into their own. No trainer screens exist yet, but this
-- policy doesn't need to change when they do.
create policy "Client sends in own thread, trainer sends in any thread" on connorst.messages
  for insert with check (
    sender_id = auth.uid()
    and (
      user_id = auth.uid()
      or exists (select 1 from connorst.profiles where id = auth.uid() and role = 'trainer')
    )
  );

-- ── media (photo/video/voice attachments) ───────────────────────────────
-- Only 'photo' is wired to an actual uploader this pass. 'video'/'voice'
-- rows are schema-valid so nothing needs to change here later — the app
-- just shows a "coming soon" chip for those kinds today.
create table connorst.media (
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

create policy "Users can manage their own media" on connorst.media
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── point_transactions (Community Points ledger) ────────────────────────
-- Points are never money. Immutable earn rows (direction = null =
-- undirected) plus paired transfer rows written by direct_points() when a
-- user allocates undirected points. No redemption/payment processing —
-- directing points only tags ledger rows, it never moves real money.
create table connorst.point_transactions (
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

create policy "Users can read their own point ledger" on connorst.point_transactions
  for select using (user_id = auth.uid());
-- No insert/update/delete policy for clients at all — every write goes
-- through the SECURITY DEFINER functions below.

-- Running-balance view. security_invoker = true is load-bearing: without
-- it, a view over an RLS'd table runs with the *view owner's* rights, not
-- the caller's, and every user would see every other user's balance.
create view connorst.point_balances
  with (security_invoker = true) as
select
  user_id,
  coalesce(sum(amount) filter (where direction is null), 0) as undirected_balance,
  coalesce(sum(amount) filter (where direction = 'own_dog'), 0) as own_dog_balance,
  coalesce(sum(amount) filter (where direction = 'community'), 0) as community_balance,
  coalesce(sum(amount) filter (where reason <> 'directed_out'), 0) as lifetime_earned
from connorst.point_transactions
group by user_id;

-- Directing points: the one client-writable path into the ledger, gated
-- entirely by this function rather than a table policy. Neither direction
-- is framed as better in the app UI — this function just records the
-- choice.
create function connorst.direct_points(p_amount integer, p_direction text)
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

-- Public-visible aggregate for the Community page ("the community pool
-- currently stands at N points") — deliberately bypasses per-user RLS via
-- SECURITY DEFINER since this one number is meant to be global.
create function connorst.community_pool_total()
returns bigint language sql security definer set search_path = connorst, public stable as $$
  select coalesce(sum(amount), 0)::bigint
  from connorst.point_transactions
  where direction = 'community';
$$;

grant execute on function connorst.community_pool_total() to authenticated, anon;

-- Awards points once a booking is confirmed/paid (never twice, guarded by
-- points_awarded), and awards the referrer on the referred user's first
-- confirmed/paid booking. Point values are intentionally simple, fixed
-- constants — keep any display copy referencing these numbers (e.g. in
-- src/constants/points.ts) in sync by hand if they ever change.
create function connorst.award_booking_points()
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

create trigger booking_points_trigger
  before update on connorst.bookings
  for each row execute function connorst.award_booking_points();

-- ── Storage RLS (bucket "connorst-media", private, created via dashboard) ─
-- Path convention: {auth.uid()}/{uuid}.{ext} — first path segment is the
-- owning user's id.
create policy "Users can read their own media objects" on storage.objects
  for select using (bucket_id = 'connorst-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can upload their own media objects" on storage.objects
  for insert with check (bucket_id = 'connorst-media' and (storage.foldername(name))[1] = auth.uid()::text);
