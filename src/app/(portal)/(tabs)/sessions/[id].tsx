import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { BackLink } from '@/components/ui/back-link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { cancelBooking, fetchMyBookings, type Booking } from '@/lib/bookings';

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const all = await fetchMyBookings(user.id);
    setBooking(all.find((b) => b.id === id) ?? null);
  }, [user, id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleCancel() {
    if (!booking) return;
    setSubmitting(true);
    try {
      await cancelBooking(booking.id);
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  function handleRequestReschedule() {
    router.push({ pathname: '/coach', params: { prefill: `I'd like to reschedule my ${booking?.serviceName} session on ${booking?.date} — ` } });
  }

  if (!booking) {
    return (
      <Screen>
        <BackLink fallbackHref="/sessions" />
        <ThemedText themeColor="textMuted">Loading…</ThemedText>
      </Screen>
    );
  }

  const canSelfReschedule = booking.status === 'pending_confirmation';
  const canCancel = booking.status !== 'cancelled';

  return (
    <Screen>
      <BackLink fallbackHref="/sessions" />

      <View style={styles.header}>
        <ThemedText type="title">{booking.serviceName}</ThemedText>
        <ThemedText themeColor="textSecondary">
          {booking.date} at {booking.time}
        </ThemedText>
      </View>

      <Card style={styles.card}>
        <ThemedText type="smallBold" themeColor="accent">
          Status
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          {booking.status === 'pending_confirmation' && 'Awaiting confirmation from Connor.'}
          {(booking.status === 'confirmed' || booking.status === 'paid') && 'Confirmed.'}
          {booking.status === 'cancelled' && 'This session was cancelled.'}
        </ThemedText>
      </Card>

      {booking.sessionSummary && (
        <Card style={styles.card}>
          <ThemedText type="smallBold" themeColor="accent">
            Session summary
          </ThemedText>
          <ThemedText themeColor="textSecondary">{booking.sessionSummary}</ThemedText>
        </Card>
      )}

      {booking.notes && (
        <Card style={styles.card}>
          <ThemedText type="smallBold" themeColor="accent">
            Your notes
          </ThemedText>
          <ThemedText themeColor="textSecondary">{booking.notes}</ThemedText>
        </Card>
      )}

      {canCancel && (
        <View style={styles.actions}>
          {canSelfReschedule ? (
            <Button label="Request reschedule" variant="secondary" onPress={handleRequestReschedule} />
          ) : (
            <Button label="Ask Connor to reschedule" variant="secondary" onPress={handleRequestReschedule} />
          )}
          <Button label="Cancel session" variant="secondary" onPress={handleCancel} loading={submitting} />
        </View>
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
  actions: {
    gap: Spacing.two,
  },
});
