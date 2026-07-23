import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Share, StyleSheet, Switch, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PointsBadge } from '@/components/ui/points-badge';
import { TextField } from '@/components/ui/text-field';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { fetchPointBalance, type PointBalance } from '@/lib/points';
import {
  createDog,
  fetchMyDog,
  pickAndUploadDogPhoto,
  pickDogPhoto,
  updateDog,
  updateNotificationPrefs,
  uploadDogPhoto,
  type Dog,
  type NotificationPrefs,
  type PickedPhoto,
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
  const [newDogBirthdate, setNewDogBirthdate] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [balance, setBalance] = useState<PointBalance | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [newDogPhoto, setNewDogPhoto] = useState<PickedPhoto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const myDog = await fetchMyDog(user.id);
    setDog(myDog);
    setMedicalNotes(myDog?.medicalNotes ?? '');
    setEmergencyName(myDog?.emergencyContactName ?? '');
    setEmergencyPhone(myDog?.emergencyContactPhone ?? '');
    setBirthdate(myDog?.dateOfBirth ?? '');
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
    setError(null);
    try {
      const created = await createDog(user.id, {
        name: newDogName.trim(),
        breed: newDogBreed.trim() || undefined,
        dateOfBirth: newDogBirthdate.trim() || undefined,
      });
      if (newDogPhoto) {
        const photoUrl = await uploadDogPhoto(user.id, created.id, newDogPhoto);
        setDog({ ...created, photoUrl });
      } else {
        setDog(created);
      }
      setNewDogName('');
      setNewDogBreed('');
      setNewDogBirthdate('');
      setNewDogPhoto(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add your dog — try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePickNewDogPhoto() {
    setError(null);
    try {
      const photo = await pickDogPhoto();
      if (photo) setNewDogPhoto(photo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open your photos — try again.');
    }
  }

  async function handleSaveDogDetails() {
    if (!dog) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateDog(dog.id, {
        medicalNotes,
        emergencyContactName: emergencyName,
        emergencyContactPhone: emergencyPhone,
        dateOfBirth: birthdate,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save — try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePickPhoto() {
    if (!user || !dog) return;
    setUploadingPhoto(true);
    setError(null);
    try {
      const photoUrl = await pickAndUploadDogPhoto(user.id, dog.id);
      if (photoUrl) setDog({ ...dog, photoUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload that photo — try again.');
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function togglePref(key: keyof NotificationPrefs) {
    if (!user) return;
    const previous = prefs;
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setError(null);
    try {
      await updateNotificationPrefs(user.id, next);
    } catch (err) {
      setPrefs(previous);
      setError(err instanceof Error ? err.message : 'Could not save that preference — try again.');
    }
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
            <View style={styles.photoRow}>
              {dog.photoUrl ? (
                <Image source={{ uri: dog.photoUrl }} style={styles.photo} contentFit="cover" />
              ) : (
                <View style={styles.photoPlaceholder} />
              )}
              <Button
                label={dog.photoUrl ? 'Change photo' : 'Add photo'}
                variant="secondary"
                onPress={handlePickPhoto}
                loading={uploadingPhoto}
                style={styles.photoButton}
              />
            </View>
            <ThemedText type="default">{dog.name}</ThemedText>
            {dog.breed && (
              <ThemedText type="small" themeColor="textSecondary">
                {dog.breed}
              </ThemedText>
            )}
            <TextField
              label={'Birthdate (or estimate — e.g. "Spring 2022")'}
              value={birthdate}
              onChangeText={setBirthdate}
              placeholder="Unknown"
            />
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
            {saved && (
              <ThemedText type="small" themeColor="success">
                Saved.
              </ThemedText>
            )}
          </>
        ) : (
          <>
            <View style={styles.photoRow}>
              {newDogPhoto ? (
                <Image source={{ uri: newDogPhoto.uri }} style={styles.photo} contentFit="cover" />
              ) : (
                <View style={styles.photoPlaceholder} />
              )}
              <Button
                label={newDogPhoto ? 'Change photo' : 'Add photo'}
                variant="secondary"
                onPress={handlePickNewDogPhoto}
                style={styles.photoButton}
              />
            </View>
            <TextField label="Dog's name" value={newDogName} onChangeText={setNewDogName} autoCapitalize="words" />
            <TextField label="Breed" value={newDogBreed} onChangeText={setNewDogBreed} autoCapitalize="words" />
            <TextField
              label={'Birthdate (or estimate — e.g. "Spring 2022", optional)'}
              value={newDogBirthdate}
              onChangeText={setNewDogBirthdate}
              placeholder="Unknown"
            />
            <Button label="Add dog" onPress={handleAddDog} disabled={!newDogName.trim()} loading={saving} />
          </>
        )}
        {error && (
          <ThemedText type="small" themeColor="attention">
            {error}
          </ThemedText>
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
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  photo: {
    width: 64,
    height: 64,
    borderRadius: Radius.medium,
  },
  photoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: Radius.medium,
    backgroundColor: Colors.accentSoft,
  },
  photoButton: {
    flexShrink: 1,
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
