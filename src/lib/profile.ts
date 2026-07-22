import { supabase } from '@/lib/supabase';

export type Dog = {
  id: string;
  userId: string;
  name: string;
  breed: string | null;
  dateOfBirth: string | null;
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

function mapDog(row: any): Dog {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    breed: row.breed,
    dateOfBirth: row.date_of_birth,
    photoUrl: row.photo_url,
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
  const { data } = await supabase
    .from('dogs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

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
    photoUrl: string;
    medicalNotes: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
  }>,
): Promise<void> {
  const { error } = await supabase
    .from('dogs')
    .update({
      breed: patch.breed,
      date_of_birth: patch.dateOfBirth,
      photo_url: patch.photoUrl,
      medical_notes: patch.medicalNotes,
      emergency_contact_name: patch.emergencyContactName,
      emergency_contact_phone: patch.emergencyContactPhone,
    })
    .eq('id', dogId);

  if (error) throw new Error(error.message);
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
