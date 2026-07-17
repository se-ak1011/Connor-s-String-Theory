import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radius } from '@/constants/theme';

type BrandMarkProps = {
  size?: number;
  withWordmark?: boolean;
};

export function BrandMark({ size = 56, withWordmark = false }: BrandMarkProps) {
  return (
    <View style={styles.row}>
      <View
        style={[
          styles.badge,
          { width: size, height: size, borderRadius: size * (Radius.large / 128) },
        ]}>
        <Ionicons name="paw" size={size * 0.52} color={Colors.background} />
      </View>
      {withWordmark && (
        <ThemedText type="display" style={styles.wordmark}>
          Heel
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    color: Colors.text,
  },
});
