import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';

import { BrandMark } from '@/components/brand-mark';
import { Spacing } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export function SplashOverlay({ ready }: { ready: boolean }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!ready) return;
    SplashScreen.hideAsync().finally(() => {
      setTimeout(() => setVisible(false), 250);
    });
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
