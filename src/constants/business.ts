/**
 * Single source of truth for Heel's shopfront copy, pricing, and portfolio
 * content. Edit this file to update what the app says — no component code
 * needs to change for a copy or price tweak.
 *
 * Prices below are placeholders — swap in real numbers before launch.
 */

export const business = {
  name: 'Heel',
  tagline: 'Every walk is a training session.',
  trainerName: 'Connor',
  intro:
    "Most dog walkers just walk your dog. Heel walks are training sessions in disguise — loose-lead walking, sitting at kerbs, no pulling toward other dogs, no barking at cars. You get a tired, happier dog and real, lasting manners, one walk at a time.",
  serviceArea: 'Serving the local area and surrounding villages — get in touch to check your postcode.',
  contact: {
    // TODO: replace with Connor's real contact details before launch.
    email: 'hello@heeldogtraining.co.uk',
    phone: '07000 000000',
    instagram: '@heel.dogtraining',
  },
};

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
    name: 'Taster Walk & Assessment',
    tagline: 'Meet Connor, meet the method',
    description:
      "A one-off session where Connor gets to know your dog, assesses where they're at, and gives you a real taste of what a training walk feels like. No commitment — just a clear, honest read on what's achievable.",
    duration: '45 minutes',
    price: '£30',
    priceNote: 'one-off',
    cadence: 'one-off',
  },
  {
    id: 'weekly',
    name: 'Weekly Training Walk',
    tagline: 'The standing slot — this is where the change happens',
    description:
      'The same time, the same walk, every week. Consistency is what actually builds the habit — loose-lead, kerb manners, calm around distractions — so this is the slot built for dogs (and owners) who want real, lasting results.',
    duration: '45–60 minutes',
    price: '£35',
    priceNote: 'per walk, billed weekly',
    cadence: 'standing',
    highlight: true,
  },
];

export type DogProfile = {
  id: string;
  name: string;
  breed: string;
  blurb: string;
  trainedIn: string[];
  photo?: string;
};

export const dogs: DogProfile[] = [
  {
    id: 'bean',
    name: 'Bean',
    breed: 'Chihuahua',
    blurb:
      "Don't let the size fool you. Bean walks loose-lead on a tiny stride, ignores food on the pavement, and waits at every kerb without being asked twice.",
    trainedIn: ['Loose-lead walking', 'Kerb waits', 'Calm around bigger dogs', 'Ignoring food distractions'],
  },
  {
    id: 'pickles',
    name: 'Pickles',
    breed: '~55% Belgian Malinois × German Shepherd',
    blurb:
      'A working-line dog with serious drive — the kind that could easily turn into a nightmare on a lead. Instead, Pickles walks calm, waits at kerbs, and switches off in high-stimulation environments on command.',
    trainedIn: ['Loose-lead walking', 'Impulse control', 'Kerb & traffic manners', 'Calm in high-stimulation environments'],
  },
];

export const proofStatement =
  "Both trained to a high standard by Connor by 9 months old. A tiny chihuahua and a high-drive working-line dog, walking exactly the same way — loose lead, calm, waiting at kerbs. That range is the proof.";

export type FaqItem = { question: string; answer: string };

export const faqs: FaqItem[] = [
  {
    question: 'My dog pulls like a steam train — can you actually fix that?',
    answer:
      "Almost always, yes. Loose-lead walking is trained through the walk itself, not a one-off lesson — that's the whole idea behind Heel. Book a taster and Connor will give you an honest read on timelines for your dog specifically.",
  },
  {
    question: 'Do you walk multiple dogs at once?',
    answer:
      'Sometimes, if temperaments match well. Mention it in your enquiry and Connor will let you know if a joint walk makes sense, or if your dog would do better one-on-one.',
  },
  {
    question: 'What if my dog is reactive to other dogs or people?',
    answer:
      "That's exactly the kind of thing training walks are built for. Tell Connor everything in your enquiry — reactivity isn't a dealbreaker, it just shapes the plan.",
  },
  {
    question: "What happens if it's pouring with rain?",
    answer:
      "Dogs still need walking, so sessions usually go ahead as normal — just message if you'd rather reschedule. Genuinely unsafe weather (storms, ice) gets rebooked at no extra cost.",
  },
  {
    question: 'Can I switch from a taster to a weekly slot?',
    answer: "Yes — most people do. There's no pressure either way, and no lost booking fee if you do switch.",
  },
];
