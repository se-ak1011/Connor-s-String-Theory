import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { clientDogs, pickles } from '@/constants/business';
import { Colors, Radius, Spacing } from '@/constants/theme';

export default function MeetPicklesScreen() {
  return (
    <Screen>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.centerText}>
          Meet Pickles
        </ThemedText>
      </View>

      <Image
        source={require('@/assets/images/mascot/pickles-default.png')}
        style={styles.heroImage}
        contentFit="contain"
      />

      <Card style={styles.picklesCard}>
        <View style={styles.picklesHeader}>
          <ThemedText type="subtitle">{pickles.name}</ThemedText>
          <ThemedText themeColor="textSecondary">{pickles.breed}</ThemedText>
        </View>
        <ThemedText themeColor="textSecondary">{pickles.story}</ThemedText>
        <View style={styles.trainedInWrap}>
          {pickles.trainedIn.map((skill) => (
            <View key={skill} style={styles.skillPill}>
              <Ionicons name="checkmark" size={13} color={Colors.accent} />
              <ThemedText type="small">{skill}</ThemedText>
            </View>
          ))}
        </View>
      </Card>

      <View style={styles.section}>
        <ThemedText type="subtitle">Dogs we've worked with</ThemedText>
        <ThemedText themeColor="textSecondary" type="small">
          A few of the dogs Connor has worked with, and where they've gotten to.
        </ThemedText>

        {clientDogs.map((dog) => (
          <Card key={dog.id} style={styles.dogCard}>
            <View style={styles.dogHeader}>
              <View style={styles.avatar}>
                <Ionicons name="paw" size={28} color={Colors.accent} />
              </View>
              <View style={styles.dogHeaderText}>
                <ThemedText type="smallBold">{dog.name}</ThemedText>
                <ThemedText themeColor="textSecondary" type="small">
                  {dog.breed}
                </ThemedText>
              </View>
            </View>

            <View style={styles.dogDetail}>
              <ThemedText type="small" themeColor="accent">
                The challenge
              </ThemedText>
              <ThemedText themeColor="textSecondary" type="small">
                {dog.challenge}
              </ThemedText>
            </View>

            <View style={styles.dogDetail}>
              <ThemedText type="small" themeColor="accent">
                The progress
              </ThemedText>
              <ThemedText themeColor="textSecondary" type="small">
                {dog.progress}
              </ThemedText>
            </View>

            {dog.testimonial && (
              <ThemedText type="small" themeColor="textMuted">
                "{dog.testimonial}"
              </ThemedText>
            )}
          </Card>
        ))}

        <ThemedText themeColor="textMuted" type="small" style={styles.centerText}>
          More dogs — and their owners' words — will be added here as new sessions begin.
        </ThemedText>
      </View>
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
  heroImage: {
    width: '100%',
    height: 260,
  },
  picklesCard: {
    gap: Spacing.three,
  },
  picklesHeader: {
    gap: Spacing.half,
  },
  section: {
    gap: Spacing.three,
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
    width: 56,
    height: 56,
    borderRadius: Radius.large,
    backgroundColor: Colors.brownSoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  dogHeaderText: {
    gap: Spacing.half,
  },
  dogDetail: {
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
