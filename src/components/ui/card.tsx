import type { ViewProps } from 'react-native';
import { StyleSheet } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';

type CardProps = ViewProps & {
  highlighted?: boolean;
};

export function Card({ style, highlighted, ...rest }: CardProps) {
  return (
    <ThemedView
      type={highlighted ? 'accentSoft' : 'backgroundElement'}
      style={[styles.card, highlighted && styles.highlighted, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.medium,
    padding: Spacing.four,
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  highlighted: {
    borderColor: Colors.accent,
  },
});
