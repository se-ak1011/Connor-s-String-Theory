/**
 * Single source of truth for the shopfront copy, pricing, and portfolio
 * content. Edit this file to update what the app says — no component code
 * needs to change for a copy or price tweak.
 *
 * Prices below are placeholders — swap in real numbers before launch.
 *
 * This is a dog training business, not a dog walking service — the walk
 * is the vehicle, not the product. Keep copy calm and plain; avoid hype
 * ("transform your dog", "unlock their potential") and avoid over-selling
 * the walking itself.
 */

export const business = {
  name: "Connor's String Theory",
  tagline: 'Real-world training. A calmer, more capable dog.',
  trainerName: 'Connor',
  intro:
    "Connor's String Theory isn't a dog walking service — it's dog training, delivered through real walks, play and structured time together. Each session is shaped around your dog: what they find hard, what they're ready to work on next. They come home tired, but they also come home having learned something.",
  serviceArea: 'Serving the local area and surrounding villages — get in touch to check your postcode.',
  contact: {
    // TODO: replace with Connor's real contact details before launch.
    email: 'hello@connorsstringtheory.co.uk',
    phone: '07000 000000',
    instagram: '@connorsstringtheory',
  },
};

export const focusAreas = [
  'Loose lead walking',
  'Recall',
  'Pulling',
  'Jumping up',
  'Puppy foundations',
  'Confidence',
  'Focus',
  'Neutrality',
  'Reactivity',
  'Engagement',
  'Calmness',
  'Impulse control',
];

export type Service = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  duration: string;
  price: string;
  priceNote: string;
  cadence: 'one-off' | 'standing';
  highlight?: boolean;
};

export const services: Service[] = [
  {
    id: 'taster',
    name: 'Taster Session',
    tagline: 'Start here',
    description:
      "A one-off session where Connor spends real time with your dog — walking, observing, working through a few things — and gives you an honest read on what's achievable and what it'll take. No commitment.",
    duration: '45 minutes',
    price: '£30',
    priceNote: 'one-off',
    cadence: 'one-off',
  },
  {
    id: 'ongoing',
    name: 'Ongoing Training',
    tagline: 'The standing slot most dogs need',
    description:
      'The same time, every week. Consistency is what actually builds new habits — whatever your dog is working on, this is where it sticks. Sessions adapt as they progress.',
    duration: '45–60 minutes',
    price: '£35',
    priceNote: 'per session, billed weekly',
    cadence: 'standing',
    highlight: true,
  },
  {
    id: 'owner-coaching',
    name: 'Owner Coaching',
    tagline: 'You, learning to lead',
    description:
      "You work with your own dog, and Connor coaches you through it. The goal isn't a dog that only listens to him — it's teaching you how to build that same relationship yourself.",
    duration: '60 minutes',
    price: '£40',
    priceNote: 'per session',
    cadence: 'one-off',
  },
  {
    id: 'social-session',
    name: 'Social Session with Pickles',
    tagline: 'Structured time with a calm, trained dog',
    description:
      "Controlled interaction with Pickles — not a free-for-all play session. It's used to build confidence, neutrality and engagement around another dog, at a pace that suits yours.",
    duration: '30–45 minutes',
    price: '£25',
    priceNote: 'per session',
    cadence: 'one-off',
  },
];

export type PicklesProfile = {
  name: string;
  breed: string;
  story: string;
  trainedIn: string[];
};

export const pickles: PicklesProfile = {
  name: 'Pickles',
  breed: '~55% Belgian Malinois × German Shepherd',
  story:
    "Pickles is the reason Connor's String Theory exists. A working-line dog with serious drive — the kind that could easily turn into a handful — raised from a puppy using the same calm, consistent methods Connor now teaches to other owners. By nine months old he was walking loose-lead, waiting at kerbs, and switching off around distractions that would send most dogs into overdrive. He's not a mascot bolted on afterwards — he's the proof the method works, and he still comes on sessions today.",
  trainedIn: ['Loose-lead walking', 'Impulse control', 'Kerb & traffic manners', 'Calm in high-stimulation environments'],
};

export type ClientDog = {
  id: string;
  name: string;
  breed: string;
  challenge: string;
  progress: string;
  testimonial?: string;
};

// Real client dogs (with photos + testimonials) go here as they come in.
export const clientDogs: ClientDog[] = [
  {
    id: 'bean',
    name: 'Bean',
    breed: 'Chihuahua',
    challenge:
      'Loose-lead walking on a tiny stride, and staying focused around food on the pavement — both easy for a small, food-motivated dog to struggle with.',
    progress:
      'Walks loose-lead consistently, waits at every kerb without being asked twice, and ignores food distractions that would normally stop her in her tracks.',
  },
];

export type FaqItem = { question: string; answer: string };

export const faqs: FaqItem[] = [
  {
    question: 'My dog pulls like a steam train — can you actually fix that?',
    answer:
      "Almost always, yes. Loose-lead walking is trained through real walks, not a one-off lesson — that's the whole idea behind Connor's String Theory. Book a taster and Connor will give you an honest read on timelines for your dog specifically.",
  },
  {
    question: "What's a Social Session with Pickles?",
    answer:
      "Structured, calm interaction with Pickles — not a play session. It's used to build your dog's confidence and neutrality around another dog, at whatever pace makes sense for them.",
  },
  {
    question: 'Can I be involved, or does Connor just work with my dog alone?',
    answer:
      "Both happen. Most sessions are one-on-one with your dog, but Owner Coaching sessions are built specifically so you're the one doing the work, with Connor guiding you.",
  },
  {
    question: 'Do you work with multiple dogs at once?',
    answer:
      'Sometimes, if temperaments match well. Mention it in your enquiry and Connor will let you know if a joint session makes sense, or if your dog would do better one-on-one.',
  },
  {
    question: 'What if my dog is reactive to other dogs or people?',
    answer:
      "That's exactly the kind of thing these sessions are built for. Tell Connor everything in your enquiry — reactivity isn't a dealbreaker, it just shapes the plan.",
  },
  {
    question: "What happens if it's pouring with rain?",
    answer:
      "Dogs still need their session, so things usually go ahead as normal — just message if you'd rather reschedule. Genuinely unsafe weather (storms, ice) gets rebooked at no extra cost.",
  },
  {
    question: 'Can I switch from a taster to ongoing training?',
    answer: "Yes — most people do. There's no pressure either way, and no lost booking fee if you do switch.",
  },
];
