import Ionicons from '@expo/vector-icons/Ionicons';
import type { Href } from 'expo-router';
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

import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';

const TABS: { name: string; href: Href; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { name: 'home', href: '/', label: 'Home', icon: 'home' },
  { name: 'portfolio', href: '/portfolio', label: 'The Dogs', icon: 'paw' },
  { name: 'book', href: '/book', label: 'Book', icon: 'calendar' },
  { name: 'contact', href: '/contact', label: 'Contact', icon: 'chatbubble-ellipses' },
];

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          {TABS.map((tab) => (
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
  const isCompact = width < 520;

  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        {!isCompact && (
          <>
            <BrandMark size={32} />
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
