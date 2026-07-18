import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Collapsible } from '@/components/ui/collapsible';
import { TextField } from '@/components/ui/text-field';
import { business, faqs } from '@/constants/business';
import { BookingUnavailableError, submitEnquiry } from '@/lib/bookings';
import { Colors, Spacing } from '@/constants/theme';

type Status = 'idle' | 'submitting' | 'sent' | 'unavailable';

export default function ContactScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const canSubmit = name.trim() && (email.trim() || phone.trim()) && message.trim();

  async function handleSubmit() {
    setStatus('submitting');
    try {
      await submitEnquiry({ name, email, phone, message });
      setStatus('sent');
    } catch (err) {
      if (err instanceof BookingUnavailableError) {
        setStatus('unavailable');
      } else {
        setStatus('unavailable');
      }
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.centerText}>
          Say hello
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.centerText}>
          Not ready to book yet? Tell {business.trainerName} about your dog and he'll get back to you
          directly — no pressure, no obligation.
        </ThemedText>
      </View>

      <Card style={styles.aboutCard}>
        <ThemedText type="smallBold" themeColor="accent">
          About {business.trainerName}
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          {business.trainerName} trains every dog on a Heel walk personally, using the same methods
          he used to raise Bean and Pickles — from a food-motivated chihuahua to a high-drive
          working-line cross — to a genuinely high standard by 9 months old.
        </ThemedText>
        <ThemedText themeColor="textSecondary" type="small">
          {business.serviceArea}
        </ThemedText>
      </Card>

      <View style={styles.contactRow}>
        <ContactLink
          icon="mail"
          label={business.contact.email}
          onPress={() => Linking.openURL(`mailto:${business.contact.email}`)}
        />
        <ContactLink
          icon="call"
          label={business.contact.phone}
          onPress={() => Linking.openURL(`tel:${business.contact.phone.replace(/\s/g, '')}`)}
        />
      </View>

      {status === 'sent' ? (
        <Card style={[styles.confirmationCard, styles.successCard]}>
          <Ionicons name="checkmark-circle" size={28} color={Colors.success} />
          <ThemedText type="smallBold">Sent — thank you.</ThemedText>
          <ThemedText themeColor="textSecondary" type="small">
            {business.trainerName} will get back to you soon.
          </ThemedText>
        </Card>
      ) : (
        <View style={styles.form}>
          <ThemedText type="subtitle">Or send a message</ThemedText>
          <TextField label="Your name" value={name} onChangeText={setName} autoCapitalize="words" />
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextField label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <TextField
            label="Tell us about your dog"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            style={styles.multiline}
          />

          {status === 'unavailable' && (
            <ThemedText type="small" themeColor="attention">
              That didn't go through — the booking system isn't fully switched on yet. Please reach
              {business.trainerName} directly using the details above instead.
            </ThemedText>
          )}

          <Button
            label="Send message"
            onPress={handleSubmit}
            disabled={!canSubmit}
            loading={status === 'submitting'}
          />
        </View>
      )}

      <View style={styles.faqSection}>
        <ThemedText type="subtitle">Questions people ask</ThemedText>
        {faqs.map((faq) => (
          <Collapsible key={faq.question} title={faq.question}>
            <ThemedText type="small" themeColor="textSecondary">
              {faq.answer}
            </ThemedText>
          </Collapsible>
        ))}
      </View>
    </Screen>
  );
}

function ContactLink({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.contactLinkWrap}>
      <Ionicons name={icon} size={16} color={Colors.accent} onPress={onPress} />
      <ThemedText type="link" onPress={onPress}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.two,
  },
  centerText: {
    textAlign: 'center',
  },
  aboutCard: {
    gap: Spacing.two,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.four,
    justifyContent: 'center',
  },
  contactLinkWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  form: {
    gap: Spacing.three,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  confirmationCard: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  successCard: {
    borderColor: Colors.success,
  },
  faqSection: {
    gap: Spacing.three,
  },
});
