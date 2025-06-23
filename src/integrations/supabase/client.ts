// Supabase client with environment-aware configuration and singleton pattern
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { env } from '@/config/environment';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// Singleton pattern - only create one instance
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

function createSupabaseClient() {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  supabaseInstance = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      // Use a unique storage key to prevent conflicts
      storageKey: `stepperslife-auth-token-${env.appEnv}`,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        'X-Client-Info': 'stepperslife-pwa',
      },
    },
  });

  return supabaseInstance;
}

export const supabase = createSupabaseClient();

// Export environment info for debugging
export const supabaseConfig = {
  url: env.supabaseUrl,
  environment: env.appEnv,
  isProduction: env.isProduction
};