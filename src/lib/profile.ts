import * as ImagePicker from 'expo-image-picker';

import { supabase } from '@/lib/supabase';

export type Dog = {
  id: string;
  userId: string;
  name: string;
  breed: string | null;
  dateOfBirth: string | null;
  // Always a resolved, displayable signed URL (or null) — never the raw
  // storage path. See resolvePhotoUrl below for why.
  photoUrl: string | null;
  medicalNotes: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  currentFocus: string | null;
};

export type NotificationPrefs = {
  pushEnabled: boolean;
  homeworkReminders: boolean;
  messageAlerts: boolean;
  sessionReminders: boolean;
};

const MEDIA_BUCKET = 'connorst-media';

/**
 * dogs.photo_url stores a Storage *path*, not a public URL — the bucket is
 * private, so every read needs a freshly-signed URL. A signed URL would
 * eventually expire if we stored it directly, silently breaking the photo
 * that's supposed to be the first thing a client sees on Home.
 */
async function resolvePhotoUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage.from(MEDIA_BUCKET).createSignedUrl(path, 60 * 60 * 24 * 7);
  if (error) console.error('[profile] resolvePhotoUrl failed', error.message);
  return data?.signedUrl ?? null;
}

async function mapDog(row: any): Promise<Dog> {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    breed: row.breed,
    dateOfBirth: row.date_of_birth,
    photoUrl: await resolvePhotoUrl(row.photo_url),
    medicalNotes: row.medical_notes,
    emergencyContactName: row.emergency_contact_name,
    emergencyContactPhone: row.emergency_contact_phone,
    currentFocus: row.current_focus,
  };
}

/**
 * v1 only surfaces one dog per client — the oldest row if a household has
 * more than one. A multi-dog switcher is a known future addition.
 */
export async function fetchMyDog(userId: string): Promise<Dog | null> {
  const { data, error } = await supabase
    .from('dogs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) console.error('[profile] fetchMyDog failed', error.message);
  return data ? mapDog(data) : null;
}

export async function createDog(
  userId: string,
  fields: { name: string; breed?: string; dateOfBirth?: string },
): Promise<Dog> {
  const { data, error } = await supabase
    .from('dogs')
    .insert({
      user_id: userId,
      name: fields.name,
      breed: fields.breed ?? null,
      date_of_birth: fields.dateOfBirth ?? null,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Could not add dog.');
  }
  return mapDog(data);
}

export async function updateDog(
  dogId: string,
  patch: Partial<{
    breed: string;
    dateOfBirth: string;
    photoPath: string;
    medicalNotes: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
  }>,
): Promise<void> {
  const updates: Record<string, unknown> = {};
  if (patch.breed !== undefined) updates.breed = patch.breed;
  if (patch.dateOfBirth !== undefined) updates.date_of_birth = patch.dateOfBirth;
  if (patch.photoPath !== undefined) updates.photo_url = patch.photoPath;
  if (patch.medicalNotes !== undefined) updates.medical_notes = patch.medicalNotes;
  if (patch.emergencyContactName !== undefined) updates.emergency_contact_name = patch.emergencyContactName;
  if (patch.emergencyContactPhone !== undefined) updates.emergency_contact_phone = patch.emergencyContactPhone;

  const { error } = await supabase.from('dogs').update(updates).eq('id', dogId);
  if (error) throw new Error(error.message);
}

export type PickedPhoto = {
  uri: string;
  mimeType?: string;
};

/**
 * Just the picker step, no upload — lets the Add Dog form show a local
 * preview before the dog (and therefore an id to upload against) exists.
 */
export async function pickDogPhoto(): Promise<PickedPhoto | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  return { uri: asset.uri, mimeType: asset.mimeType };
}

/**
 * Uploads an already-picked photo as this dog's profile photo, under the
 * same private bucket/path convention as lib/media.ts (first path segment
 * = owner's user id, so the existing Storage RLS policies already cover
 * this without any new policy).
 */
export async function uploadDogPhoto(userId: string, dogId: string, photo: PickedPhoto): Promise<string | null> {
  const ext = photo.uri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${userId}/dog-${dogId}-${Date.now()}.${ext}`;

  const response = await fetch(photo.uri);
  const arrayBuffer = await response.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, arrayBuffer, { contentType: photo.mimeType ?? 'image/jpeg' });
  if (uploadError) throw new Error(uploadError.message);

  await updateDog(dogId, { photoPath: path });
  return resolvePhotoUrl(path);
}

/** Picks then immediately uploads — the common case once a dog already exists. */
export async function pickAndUploadDogPhoto(userId: string, dogId: string): Promise<string | null> {
  const photo = await pickDogPhoto();
  if (!photo) return null;
  return uploadDogPhoto(userId, dogId, photo);
}

export async function updateProfile(userId: string, fullName: string): Promise<void> {
  const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', userId);
  if (error) throw new Error(error.message);
}

export async function updateNotificationPrefs(userId: string, prefs: NotificationPrefs): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      notification_prefs: {
        push_enabled: prefs.pushEnabled,
        homework_reminders: prefs.homeworkReminders,
        message_alerts: prefs.messageAlerts,
        session_reminders: prefs.sessionReminders,
      },
    })
    .eq('id', userId);

  if (error) throw new Error(error.message);
}
