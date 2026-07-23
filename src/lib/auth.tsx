import type { Session, User } from '@supabase/supabase-js';
import { createContext, useCallback, useEffect, useRef, useState, type PropsWithChildren } from 'react';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export type Profile = {
  id: string;
  fullName: string | null;
  role: 'client' | 'trainer';
  referralCode: string;
  referredBy: string | null;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  // True whenever a session exists but `profile` doesn't yet reflect it —
  // the root layout waits on this before deciding between the client
  // portal and the trainer portal. Derived (see below), not a separately
  // set flag, so there's no render frame where session is set but this
  // hasn't caught up yet.
  profileLoading: boolean;
  // Set only when the profile genuinely failed to load/repair (schema not
  // exposed, network error, RLS misconfiguration, etc) — never set just
  // because a role happens to be 'client'. The root layout must treat this
  // as blocking, not fall through to the client portal.
  profileError: string | null;
  retryProfile: () => void;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    referralCode?: string,
  ) => Promise<{ error: string | null; requiresConfirmation: boolean }>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

function mapProfile(row: any): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    role: row.role,
    referralCode: row.referral_code,
    referredBy: row.referred_by,
  };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  // The user id `profile` is actually valid for. Comparing this to the
  // current session's user id (below) is what makes profileLoading
  // correct on the very first render after a session appears, instead of
  // waiting a render for a separate effect to flip a flag.
  const [profileFetchedFor, setProfileFetchedFor] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const profileLoading = !!session?.user && profileFetchedFor !== session.user.id;

  // Guards against a slow, stale fetch (e.g. a retry racing the original
  // request) overwriting state after a newer request has already resolved.
  const latestRequestedUserId = useRef<string | null>(null);

  const loadProfile = useCallback(async (userId: string) => {
    latestRequestedUserId.current = userId;

    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (latestRequestedUserId.current !== userId) return;

    if (data) {
      setProfile(mapProfile(data));
      setProfileError(null);
      setProfileFetchedFor(userId);
      return;
    }

    // No row (trigger didn't fire in time, or this is a dashboard-created
    // account like a trainer's) or a real fetch error (schema not exposed,
    // RLS blocking, network) — either way, do NOT silently default to the
    // client portal. Try a self-repair RPC first (idempotent: creates the
    // profile row if genuinely missing, no-ops otherwise), then surface a
    // real error if even that fails.
    const { data: repaired, error: repairError } = await supabase.rpc('ensure_profile');
    if (latestRequestedUserId.current !== userId) return;

    if (repaired) {
      setProfile(mapProfile(repaired));
      setProfileError(null);
    } else {
      console.error('[auth] profile fetch/repair failed', error?.message, repairError?.message);
      setProfile(null);
      setProfileError(error?.message ?? repairError?.message ?? 'Could not load your account.');
    }
    setProfileFetchedFor(userId);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // .catch().finally() ensures `loading` always resolves even if
    // Supabase is unreachable — without it a network hiccup on boot would
    // leave the splash screen up forever instead of falling through to
    // the logged-out public experience.
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .catch(() => {})
      .finally(() => setLoading(false));

    // This, not a manual router.replace() after signIn/signUp, is what
    // actually catches a successful login — Stack.Protected reacts to
    // `session` changing, so every auth state transition (login, logout,
    // token refresh) needs to flow through here.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setProfile(null);
      setProfileFetchedFor(null);
      setProfileError(null);
      latestRequestedUserId.current = null;
      return;
    }
    loadProfile(session.user.id);
  }, [session?.user?.id, loadProfile]);

  function retryProfile() {
    if (!session?.user) return;
    setProfileFetchedFor(null);
    setProfileError(null);
    loadProfile(session.user.id);
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signUp(email: string, password: string, fullName: string, referralCode?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          ...(referralCode ? { referral_code: referralCode } : {}),
        },
      },
    });

    if (error) {
      return { error: error.message, requiresConfirmation: false };
    }

    return { error: null, requiresConfirmation: !data.session };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        profileLoading,
        profileError,
        retryProfile,
        signIn,
        signUp,
        signOut,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
