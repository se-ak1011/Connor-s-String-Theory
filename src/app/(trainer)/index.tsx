import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { MascotCluster, type ClusterChip } from '@/components/mascot-cluster';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';

const TRAINER_CHIPS: ClusterChip[] = [
  { label: 'Sessions', icon: 'calendar', href: '/sessions' },
  { label: 'Clients', icon: 'people', href: '/clients' },
  { label: 'HMRC', icon: 'cash', href: '/hmrc' },
  { label: 'Settings', icon: 'settings', href: '/settings' },
];

export default function TrainerHomeScreen() {
  const { profile } = useAuth();
  // No tab bar on this side of the app (see (trainer)/_layout.tsx), so
  // without an explicit height target here the cluster only ever takes
  // its own content size and Pickles ends up stranded near the top with
  // dead space below. Claiming most of the window height and centering
  // within it keeps him roughly mid-screen instead.
  const { height } = useWindowDimensions();

  return (
    <Screen>
      <View style={styles.center}>
        <ThemedText type="title" style={styles.centerText}>
          {profile?.fullName ? `Hi ${profile.fullName.split(' ')[0]}` : 'Hi'}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.centerText}>
          Tap Pickles for sessions, clients, your income log and settings.
        </ThemedText>
      </View>

      <View style={[styles.clusterWrap, { minHeight: height * 0.62 }]}>
        <MascotCluster
          mascotSource={require('@/assets/images/mascot/pickles-default.png')}
          chips={TRAINER_CHIPS}
          size={460}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    gap: Spacing.two,
  },
  centerText: {
    textAlign: 'center',
  },
  clusterWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
