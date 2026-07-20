import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';

type ButtonProps = ComponentProps<typeof Pressable> & {
  label: string;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
};

export function Button({ label, variant = 'primary', loading, style, disabled, ...rest }: ButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        (pressed || disabled) && styles.pressed,
        typeof style === 'function' ? undefined : style,
      ]}
      {...rest}>
      {loading ? (
        // Progress indicator — one of the purple accent's deliberate use cases.
        <ActivityIndicator color={Colors.complement} />
      ) : (
        <ThemedText type="smallBold" themeColor={isPrimary ? 'onAccent' : 'backgroundElement'}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.five,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: Colors.accent,
  },
  secondary: {
    backgroundColor: Colors.brown,
    borderWidth: 1,
    borderColor: Colors.brown,
  },
  pressed: {
    opacity: 0.75,
  },
});
