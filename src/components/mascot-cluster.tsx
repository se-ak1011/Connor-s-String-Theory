import Ionicons from '@expo/vector-icons/Ionicons';
import { router, type Href } from 'expo-router';
import { Image, type ImageProps } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';

/**
 * The Home hero: a central mascot illustration with four chips arranged
 * around it, radially — the pattern used across the rest of the Sends
 * family (Hassle's Lola, Alchono's companion).
 *
 * `mascotSource` falls back to a paw-icon placeholder when omitted —
 * useful for previewing layout changes without the real asset.
 *
 * The character is tappable — a haptic bump plus a little bounce — and
 * ringed by a slow sonar pulse in Colors.complement (the one deliberate
 * purple touch, reserved for haptic/interactive moments) to signal
 * "this is interactive," a nod to Lola's own pulse in Hassle.
 */

type ClusterChip = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: Href;
  highlight?: boolean;
};

const CHIPS: [ClusterChip, ClusterChip, ClusterChip, ClusterChip] = [
  { label: 'Meet Pickles', icon: 'paw', href: '/meet-pickles' },
  { label: 'Services', icon: 'list', href: '/book' },
  { label: 'Meet Connor', icon: 'chatbubble-ellipses', href: '/contact' },
  { label: 'Book a session', icon: 'calendar', href: '/book', highlight: true },
];

type MascotClusterProps = {
  mascotSource?: ImageProps['source'];
};

export function MascotCluster({ mascotSource }: MascotClusterProps) {
  const reducedMotion = useReducedMotion();
  const breathe = useSharedValue(0);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    if (reducedMotion) return;
    breathe.value = withRepeat(withTiming(1, { duration: 2600 }), -1, true);
  }, [breathe, reducedMotion]);

  const characterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: (1 + breathe.value * 0.035) * pressScale.value }],
  }));

  function handlePress() {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    pressScale.value = withSequence(
      withTiming(0.92, { duration: 90, easing: Easing.out(Easing.quad) }),
      withSpring(1, { damping: 7, stiffness: 220 }),
    );
  }

  return (
    <View style={styles.cluster}>
      <Chip chip={CHIPS[0]} style={styles.topLeft} />
      <Chip chip={CHIPS[1]} style={styles.topRight} />

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

      <Chip chip={CHIPS[2]} style={styles.bottomLeft} />
      <Chip chip={CHIPS[3]} style={styles.bottomRight} />
    </View>
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

function Chip({ chip, style }: { chip: ClusterChip; style: object }) {
  return (
    <View style={style}>
      <Pressable
        onPress={() => router.push(chip.href)}
        style={({ pressed }) => [
          styles.chip,
          chip.highlight && styles.chipHighlight,
          pressed && styles.chipPressed,
        ]}>
        <Ionicons
          name={chip.icon}
          size={14}
          color={chip.highlight ? Colors.onAccent : Colors.accent}
        />
        <ThemedText type="small" themeColor={chip.highlight ? 'onAccent' : 'text'}>
          {chip.label}
        </ThemedText>
      </Pressable>
    </View>
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
  topLeft: { position: 'absolute', top: '4%', left: 0 },
  topRight: { position: 'absolute', top: '4%', right: 0 },
  bottomLeft: { position: 'absolute', bottom: '6%', left: 0 },
  bottomRight: { position: 'absolute', bottom: '6%', right: 0 },
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
  chipHighlight: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  chipPressed: {
    opacity: 0.75,
  },
});
