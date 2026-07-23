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

/**
 * Only photos are wired end to end this pass — picks from the library,
 * uploads to the private `connorst-media` bucket under the user's own
 * folder (matches the storage RLS policy), and records a `media` row.
 * Video/voice stay schema-valid but have no capture UI yet.
 */
export async function uploadPhoto(
  userId: string,
  targets: { dogId?: string; messageId?: string; homeworkAssignmentId?: string; caption?: string } = {},
): Promise<MediaItem | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.8,
  });
  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  const ext = asset.uri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${userId}/${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;

  const response = await fetch(asset.uri);
  const arrayBuffer = await response.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, arrayBuffer, { contentType: asset.mimeType ?? 'image/jpeg' });
  if (uploadError) throw new Error(uploadError.message);

  const { data, error } = await supabase
    .from('media')
    .insert({
      user_id: userId,
      dog_id: targets.dogId ?? null,
      message_id: targets.messageId ?? null,
      homework_assignment_id: targets.homeworkAssignmentId ?? null,
      kind: 'photo',
      storage_path: path,
      caption: targets.caption ?? null,
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Could not save photo.');

  const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
  return mapMedia(data, signed?.signedUrl ?? null);
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
