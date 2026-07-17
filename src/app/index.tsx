import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { MascotCluster } from '@/components/mascot-cluster';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { business, dogs, proofStatement, services } from '@/constants/business';
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
        <ThemedText type="subtitle">What every walk includes</ThemedText>
        <View style={styles.pillRow}>
          {['Loose-lead walking', 'Kerb waits', 'No pulling to other dogs', 'Calm around traffic', 'No barking'].map(
            (item) => (
              <View key={item} style={styles.pill}>
                <Ionicons name="checkmark" size={14} color={Colors.accent} />
                <ThemedText type="small">{item}</ThemedText>
              </View>
            ),
          )}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">Sessions & pricing</ThemedText>
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

      <View style={styles.section}>
        <ThemedText type="subtitle">The proof is in the dogs</ThemedText>
        <ThemedText themeColor="textSecondary">{proofStatement}</ThemedText>
        <View style={styles.dogRow}>
          {dogs.map((dog) => (
            <View key={dog.id} style={styles.dogTeaser}>
              <View style={styles.dogAvatar}>
                <Ionicons name="paw" size={28} color={Colors.accent} />
              </View>
              <ThemedText type="smallBold">{dog.name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {dog.breed}
              </ThemedText>
            </View>
          ))}
        </View>
        <Button label="See their full profiles" variant="secondary" onPress={() => router.push('/portfolio')} />
      </View>

      <Card style={styles.trainerCard}>
        <ThemedText type="smallBold" themeColor="accent">
          Meet your trainer
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          {business.trainerName} trains every dog on Heel walks personally — {business.serviceArea}
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
  dogRow: {
    flexDirection: 'row',
    gap: Spacing.four,
  },
  dogTeaser: {
    alignItems: 'center',
    gap: Spacing.half,
  },
  dogAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trainerCard: {
    alignItems: 'flex-start',
  },
});
