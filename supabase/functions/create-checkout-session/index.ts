// Supabase Edge Function: create-checkout-session
//
// Creates a Stripe Checkout session for a booking deposit and returns its URL.
// Deploy with: supabase functions deploy create-checkout-session
// Requires a STRIPE_SECRET_KEY secret: supabase secrets set STRIPE_SECRET_KEY=sk_live_...
//
// Until this is deployed, submitBooking() in src/lib/bookings.ts silently
// skips the checkout step and the booking is saved as "pending_confirmation" —
// Connor can then arrange payment directly.

import Stripe from 'npm:stripe@17';
import { createClient } from 'npm:@supabase/supabase-js@2';

const DEPOSIT_AMOUNTS_PENCE: Record<string, number> = {
  taster: 1000, // £10 deposit off a £30 taster
  weekly: 1500, // £15 deposit off a £35 weekly walk
};

Deno.serve(async (req) => {
  try {
    const { bookingId, serviceId } = await req.json();

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2024-06-20',
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const amount = DEPOSIT_AMOUNTS_PENCE[serviceId] ?? 1000;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: { name: 'Heel booking deposit' },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: { bookingId },
      success_url: Deno.env.get('CHECKOUT_SUCCESS_URL') ?? 'https://example.com/success',
      cancel_url: Deno.env.get('CHECKOUT_CANCEL_URL') ?? 'https://example.com/cancel',
    });

    await supabase.from('bookings').update({ status: 'pending_confirmation' }).eq('id', bookingId);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
