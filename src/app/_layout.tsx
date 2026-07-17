import {
  ShantellSans_400Regular,
  ShantellSans_500Medium,
  ShantellSans_600SemiBold,
  ShantellSans_700Bold,
  useFonts,
} from '@expo-google-fonts/shantell-sans';
import { DarkTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import AppTabs from '@/components/app-tabs';
import { SplashOverlay } from '@/components/splash-overlay';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    ShantellSans_400Regular,
    ShantellSans_500Medium,
    ShantellSans_600SemiBold,
    ShantellSans_700Bold,
  });

  return (
    <ThemeProvider value={DarkTheme}>
      <StatusBar style="light" />
      {fontsLoaded ? <AppTabs /> : null}
      <SplashOverlay ready={fontsLoaded} />
    </ThemeProvider>
  );
}
