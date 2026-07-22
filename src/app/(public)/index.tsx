import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { MascotCluster } from '@/components/mascot-cluster';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <Screen>
      <View style={styles.center}>
        <MascotCluster mascotSource={require('@/assets/images/mascot/pickles-default.png')} />
      </View>
      <Link href="/sign-in" asChild>
        <ThemedText type="link" themeColor="textMuted" style={styles.signIn}>
          Already training with Connor? Sign in
        </ThemedText>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signIn: {
    textAlign: 'center',
    alignSelf: 'center',
    marginTop: -Spacing.four,
  },
});
