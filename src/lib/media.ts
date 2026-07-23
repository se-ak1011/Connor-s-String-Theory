import * as ImagePicker from 'expo-image-picker';

import { supabase } from '@/lib/supabase';

export type MediaItem = {
  id: string;
  userId: string;
  dogId: string | null;
  kind: 'photo' | 'video' | 'voice';
  storagePath: string;
  caption: string | null;
  createdAt: string;
  url: string | null;
};

type MediaTargets = { dogId?: string; messageId?: string; homeworkAssignmentId?: string; caption?: string };

function mapMedia(row: any, url: string | null): MediaItem {
  return {
    id: row.id,
    userId: row.user_id,
    dogId: row.dog_id,
    kind: row.kind,
    storagePath: row.storage_path,
    caption: row.caption,
    createdAt: row.created_at,
    url,
  };
}

const BUCKET = 'connorst-media';
// Keeps clips small enough to upload comfortably on mobile data and to not
// blow through Storage on a free/low tier — same reasoning as photo's 0.8
// quality compression.
export const MAX_VIDEO_DURATION_SECONDS = 60;
export const MAX_VOICE_DURATION_SECONDS = 120;

/**
 * Shared upload step for every media kind: pushes the file to the private
 * `connorst-media` bucket under the user's own folder (matches the storage
 * RLS policy), records a `media` row, and resolves a signed URL to hand
 * straight back for immediate use.
 */
async function uploadLocalFile(
  userId: string,
  kind: MediaItem['kind'],
  uri: string,
  mimeType: string | undefined,
  fallbackExt: string,
  targets: MediaTargets,
): Promise<MediaItem> {
  const ext = uri.split('.').pop()?.toLowerCase() || fallbackExt;
  const path = `${userId}/${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;

  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, arrayBuffer, { contentType: mimeType ?? 'application/octet-stream' });
  if (uploadError) throw new Error(uploadError.message);

  const { data, error } = await supabase
    .from('media')
    .insert({
      user_id: userId,
      dog_id: targets.dogId ?? null,
      message_id: targets.messageId ?? null,
      homework_assignment_id: targets.homeworkAssignmentId ?? null,
      kind,
      storage_path: path,
      caption: targets.caption ?? null,
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? `Could not save that ${kind}.`);

  const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
  return mapMedia(data, signed?.signedUrl ?? null);
}

export async function uploadPhoto(userId: string, targets: MediaTargets = {}): Promise<MediaItem | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  return uploadLocalFile(userId, 'photo', asset.uri, asset.mimeType ?? 'image/jpeg', 'jpg', targets);
}

/**
 * Picks an existing video from the library (same picker as photos, just a
 * different media type) rather than recording live — keeps this in line
 * with what the picker already does for photos, no camera module needed.
 */
export async function pickAndUploadVideo(userId: string, targets: MediaTargets = {}): Promise<MediaItem | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['videos'],
    quality: 0.8,
    videoMaxDuration: MAX_VIDEO_DURATION_SECONDS,
  });
  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  return uploadLocalFile(userId, 'video', asset.uri, asset.mimeType ?? 'video/mp4', 'mp4', targets);
}

/**
 * Voice notes are recorded in-app (see VoiceRecorderButton), not picked
 * from a library — this just uploads the local recording expo-audio
 * already produced.
 */
export async function uploadVoiceNote(userId: string, localUri: string, targets: MediaTargets = {}): Promise<MediaItem> {
  return uploadLocalFile(userId, 'voice', localUri, 'audio/m4a', 'm4a', targets);
}

export async function fetchMedia(filter: { dogId?: string; kind?: MediaItem['kind'] }): Promise<MediaItem[]> {
  let query = supabase.from('media').select('*').order('created_at', { ascending: false });
  if (filter.dogId) query = query.eq('dog_id', filter.dogId);
  if (filter.kind) query = query.eq('kind', filter.kind);

  const { data, error } = await query;
  if (error) console.error('[media] fetchMedia failed', error.message);
  if (error || !data) return [];

  const withUrls = await Promise.all(
    data.map(async (row) => {
      const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(row.storage_path, 60 * 60);
      return mapMedia(row, signed?.signedUrl ?? null);
    }),
  );
  return withUrls;
}
