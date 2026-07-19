import { useFonts } from 'expo-font';
import { DarkTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import AppTabs from '@/components/app-tabs';
import { SplashOverlay } from '@/components/splash-overlay';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Satoshi-Regular': require('@/assets/fonts/Satoshi-Regular.ttf'),
    'Satoshi-Medium': require('@/assets/fonts/Satoshi-Medium.ttf'),
    'Satoshi-Bold': require('@/assets/fonts/Satoshi-Bold.ttf'),
    'Satoshi-Black': require('@/assets/fonts/Satoshi-Black.ttf'),
  });

  return (
    <ThemeProvider value={DarkTheme}>
      <StatusBar style="light" />
      {fontsLoaded ? <AppTabs /> : null}
      <SplashOverlay ready={fontsLoaded} />
    </ThemeProvider>
  );
}
