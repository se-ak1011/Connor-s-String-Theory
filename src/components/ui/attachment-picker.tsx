import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ComingSoonBadge } from '@/components/ui/coming-soon-badge';
import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { uploadPhoto, type MediaItem } from '@/lib/media';

type AttachmentPickerProps = {
  userId: string;
  targets?: { dogId?: string; messageId?: string; homeworkAssignmentId?: string };
  onUploaded?: (media: MediaItem) => void;
};

/**
 * Photo works end to end (expo-image-picker + Supabase Storage). Video and
 * voice are schema-ready but not wired to a capture UI yet — shown as
 * "coming soon" rather than silently missing.
 */
export function AttachmentPicker({ userId, targets, onUploaded }: AttachmentPickerProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePhoto() {
    setUploading(true);
    setError(null);
    try {
      const media = await uploadPhoto(userId, targets);
      if (media) onUploaded?.(media);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload that photo — try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Pressable onPress={handlePhoto} disabled={uploading} style={styles.chip}>
          <Ionicons name="image" size={16} color={Colors.accent} />
          <ThemedText type="small">{uploading ? 'Uploading…' : 'Photo'}</ThemedText>
        </Pressable>

        <View style={styles.chip}>
          <Ionicons name="videocam" size={16} color={Colors.textMuted} />
          <ThemedText type="small" themeColor="textMuted">
            Video
          </ThemedText>
          <ComingSoonBadge />
        </View>

        <View style={styles.chip}>
          <Ionicons name="mic" size={16} color={Colors.textMuted} />
          <ThemedText type="small" themeColor="textMuted">
            Voice note
          </ThemedText>
          <ComingSoonBadge />
        </View>
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
