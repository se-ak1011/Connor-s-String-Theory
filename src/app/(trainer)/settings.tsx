import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { BackLink } from '@/components/ui/back-link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';

export default function TrainerSettingsScreen() {
  const { user, profile, signOut } = useAuth();

  return (
    <Screen>
      <View style={styles.header}>
        <BackLink label="Home" fallbackHref="/" />
        <ThemedText type="title">Settings</ThemedText>
      </View>

      <Card style={styles.card}>
        <ThemedText type="smallBold" themeColor="accent">
          Account
        </ThemedText>
        <ThemedText themeColor="textSecondary">{profile?.fullName ?? 'Connor'}</ThemedText>
        {user?.email && (
          <ThemedText type="small" themeColor="textMuted">
            {user.email}
          </ThemedText>
        )}
        <ThemedText type="small" themeColor="textMuted">
          Trainer account
        </ThemedText>
      </Card>

      <Button label="Sign out" variant="secondary" onPress={signOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.two,
  },
  card: {
    gap: Spacing.half,
  },
});
