import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { fetchMyBookings, type Booking } from '@/lib/bookings';
import { fetchMedia, type MediaItem } from '@/lib/media';
import { fetchMyDog } from '@/lib/profile';
import { fetchHomework, type HomeworkAssignment } from '@/lib/training';

export default function ProgressScreen() {
  const { user } = useAuth();
  const [pastSessions, setPastSessions] = useState<Booking[]>([]);
  const [milestones, setMilestones] = useState<HomeworkAssignment[]>([]);
  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [dog, bookings] = await Promise.all([fetchMyDog(user.id), fetchMyBookings(user.id)]);
    const today = new Date().toISOString().slice(0, 10);
    setPastSessions(
      bookings.filter((b) => b.date < today && b.status !== 'cancelled').sort((a, b) => b.date.localeCompare(a.date)),
    );

    if (dog) {
      const [homework, media] = await Promise.all([
        fetchHomework(dog.id),
        fetchMedia({ dogId: dog.id, kind: 'photo' }),
      ]);
      setMilestones(homework.filter((h) => h.isMilestone));
      setPhotos(media);
    }

    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <Screen refreshing={loading} onRefresh={load}>
      <View style={styles.header}>
        <ThemedText type="title">Progress</ThemedText>
        <ThemedText themeColor="textSecondary">A record of how far you've come together — not a scoreboard.</ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">Achievements</ThemedText>
        {milestones.length === 0 ? (
          <Card>
            <EmptyState icon="ribbon" title="Nothing yet" message="Milestones Connor flags along the way will show up here." />
          </Card>
        ) : (
          milestones.map((item) => (
            <Card key={item.id} style={styles.row}>
              <ThemedText type="smallBold">{item.title}</ThemedText>
              {item.notes && (
                <ThemedText type="small" themeColor="textSecondary">
                  {item.notes}
                </ThemedText>
              )}
            </Card>
          ))
        )}
      </View>

      {photos.length > 0 && (
        <View style={styles.section}>
          <ThemedText type="subtitle">Photos</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
            {photos.map((photo) =>
              photo.url ? <Image key={photo.id} source={{ uri: photo.url }} style={styles.photo} contentFit="cover" /> : null,
            )}
          </ScrollView>
        </View>
      )}

      <View style={styles.section}>
        <ThemedText type="subtitle">Session history</ThemedText>
        {pastSessions.length === 0 ? (
          <Card>
            <EmptyState icon="time" title="No sessions yet" message="Your session history will build up here over time." />
          </Card>
        ) : (
          pastSessions.map((booking) => (
            <Card key={booking.id} style={styles.row}>
              <ThemedText type="smallBold">{booking.serviceName}</ThemedText>
              <ThemedText type="small" themeColor="textMuted">
                {booking.date}
              </ThemedText>
              {booking.sessionSummary && (
                <ThemedText type="small" themeColor="textSecondary">
                  {booking.sessionSummary}
                </ThemedText>
              )}
            </Card>
          ))
        )}
      </View>
    </Screen>
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
  photoRow: {
    gap: Spacing.two,
  },
  photo: {
    width: 140,
    height: 140,
    borderRadius: Radius.medium,
  },
});
