import { supabase } from '@/lib/supabase';

export type Message = {
  id: string;
  userId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};

function mapMessage(row: any): Message {
  return {
    id: row.id,
    userId: row.user_id,
    senderId: row.sender_id,
    body: row.body,
    createdAt: row.created_at,
    readAt: row.read_at,
  };
}

/**
 * Fetch-on-mount + pull-to-refresh, not a realtime subscription — matches
 * the rest of this codebase (no websocket lifecycle anywhere yet). Worth
 * revisiting first if "ongoing partnership" messaging needs to feel live.
 */
export async function fetchMessages(userId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) console.error('[messages] fetchMessages failed', error.message);
  if (error || !data) return [];
  return data.map(mapMessage);
}

export async function sendMessage(userId: string, senderId: string, body: string): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({ user_id: userId, sender_id: senderId, body })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Could not send message.');
  return mapMessage(data);
}
