import { useFonts } from 'expo-font';
import { DefaultTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import AppTabs from '@/components/app-tabs';
import { SplashOverlay } from '@/components/splash-overlay';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    FrostImperial: require('@/assets/fonts/FrostImperial.ttf'),
  });

  return (
    <ThemeProvider value={DefaultTheme}>
      <StatusBar style="dark" />
      {fontsLoaded ? <AppTabs /> : null}
      <SplashOverlay ready={fontsLoaded} />
    </ThemeProvider>
  );
}
