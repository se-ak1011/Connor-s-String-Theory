import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { BackLink } from '@/components/ui/back-link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { TextField } from '@/components/ui/text-field';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { fetchMessages, sendMessage, type Message } from '@/lib/messages';
import { fetchClientDetail, type ClientSummary } from '@/lib/trainer';

export default function TrainerClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [client, setClient] = useState<ClientSummary | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [detail, thread] = await Promise.all([fetchClientDetail(id), fetchMessages(id)]);
    setClient(detail);
    setMessages(thread);
    setLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleSend() {
    if (!user || !id || !draft.trim()) return;
    setSending(true);
    setError(null);
    try {
      await sendMessage(id, user.id, draft.trim());
      setDraft('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send that message.');
    } finally {
      setSending(false);
    }
  }

  return (
    <Screen refreshing={loading} onRefresh={load}>
      <View style={styles.header}>
        <BackLink label="Clients" fallbackHref="/clients" />
        <ThemedText type="title">{client?.fullName ?? 'Client'}</ThemedText>
        {client?.dogName ? (
          <ThemedText themeColor="textSecondary">
            {client.dogName}
            {client.dogBreed ? ` — ${client.dogBreed}` : ''}
          </ThemedText>
        ) : (
          <ThemedText themeColor="textMuted">No dog added yet</ThemedText>
        )}
        {client?.currentFocus && (
          <ThemedText type="small" themeColor="accent">
            Working on: {client.currentFocus}
          </ThemedText>
        )}
      </View>

      <View style={styles.thread}>
        {messages.length === 0 ? (
          <Card>
            <EmptyState icon="chatbubble-ellipses" title="No messages yet" message="Replies you send will show up here." />
          </Card>
        ) : (
          messages.map((message) => <MessageBubble key={message.id} message={message} isOwn={message.senderId === user?.id} />)
        )}
      </View>

      <View style={styles.compose}>
        <TextField
          label="Reply"
          value={draft}
          onChangeText={setDraft}
          multiline
          numberOfLines={3}
          style={styles.multiline}
        />
        {error && (
          <ThemedText type="small" themeColor="attention">
            {error}
          </ThemedText>
        )}
        <Button label="Send" onPress={handleSend} disabled={!draft.trim()} loading={sending} />
      </View>
    </Screen>
  );
}

function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  return (
    <View style={[styles.bubbleRow, isOwn ? styles.bubbleRowOwn : styles.bubbleRowOther]}>
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        <ThemedText type="small" themeColor={isOwn ? 'onAccent' : 'text'}>
          {message.body}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.two,
  },
  thread: {
    gap: Spacing.two,
  },
  bubbleRow: {
    flexDirection: 'row',
  },
  bubbleRowOwn: {
    justifyContent: 'flex-end',
  },
  bubbleRowOther: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: Radius.medium,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  bubbleOwn: {
    backgroundColor: Colors.accent,
  },
  bubbleOther: {
    backgroundColor: Colors.backgroundElement,
  },
  compose: {
    gap: Spacing.two,
  },
  multiline: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
});
