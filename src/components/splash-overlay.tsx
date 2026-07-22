import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';

import { BrandMark } from '@/components/brand-mark';
import { Spacing } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export function SplashOverlay({ ready }: { ready: boolean }) {
  const [visible, setVisible] = useState(true);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!ready) {
      // `ready` can legitimately flip back to false after a brief true
      // pulse (e.g. session resolves a render before the profile/role
      // does) — cancel any pending hide and re-cover the screen so we
      // never reveal a portal picked before auth state had fully settled.
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
        hideTimeout.current = null;
      }
      setVisible(true);
      return;
    }

    SplashScreen.hideAsync().finally(() => {
      hideTimeout.current = setTimeout(() => setVisible(false), 250);
    });

    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, [ready]);

  if (!visible) return null;

  return (
    <Animated.View exiting={FadeOut.duration(400)} style={styles.overlay}>
      <Image
        source={require('@/assets/images/splash/hero.jpg')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <View style={styles.scrim} />
      <View style={styles.wordmarkWrap}>
        {/* Wait for the custom font before rendering the wordmark — otherwise
            it briefly flashes in the system fallback serif. Light color here
            is a deliberate exception: this sits on the dark hero photo, not
            the app's usual light background. */}
        {ready && <BrandMark size={30} color="backgroundElement" />}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 1000,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(20, 16, 14, 0.28)',
  },
  wordmarkWrap: {
    position: 'absolute',
    bottom: '12%',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Spacing.five,
  },
});
