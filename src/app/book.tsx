import * as WebBrowser from 'expo-web-browser';
import { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TextField } from '@/components/ui/text-field';
import { services } from '@/constants/business';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { fetchAvailability, type DayAvailability } from '@/lib/availability';
import { BookingUnavailableError, submitBooking } from '@/lib/bookings';

type Status = 'idle' | 'submitting' | 'confirmed' | 'unavailable';

export default function BookScreen() {
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [serviceId, setServiceId] = useState(services[1]?.id ?? services[0].id);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dogName, setDogName] = useState('');
  const [dogBreed, setDogBreed] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    fetchAvailability().then(setAvailability);
  }, []);

  const selectedService = services.find((s) => s.id === serviceId) ?? services[0];

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    for (const day of availability) {
      const hasAvailability = day.slots.some((slot) => slot.available);
      marks[day.date] = {
        marked: hasAvailability,
        dotColor: Colors.accent,
        disabled: !hasAvailability,
      };
    }
    if (selectedDate) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: Colors.accent,
        selectedTextColor: Colors.onAccent,
      };
    }
    return marks;
  }, [availability, selectedDate]);

  const timesForSelectedDate = availability.find((d) => d.date === selectedDate)?.slots ?? [];

  const canSubmit =
    selectedDate && selectedTime && ownerName.trim() && (email.trim() || phone.trim()) && dogName.trim();

  async function handleSubmit() {
    if (!selectedDate || !selectedTime) return;
    setStatus('submitting');
    try {
      const { checkoutUrl } = await submitBooking({
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        date: selectedDate,
        time: selectedTime,
        ownerName,
        email,
        phone,
        dogName,
        dogBreed,
        notes,
      });
      setStatus('confirmed');
      if (checkoutUrl) {
        if (Platform.OS === 'web') {
          window.open(checkoutUrl, '_blank');
        } else {
          await WebBrowser.openBrowserAsync(checkoutUrl);
        }
      }
    } catch (err) {
      setStatus(err instanceof BookingUnavailableError ? 'unavailable' : 'unavailable');
    }
  }

  if (status === 'confirmed') {
    return (
      <Screen>
        <Card style={[styles.confirmCard, styles.successCard]}>
          <ThemedText type="subtitle">You're booked in 🎉</ThemedText>
          <ThemedText themeColor="textSecondary">
            {selectedService.name} on {selectedDate} at {selectedTime}. Connor will confirm shortly —
            keep an eye on your email or phone.
          </ThemedText>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <ThemedText type="title">Book a session</ThemedText>
        <ThemedText themeColor="textSecondary">
          Pick a session, a slot that works, and tell us about your dog. No account needed.
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
              selectedDayBackgroundColor: Colors.accent,
              selectedDayTextColor: Colors.onAccent,
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
        <ThemedText type="subtitle">3. Your details</ThemedText>
        <TextField label="Your name" value={ownerName} onChangeText={setOwnerName} autoCapitalize="words" />
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextField label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <TextField label="Dog's name" value={dogName} onChangeText={setDogName} autoCapitalize="words" />
        <TextField label="Breed" value={dogBreed} onChangeText={setDogBreed} autoCapitalize="words" />
        <TextField
          label="Anything we should know? (reactivity, health, behaviour)"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          style={styles.multiline}
        />
      </View>

      {status === 'unavailable' && (
        <ThemedText type="small" themeColor="attention">
          That didn't go through — the booking system isn't fully switched on yet. Please use the
          Contact tab to reach us directly and we'll sort your slot by hand.
        </ThemedText>
      )}

      <Button label="Confirm booking" onPress={handleSubmit} disabled={!canSubmit} loading={status === 'submitting'} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.two,
  },
  section: {
    gap: Spacing.three,
  },
  serviceRow: {
    gap: Spacing.two,
  },
  serviceButton: {
    alignSelf: 'stretch',
  },
  calendarCard: {
    padding: Spacing.two,
    borderRadius: Radius.medium,
  },
  timeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  timeButton: {
    paddingHorizontal: Spacing.four,
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  confirmCard: {
    gap: Spacing.two,
    alignItems: 'center',
  },
  successCard: {
    borderColor: Colors.success,
  },
});
