import Ionicons from '@expo/vector-icons/Ionicons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { MediaItem } from '@/lib/media';

function formatSeconds(seconds: number) {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function VoiceNoteRow({ media }: { media: MediaItem }) {
  const player = useAudioPlayer(media.url ?? undefined);
  const status = useAudioPlayerStatus(player);

  function toggle() {
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  }

  return (
    <Pressable onPress={toggle} style={styles.row}>
      <Ionicons name={status.playing ? 'pause-circle' : 'play-circle'} size={28} color={Colors.accent} />
      <View style={styles.info}>
        <ThemedText type="small">Voice note</ThemedText>
        <ThemedText type="small" themeColor="textMuted">
          {formatSeconds(status.playing ? status.currentTime : status.duration)}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: Colors.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.medium,
    padding: Spacing.two,
  },
  info: {
    gap: Spacing.half,
  },
});
