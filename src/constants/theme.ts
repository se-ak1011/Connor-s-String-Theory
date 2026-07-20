/**
 * The palette: sampled directly from the Connor's String Theory logo —
 * dark olive-charcoal, muted khaki, warm tan (Pickles' coat), cream.
 * Premium, quiet, masculine, understated; contrast comes from warm
 * tonal separation, not white. Not a light/dark toggle — see app.json's
 * userInterfaceStyle: "dark".
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  background: '#181A16',
  backgroundElement: '#252820',
  backgroundSelected: '#2F3327',
  border: '#3A3E30',
  text: '#F5EEE1',
  textSecondary: '#D9D0BC',
  textMuted: '#9C9782',
  accent: '#8C8862',
  accentPressed: '#A5A177',
  accentSoft: '#22241B',
  brown: '#8A6F4E',
  brownSoft: '#241D14',
  onAccent: '#181A16',
  success: '#6F9159',
  attention: '#C08A4A',
  // Olive's complement — dusty, warm-leaning plum, not a bright lavender.
  // Reserved for quiet/interactive-only moments (haptic touchpoints,
  // the mascot's pulse ring) — never a dominant UI color.
  complement: '#8A6E8C',
} as const;

export type ThemeColor = keyof typeof Colors;

export const Fonts = {
  display: 'Kalam_700Bold',
  displayBold: 'Kalam_700Bold',
  sans: 'Kalam_400Regular',
  sansMedium: 'Kalam_700Bold',
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
