import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { BackLink } from '@/components/ui/back-link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TextField } from '@/components/ui/text-field';
import { parseServicePrice, services } from '@/constants/business';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { fetchAvailability, type DayAvailability } from '@/lib/availability';
import { BookingUnavailableError, submitBooking } from '@/lib/bookings';
import { fetchMyDog, type Dog } from '@/lib/profile';

type Status = 'idle' | 'submitting' | 'confirmed' | 'unavailable';

export default function NewSessionScreen() {
  const { user, profile } = useAuth();
  const [dog, setDog] = useState<Dog | null>(null);
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [serviceId, setServiceId] = useState(services[1]?.id ?? services[0].id);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    fetchAvailability().then(setAvailability);
    if (user) fetchMyDog(user.id).then(setDog);
  }, [user]);

  const selectedService = services.find((s) => s.id === serviceId) ?? services[0];

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    for (const day of availability) {
      const hasAvailability = day.slots.some((slot) => slot.available);
      marks[day.date] = { marked: hasAvailability, dotColor: Colors.accent, disabled: !hasAvailability };
    }
    if (selectedDate) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: Colors.complement,
        selectedTextColor: Colors.backgroundElement,
      };
    }
    return marks;
  }, [availability, selectedDate]);

  const timesForSelectedDate = availability.find((d) => d.date === selectedDate)?.slots ?? [];
  const canSubmit = selectedDate && selectedTime && user;

  async function handleSubmit() {
    if (!selectedDate || !selectedTime || !user) return;
    setStatus('submitting');
    try {
      await submitBooking({
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        date: selectedDate,
        time: selectedTime,
        ownerName: profile?.fullName ?? '',
        email: user.email ?? '',
        phone: '',
        dogName: dog?.name ?? '',
        dogBreed: dog?.breed ?? '',
        notes,
        userId: user.id,
        dogId: dog?.id,
        price: parseServicePrice(selectedService.price) ?? undefined,
      });
      setStatus('confirmed');
    } catch (err) {
      setStatus(err instanceof BookingUnavailableError ? 'unavailable' : 'unavailable');
    }
  }

  if (status === 'confirmed') {
    return (
      <Screen>
        <Card style={[styles.confirmCard, styles.successCard]}>
          <ThemedText type="subtitle">You're booked in</ThemedText>
          <ThemedText themeColor="textSecondary">
            {selectedService.name} on {selectedDate} at {selectedTime}. Connor will confirm shortly.
          </ThemedText>
          <Button label="Back to Sessions" variant="secondary" onPress={() => router.replace('/sessions')} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <BackLink fallbackHref="/sessions" />
        <ThemedText type="title">Book a session</ThemedText>
        <ThemedText themeColor="textSecondary">
          Pick a session and a slot that works — {dog?.name ?? 'your dog'}'s details come from your profile.
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">1. Choose a session</ThemedText>
        <View style={styles.serviceRow}>
          {services.map((service) => (
            <Button
              key={service.id}
              label={`${service.name} · ${service.price}`}
              variant={service.id === serviceId ? 'primary' : 'secondary'}
              onPress={() => setServiceId(service.id)}
              style={styles.serviceButton}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">2. Pick a date</ThemedText>
        <Card style={styles.calendarCard}>
          <Calendar
            markedDates={markedDates}
            minDate={new Date().toISOString().slice(0, 10)}
            onDayPress={(day: DateData) => {
              setSelectedDate(day.dateString);
              setSelectedTime(null);
            }}
            theme={{
              calendarBackground: 'transparent',
              dayTextColor: Colors.text,
              monthTextColor: Colors.text,
              textSectionTitleColor: Colors.textSecondary,
              todayTextColor: Colors.accent,
              arrowColor: Colors.accent,
              textDisabledColor: Colors.textMuted,
              selectedDayBackgroundColor: Colors.complement,
              selectedDayTextColor: Colors.backgroundElement,
              dotColor: Colors.accent,
              textDayFontFamily: Fonts.sans,
              textMonthFontFamily: Fonts.displayBold,
              textDayHeaderFontFamily: Fonts.sansMedium,
            }}
          />
        </Card>

        {selectedDate && (
          <View style={styles.timeRow}>
            {timesForSelectedDate.length === 0 && (
              <ThemedText themeColor="textMuted" type="small">
                Loading times…
              </ThemedText>
            )}
            {timesForSelectedDate.map((slot) => (
              <Button
                key={slot.time}
                label={slot.time}
                disabled={!slot.available}
                variant={selectedTime === slot.time ? 'primary' : 'secondary'}
                onPress={() => setSelectedTime(slot.time)}
                style={styles.timeButton}
              />
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">3. Anything to add?</ThemedText>
        <TextField
          label="Notes for Connor (optional)"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          style={styles.multiline}
        />
      </View>

      {status === 'unavailable' && (
        <ThemedText type="small" themeColor="attention">
          That didn't go through — please message Connor directly from the Coach tab instead.
        </ThemedText>
      )}

      <Button label="Confirm booking" onPress={handleSubmit} disabled={!canSubmit} loading={status === 'submitting'} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: Spacing.two },
  section: { gap: Spacing.three },
  serviceRow: { gap: Spacing.two },
  serviceButton: { alignSelf: 'stretch' },
  calendarCard: { padding: Spacing.two, borderRadius: Radius.medium },
  timeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  timeButton: { paddingHorizontal: Spacing.four },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  confirmCard: { gap: Spacing.two, alignItems: 'center' },
  successCard: { borderColor: Colors.success },
});
