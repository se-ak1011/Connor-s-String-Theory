# Connor's Lead — going from placeholder to live

This app runs and looks finished right now with no setup — the calendar,
booking form, and enquiry form all work using placeholder data. This doc
is for switching from "demo" to "actually taking real bookings."

## What's placeholder right now

- **Prices** in `src/constants/business.ts` — made up, not agreed with Connor.
- **Contact details** (`email`, `phone`, `instagram`) in the same file.
- **Availability** — generated on the fly (`src/lib/availability.ts`) since
  there's no real calendar behind it yet.
- **Bookings & enquiries** — the forms work, but submitting one currently
  just shows a gentle "that didn't go through yet, contact us directly"
  message, because there's no live backend to save it to.

None of that is a bug — it's the difference between an "engineering base"
and a live business. Here's how to close that gap, in order.

## 1. Fix the copy

Edit `src/constants/business.ts`:
- Real prices for the taster and weekly slot.
- Real email/phone/Instagram.
- Anything about Connor, the dogs, or the FAQ that isn't quite right.

Nothing else in the app needs to change for a copy or price edit.

## 2. Create a Supabase project

1. [supabase.com](https://supabase.com) → New project.
2. In the SQL editor, run `supabase/schema.sql` from this repo — creates
   the `availability_slots`, `bookings`, and `enquiries` tables with row
   level security already locked down (customers can only *submit*
   bookings/enquiries, never read anyone else's).
3. Project Settings → API — copy the **Project URL** and **anon public
   key**.
4. Create a `.env` file in the repo root (copy `.env.example`) and paste
   those two values in. Restart `npm start` after.

At this point bookings and enquiries save for real, and the calendar can
be driven by real rows in `availability_slots` instead of the generated
placeholder — add rows there for the dates/times Connor's actually free.

## 3. (Optional) Take deposits with Stripe

The app is wired for a Stripe Checkout deposit step, but it's inert until
you deploy the edge function:

1. Create a Stripe account, get a secret key (`sk_live_...` or
   `sk_test_...` while testing).
2. Install the [Supabase CLI](https://supabase.com/docs/guides/cli),
   `supabase login`, `supabase link` to your project.
3. `supabase secrets set STRIPE_SECRET_KEY=sk_...`
4. `supabase functions deploy create-checkout-session`
5. Adjust the deposit amounts in
   `supabase/functions/create-checkout-session/index.ts` if £10/£15
   isn't right.

Until you do this, bookings still save fine — they just skip straight to
"pending confirmation," and Connor arranges payment directly.

## 4. Real photos of Bean & Pickles

`src/app/portfolio.tsx` currently shows a paw icon in place of photos.
Swap in real images via `expo-image` once you've got a few good shots —
happy to help wire that up when you're ready.

## 5. Ship it

- `npx expo prebuild` + EAS build once the above is done, same as the
  Hassle pipeline.
- App icon / splash currently uses the default Expo placeholders in
  `assets/images/` — swap those for a Connor's Lead icon whenever one exists.
