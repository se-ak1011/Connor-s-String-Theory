import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Share, StyleSheet, Switch, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PointsBadge } from '@/components/ui/points-badge';
import { TextField } from '@/components/ui/text-field';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { fetchPointBalance, type PointBalance } from '@/lib/points';
import {
  createDog,
  fetchMyDog,
  updateDog,
  updateNotificationPrefs,
  type Dog,
  type NotificationPrefs,
} from '@/lib/profile';

const DEFAULT_PREFS: NotificationPrefs = {
  pushEnabled: true,
  homeworkReminders: true,
  messageAlerts: true,
  sessionReminders: true,
};

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const [dog, setDog] = useState<Dog | null>(null);
  const [newDogName, setNewDogName] = useState('');
  const [newDogBreed, setNewDogBreed] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [balance, setBalance] = useState<PointBalance | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const myDog = await fetchMyDog(user.id);
    setDog(myDog);
    setMedicalNotes(myDog?.medicalNotes ?? '');
    setEmergencyName(myDog?.emergencyContactName ?? '');
    setEmergencyPhone(myDog?.emergencyContactPhone ?? '');
    setBalance(await fetchPointBalance(user.id));
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleAddDog() {
    if (!user || !newDogName.trim()) return;
    setSaving(true);
    try {
      const created = await createDog(user.id, { name: newDogName.trim(), breed: newDogBreed.trim() || undefined });
      setDog(created);
      setNewDogName('');
      setNewDogBreed('');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveDogDetails() {
    if (!dog) return;
    setSaving(true);
    try {
      await updateDog(dog.id, {
        medicalNotes,
        emergencyContactName: emergencyName,
        emergencyContactPhone: emergencyPhone,
      });
    } finally {
      setSaving(false);
    }
  }

  async function togglePref(key: keyof NotificationPrefs) {
    if (!user) return;
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    await updateNotificationPrefs(user.id, next);
  }

  async function handleShareReferral() {
    if (!profile) return;
    await Share.share({
      message: `Come train with Connor's String Theory — use my code ${profile.referralCode} when you sign up.`,
    });
  }

  return (
    <Screen>
      <View style={styles.header}>
        <ThemedText type="title">Profile</ThemedText>
      </View>

      <Card style={styles.card}>
        <ThemedText type="smallBold" themeColor="accent">
          Your dog
        </ThemedText>
        {dog ? (
          <>
            <ThemedText type="default">{dog.name}</ThemedText>
            {dog.breed && (
              <ThemedText type="small" themeColor="textSecondary">
                {dog.breed}
              </ThemedText>
            )}
            <TextField
              label="Medical notes"
              value={medicalNotes}
              onChangeText={setMedicalNotes}
              multiline
              numberOfLines={3}
              style={styles.multiline}
            />
            <TextField label="Emergency contact name" value={emergencyName} onChangeText={setEmergencyName} />
            <TextField
              label="Emergency contact phone"
              value={emergencyPhone}
              onChangeText={setEmergencyPhone}
              keyboardType="phone-pad"
            />
            <Button label="Save" variant="secondary" onPress={handleSaveDogDetails} loading={saving} />
          </>
        ) : (
          <>
            <TextField label="Dog's name" value={newDogName} onChangeText={setNewDogName} autoCapitalize="words" />
            <TextField label="Breed" value={newDogBreed} onChangeText={setNewDogBreed} autoCapitalize="words" />
            <Button label="Add dog" onPress={handleAddDog} disabled={!newDogName.trim()} loading={saving} />
          </>
        )}
      </Card>

      <Card style={styles.card}>
        <ThemedText type="smallBold" themeColor="accent">
          Notifications
        </ThemedText>
        <PrefRow label="Push notifications" value={prefs.pushEnabled} onToggle={() => togglePref('pushEnabled')} />
        <PrefRow label="Homework reminders" value={prefs.homeworkReminders} onToggle={() => togglePref('homeworkReminders')} />
        <PrefRow label="Message alerts" value={prefs.messageAlerts} onToggle={() => togglePref('messageAlerts')} />
        <PrefRow label="Session reminders" value={prefs.sessionReminders} onToggle={() => togglePref('sessionReminders')} />
      </Card>

      <Card style={styles.pointsCard}>
        <ThemedText type="smallBold" themeColor="accent">
          Community Points
        </ThemedText>
        <PointsBadge amount={balance?.lifetimeEarned ?? 0} label="Lifetime earned" />
        {profile && (
          <View style={styles.referralRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Your code: {profile.referralCode}
            </ThemedText>
            <Button label="Share" variant="secondary" onPress={handleShareReferral} />
          </View>
        )}
      </Card>

      <Button label="Sign out" variant="secondary" onPress={signOut} />
    </Screen>
  );
}

function PrefRow({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) {
  return (
    <View style={styles.prefRow}>
      <ThemedText type="small">{label}</ThemedText>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.border, true: Colors.accent }}
        thumbColor={Colors.backgroundElement}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.two,
  },
  card: {
    gap: Spacing.two,
  },
  multiline: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  pointsCard: {
    gap: Spacing.two,
    alignItems: 'center',
  },
  referralRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
