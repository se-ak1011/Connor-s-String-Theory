import Ionicons from '@expo/vector-icons/Ionicons';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

type BackLinkProps = {
  label?: string;
  fallbackHref: Href;
};

/**
 * Every screen reachable outside the tab bar (pushed on top of it, or a
 * sibling route that isn't nested inside the tabs group) needs an explicit,
 * visible way back — don't rely on the OS swipe-back gesture alone.
 */
export function BackLink({ label = 'Back', fallbackHref }: BackLinkProps) {
  function handlePress() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallbackHref);
    }
  }

  return (
    <Pressable onPress={handlePress} hitSlop={12} style={styles.row}>
      <Ionicons name="chevron-back" size={18} color={Colors.accent} />
      <ThemedText type="small" themeColor="accent">
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
    alignSelf: 'flex-start',
  },
});
