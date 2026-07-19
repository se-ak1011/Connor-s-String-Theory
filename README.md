# Connor's String Theory

Dog training, delivered through real-world walks, play and structured
interaction — not a dog walking service. Pickles, Connor's own dog, is
the proof the method works.

Built with Expo (SDK 57) + expo-router + Supabase. Warm leather and walnut
tones pulled from Pickles' own coat, calm and unhurried.

## Get started

```bash
npm install
npx expo start
```

Press `w` for web, or open with Expo Go / a dev build for native.

## Where things live

- `src/app/` — the four screens: Home, Meet Pickles, Book, Contact.
- `src/constants/business.ts` — all copy, prices, services, focus areas,
  Pickles' profile, client dogs, and FAQ. Edit this file for content
  changes; you shouldn't need to touch components.
- `src/lib/` — Supabase client, availability, and booking/enquiry submission.
- `supabase/` — schema and the Stripe checkout edge function.

## Going live

The app runs fully today on placeholder data (prices, contact details,
availability). See [SETUP.md](./SETUP.md) for the steps to connect a real
Supabase project and, optionally, Stripe deposits.
