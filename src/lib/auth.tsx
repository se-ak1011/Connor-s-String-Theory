import type { Session, User } from '@supabase/supabase-js';
import { createContext, useEffect, useState, type PropsWithChildren } from 'react';

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
      return;
    }

    let cancelled = false;
    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        if (!cancelled) setProfile(data ? mapProfile(data) : null);
      });

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

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
        signIn,
        signUp,
        signOut,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
