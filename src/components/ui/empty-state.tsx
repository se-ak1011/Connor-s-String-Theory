import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

type EmptyStateProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
};

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <Ionicons name={icon} size={28} color={Colors.textMuted} />
      <ThemedText type="smallBold" style={styles.centerText}>
        {title}
      </ThemedText>
      <ThemedText type="small" themeColor="textMuted" style={styles.centerText}>
        {message}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.four,
  },
  centerText: {
    textAlign: 'center',
  },
});
