import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { BackLink } from '@/components/ui/back-link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ComingSoonBadge } from '@/components/ui/coming-soon-badge';
import { Spacing } from '@/constants/theme';
import { fetchHomeworkItem, markHomeworkComplete, type HomeworkAssignment } from '@/lib/training';

export default function HomeworkDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<HomeworkAssignment | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setItem(await fetchHomeworkItem(id));
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleComplete() {
    if (!item) return;
    setSubmitting(true);
    try {
      await markHomeworkComplete(item.id);
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  if (!item) {
    return (
      <Screen>
        <BackLink fallbackHref="/training" />
        <ThemedText themeColor="textMuted">Loading…</ThemedText>
      </Screen>
    );
  }

  return (
    <Screen>
      <BackLink fallbackHref="/training" />

      <View style={styles.header}>
        <ThemedText type="title">{item.title}</ThemedText>
        {item.exercise?.category && (
          <ThemedText themeColor="textSecondary">{item.exercise.category}</ThemedText>
        )}
      </View>

      {item.exercise?.description && (
        <Card style={styles.card}>
          <ThemedText type="smallBold" themeColor="accent">
            What this is
          </ThemedText>
          <ThemedText themeColor="textSecondary">{item.exercise.description}</ThemedText>
        </Card>
      )}

      {item.exercise?.techniqueNotes && (
        <Card style={styles.card}>
          <ThemedText type="smallBold" themeColor="accent">
            Technique
          </ThemedText>
          <ThemedText themeColor="textSecondary">{item.exercise.techniqueNotes}</ThemedText>
        </Card>
      )}

      {item.notes && (
        <Card style={styles.card}>
          <ThemedText type="smallBold" themeColor="accent">
            Connor's notes
          </ThemedText>
          <ThemedText themeColor="textSecondary">{item.notes}</ThemedText>
        </Card>
      )}

      <Card style={styles.card}>
        <ThemedText type="smallBold" themeColor="accent">
          Video walkthrough
        </ThemedText>
        <ComingSoonBadge />
      </Card>

      {item.aiSummary && (
        <Card style={styles.card}>
          <ThemedText type="smallBold" themeColor="accent">
            Summary
          </ThemedText>
          <ThemedText themeColor="textSecondary">{item.aiSummary}</ThemedText>
        </Card>
      )}

      {item.status === 'assigned' ? (
        <Button label="Mark complete" onPress={handleComplete} loading={submitting} />
      ) : (
        <ThemedText type="small" themeColor="textMuted" style={styles.doneText}>
          Marked complete{item.completedAt ? ` on ${item.completedAt.slice(0, 10)}` : ''}.
        </ThemedText>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.two,
  },
  card: {
    gap: Spacing.one,
  },
  doneText: {
    textAlign: 'center',
  },
});
