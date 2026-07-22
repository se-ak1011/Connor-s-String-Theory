import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Collapsible } from '@/components/ui/collapsible';
import { EmptyState } from '@/components/ui/empty-state';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { fetchMyDog } from '@/lib/profile';
import { fetchHomework, type HomeworkAssignment } from '@/lib/training';

export default function TrainingScreen() {
  const { user } = useAuth();
  const [homework, setHomework] = useState<HomeworkAssignment[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasDog, setHasDog] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const dog = await fetchMyDog(user.id);
    setHasDog(!!dog);
    setHomework(dog ? await fetchHomework(dog.id) : []);
    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return homework;
    return homework.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.exercise?.category?.toLowerCase().includes(query) ||
        item.exercise?.name.toLowerCase().includes(query),
    );
  }, [homework, search]);

  const assigned = filtered.filter((item) => item.status === 'assigned');
  const completed = filtered.filter((item) => item.status === 'completed');

  return (
    <Screen refreshing={loading} onRefresh={load}>
      <View style={styles.header}>
        <ThemedText type="title">Training</ThemedText>
        <ThemedText themeColor="textSecondary">
          Homework, exercises and Connor's notes — everything you're working on together.
        </ThemedText>
      </View>

      {!hasDog ? (
        <Card>
          <EmptyState
            icon="school"
            title="No dog on your profile yet"
            message="Add your dog from Profile and Connor's homework will show up here."
          />
        </Card>
      ) : (
        <>
          <TextField label="Search" value={search} onChangeText={setSearch} placeholder="Loose lead, recall…" />

          <View style={styles.section}>
            {assigned.length === 0 ? (
              <Card>
                <EmptyState icon="checkmark-done" title="All caught up" message="Nothing assigned right now." />
              </Card>
            ) : (
              assigned.map((item) => <HomeworkRow key={item.id} item={item} />)
            )}
          </View>

          {completed.length > 0 && (
            <Collapsible title={`Completed (${completed.length})`}>
              <View style={styles.section}>
                {completed.map((item) => (
                  <HomeworkRow key={item.id} item={item} />
                ))}
              </View>
            </Collapsible>
          )}
        </>
      )}
    </Screen>
  );
}

function HomeworkRow({ item }: { item: HomeworkAssignment }) {
  return (
    <Pressable onPress={() => router.push(`/training/${item.id}`)}>
      <Card style={styles.row}>
        <View style={styles.rowHeader}>
          <ThemedText type="smallBold">{item.title}</ThemedText>
          {item.isMilestone && (
            <ThemedText type="small" themeColor="accent">
              Milestone
            </ThemedText>
          )}
        </View>
        {item.exercise?.category && (
          <ThemedText type="small" themeColor="textMuted">
            {item.exercise.category}
          </ThemedText>
        )}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.two,
  },
  section: {
    gap: Spacing.two,
  },
  row: {
    gap: Spacing.half,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
