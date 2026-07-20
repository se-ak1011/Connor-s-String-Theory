/**
 * Full brand reset — light, earthy, based on Pickles. Greige background,
 * never white. Heather purple is the ONLY accent, used sparingly (links,
 * focus states, progress/haptic feedback, selection) — it must never read
 * as the primary interactive color; that's the warm taupe "brand" tone.
 * Fixed single identity, not a light/dark toggle — see app.json's
 * userInterfaceStyle: "light".
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  background: '#B5ADA2',
  backgroundElement: '#CFCEC8',
  backgroundSelected: '#C3B6A5',
  border: '#A69B8C',
  text: '#2B2621',
  heading: '#564A3D',
  textSecondary: '#4F453A',
  textMuted: '#786C5D',
  accent: '#9B8C7D',
  accentPressed: '#7B6A59',
  accentSoft: '#C7BCA9',
  brown: '#7B6A59',
  brownSoft: '#E1DACD',
  onAccent: '#2B2621',
  success: '#6E7C4E',
  attention: '#A8794A',
  // Heather purple — the one accent color. Links, focus states, progress
  // and haptic-feedback visuals, selection indicators. Never primary
  // buttons or nav — must stay Pickles-first, purple second.
  complement: '#76648C',
} as const;

export type ThemeColor = keyof typeof Colors;

export const Fonts = {
  display: 'FrostImperial',
  displayBold: 'FrostImperial',
  sans: 'FrostImperial',
  sansMedium: 'FrostImperial',
  mono: Platform.select({ ios: 'ui-monospace', default: 'monospace' }),
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  small: 12,
  medium: 20,
  large: 28,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
