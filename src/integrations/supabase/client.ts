// Supabase client with environment-aware configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { env } from '@/config/environment';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Export environment info for debugging
export const supabaseConfig = {
  url: env.supabaseUrl,
  environment: env.appEnv,
  isProduction: env.isProduction
};