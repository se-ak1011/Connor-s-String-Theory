import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { MascotCluster } from '@/components/mascot-cluster';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { business } from '@/constants/business';
import { Spacing } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <Screen>
      <View style={styles.hero}>
        <ThemedText type="title" style={styles.centerText}>
          {business.tagline}
        </ThemedText>

        <MascotCluster mascotSource={require('@/assets/images/mascot/pickles-default.png')} />

        <ThemedText themeColor="textSecondary" style={styles.centerText}>
          {business.intro}
        </ThemedText>
      </View>

      <Link href="/sign-in" asChild>
        <ThemedText type="link" themeColor="textMuted" style={styles.centerText}>
          Already training with Connor? Sign in
        </ThemedText>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: Spacing.three,
  },
  centerText: {
    textAlign: 'center',
  },
});
