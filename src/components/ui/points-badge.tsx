import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';

type PointsBadgeProps = {
  amount: number;
  label: string;
};

export function PointsBadge({ amount, label }: PointsBadgeProps) {
  return (
    <View style={styles.badge}>
      <ThemedText type="title" themeColor="heading">
        {amount}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: Colors.accentSoft,
    borderRadius: Radius.medium,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.half,
  },
});
