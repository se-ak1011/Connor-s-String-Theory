/**
 * Static copy for the Community page — editorial content, not user data,
 * so it lives here rather than behind a DB table (same reasoning as
 * business.ts). Keep the tone as specified in the brief: not a charity
 * pitch, not corporate — a community choosing to help other dogs. Never
 * imply one point-direction choice is better than the other.
 */

export const community = {
  title: 'Beyond your own dog',
  intro:
    "Connor's String Theory exists to make dogs and the people who love them understand each other better. As that grows, part of it goes back — to dogs and owners who need the same thing you're getting, but can't easily get to it.",
  paragraphs: [
    'That might mean help with an emergency vet bill, time spent on a dog with a harder start in life, support for a small independent rescue, or simply helping a family keep the dog they already have.',
    "It isn't a fund you pay into — it's built from Community Points, which every client earns just by being part of this. What you choose to do with yours is entirely yours to decide.",
  ],
  referralThanks: 'Thank you for helping another dog find us.',
  directPointsIntro:
    "Undirected points are yours to send wherever you'd like — toward your own dog's training, or toward another dog's. Neither one is the better choice. Helping your own dog is still helping a dog.",
};
