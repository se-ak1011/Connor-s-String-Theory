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
  const { session, loading, profile, profileLoading } = useAuth();

  // Splash overlay covers both windows — nothing renders underneath until
  // we know which side of the gate to show, and (once logged in) which
  // role's portal that is. Without waiting on profileLoading too, a
  // trainer would flash the client portal for a frame before their role
  // resolves.
  if (loading || (!!session && profileLoading)) return null;

  const isTrainer = profile?.role === 'trainer';

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(public)" />
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={!!session && !isTrainer}>
        <Stack.Screen name="(portal)" />
      </Stack.Protected>
      <Stack.Protected guard={!!session && isTrainer}>
        <Stack.Screen name="(trainer)" />
      </Stack.Protected>
    </Stack>
  );
}

// Small wrapper so the splash stays up until fonts, the auth session
// check, AND (if logged in) the profile/role fetch have all resolved —
// otherwise it can drop away before RootNavigator knows which portal to
// show.
function SplashOverlayGate({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { loading: authLoading, session, profileLoading } = useAuth();
  const ready = fontsLoaded && !authLoading && !(session && profileLoading);
  return <SplashOverlay ready={ready} />;
}
