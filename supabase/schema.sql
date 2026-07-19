-- Connor's Lead — Supabase schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a fresh project.

create table if not exists availability_slots (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  time text not null,
  available boolean not null default true,
  created_at timestamptz not null default now(),
  unique (date, time)
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
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
  created_at timestamptz not null default now()
);

create table if not exists enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- Row Level Security: the app uses the public anon key, so customers can
-- submit bookings/enquiries but never read anyone else's data. Connor
-- reads everything from the Supabase dashboard (or the service role key)
-- rather than through the app.

alter table availability_slots enable row level security;
alter table bookings enable row level security;
alter table enquiries enable row level security;

create policy "Anyone can read availability" on availability_slots
  for select using (true);

create policy "Anyone can create a booking" on bookings
  for insert with check (true);

create policy "Anyone can submit an enquiry" on enquiries
  for insert with check (true);

-- No public select policy on bookings/enquiries: only the service role
-- (Connor, via the dashboard) can read booking and enquiry details.
