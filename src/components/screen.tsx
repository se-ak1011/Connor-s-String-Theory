import type { PropsWithChildren } from 'react';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export function Screen({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        contentInset={{ bottom: insets.bottom + BottomTabInset }}
        showsVerticalScrollIndicator={false}>
        <ThemedView
          style={[
            styles.inner,
            {
              paddingTop: (Platform.OS === 'web' ? Spacing.six : insets.top) + Spacing.four,
              paddingBottom: insets.bottom + BottomTabInset + Spacing.five,
            },
          ]}>
          {children}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    gap: Spacing.six,
  },
});
