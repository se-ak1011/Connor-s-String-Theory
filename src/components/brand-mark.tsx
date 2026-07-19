import { ThemedText } from '@/components/themed-text';

type BrandMarkProps = {
  size?: number;
  /** Nav bar needs this — no room to wrap onto a second line in a row layout. */
  singleLine?: boolean;
};

export function BrandMark({ size = 32, singleLine = false }: BrandMarkProps) {
  return (
    <ThemedText
      type="display"
      numberOfLines={singleLine ? 1 : undefined}
      ellipsizeMode="tail"
      style={{ fontSize: size, lineHeight: size * 1.15, textAlign: 'center' }}>
      Connor&apos;s String Theory
    </ThemedText>
  );
}
