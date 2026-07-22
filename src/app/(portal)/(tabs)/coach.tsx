import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { AttachmentPicker } from '@/components/ui/attachment-picker';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { TextField } from '@/components/ui/text-field';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { fetchMessages, sendMessage, type Message } from '@/lib/messages';
import { fetchMyDog } from '@/lib/profile';

export default function CoachScreen() {
  const { user } = useAuth();
  const { prefill } = useLocalSearchParams<{ prefill?: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [dogId, setDogId] = useState<string | undefined>(undefined);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setMessages(await fetchMessages(user.id));
    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useEffect(() => {
    if (user) fetchMyDog(user.id).then((dog) => setDogId(dog?.id));
  }, [user]);

  useEffect(() => {
    if (prefill) setDraft(prefill);
  }, [prefill]);

  async function handleSend() {
    if (!user || !draft.trim()) return;
    setSending(true);
    try {
      await sendMessage(user.id, user.id, draft.trim());
      setDraft('');
      await load();
    } finally {
      setSending(false);
    }
  }

  return (
    <Screen refreshing={loading} onRefresh={load}>
      <View style={styles.header}>
        <ThemedText type="title">Coach</ThemedText>
        <ThemedText themeColor="textSecondary">Message Connor directly — questions, updates, anything.</ThemedText>
      </View>

      <View style={styles.thread}>
        {messages.length === 0 ? (
          <Card>
            <EmptyState icon="chatbubble-ellipses" title="No messages yet" message="Say hello — Connor reads every message." />
          </Card>
        ) : (
          messages.map((message) => <MessageBubble key={message.id} message={message} isOwn={message.senderId === user?.id} />)
        )}
      </View>

      <View style={styles.compose}>
        <TextField
          label="Message"
          value={draft}
          onChangeText={setDraft}
          multiline
          numberOfLines={3}
          style={styles.multiline}
        />
        {user && <AttachmentPicker userId={user.id} targets={{ dogId }} />}
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
