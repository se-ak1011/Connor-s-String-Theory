import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, type ImageProps } from 'expo-image';
import { router, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';

/**
 * The Home hero: just Pickles, tappable. No haptic — the only signal that
 * he's interactive is a soft pulse ring that loops until the first tap,
 * then stops for good. Pressing him doesn't move him; he just idly
 * breathes. When `chips` are provided, a tap fans up to three destination
 * chips out around him in a ring (tapping again, a chip, or outside hides
 * them). Ported from the companion pattern used in Hassle/Alchono.
 *
 * `mascotSource` falls back to a paw-icon placeholder when omitted —
 * useful for previewing layout changes without the real asset.
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

// Evenly spaced around an ellipse, starting at 12 o'clock and going
// clockwise. Capped at 3 chips here, so this always lands on the
// generic branch (no hand-tuned per-count layouts needed).
function slotFor(index: number, count: number) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / Math.max(count, 1);
  return { x: Math.cos(angle), y: Math.sin(angle) };
}

const RADIUS_X = 100;
const RADIUS_Y = 125;

export function MascotCluster({ mascotSource, chips }: MascotClusterProps) {
  const reducedMotion = useReducedMotion();
  const breathe = useSharedValue(0);
  const progress = useSharedValue(0);
  const tapPulse = useSharedValue(0);
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;
    breathe.value = withRepeat(withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [breathe, reducedMotion]);

  useEffect(() => {
    if (reducedMotion || hasOpened || open) {
      tapPulse.value = 0;
      return;
    }
    tapPulse.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.out(Easing.ease) }), -1, false);
  }, [hasOpened, open, reducedMotion, tapPulse]);

  useEffect(() => {
    progress.value = withSpring(open ? 1 : 0, { damping: 16, stiffness: 140 });
  }, [open, progress]);

  const characterStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -breathe.value * 3 }, { scale: 1 + breathe.value * 0.008 }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(tapPulse.value, [0, 0.55, 1], [0.16, 0.32, 0]),
    transform: [{ scale: interpolate(tapPulse.value, [0, 1], [0.88, 1.28]) }],
  }));

  function handlePress() {
    setHasOpened(true);
    if (chips && chips.length > 0) {
      setOpen((prev) => !prev);
    }
  }

  const showTapPulse = !reducedMotion && !hasOpened && !open;

  return (
    <View style={styles.cluster}>
      {open && <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />}

      <View style={styles.characterWrap} pointerEvents="box-none">
        {showTapPulse && <Animated.View pointerEvents="none" style={[styles.tapPulse, pulseStyle]} />}

        {chips?.slice(0, 3).map((chip, index, arr) => (
          <Chip
            key={chip.label}
            chip={chip}
            slot={slotFor(index, arr.length)}
            progress={progress}
            open={open}
            onNavigate={() => setOpen(false)}
          />
        ))}

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
    </View>
  );
}

function Chip({
  chip,
  slot,
  progress,
  open,
  onNavigate,
}: {
  chip: ClusterChip;
  slot: { x: number; y: number };
  progress: SharedValue<number>;
  open: boolean;
  onNavigate: () => void;
}) {
  const chipStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.55, 1], [0, 0.2, 1]),
    transform: [
      { translateX: progress.value * slot.x * RADIUS_X },
      { translateY: progress.value * slot.y * RADIUS_Y },
      { scale: interpolate(progress.value, [0, 1], [0.72, 1]) },
    ],
  }));

  return (
    <Animated.View pointerEvents={open ? 'auto' : 'none'} style={[styles.chipSlot, chipStyle]}>
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
  tapPulse: {
    position: 'absolute',
    width: '76%',
    aspectRatio: 1,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.complement,
    backgroundColor: Colors.accentSoft,
  },
  characterInner: {
    width: '78%',
    aspectRatio: 1,
    zIndex: 2,
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
    zIndex: 3,
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
