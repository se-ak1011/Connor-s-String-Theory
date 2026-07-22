import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BrandMark } from '@/components/brand-mark';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  const canSubmit = fullName.trim() && email.trim() && password.trim().length >= 6;

  function handleBackToSite() {
    // See the matching comment in sign-in.tsx — a plain href push/replace
    // to "/" is ambiguous across (public), (portal)/(tabs) and (trainer),
    // and silently no-ops from inside (auth). Going back through existing
    // history works reliably; replace() is only a fallback for landing
    // here with no history.
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const result = await signUp(email.trim(), password, fullName.trim(), referralCode.trim() || undefined);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.requiresConfirmation) {
      setAwaitingConfirmation(true);
      return;
    }
    // No confirmation required — Stack.Protected picks up the new session
    // and swaps in the portal on its own.
  }

  if (awaitingConfirmation) {
    return (
      <Screen>
        <Card style={styles.confirmCard}>
          <ThemedText type="subtitle" style={styles.centerText}>
            Check your inbox
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.centerText}>
            We've sent a confirmation link to {email.trim()}. Tap it, then come back and sign in.
          </ThemedText>
          <Link href="/sign-in" asChild>
            <Button label="Back to sign in" variant="secondary" />
          </Link>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <BrandMark size={26} />
        <ThemedText type="title" style={styles.centerText}>
          Create your account
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.centerText}>
          You'll be able to add your dog and see their training as soon as you're in.
        </ThemedText>
      </View>

      <View style={styles.form}>
        <TextField label="Your name" value={fullName} onChangeText={setFullName} autoCapitalize="words" />
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password-new"
        />
        <TextField
          label="Referral code (optional)"
          value={referralCode}
          onChangeText={setReferralCode}
          autoCapitalize="characters"
        />

        {error && (
          <ThemedText type="small" themeColor="attention">
            {error}
          </ThemedText>
        )}

        <Button label="Create account" onPress={handleSubmit} disabled={!canSubmit} loading={submitting} />
      </View>

      <View style={styles.footer}>
        <ThemedText type="small" themeColor="textSecondary">
          Already have an account?{' '}
          <Link href="/sign-in" asChild>
            <ThemedText type="linkPrimary">Sign in</ThemedText>
          </Link>
        </ThemedText>
        <ThemedText type="link" themeColor="textMuted" onPress={handleBackToSite} style={styles.centerText}>
          Back to the site
        </ThemedText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  centerText: {
    textAlign: 'center',
  },
  form: {
    gap: Spacing.three,
  },
  footer: {
    alignItems: 'center',
    gap: Spacing.three,
  },
  confirmCard: {
    alignItems: 'center',
    gap: Spacing.three,
  },
});
