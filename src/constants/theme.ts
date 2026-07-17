/**
 * Heel's palette is intentionally single-mode: near-black, always — but
 * warmer and earthier than the rest of the Sends family, on purpose.
 * Moss green + saddle brown (pulled from Pickles' own coat) carry the
 * brand; lavender survives only as `complement`, a deliberate nod to
 * Hassle/Alchono used sparingly (currently: the mascot's pulse rings).
 * Not a light/dark toggle — see app.json's userInterfaceStyle: "dark".
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  background: '#16130F',
  backgroundElement: '#211B15',
  backgroundSelected: '#2C241C',
  border: '#362D23',
  text: '#F5F0E8',
  textSecondary: '#B7AB9A',
  textMuted: '#8A7F70',
  accent: '#6FA05C',
  accentPressed: '#588048',
  accentSoft: '#212D1C',
  brown: '#B9834F',
  brownSoft: '#2E2318',
  onAccent: '#16130F',
  complement: '#A78BC9',
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
