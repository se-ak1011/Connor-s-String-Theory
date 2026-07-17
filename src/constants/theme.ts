/**
 * Heel's palette is intentionally single-mode: near-black + lavender, always.
 * It's a brand identity (shared with the rest of the Sends family), not a
 * light/dark toggle — see app.json's userInterfaceStyle: "dark".
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  background: '#151517',
  backgroundElement: '#1E1E22',
  backgroundSelected: '#2A2A30',
  border: '#2E2E34',
  text: '#F5F3F7',
  textSecondary: '#A9A6B0',
  textMuted: '#75727C',
  accent: '#A78BC9',
  accentPressed: '#8F6FB0',
  accentSoft: '#2C2536',
  onAccent: '#151517',
  attention: '#C9738C',
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
