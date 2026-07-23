import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import { SplashOverlay } from '@/components/splash-overlay';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
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
  const { session, loading, profile, profileLoading, profileError, retryProfile } = useAuth();

  // Splash overlay covers both windows — nothing renders underneath until
  // we know which side of the gate to show, and (once logged in) which
  // role's portal that is. Without waiting on profileLoading too, a
  // trainer would flash the client portal for a frame before their role
  // resolves.
  if (loading || (!!session && profileLoading)) return null;

  // A real fetch/repair failure (schema not exposed, RLS, network) — not
  // the same as "profile loaded, role is client". Never let this fall
  // through to the client portal; show something recoverable instead.
  if (session && profileError) {
    return <ProfileErrorScreen message={profileError} onRetry={retryProfile} />;
  }

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

function ProfileErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <ThemedView style={styles.errorRoot}>
      <View style={styles.errorContent}>
        <ThemedText type="subtitle" style={styles.errorText}>
          Couldn&apos;t load your account
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.errorText}>
          {message}
        </ThemedText>
        <Button label="Try again" onPress={onRetry} />
      </View>
    </ThemedView>
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

const styles = StyleSheet.create({
  errorRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.five,
  },
  errorContent: {
    gap: Spacing.three,
    alignItems: 'center',
    maxWidth: 340,
  },
  errorText: {
    textAlign: 'center',
  },
});
