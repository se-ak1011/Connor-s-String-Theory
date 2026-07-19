import { ThemedText } from '@/components/themed-text';

type BrandMarkProps = {
  size?: number;
};

export function BrandMark({ size = 32 }: BrandMarkProps) {
  return (
    <ThemedText
      type="display"
      style={{ fontSize: size, lineHeight: size * 1.15, textAlign: 'center' }}>
      Connor&apos;s Lead
    </ThemedText>
  );
}
