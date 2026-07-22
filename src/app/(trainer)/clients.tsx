import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { BackLink } from '@/components/ui/back-link';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Spacing } from '@/constants/theme';
import { fetchAllClients, type ClientSummary } from '@/lib/trainer';

export default function TrainerClientsScreen() {
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setClients(await fetchAllClients());
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <Screen refreshing={loading} onRefresh={load}>
      <View style={styles.header}>
        <BackLink label="Home" fallbackHref="/" />
        <ThemedText type="title">Clients</ThemedText>
      </View>

      {clients.length === 0 ? (
        <Card>
          <EmptyState icon="people" title="No clients yet" message="Clients who sign up will show up here." />
        </Card>
      ) : (
        clients.map((client) => (
          <Card key={client.profileId} style={styles.card}>
            <ThemedText type="smallBold">{client.fullName ?? 'Unnamed'}</ThemedText>
            {client.dogName ? (
              <ThemedText type="small" themeColor="textSecondary">
                {client.dogName}
                {client.dogBreed ? ` — ${client.dogBreed}` : ''}
              </ThemedText>
            ) : (
              <ThemedText type="small" themeColor="textMuted">
                No dog added yet
              </ThemedText>
            )}
            {client.currentFocus && (
              <ThemedText type="small" themeColor="accent">
                Working on: {client.currentFocus}
              </ThemedText>
            )}
          </Card>
        ))
      )}
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
