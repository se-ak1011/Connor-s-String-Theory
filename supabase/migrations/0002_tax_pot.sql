-- Connor's String Theory — migration 0002: Tax Pot
-- Run in the Supabase SQL editor after 0001_trainer_access.sql.
--
-- Adapted from the tax-pot pattern in the PAI app: a flat percentage,
-- snapshotted per income entry (not recalculated if the rate changes
-- later), with a client-side-computed run-rate projection. The one real
-- difference: PAI computes everything client-side because it has many
-- contractors; here, with exactly one trainer, a database trigger logs
-- income automatically the moment a booking is marked paid — no client
-- code has to remember to do it, and it can't be skipped or double-fired.

alter table connorst.profiles add column if not exists tax_rate numeric not null default 30;
alter table connorst.bookings add column if not exists price numeric;
alter table connorst.bookings add column if not exists income_logged boolean not null default false;
alter table connorst.income_entries add column if not exists tax_rate numeric;
alter table connorst.income_entries add column if not exists tax_set_aside numeric not null default 0;

-- Fires once, the moment a booking's status changes to 'paid' (not
-- 'confirmed' — confirmed just locks the slot in, paid is the actual
-- money-received signal). Uses whatever tax_rate is on the trainer's
-- profile *at that moment* and snapshots it onto the entry, so a later
-- rate change doesn't retroactively rewrite historical entries — same
-- snapshot behaviour as PAI's manual_income.tax_rate/tax_set_aside.
create function connorst.log_booking_income()
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

create trigger booking_income_trigger
  before update on connorst.bookings
  for each row execute function connorst.log_booking_income();
