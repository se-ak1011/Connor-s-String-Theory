import { ThemedText } from '@/components/themed-text';
import type { ThemeColor } from '@/constants/theme';

type BrandMarkProps = {
  size?: number;
  /** Nav bar needs this — no room to wrap onto a second line in a row layout. */
  singleLine?: boolean;
  /** Override the default heading color — needed on the splash photo. */
  color?: ThemeColor;
};

export function BrandMark({ size = 32, singleLine = false, color }: BrandMarkProps) {
  return (
    <ThemedText
      type="display"
      themeColor={color}
      numberOfLines={singleLine ? 1 : undefined}
      ellipsizeMode="tail"
      style={{ fontSize: size, lineHeight: size * 1.15, textAlign: 'center' }}>
      Connor&apos;s String Theory
    </ThemedText>
  );
}
