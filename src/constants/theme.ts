/**
 * Heel's neutral palette (background/surface/text) is sampled directly
 * from a real photo of Pickles — his black mask, his tan coat, and the
 * warm grizzled grey across his back/saddle are the "first, second,
 * third" colors. No green, no invented brown.
 *
 * `accent` is purple — TODO: placeholder value below, swap for the
 * exact hex once it's chosen. It's the one deliberate accent color,
 * used everywhere something needs to read as interactive.
 * Not a light/dark toggle — see app.json's userInterfaceStyle: "dark".
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  background: '#151411', // 1st: sampled from Pickles' black mask
  backgroundElement: '#231F1B',
  backgroundSelected: '#2E2822',
  border: '#3A332C',
  text: '#F5F0E8',
  textSecondary: '#A89F9D', // 3rd: sampled from his grizzled grey saddle
  textMuted: '#786F68',
  // TODO: placeholder purple — replace with the exact accent hex once chosen.
  accent: '#A78BC9',
  accentPressed: '#8F6FB0',
  accentSoft: '#241F2C',
  brown: '#9B7E61', // 2nd: sampled from his tan coat
  brownSoft: '#2A2019',
  onAccent: '#151411',
  attention: '#C9824A',
} as const;

export type ThemeColor = keyof typeof Colors;

export const Fonts = {
  display: 'ShantellSans_600SemiBold',
  displayBold: 'ShantellSans_700Bold',
  sans: 'ShantellSans_400Regular',
  sansMedium: 'ShantellSans_500Medium',
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
