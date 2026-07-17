import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export class BookingUnavailableError extends Error {}

export type BookingPayload = {
  serviceId: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  time: string;
  ownerName: string;
  email: string;
  phone: string;
  dogName: string;
  dogBreed: string;
  notes: string;
};

export type EnquiryPayload = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

/**
 * Inserts a booking row and, if a checkout function is configured, kicks
 * off a Stripe Checkout session for the deposit. Throws BookingUnavailableError
 * when Supabase isn't wired up yet so screens can fall back to a direct
 * contact CTA instead of silently pretending the booking went through.
 */
export async function submitBooking(payload: BookingPayload): Promise<{ checkoutUrl: string | null }> {
  if (!isSupabaseConfigured) {
    throw new BookingUnavailableError('Booking backend is not configured yet.');
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      service_id: payload.serviceId,
      service_name: payload.serviceName,
      date: payload.date,
      time: payload.time,
      owner_name: payload.ownerName,
      email: payload.email,
      phone: payload.phone,
      dog_name: payload.dogName,
      dog_breed: payload.dogBreed,
      notes: payload.notes,
      status: 'pending_confirmation',
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new BookingUnavailableError(error?.message ?? 'Could not save booking.');
  }

  // Deposit checkout is optional: only attempted if the edge function is deployed.
  try {
    const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
      'create-checkout-session',
      { body: { bookingId: data.id, serviceId: payload.serviceId } },
    );
    if (!checkoutError && checkoutData?.url) {
      return { checkoutUrl: checkoutData.url as string };
    }
  } catch {
    // Edge function not deployed yet — booking is still saved, payment happens on the day.
  }

  return { checkoutUrl: null };
}

export async function submitEnquiry(payload: EnquiryPayload): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new BookingUnavailableError('Enquiry backend is not configured yet.');
  }

  const { error } = await supabase.from('enquiries').insert({
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    message: payload.message,
  });

  if (error) {
    throw new BookingUnavailableError(error.message);
  }
}
