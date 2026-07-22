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
  const [{ data: profiles, error: profilesError }, { data: dogs }] = await Promise.all([
    supabase.from('profiles').select('id, full_name, role').eq('role', 'client'),
    supabase.from('dogs').select('user_id, name, breed, current_focus'),
  ]);

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

export type IncomeEntry = {
  id: string;
  entryDate: string;
  amount: number;
  kind: 'income' | 'expense';
  category: string | null;
  notes: string | null;
};

function mapIncomeEntry(row: any): IncomeEntry {
  return {
    id: row.id,
    entryDate: row.entry_date,
    amount: Number(row.amount),
    kind: row.kind,
    category: row.category,
    notes: row.notes,
  };
}

export async function fetchIncomeEntries(): Promise<IncomeEntry[]> {
  const { data, error } = await supabase.from('income_entries').select('*').order('entry_date', { ascending: false });
  if (error || !data) return [];
  return data.map(mapIncomeEntry);
}

export async function addIncomeEntry(fields: {
  amount: number;
  kind: 'income' | 'expense';
  category?: string;
  notes?: string;
  entryDate?: string;
}): Promise<void> {
  const { error } = await supabase.from('income_entries').insert({
    amount: fields.amount,
    kind: fields.kind,
    category: fields.category ?? null,
    notes: fields.notes ?? null,
    entry_date: fields.entryDate ?? new Date().toISOString().slice(0, 10),
  });
  if (error) throw new Error(error.message);
}
