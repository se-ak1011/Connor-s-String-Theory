import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet } from 'react-native';

import { Colors, Radius } from '@/constants/theme';
import type { MediaItem } from '@/lib/media';

export function VideoTile({ media, size = 140 }: { media: MediaItem; size?: number }) {
  const player = useVideoPlayer(media.url ?? '', (p) => {
    p.loop = false;
  });

  return (
    <VideoView
      player={player}
      style={[styles.video, { width: size, height: size }]}
      nativeControls
      contentFit="cover"
    />
  );
}

const styles = StyleSheet.create({
  video: {
    borderRadius: Radius.medium,
    backgroundColor: Colors.backgroundElement,
  },
});
