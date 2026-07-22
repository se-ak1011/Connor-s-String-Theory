import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { fetchMyBookings, type Booking } from '@/lib/bookings';
import { fetchMessages, type Message } from '@/lib/messages';
import { uploadPhoto } from '@/lib/media';
import { fetchMyDog, type Dog } from '@/lib/profile';
import { fetchHomework, type HomeworkAssignment } from '@/lib/training';

export default function PortalHomeScreen() {
  const { user, profile } = useAuth();
  const [dog, setDog] = useState<Dog | null>(null);
  const [nextBooking, setNextBooking] = useState<Booking | null>(null);
  const [homework, setHomework] = useState<HomeworkAssignment[]>([]);
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const myDog = await fetchMyDog(user.id);
    setDog(myDog);

    const [bookings, messages] = await Promise.all([fetchMyBookings(user.id), fetchMessages(user.id)]);

    const today = new Date().toISOString().slice(0, 10);
    const upcoming = bookings
      .filter((b) => b.date >= today && b.status !== 'cancelled')
      .sort((a, b) => a.date.localeCompare(b.date));
    setNextBooking(upcoming[0] ?? null);

    setLastMessage(messages.length > 0 ? messages[messages.length - 1] : null);

    if (myDog) {
      const hw = await fetchHomework(myDog.id);
      setHomework(hw.filter((h) => h.status === 'assigned'));
    } else {
      setHomework([]);
    }

    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleUploadVideo() {
    if (!user) return;
    setUploading(true);
    try {
      await uploadPhoto(user.id, { dogId: dog?.id });
    } finally {
      setUploading(false);
    }
  }

  return (
    <Screen refreshing={loading} onRefresh={load}>
      <View style={styles.header}>
        <ThemedText type="title">
          {profile?.fullName ? `Welcome back, ${profile.fullName.split(' ')[0]}` : 'Welcome back'}
        </ThemedText>
      </View>

      {dog ? (
        <Card style={styles.dogCard}>
          {dog.photoUrl ? (
            <Image source={{ uri: dog.photoUrl }} style={styles.dogPhoto} contentFit="cover" />
          ) : (
            <View style={styles.dogPhotoPlaceholder}>
              <Ionicons name="paw" size={40} color={Colors.accent} />
            </View>
          )}
          <ThemedText type="subtitle" style={styles.centerText}>
            {dog.name}
          </ThemedText>
          {dog.currentFocus && (
            <View style={styles.focusPill}>
              <ThemedText type="small" themeColor="accent">
                Working on: {dog.currentFocus}
              </ThemedText>
            </View>
          )}
        </Card>
      ) : (
        <Card>
          <EmptyState
            icon="paw"
            title="Add your dog"
            message="Once your dog's on your profile, this becomes their home — sessions, homework and progress all in one place."
          />
          <Button label="Add your dog" onPress={() => router.push('/profile')} />
        </Card>
      )}

      <Card style={styles.sectionCard}>
        <ThemedText type="smallBold" themeColor="accent">
          Next session
        </ThemedText>
        {nextBooking ? (
          <>
            <ThemedText type="default">
              {nextBooking.serviceName} — {nextBooking.date} at {nextBooking.time}
            </ThemedText>
            <ThemedText type="small" themeColor="textMuted">
              {nextBooking.status === 'pending_confirmation' ? 'Awaiting confirmation' : 'Confirmed'}
            </ThemedText>
          </>
        ) : (
          <ThemedText type="small" themeColor="textMuted">
            Nothing booked yet.
          </ThemedText>
        )}
      </Card>

      <Card style={styles.sectionCard}>
        <ThemedText type="smallBold" themeColor="accent">
          Today's homework
        </ThemedText>
        {homework.length > 0 ? (
          homework.slice(0, 3).map((item) => (
            <ThemedText key={item.id} type="small" themeColor="textSecondary">
              • {item.title}
            </ThemedText>
          ))
        ) : (
          <ThemedText type="small" themeColor="textMuted">
            Nothing set right now.
          </ThemedText>
        )}
      </Card>

      <Card style={styles.sectionCard}>
        <ThemedText type="smallBold" themeColor="accent">
          Latest from Connor
        </ThemedText>
        {lastMessage ? (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={3}>
            {lastMessage.body}
          </ThemedText>
        ) : (
          <ThemedText type="small" themeColor="textMuted">
            No messages yet.
          </ThemedText>
        )}
      </Card>

      <View style={styles.quickActions}>
        <Button label="Message Connor" variant="secondary" onPress={() => router.push('/coach')} style={styles.actionButton} />
        <Button
          label={uploading ? 'Uploading…' : 'Upload training video'}
          variant="secondary"
          disabled={uploading}
          onPress={handleUploadVideo}
          style={styles.actionButton}
        />
        <Button label="View progress" variant="secondary" onPress={() => router.push('/progress')} style={styles.actionButton} />
        <Button label="Book session" onPress={() => router.push('/sessions/new')} style={styles.actionButton} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.two,
  },
  centerText: {
    textAlign: 'center',
  },
  dogCard: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  dogPhoto: {
    width: 160,
    height: 160,
    borderRadius: Radius.large,
  },
  dogPhotoPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: Radius.large,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusPill: {
    backgroundColor: Colors.background,
    borderRadius: Spacing.five,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
  },
  sectionCard: {
    gap: Spacing.one,
  },
  quickActions: {
    gap: Spacing.two,
  },
  actionButton: {
    alignSelf: 'stretch',
  },
});
