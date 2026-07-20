import { WorkSans_400Regular, WorkSans_600SemiBold } from '@expo-google-fonts/work-sans';
import { useFonts } from 'expo-font';
import { DefaultTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import AppTabs from '@/components/app-tabs';
import { SplashOverlay } from '@/components/splash-overlay';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    FrostImperial: require('@/assets/fonts/FrostImperial.ttf'),
    WorkSans_400Regular,
    WorkSans_600SemiBold,
  });

  return (
    <ThemeProvider value={DefaultTheme}>
      <StatusBar style="dark" />
      {fontsLoaded ? <AppTabs /> : null}
      <SplashOverlay ready={fontsLoaded} />
    </ThemeProvider>
  );
}
