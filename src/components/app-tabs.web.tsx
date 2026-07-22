import Ionicons from '@expo/vector-icons/Ionicons';
import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, ScrollView, useWindowDimensions, View, StyleSheet } from 'react-native';

import { BrandMark } from './brand-mark';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import type { TabDef } from '@/components/tab-def';
import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';

export default function AppTabs({ tabs }: { tabs: TabDef[] }) {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          {tabs.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <TabButton icon={tab.icon}>{tab.label}</TabButton>
            </TabTrigger>
          ))}
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({
  children,
  isFocused,
  icon,
  ...props
}: TabTriggerSlotProps & { icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={isFocused ? 'accentSoft' : 'background'}
        style={styles.tabButtonView}>
        <Ionicons
          name={icon}
          size={16}
          color={isFocused ? Colors.accent : Colors.textMuted}
        />
        <ThemedText type="small" themeColor={isFocused ? 'accent' : 'textMuted'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 640;

  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        {!isCompact && (
          <>
            <View style={styles.brandWrap}>
              <BrandMark size={20} singleLine />
            </View>
            <View style={styles.spacer} />
          </>
        )}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
          style={isCompact && styles.tabScroll}>
          {props.children}
        </ScrollView>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  brandWrap: {
    flexShrink: 1,
    maxWidth: 260,
  },
  spacer: {
    flexGrow: 1,
  },
  tabScroll: {
    flexShrink: 1,
  },
  tabScrollContent: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
});
