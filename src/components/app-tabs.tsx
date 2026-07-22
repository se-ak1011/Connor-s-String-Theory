import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

import type { TabDef } from '@/components/tab-def';
import { Colors } from '@/constants/theme';

export default function AppTabs({ tabs }: { tabs: TabDef[] }) {
  return (
    <NativeTabs
      backgroundColor={Colors.background}
      indicatorColor={Colors.backgroundSelected}
      iconColor={{ selected: Colors.accent, default: Colors.textMuted }}
      labelStyle={{ selected: { color: Colors.accent }, default: { color: Colors.textMuted } }}>
      {tabs.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <NativeTabs.Trigger.Label>{tab.label}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name={tab.icon} />}
          />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
