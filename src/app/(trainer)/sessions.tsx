import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { BackLink } from '@/components/ui/back-link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Spacing } from '@/constants/theme';
import { fetchAllBookings, updateBookingStatus, type TrainerBooking } from '@/lib/trainer';

export default function TrainerSessionsScreen() {
  const [bookings, setBookings] = useState<TrainerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setBookings(await fetchAllBookings());
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleUpdateStatus(id: string, status: TrainerBooking['status']) {
    setUpdatingId(id);
    try {
      await updateBookingStatus(id, status);
      await load();
    } finally {
      setUpdatingId(null);
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bookings.filter((b) => b.date >= today && b.status !== 'cancelled');
  const past = bookings.filter((b) => b.date < today || b.status === 'cancelled');

  return (
    <Screen refreshing={loading} onRefresh={load}>
      <View style={styles.header}>
        <BackLink label="Home" fallbackHref="/" />
        <ThemedText type="title">Sessions</ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">Upcoming</ThemedText>
        {upcoming.length === 0 ? (
          <Card>
            <EmptyState icon="calendar" title="Nothing booked" message="New bookings will show up here." />
          </Card>
        ) : (
          upcoming.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              updating={updatingId === booking.id}
              onConfirm={() => handleUpdateStatus(booking.id, 'confirmed')}
              onCancel={() => handleUpdateStatus(booking.id, 'cancelled')}
              onMarkPaid={() => handleUpdateStatus(booking.id, 'paid')}
            />
          ))
        )}
      </View>

      {past.length > 0 && (
        <View style={styles.section}>
          <ThemedText type="subtitle">Past</ThemedText>
          {past.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              updating={updatingId === booking.id}
              onMarkPaid={() => handleUpdateStatus(booking.id, 'paid')}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

function BookingCard({
  booking,
  updating,
  onConfirm,
  onCancel,
  onMarkPaid,
}: {
  booking: TrainerBooking;
  updating: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  onMarkPaid?: () => void;
}) {
  return (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <ThemedText type="smallBold">{booking.serviceName}</ThemedText>
        <ThemedText type="small" themeColor={booking.status === 'cancelled' ? 'attention' : 'textMuted'}>
          {booking.status.replace('_', ' ')}
        </ThemedText>
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {booking.date} at {booking.time} — {booking.dogName} ({booking.dogBreed})
      </ThemedText>
      <ThemedText type="small" themeColor="textMuted">
        {booking.ownerName} · {booking.email} · {booking.phone}
      </ThemedText>
      {booking.notes && (
        <ThemedText type="small" themeColor="textSecondary">
          {booking.notes}
        </ThemedText>
      )}
      {booking.status === 'pending_confirmation' && (onConfirm || onCancel) && (
        <View style={styles.actions}>
          {onConfirm && <Button label="Confirm" onPress={onConfirm} loading={updating} style={styles.actionButton} />}
          {onCancel && (
            <Button label="Cancel" variant="secondary" onPress={onCancel} loading={updating} style={styles.actionButton} />
          )}
        </View>
      )}
      {booking.status === 'confirmed' && onMarkPaid && (
        <View style={styles.actions}>
          {/* Marking paid is what fires the auto-log-to-Tax-Pot trigger
              (migrations/0002_tax_pot.sql) — this is the "money comes in"
              moment, not Confirm. */}
          <Button label="Mark as paid" onPress={onMarkPaid} loading={updating} style={styles.actionButton} />
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.two,
  },
  section: {
    gap: Spacing.two,
  },
  card: {
    gap: Spacing.half,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  actionButton: {
    flex: 1,
  },
});
