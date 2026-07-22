import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { BackLink } from '@/components/ui/back-link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PointsBadge } from '@/components/ui/points-badge';
import { community } from '@/constants/community';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { directPoints, fetchCommunityPoolTotal, fetchPointBalance, type PointBalance } from '@/lib/points';

export default function CommunityScreen() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<PointBalance | null>(null);
  const [poolTotal, setPoolTotal] = useState(0);
  const [directing, setDirecting] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const [b, total] = await Promise.all([fetchPointBalance(user.id), fetchCommunityPoolTotal()]);
    setBalance(b);
    setPoolTotal(total);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleDirect(direction: 'own_dog' | 'community') {
    if (!balance || balance.undirectedBalance <= 0) return;
    setDirecting(true);
    try {
      await directPoints(balance.undirectedBalance, direction);
      await load();
    } finally {
      setDirecting(false);
    }
  }

  return (
    <Screen>
      <BackLink label="Home" fallbackHref="/" />

      <View style={styles.header}>
        <ThemedText type="title">{community.title}</ThemedText>
        <ThemedText themeColor="textSecondary">{community.intro}</ThemedText>
      </View>

      {community.paragraphs.map((p, i) => (
        <ThemedText key={i} themeColor="textSecondary">
          {p}
        </ThemedText>
      ))}

      <Card style={styles.poolCard}>
        <PointsBadge amount={poolTotal} label="Community Points given so far" />
      </Card>

      {balance && balance.undirectedBalance > 0 && (
        <Card style={styles.directCard}>
          <ThemedText type="smallBold" themeColor="accent">
            You have {balance.undirectedBalance} points to direct
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {community.directPointsIntro}
          </ThemedText>
          <View style={styles.directButtons}>
            <Button
              label="Toward my dog"
              variant="secondary"
              onPress={() => handleDirect('own_dog')}
              disabled={directing}
              style={styles.directButton}
            />
            <Button
              label="Toward the community"
              variant="secondary"
              onPress={() => handleDirect('community')}
              disabled={directing}
              style={styles.directButton}
            />
          </View>
        </Card>
      )}

      <Card>
        <ThemedText type="small" themeColor="textMuted" style={styles.centerText}>
          {community.referralThanks}
        </ThemedText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.two,
  },
  poolCard: {
    alignItems: 'center',
  },
  directCard: {
    gap: Spacing.two,
  },
  directButtons: {
    gap: Spacing.two,
  },
  directButton: {
    alignSelf: 'stretch',
  },
  centerText: {
    textAlign: 'center',
  },
});
