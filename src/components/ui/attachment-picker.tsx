import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { VoiceRecorderButton } from '@/components/ui/voice-recorder-button';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { pickAndUploadVideo, uploadPhoto, type MediaItem } from '@/lib/media';

type AttachmentPickerProps = {
  userId: string;
  targets?: { dogId?: string; messageId?: string; homeworkAssignmentId?: string };
  onUploaded?: (media: MediaItem) => void;
};

/**
 * Photo and video pick from the library (expo-image-picker); voice
 * records in-app (expo-audio). All three upload to the same private
 * connorst-media bucket and record a `media` row the same way.
 */
export function AttachmentPicker({ userId, targets, onUploaded }: AttachmentPickerProps) {
  const [uploadingKind, setUploadingKind] = useState<'photo' | 'video' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePhoto() {
    setUploadingKind('photo');
    setError(null);
    try {
      const media = await uploadPhoto(userId, targets);
      if (media) onUploaded?.(media);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload that photo — try again.');
    } finally {
      setUploadingKind(null);
    }
  }

  async function handleVideo() {
    setUploadingKind('video');
    setError(null);
    try {
      const media = await pickAndUploadVideo(userId, targets);
      if (media) onUploaded?.(media);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload that video — try again.');
    } finally {
      setUploadingKind(null);
    }
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Pressable onPress={handlePhoto} disabled={uploadingKind !== null} style={styles.chip}>
          <Ionicons name="image" size={16} color={Colors.accent} />
          <ThemedText type="small">{uploadingKind === 'photo' ? 'Uploading…' : 'Photo'}</ThemedText>
        </Pressable>

        <Pressable onPress={handleVideo} disabled={uploadingKind !== null} style={styles.chip}>
          <Ionicons name="videocam" size={16} color={Colors.accent} />
          <ThemedText type="small">{uploadingKind === 'video' ? 'Uploading…' : 'Video'}</ThemedText>
        </Pressable>

        <VoiceRecorderButton userId={userId} targets={targets} onUploaded={onUploaded} onError={setError} />
      </View>
      {error && (
        <ThemedText type="small" themeColor="attention">
          {error}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    backgroundColor: Colors.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
});
