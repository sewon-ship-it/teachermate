import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** URL 과 anon key 가 모두 있을 때만 서버 모드. 하나라도 없으면 로컬 체험 모드. */
export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
    : null;

export const aiEnabled = Boolean(supabase) && import.meta.env.VITE_AI_ENABLED === 'true';
