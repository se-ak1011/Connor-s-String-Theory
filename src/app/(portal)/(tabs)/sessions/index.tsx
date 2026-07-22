import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { fetchMyBookings, type Booking } from '@/lib/bookings';

export default function SessionsScreen() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setBookings(await fetchMyBookings(user.id));
    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bookings.filter((b) => b.date >= today && b.status !== 'cancelled');
  const past = bookings.filter((b) => b.date < today || b.status === 'cancelled');

  return (
    <Screen refreshing={loading} onRefresh={load}>
      <View style={styles.header}>
        <ThemedText type="title">Sessions</ThemedText>
        <Button label="Book a session" onPress={() => router.push('/sessions/new')} />
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">Upcoming</ThemedText>
        {upcoming.length === 0 ? (
          <Card>
            <EmptyState icon="calendar" title="Nothing booked" message="Book a session whenever you're ready." />
          </Card>
        ) : (
          upcoming.map((booking) => <BookingRow key={booking.id} booking={booking} />)
        )}
      </View>

      {past.length > 0 && (
        <View style={styles.section}>
          <ThemedText type="subtitle">Previous sessions</ThemedText>
          {past.map((booking) => (
            <BookingRow key={booking.id} booking={booking} />
          ))}
        </View>
      )}
    </Screen>
  );
}

function BookingRow({ booking }: { booking: Booking }) {
  return (
    <Pressable onPress={() => router.push(`/sessions/${booking.id}`)}>
      <Card style={styles.row}>
        <View style={styles.rowHeader}>
          <ThemedText type="smallBold">{booking.serviceName}</ThemedText>
          <ThemedText type="small" themeColor={booking.status === 'cancelled' ? 'attention' : 'textMuted'}>
            {statusLabel(booking.status)}
          </ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {booking.date} at {booking.time}
        </ThemedText>
      </Card>
    </Pressable>
  );
}

function statusLabel(status: Booking['status']) {
  switch (status) {
    case 'pending_confirmation':
      return 'Awaiting confirmation';
    case 'confirmed':
      return 'Confirmed';
    case 'paid':
      return 'Confirmed';
    case 'cancelled':
      return 'Cancelled';
  }
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.three,
  },
  section: {
    gap: Spacing.three,
  },
  row: {
    gap: Spacing.one,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
