import { supabase } from '@/lib/supabase';

export type TrainerBooking = {
  id: string;
  serviceName: string;
  date: string;
  time: string;
  ownerName: string;
  email: string;
  phone: string;
  dogName: string;
  dogBreed: string;
  notes: string;
  status: 'pending_confirmation' | 'confirmed' | 'paid' | 'cancelled';
  sessionSummary: string | null;
};

function mapTrainerBooking(row: any): TrainerBooking {
  return {
    id: row.id,
    serviceName: row.service_name,
    date: row.date,
    time: row.time,
    ownerName: row.owner_name,
    email: row.email,
    phone: row.phone,
    dogName: row.dog_name,
    dogBreed: row.dog_breed,
    notes: row.notes,
    status: row.status,
    sessionSummary: row.session_summary,
  };
}

export async function fetchAllBookings(): Promise<TrainerBooking[]> {
  const { data, error } = await supabase.from('bookings').select('*').order('date', { ascending: true });
  if (error) console.error('[trainer] fetchAllBookings failed', error.message);
  if (error || !data) return [];
  return data.map(mapTrainerBooking);
}

export async function updateBookingStatus(
  id: string,
  status: TrainerBooking['status'],
  sessionSummary?: string,
): Promise<void> {
  const updates: Record<string, unknown> = { status };
  if (sessionSummary !== undefined) updates.session_summary = sessionSummary;

  const { error } = await supabase.from('bookings').update(updates).eq('id', id);
  if (error) throw new Error(error.message);
}

export type ClientSummary = {
  profileId: string;
  fullName: string | null;
  dogName: string | null;
  dogBreed: string | null;
  currentFocus: string | null;
};

export async function fetchAllClients(): Promise<ClientSummary[]> {
  const [{ data: profiles, error: profilesError }, { data: dogs, error: dogsError }] = await Promise.all([
    supabase.from('profiles').select('id, full_name, role').eq('role', 'client'),
    supabase.from('dogs').select('user_id, name, breed, current_focus'),
  ]);

  if (profilesError) console.error('[trainer] fetchAllClients profiles query failed', profilesError.message);
  if (dogsError) console.error('[trainer] fetchAllClients dogs query failed', dogsError.message);
  if (profilesError || !profiles) return [];

  const dogByOwner = new Map((dogs ?? []).map((d: any) => [d.user_id, d]));

  return profiles.map((p: any) => {
    const dog = dogByOwner.get(p.id);
    return {
      profileId: p.id,
      fullName: p.full_name,
      dogName: dog?.name ?? null,
      dogBreed: dog?.breed ?? null,
      currentFocus: dog?.current_focus ?? null,
    };
  });
}

/**
 * Single-client version of fetchAllClients, for the trainer's client
 * detail/message screen — avoids fetching every client just to find one.
 */
export async function fetchClientDetail(profileId: string): Promise<ClientSummary | null> {
  const [{ data: profileRow, error: profileError }, { data: dog, error: dogError }] = await Promise.all([
    supabase.from('profiles').select('id, full_name, role').eq('id', profileId).maybeSingle(),
    supabase.from('dogs').select('name, breed, current_focus').eq('user_id', profileId).limit(1).maybeSingle(),
  ]);

  if (profileError) console.error('[trainer] fetchClientDetail profile query failed', profileError.message);
  if (dogError) console.error('[trainer] fetchClientDetail dog query failed', dogError.message);
  if (!profileRow) return null;

  return {
    profileId: profileRow.id,
    fullName: profileRow.full_name,
    dogName: dog?.name ?? null,
    dogBreed: dog?.breed ?? null,
    currentFocus: dog?.current_focus ?? null,
  };
}

export type IncomeEntry = {
  id: string;
  entryDate: string;
  amount: number;
  kind: 'income' | 'expense';
  category: string | null;
  notes: string | null;
  // Snapshotted at the rate in effect when the entry was created — a
  // later rate change doesn't rewrite history. Expenses don't carry a
  // set-aside (nothing's taxed on money going out).
  taxRate: number | null;
  taxSetAside: number;
};

function mapIncomeEntry(row: any): IncomeEntry {
  return {
    id: row.id,
    entryDate: row.entry_date,
    amount: Number(row.amount),
    kind: row.kind,
    category: row.category,
    notes: row.notes,
    taxRate: row.tax_rate == null ? null : Number(row.tax_rate),
    taxSetAside: Number(row.tax_set_aside ?? 0),
  };
}

export async function fetchIncomeEntries(): Promise<IncomeEntry[]> {
  const { data, error } = await supabase.from('income_entries').select('*').order('entry_date', { ascending: false });
  if (error) console.error('[trainer] fetchIncomeEntries failed', error.message);
  if (error || !data) return [];
  return data.map(mapIncomeEntry);
}

/**
 * Manual entries (bookings marked paid are logged automatically by the
 * booking_income_trigger in migrations/0002_tax_pot.sql instead — this is
 * only for the "Add entry" form). `taxRate` is the trainer's current rate,
 * passed in by the caller rather than fetched again here — same
 * snapshot-at-creation behaviour as the trigger.
 */
export async function addIncomeEntry(fields: {
  amount: number;
  kind: 'income' | 'expense';
  category?: string;
  notes?: string;
  entryDate?: string;
  taxRate: number;
}): Promise<void> {
  const taxSetAside = fields.kind === 'income' ? Math.round(fields.amount * (fields.taxRate / 100) * 100) / 100 : 0;

  const { error } = await supabase.from('income_entries').insert({
    amount: fields.amount,
    kind: fields.kind,
    category: fields.category ?? null,
    notes: fields.notes ?? null,
    entry_date: fields.entryDate ?? new Date().toISOString().slice(0, 10),
    tax_rate: fields.kind === 'income' ? fields.taxRate : null,
    tax_set_aside: taxSetAside,
  });
  if (error) throw new Error(error.message);
}

export async function fetchTaxRate(): Promise<number> {
  const { data } = await supabase.from('profiles').select('tax_rate').eq('role', 'trainer').limit(1).maybeSingle();
  return data?.tax_rate == null ? 30 : Number(data.tax_rate);
}

export async function updateTaxRate(userId: string, rate: number): Promise<void> {
  const { error } = await supabase.from('profiles').update({ tax_rate: rate }).eq('id', userId);
  if (error) throw new Error(error.message);
}

export type TaxPotSummary = {
  totalSetAside: number;
  totalIncome: number;
  totalExpenses: number;
  yearlyProjection: number;
  estimatedTax: number;
  monthlySetAside: number;
};

/**
 * Same run-rate approach as PAI's Tax Pot: total income so far in the
 * current UK tax year (6 April – 5 April), divided by months elapsed to
 * get a monthly rate, extrapolated to a naive straight-line yearly
 * figure. Not a real forecast — see the disclaimer shown alongside it.
 */
export function calcTaxPotSummary(entries: IncomeEntry[], taxRate: number): TaxPotSummary {
  const totalIncome = entries.filter((e) => e.kind === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = entries.filter((e) => e.kind === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const totalSetAside = entries.reduce((sum, e) => sum + e.taxSetAside, 0);

  const now = new Date();
  const taxYearStart = new Date(now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1, 3, 6);
  const msElapsed = now.getTime() - taxYearStart.getTime();
  const monthsElapsed = Math.max(1, msElapsed / (1000 * 60 * 60 * 24 * 30.44));
  const monthlyRate = totalIncome / monthsElapsed;
  const yearlyProjection = monthlyRate * 12;
  const estimatedTax = yearlyProjection * (taxRate / 100);

  return {
    totalSetAside,
    totalIncome,
    totalExpenses,
    yearlyProjection,
    estimatedTax,
    monthlySetAside: estimatedTax / 12,
  };
}
