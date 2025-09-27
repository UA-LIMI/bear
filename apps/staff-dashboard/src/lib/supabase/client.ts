import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/types/supabase';

let client: SupabaseClient<Database> | null = null;

const getUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL;
const getAnonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => Boolean(getUrl() && getAnonKey());

export const initializeSupabaseClient = (): SupabaseClient<Database> => {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase credentials are not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  const url = getUrl();
  const key = getAnonKey();

  if (!url || !key) {
    throw new Error('Supabase URL or anon key is missing.');
  }

  return createClient<Database>(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
};

export const getSupabaseClient = (): SupabaseClient<Database> | null => {
  if (!client && isSupabaseConfigured()) {
    client = initializeSupabaseClient();
  }

  return client;
};

export type TypedSupabaseClient = SupabaseClient<Database>;
