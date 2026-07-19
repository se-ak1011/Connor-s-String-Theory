/**
 * The palette: warm leather, saddle brown, walnut, espresso, charcoal —
 * Pickles' natural coat, not a purple app-identity. Premium, quiet,
 * masculine, understated; contrast comes from warm tonal separation, not
 * white. Not a light/dark toggle — see app.json's userInterfaceStyle: "dark".
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  background: '#161311',
  backgroundElement: '#241E1A',
  backgroundSelected: '#2E2620',
  border: '#3B3028',
  text: '#F2E8DD',
  textSecondary: '#D9CEC2',
  textMuted: '#A99989',
  accent: '#B88956',
  accentPressed: '#D1A16A',
  accentSoft: '#2A2018',
  brown: '#6B4C35',
  brownSoft: '#241A12',
  onAccent: '#161311',
  success: '#7B8A5A',
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
