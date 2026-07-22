import { StyleSheet, View } from 'react-native';

import { MascotCluster, type ClusterChip } from '@/components/mascot-cluster';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';

const TRAINER_CHIPS: ClusterChip[] = [
  { label: 'Sessions', icon: 'calendar', href: '/sessions' },
  { label: 'Clients', icon: 'people', href: '/clients' },
  { label: 'HMRC', icon: 'cash', href: '/hmrc' },
];

export default function TrainerHomeScreen() {
  const { profile } = useAuth();

  return (
    <Screen>
      <View style={styles.center}>
        <ThemedText type="title" style={styles.centerText}>
          {profile?.fullName ? `Hi ${profile.fullName.split(' ')[0]}` : 'Hi'}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.centerText}>
          Tap Pickles for sessions, clients and your income log.
        </ThemedText>
      </View>

      <View style={styles.clusterWrap}>
        <MascotCluster
          mascotSource={require('@/assets/images/mascot/pickles-default.png')}
          chips={TRAINER_CHIPS}
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
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
});
