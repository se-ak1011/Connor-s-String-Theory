import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export type TimeSlot = {
  time: string;
  available: boolean;
};

export type DayAvailability = {
  date: string; // YYYY-MM-DD
  slots: TimeSlot[];
};

const DAILY_TIMES = ['09:00', '11:00', '14:00', '16:00'];
const DAYS_AHEAD = 21;

/**
 * Deterministic placeholder availability so the calendar has something
 * real to show before a live Supabase project is wired up. Sundays are
 * treated as a day off. Swap for real data by populating the
 * `availability_slots` table — see SETUP.md.
 */
function generateFallbackAvailability(): DayAvailability[] {
  const days: DayAvailability[] = [];
  const today = new Date();

  for (let i = 1; i <= DAYS_AHEAD; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    if (date.getDay() === 0) continue; // Sundays off

    const dateStr = date.toISOString().slice(0, 10);
    const slots = DAILY_TIMES.map((time, index) => ({
      time,
      // A touch of deterministic variation so the demo calendar isn't wall-to-wall green.
      available: (date.getDate() + index) % 5 !== 0,
    }));

    days.push({ date: dateStr, slots });
  }

  return days;
}

export async function fetchAvailability(): Promise<DayAvailability[]> {
  if (!isSupabaseConfigured) {
    return generateFallbackAvailability();
  }

  const { data, error } = await supabase
    .from('availability_slots')
    .select('date, time, available')
    .gte('date', new Date().toISOString().slice(0, 10))
    .order('date', { ascending: true });

  if (error || !data || data.length === 0) {
    return generateFallbackAvailability();
  }

  const byDate = new Map<string, TimeSlot[]>();
  for (const row of data) {
    const slots = byDate.get(row.date) ?? [];
    slots.push({ time: row.time, available: row.available });
    byDate.set(row.date, slots);
  }

  return Array.from(byDate.entries()).map(([date, slots]) => ({ date, slots }));
}
