import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';

import { BrandMark } from '@/components/brand-mark';
import { Colors } from '@/constants/theme';

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
      <View style={styles.pulse}>
        <BrandMark size={88} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  pulse: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
