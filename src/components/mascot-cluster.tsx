import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, type ImageProps } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { router, type Href } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useEffect, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';

/**
 * The Home hero: just Pickles, tappable — a haptic bump, ringed by a slow
 * sonar pulse in Colors.complement (the one deliberate purple touch,
 * reserved for haptic/interactive moments). He doesn't move on tap; the
 * ring + haptic alone signal "this is interactive."
 *
 * `mascotSource` falls back to a paw-icon placeholder when omitted —
 * useful for previewing layout changes without the real asset.
 *
 * `chips`, when provided (trainer Home only — the public/client Home
 * passes none), turns a tap into a toggle: the same haptic fires, and up
 * to three destination chips fade/scale in around him instead of nothing
 * happening. Tapping again (or a chip itself) hides them.
 */

export type ClusterChip = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: Href;
};

type MascotClusterProps = {
  mascotSource?: ImageProps['source'];
  chips?: ClusterChip[];
};

const CHIP_SLOTS = ['top', 'bottomLeft', 'bottomRight'] as const;

export function MascotCluster({ mascotSource, chips }: MascotClusterProps) {
  const reducedMotion = useReducedMotion();
  const breathe = useSharedValue(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;
    breathe.value = withRepeat(withTiming(1, { duration: 2600 }), -1, true);
  }, [breathe, reducedMotion]);

  const characterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + breathe.value * 0.035 }],
  }));

  function handlePress() {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (chips && chips.length > 0) {
      setRevealed((prev) => !prev);
    }
  }

  return (
    <View style={styles.cluster}>
      <View style={styles.characterWrap} pointerEvents="box-none">
        {!reducedMotion && (
          <>
            <PulseRing delay={0} />
            <PulseRing delay={1400} />
          </>
        )}

        <Pressable onPress={handlePress} hitSlop={16} style={styles.characterInner}>
          <Animated.View style={[styles.characterFill, characterStyle]}>
            <View style={styles.glow} />
            {mascotSource ? (
              <Image source={mascotSource} style={styles.mascotImage} contentFit="contain" />
            ) : (
              <View style={styles.placeholderBadge}>
                <Ionicons name="paw" size={72} color={Colors.accent} />
              </View>
            )}
          </Animated.View>
        </Pressable>
      </View>

      {chips?.slice(0, 3).map((chip, index) => (
        <Chip key={chip.label} chip={chip} slot={CHIP_SLOTS[index]} revealed={revealed} onNavigate={() => setRevealed(false)} />
      ))}
    </View>
  );
}

function Chip({
  chip,
  slot,
  revealed,
  onNavigate,
}: {
  chip: ClusterChip;
  slot: (typeof CHIP_SLOTS)[number];
  revealed: boolean;
  onNavigate: () => void;
}) {
  const reveal = useSharedValue(0);

  useEffect(() => {
    reveal.value = withTiming(revealed ? 1 : 0, { duration: 220, easing: Easing.out(Easing.quad) });
  }, [revealed, reveal]);

  const chipStyle = useAnimatedStyle(() => ({
    opacity: reveal.value,
    transform: [{ scale: 0.7 + reveal.value * 0.3 }],
  }));

  return (
    <Animated.View
      pointerEvents={revealed ? 'auto' : 'none'}
      style={[styles.chipSlot, styles[slot], chipStyle]}>
      <Pressable
        onPress={() => {
          onNavigate();
          router.push(chip.href);
        }}
        style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}>
        <Ionicons name={chip.icon} size={14} color={Colors.accent} />
        <ThemedText type="small">{chip.label}</ThemedText>
      </Pressable>
    </Animated.View>
  );
}

function PulseRing({ delay }: { delay: number }) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 2800, easing: Easing.out(Easing.ease) }), -1, false),
    );
  }, [delay, t]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: (1 - t.value) * 0.5,
    transform: [{ scale: 1 + t.value * 0.55 }],
  }));

  return <Animated.View pointerEvents="none" style={[styles.ring, ringStyle]} />;
}

const styles = StyleSheet.create({
  cluster: {
    width: '100%',
    maxWidth: 380,
    aspectRatio: 1,
    alignSelf: 'center',
    position: 'relative',
  },
  characterWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: '72%',
    aspectRatio: 1,
    borderRadius: Radius.pill,
    borderWidth: 2,
    borderColor: Colors.complement,
  },
  characterInner: {
    width: '78%',
    aspectRatio: 1,
  },
  characterFill: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: '68%',
    aspectRatio: 1,
    borderRadius: Radius.pill,
    backgroundColor: Colors.accentSoft,
    opacity: 0.6,
  },
  placeholderBadge: {
    width: '58%',
    aspectRatio: 1,
    borderRadius: Radius.large,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotImage: {
    width: '100%',
    height: '100%',
  },
  chipSlot: {
    position: 'absolute',
  },
  top: {
    top: '2%',
    left: '50%',
    transform: [{ translateX: -60 }],
  },
  bottomLeft: {
    bottom: '6%',
    left: 0,
  },
  bottomRight: {
    bottom: '6%',
    right: 0,
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
  chipPressed: {
    opacity: 0.75,
  },
});
