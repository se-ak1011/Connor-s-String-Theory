import type { PropsWithChildren } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Colors, MaxContentWidth, Spacing } from '@/constants/theme';

type ScreenProps = PropsWithChildren<{
  refreshing?: boolean;
  onRefresh?: () => void;
}>;

export function Screen({ children, refreshing, onRefresh }: ScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        contentInset={{ bottom: insets.bottom + BottomTabInset }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />
          ) : undefined
        }>
        <ThemedView
          style={[
            styles.inner,
            {
              // Math.max guards against the first-render frame where
              // safe-area insets can briefly report 0 before the native
              // measurement arrives (most visible right after a screen
              // transition) — without it, content can flash flush against
              // the status bar for a frame.
              paddingTop: (Platform.OS === 'web' ? Spacing.six : Math.max(insets.top, 24)) + Spacing.four,
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
