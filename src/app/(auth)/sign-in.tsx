import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BrandMark } from '@/components/brand-mark';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = email.trim() && password.trim();

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const { error: signInError } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (signInError) {
      setError(signInError);
      return;
    }
    // Stack.Protected picks up the session change and swaps in the portal
    // on its own — no manual navigation needed here.
  }

  return (
    <Screen>
      <View style={styles.header}>
        <BrandMark size={26} />
        <ThemedText type="title" style={styles.centerText}>
          Welcome back
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.centerText}>
          Sign in to see your dog's training, upcoming sessions and Connor's notes.
        </ThemedText>
      </View>

      <View style={styles.form}>
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
          autoComplete="password"
        />

        {error && (
          <ThemedText type="small" themeColor="attention">
            {error}
          </ThemedText>
        )}

        <Button label="Sign in" onPress={handleSubmit} disabled={!canSubmit} loading={submitting} />
      </View>

      <View style={styles.footer}>
        <ThemedText type="small" themeColor="textSecondary">
          New here?{' '}
          <Link href="/sign-up" asChild>
            <ThemedText type="linkPrimary">Create an account</ThemedText>
          </Link>
        </ThemedText>
        <ThemedText
          type="link"
          themeColor="textMuted"
          onPress={() => router.push('/')}
          style={styles.centerText}>
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
});
