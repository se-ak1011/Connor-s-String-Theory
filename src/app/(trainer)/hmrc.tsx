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
import { useAuth } from '@/hooks/use-auth';
import {
  addIncomeEntry,
  calcTaxPotSummary,
  fetchIncomeEntries,
  fetchTaxRate,
  updateTaxRate,
  type IncomeEntry,
} from '@/lib/trainer';

const RATE_PRESETS = [20, 30];

export default function TrainerHmrcScreen() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<IncomeEntry[]>([]);
  const [taxRate, setTaxRate] = useState(30);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [kind, setKind] = useState<'income' | 'expense'>('income');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [fetchedEntries, fetchedRate] = await Promise.all([fetchIncomeEntries(), fetchTaxRate()]);
    setEntries(fetchedEntries);
    setTaxRate(fetchedRate);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const summary = useMemo(() => calcTaxPotSummary(entries, taxRate), [entries, taxRate]);

  async function handleRateChange(rate: number) {
    if (!user) return;
    setTaxRate(rate);
    try {
      await updateTaxRate(user.id, rate);
    } catch {
      // Local state already reflects the tap; a failed write here just
      // means it'll revert to the stored rate next load — not worth a
      // scary error for a settings toggle.
    }
  }

  async function handleAdd() {
    const parsed = Number(amount);
    if (!parsed || parsed <= 0) return;
    setSaving(true);
    setError(null);
    try {
      await addIncomeEntry({
        amount: parsed,
        kind,
        category: category.trim() || undefined,
        notes: notes.trim() || undefined,
        taxRate,
      });
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
        <ThemedText type="title">Tax Pot</ThemedText>
        <ThemedText themeColor="textSecondary">
          Sessions marked paid log here automatically — this is just a running estimate for your own
          bookkeeping.
        </ThemedText>
      </View>

      <Card style={styles.potCard}>
        <ThemedText type="small" themeColor="textSecondary">
          Set aside so far
        </ThemedText>
        <ThemedText type="title" themeColor="heading">
          £{summary.totalSetAside.toFixed(2)}
        </ThemedText>
        <View style={styles.projectionRow}>
          <ThemedText type="small" themeColor="textSecondary">
            Suggested monthly set-aside
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            £{summary.monthlySetAside.toFixed(2)}
          </ThemedText>
        </View>
        <ThemedText type="small" themeColor="textMuted">
          Estimates only — this isn't tax or financial advice. Always confirm with an accountant before
          filing.
        </ThemedText>
      </Card>

      <Card style={styles.rateCard}>
        <ThemedText type="smallBold" themeColor="accent">
          Tax rate
        </ThemedText>
        <View style={styles.rateRow}>
          {RATE_PRESETS.map((rate) => (
            <Button
              key={rate}
              label={`${rate}%`}
              variant={taxRate === rate ? 'primary' : 'secondary'}
              onPress={() => handleRateChange(rate)}
              style={styles.rateButton}
            />
          ))}
        </View>
      </Card>

      <Card style={styles.totalsCard}>
        <TotalRow label="Income" value={summary.totalIncome} />
        <TotalRow label="Expenses" value={summary.totalExpenses} />
        <TotalRow label="Net" value={summary.totalIncome - summary.totalExpenses} emphasize />
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
              {entry.kind === 'income' && entry.taxSetAside > 0 && (
                <ThemedText type="small" themeColor="accent">
                  £{entry.taxSetAside.toFixed(2)} set aside
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
  potCard: {
    gap: Spacing.one,
  },
  projectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
  },
  rateCard: {
    gap: Spacing.two,
  },
  rateRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  rateButton: {
    flex: 1,
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
