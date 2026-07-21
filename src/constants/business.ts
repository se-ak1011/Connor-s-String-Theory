/**
 * Single source of truth for the shopfront copy, pricing, and portfolio
 * content. Edit this file to update what the app says — no component code
 * needs to change for a copy or price tweak.
 *
 * Prices below are placeholders — swap in real numbers before launch.
 *
 * Connor's String Theory is a training philosophy, not a generic obedience
 * service: where the head goes, the body follows. Sessions work on a dog's
 * attention first, because attention is what movement and behaviour follow.
 * The string — a light lead positioned high on the neck — is the method's
 * signature tool, not the method itself; it makes the conversation between
 * dog and handler clearer, nothing more. Never describe it as something
 * that holds, forces or corrects a dog into position.
 *
 * Keep copy calm, plain and explanatory — educate before you sell. Avoid
 * hype ("transform your dog", "unlock their potential"), clichés ("pulls
 * like a steam train"), military or dominance language ("pack leader",
 * "corrections", "obedience"), and exaggerated claims.
 */

export const business = {
  name: "Connor's String Theory",
  tagline: 'Where the head goes, the body follows.',
  trainerName: 'Connor',
  intro:
    "Connor's String Theory is a training philosophy, not a walking service. Every session works from one idea outward: attention shapes movement, movement shapes behaviour, and lasting change comes through clear communication and consistency — not force.",
  serviceArea: 'Serving the local area and surrounding villages — get in touch to check your postcode.',
  contact: {
    // TODO: replace with Connor's real contact details before launch.
    email: 'hello@connorsstringtheory.co.uk',
    phone: '07000 000000',
    instagram: '@connorsstringtheory',
  },
};

export const philosophy = {
  title: 'Why String Theory?',
  intro:
    "It starts from a simple observation: a dog whose head is fixed on something is already halfway to reacting to it, long before a lead goes tight. So instead of managing the outcome — the pulling, the jumping, the bolting — String Theory works upstream, on where a dog's attention is and where it's going next.",
  toolNote:
    "The string — a light lead positioned high on the neck — is the signature tool of the method, not the method itself. It doesn't hold a dog in place or do the training for you. It simply makes the conversation between dog and handler clearer, so attention, movement and behaviour can be shaped together, through consistency and understanding rather than force.",
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
      "A one-off session where Connor spends real time with your dog — watching where their attention goes, working through a few things, and giving you an honest read on what's achievable and what it'll take. No commitment.",
    duration: '45 minutes',
    price: '£30',
    priceNote: 'one-off',
    cadence: 'one-off',
  },
  {
    id: 'ongoing',
    name: 'Ongoing Training',
    tagline: 'Same time, every week',
    description:
      'Consistency is what turns attention into habit — whatever your dog is working on, this is where it gets built. Sessions adapt as they progress, week to week.',
    duration: '45–60 minutes',
    price: '£35',
    priceNote: 'per session, billed weekly',
    cadence: 'standing',
    highlight: true,
  },
  {
    id: 'owner-coaching',
    name: 'Owner Coaching',
    tagline: 'You, learning the method',
    description:
      "You work directly with your own dog, and Connor coaches you through it — reading where their attention is, and how to guide it yourself. The goal isn't a dog that only responds to him; it's you and your dog understanding each other.",
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
      "Structured time with Pickles — not a free-for-all play session. It's used to build confidence and calm attention around another dog, at a pace that suits yours.",
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
    "Pickles is where String Theory started. A working-line dog with serious drive, he's the kind of dog whose attention snaps onto everything — and takes his body with it. Connor raised him on the same principle he now teaches to other owners: work with where a dog's head goes, not against where their body ends up. The string, positioned high on his neck, was never about holding him back — it gave Connor a clearer way to guide his attention, session by session, until it became habit. By nine months old, Pickles was walking loose-lead, waiting at kerbs, and switching off around distractions that would send most dogs into overdrive. He's not a mascot bolted on afterwards — he's where the method was built, and he still comes to sessions today.",
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
      'Loose-lead walking on a tiny stride, and holding focus around food on the pavement — both easy for a small, food-motivated dog to lose to distraction.',
    progress:
      'Walks loose-lead consistently, waits at every kerb without being asked twice, and holds her attention past food distractions that would normally stop her in her tracks.',
  },
];

export type FaqItem = { question: string; answer: string };

export const faqs: FaqItem[] = [
  {
    question: 'What is String Theory, exactly?',
    answer:
      "It's Connor's training philosophy, built around one idea: where the head goes, the body follows. Sessions work on a dog's attention first — because attention is what shapes movement, and movement is what shapes behaviour — using clear communication and consistency rather than force.",
  },
  {
    question: 'Does the string hold or force my dog into position?',
    answer:
      "No. It's positioned high on the neck to make the connection between the lead and your dog's attention clearer — not to hold, drag or correct them into place. It's a communication tool, not a control device; the training itself happens through consistency and understanding.",
  },
  {
    question: 'My dog pulls a lot on the lead — can training actually help?',
    answer:
      "In most cases, yes. Pulling is trained out through consistent real-world walks, not a single lesson — that's the core of how String Theory works. Book a taster and Connor will give you an honest read on timelines for your dog specifically.",
  },
  {
    question: "What's a Social Session with Pickles?",
    answer:
      "Structured, calm time with Pickles — not a play session. It's used to build your dog's confidence and calm attention around another dog, at whatever pace makes sense for them.",
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
