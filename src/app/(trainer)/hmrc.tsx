import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { BackLink } from '@/components/ui/back-link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { addIncomeEntry, fetchIncomeEntries, type IncomeEntry } from '@/lib/trainer';

export default function TrainerHmrcScreen() {
  const [entries, setEntries] = useState<IncomeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [kind, setKind] = useState<'income' | 'expense'>('income');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setEntries(await fetchIncomeEntries());
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const totals = useMemo(() => {
    const income = entries.filter((e) => e.kind === 'income').reduce((sum, e) => sum + e.amount, 0);
    const expenses = entries.filter((e) => e.kind === 'expense').reduce((sum, e) => sum + e.amount, 0);
    return { income, expenses, net: income - expenses };
  }, [entries]);

  async function handleAdd() {
    const parsed = Number(amount);
    if (!parsed || parsed <= 0) return;
    setSaving(true);
    setError(null);
    try {
      await addIncomeEntry({ amount: parsed, kind, category: category.trim() || undefined, notes: notes.trim() || undefined });
      setAmount('');
      setCategory('');
      setNotes('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that entry.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen refreshing={loading} onRefresh={load}>
      <View style={styles.header}>
        <BackLink label="Home" fallbackHref="/" />
        <ThemedText type="title">HMRC log</ThemedText>
        <ThemedText themeColor="textSecondary">
          A running record for your own bookkeeping — not tax advice, not a filing.
        </ThemedText>
      </View>

      <Card style={styles.totalsCard}>
        <TotalRow label="Income" value={totals.income} />
        <TotalRow label="Expenses" value={totals.expenses} />
        <TotalRow label="Net" value={totals.net} emphasize />
      </Card>

      <Card style={styles.formCard}>
        <ThemedText type="smallBold" themeColor="accent">
          Add an entry
        </ThemedText>
        <View style={styles.kindRow}>
          <Button
            label="Income"
            variant={kind === 'income' ? 'primary' : 'secondary'}
            onPress={() => setKind('income')}
            style={styles.kindButton}
          />
          <Button
            label="Expense"
            variant={kind === 'expense' ? 'primary' : 'secondary'}
            onPress={() => setKind('expense')}
            style={styles.kindButton}
          />
        </View>
        <TextField label="Amount (£)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
        <TextField label="Category (optional)" value={category} onChangeText={setCategory} />
        <TextField label="Notes (optional)" value={notes} onChangeText={setNotes} />
        {error && (
          <ThemedText type="small" themeColor="attention">
            {error}
          </ThemedText>
        )}
        <Button label="Add entry" onPress={handleAdd} disabled={!amount} loading={saving} />
      </Card>

      <View style={styles.section}>
        <ThemedText type="subtitle">Entries</ThemedText>
        {entries.length === 0 ? (
          <Card>
            <EmptyState icon="cash" title="Nothing logged yet" message="Entries you add will show up here." />
          </Card>
        ) : (
          entries.map((entry) => (
            <Card key={entry.id} style={styles.entryCard}>
              <View style={styles.entryRow}>
                <ThemedText type="smallBold" themeColor={entry.kind === 'income' ? 'success' : 'attention'}>
                  {entry.kind === 'income' ? '+' : '-'}£{entry.amount.toFixed(2)}
                </ThemedText>
                <ThemedText type="small" themeColor="textMuted">
                  {entry.entryDate}
                </ThemedText>
              </View>
              {entry.category && (
                <ThemedText type="small" themeColor="textSecondary">
                  {entry.category}
                </ThemedText>
              )}
              {entry.notes && (
                <ThemedText type="small" themeColor="textMuted">
                  {entry.notes}
                </ThemedText>
              )}
            </Card>
          ))
        )}
      </View>
    </Screen>
  );
}

function TotalRow({ label, value, emphasize }: { label: string; value: number; emphasize?: boolean }) {
  return (
    <View style={styles.totalRow}>
      <ThemedText type={emphasize ? 'smallBold' : 'small'} themeColor={emphasize ? 'heading' : 'textSecondary'}>
        {label}
      </ThemedText>
      <ThemedText type={emphasize ? 'smallBold' : 'small'} themeColor={emphasize ? 'heading' : 'textSecondary'}>
        £{value.toFixed(2)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.two,
  },
  totalsCard: {
    gap: Spacing.one,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formCard: {
    gap: Spacing.two,
  },
  kindRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  kindButton: {
    flex: 1,
  },
  section: {
    gap: Spacing.two,
  },
  entryCard: {
    gap: Spacing.half,
  },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
