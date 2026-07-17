import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, type ImageProps } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { dogs, proofStatement } from '@/constants/business';
import { Colors, Spacing } from '@/constants/theme';

// Add each dog's illustration here as it's ready — falls back to a paw icon until then.
const DOG_PHOTOS: Partial<Record<string, ImageProps['source']>> = {
  pickles: require('@/assets/images/mascot/pickles-default.png'),
};

export default function PortfolioScreen() {
  return (
    <Screen>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.centerText}>
          The dogs who prove it
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.centerText}>
          {proofStatement}
        </ThemedText>
      </View>

      {dogs.map((dog) => (
        <Card key={dog.id} style={styles.dogCard}>
          <View style={styles.dogHeader}>
            <View style={styles.avatar}>
              {DOG_PHOTOS[dog.id] ? (
                <Image source={DOG_PHOTOS[dog.id]} style={styles.avatarImage} contentFit="cover" />
              ) : (
                <Ionicons name="paw" size={32} color={Colors.accent} />
              )}
            </View>
            <View style={styles.dogHeaderText}>
              <ThemedText type="subtitle">{dog.name}</ThemedText>
              <ThemedText themeColor="textSecondary">{dog.breed}</ThemedText>
            </View>
          </View>

          <ThemedText themeColor="textSecondary">{dog.blurb}</ThemedText>

          <View style={styles.trainedInWrap}>
            {dog.trainedIn.map((skill) => (
              <View key={skill} style={styles.skillPill}>
                <Ionicons name="checkmark" size={13} color={Colors.accent} />
                <ThemedText type="small">{skill}</ThemedText>
              </View>
            ))}
          </View>
        </Card>
      ))}

      <ThemedText themeColor="textMuted" type="small" style={styles.centerText}>
        Photos and videos from real walks are coming soon.
      </ThemedText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.two,
  },
  centerText: {
    textAlign: 'center',
  },
  dogCard: {
    gap: Spacing.three,
  },
  dogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  dogHeaderText: {
    gap: Spacing.half,
  },
  trainedInWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  skillPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    backgroundColor: Colors.background,
    borderRadius: Spacing.five,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
