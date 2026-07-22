import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// expo-secure-store only exists on native (it wraps the iOS Keychain /
// Android Keystore) — fall back to localStorage on web, same as the
// Tenant Passport client.
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

/**
 * Until real Supabase project credentials are set (see SETUP.md), this
 * client is created against placeholder values and every call will fail —
 * screens check `isSupabaseConfigured` first and fall back to a friendly
 * "contact us directly" path instead of a broken network error.
 *
 * This project shares a Supabase instance with Tenant Passport (separate
 * `connorst` schema, same `auth.users`) rather than its own project.
 */
export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-anon-key',
  {
    db: {
      // Everything for this app lives in its own schema — see
      // supabase/schema.sql — so nothing collides with Tenant Passport's
      // tables in `public`. Every bare `.from(...)`/`.rpc(...)` call
      // below defaults to this schema; no call site needs to say so.
      schema: 'connorst',
    },
    auth: {
      storage: Platform.OS === 'web' ? undefined : ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
