import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { MascotCluster } from '@/components/mascot-cluster';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { business, focusAreas, philosophy, services } from '@/constants/business';
import { Colors, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <Screen>
      <View style={styles.hero}>
        <ThemedText type="title" style={styles.centerText}>
          {business.tagline}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.centerText}>
          Tap around Pickles, or dive straight into the details below.
        </ThemedText>

        <MascotCluster mascotSource={require('@/assets/images/mascot/pickles-default.png')} />

        <ThemedText themeColor="textSecondary" style={styles.centerText}>
          {business.intro}
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">{philosophy.title}</ThemedText>
        <ThemedText themeColor="textSecondary" type="small">
          {philosophy.intro}
        </ThemedText>
        <ThemedText themeColor="textSecondary" type="small">
          {philosophy.toolNote}
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">What sessions can work on</ThemedText>
        <ThemedText themeColor="textSecondary" type="small">
          No two dogs need the same thing. Sessions are built around whichever of these your dog
          needs most.
        </ThemedText>
        <View style={styles.pillRow}>
          {focusAreas.map((item) => (
            <View key={item} style={styles.pill}>
              <Ionicons name="checkmark" size={14} color={Colors.accent} />
              <ThemedText type="small">{item}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">Sessions</ThemedText>
        <ThemedText themeColor="textSecondary" type="small">
          Every session is shaped around your dog, not a fixed curriculum. These are typical
          starting points.
        </ThemedText>
        {services.map((service) => (
          <Card key={service.id} highlighted={service.highlight}>
            <ThemedText type="smallBold" themeColor="accent">
              {service.tagline}
            </ThemedText>
            <View style={styles.serviceHeader}>
              <ThemedText type="default" style={styles.serviceName}>
                {service.name}
              </ThemedText>
              <ThemedText type="smallBold">
                {service.price}{' '}
                <ThemedText type="small" themeColor="textSecondary">
                  {service.priceNote}
                </ThemedText>
              </ThemedText>
            </View>
            <ThemedText themeColor="textSecondary" type="small">
              {service.description}
            </ThemedText>
          </Card>
        ))}
      </View>

      <Card style={styles.picklesCard}>
        <ThemedText type="smallBold" themeColor="accent">
          The dog behind the method
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          Pickles — Connor's own dog — is a high-drive Belgian Malinois cross whose attention
          could easily run the show. String Theory was built around him, session by session,
          until calm, focused attention became the default.
        </ThemedText>
        <Button label="Meet Pickles" variant="secondary" onPress={() => router.push('/meet-pickles')} />
      </Card>

      <Card style={styles.trainerCard}>
        <ThemedText type="smallBold" themeColor="accent">
          Meet your trainer
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          {business.trainerName} trains every dog personally, and where it helps, he coaches
          owners too — the goal is a dog and handler who understand each other without him
          there. {business.serviceArea}
        </ThemedText>
        <Button label="Get in touch" variant="secondary" onPress={() => router.push('/contact')} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: Spacing.three,
  },
  centerText: {
    textAlign: 'center',
  },
  section: {
    gap: Spacing.three,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    backgroundColor: Colors.backgroundElement,
    borderRadius: Spacing.five,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  serviceName: {
    fontWeight: '600',
  },
  picklesCard: {
    alignItems: 'flex-start',
  },
  trainerCard: {
    alignItems: 'flex-start',
  },
});
