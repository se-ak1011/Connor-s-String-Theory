import { Kalam_300Light, Kalam_400Regular, Kalam_700Bold, useFonts } from '@expo-google-fonts/kalam';
import { DarkTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import AppTabs from '@/components/app-tabs';
import { SplashOverlay } from '@/components/splash-overlay';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Kalam_300Light,
    Kalam_400Regular,
    Kalam_700Bold,
  });

  return (
    <ThemeProvider value={DarkTheme}>
      <StatusBar style="light" />
      {fontsLoaded ? <AppTabs /> : null}
      <SplashOverlay ready={fontsLoaded} />
    </ThemeProvider>
  );
}
