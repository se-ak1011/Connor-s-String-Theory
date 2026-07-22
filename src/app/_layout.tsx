import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { SplashOverlay } from '@/components/splash-overlay';
import { AuthProvider } from '@/lib/auth';
import { useAuth } from '@/hooks/use-auth';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    FrostImperial: require('@/assets/fonts/FrostImperial.ttf'),
    SimpleHandwriting: require('@/assets/fonts/SimpleHandwriting.ttf'),
  });

  return (
    <ThemeProvider value={DefaultTheme}>
      <StatusBar style="dark" />
      <AuthProvider>
        {fontsLoaded ? <RootNavigator /> : null}
        <SplashOverlayGate fontsLoaded={fontsLoaded} />
      </AuthProvider>
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { session, loading } = useAuth();

  // Splash overlay covers this brief window — nothing renders underneath
  // until we actually know which side of the gate to show.
  if (loading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(public)" />
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(portal)" />
      </Stack.Protected>
    </Stack>
  );
}

// Small wrapper so the splash stays up until BOTH fonts and the auth
// session check have resolved — otherwise it can drop away before
// RootNavigator knows whether to show the public site or the portal.
function SplashOverlayGate({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { loading: authLoading } = useAuth();
  return <SplashOverlay ready={fontsLoaded && !authLoading} />;
}
