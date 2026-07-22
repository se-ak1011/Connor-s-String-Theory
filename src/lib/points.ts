import { supabase } from '@/lib/supabase';

export type PointBalance = {
  undirectedBalance: number;
  ownDogBalance: number;
  communityBalance: number;
  lifetimeEarned: number;
};

const EMPTY_BALANCE: PointBalance = {
  undirectedBalance: 0,
  ownDogBalance: 0,
  communityBalance: 0,
  lifetimeEarned: 0,
};

export async function fetchPointBalance(userId: string): Promise<PointBalance> {
  const { data } = await supabase.from('point_balances').select('*').eq('user_id', userId).maybeSingle();

  if (!data) return EMPTY_BALANCE;
  return {
    undirectedBalance: data.undirected_balance,
    ownDogBalance: data.own_dog_balance,
    communityBalance: data.community_balance,
    lifetimeEarned: data.lifetime_earned,
  };
}

/**
 * Points are never money — this only tags ledger rows via the
 * direct_points() function, it never moves real currency. Neither
 * direction is framed as better in the UI.
 */
export async function directPoints(amount: number, direction: 'own_dog' | 'community'): Promise<void> {
  const { error } = await supabase.rpc('direct_points', { p_amount: amount, p_direction: direction });
  if (error) throw new Error(error.message);
}

export async function fetchCommunityPoolTotal(): Promise<number> {
  const { data, error } = await supabase.rpc('community_pool_total');
  if (error || data == null) return 0;
  return data as number;
}
