import Ionicons from '@expo/vector-icons/Ionicons';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { MAX_VOICE_DURATION_SECONDS, uploadVoiceNote, type MediaItem } from '@/lib/media';

type VoiceRecorderButtonProps = {
  userId: string;
  targets?: { dogId?: string; messageId?: string; homeworkAssignmentId?: string };
  onUploaded?: (media: MediaItem) => void;
  onError?: (message: string) => void;
};

function formatDuration(millis: number) {
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Tap to start recording, tap again to stop and upload — auto-stops at
 * MAX_VOICE_DURATION_SECONDS so nobody accidentally leaves it running.
 * Recording (not picking, like photo/video) is the natural interaction
 * here — there's no library of existing voice notes to choose from.
 */
export function VoiceRecorderButton({ userId, targets, onUploaded, onError }: VoiceRecorderButtonProps) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const state = useAudioRecorderState(recorder, 200);
  const [uploading, setUploading] = useState(false);
  const stopping = useRef(false);

  async function handlePress() {
    if (state.isRecording) {
      await handleStop();
      return;
    }

    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      onError?.('Microphone access is needed to record a voice note.');
      return;
    }

    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
  }

  async function handleStop() {
    // The auto-stop effect below and a manual tap can race in the same
    // ~200ms polling window right at the max-duration mark — make sure
    // recorder.stop()/upload only ever runs once per recording.
    if (stopping.current) return;
    stopping.current = true;

    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) return;

      setUploading(true);
      try {
        const media = await uploadVoiceNote(userId, uri, targets);
        onUploaded?.(media);
      } catch (err) {
        onError?.(err instanceof Error ? err.message : 'Could not upload that voice note — try again.');
      } finally {
        setUploading(false);
      }
    } finally {
      stopping.current = false;
    }
  }

  // Belt-and-suspenders auto-stop — most native recorders also enforce a
  // max duration internally, but this guarantees it regardless of platform.
  // Runs as an effect, not inline during render, since stopping has side
  // effects (native calls + state updates).
  useEffect(() => {
    if (state.isRecording && state.durationMillis >= MAX_VOICE_DURATION_SECONDS * 1000) {
      handleStop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isRecording, state.durationMillis]);

  const label = uploading
    ? 'Uploading…'
    : state.isRecording
      ? `Stop · ${formatDuration(state.durationMillis)}`
      : 'Voice note';

  return (
    <Pressable
      onPress={handlePress}
      disabled={uploading}
      style={[styles.chip, state.isRecording && styles.chipRecording]}>
      <Ionicons
        name={state.isRecording ? 'stop-circle' : 'mic'}
        size={16}
        color={state.isRecording ? Colors.attention : Colors.accent}
      />
      <ThemedText type="small" themeColor={state.isRecording ? 'attention' : 'text'}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  chipRecording: {
    borderColor: Colors.attention,
  },
});
