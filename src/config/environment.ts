// Environment configuration for dev/production database switching

export interface EnvironmentConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  appEnv: 'development' | 'production' | 'staging';
  appUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  const isDevelopment = import.meta.env.DEV || import.meta.env.VITE_APP_ENV === 'development';
  const isProduction = import.meta.env.PROD || import.meta.env.VITE_APP_ENV === 'production';
  
  // PRODUCTION OVERRIDE: Always use production database for real data
  // This ensures we're always working with real production data, not mock data
  const prodConfig = {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://nvryyufpbcruyqqndyjn.supabase.co',
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52cnl5dWZwYmNydXlxcW5keWpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NzY1MDUsImV4cCI6MjA2NTI1MjUwNX0.W6vriRZnO7n8FPm5Zjd_fe41cY20tWkDOqYF59wulzs',
    appUrl: isDevelopment ? 'http://localhost:8080' : 'https://stepperslife.com'
  };

  // Always use production config for database
  const config = prodConfig;

  return {
    supabaseUrl: config.supabaseUrl,
    supabaseAnonKey: config.supabaseAnonKey,
    appEnv: isProduction ? 'production' : 'development',
    appUrl: config.appUrl,
    isDevelopment,
    isProduction,
  };
};

export const env = getEnvironmentConfig();

// Validation
if (!env.supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!env.supabaseAnonKey || env.supabaseAnonKey === 'PRODUCTION_KEY_NEEDED') {
  console.warn(`Missing or placeholder Supabase anon key for ${env.appEnv} environment`);
}

// Log environment info for debugging
console.log('🔧 Environment Configuration:', {
  environment: env.appEnv,
  supabaseUrl: env.supabaseUrl,
  appUrl: env.appUrl,
  hasValidKey: env.supabaseAnonKey !== 'PRODUCTION_KEY_NEEDED',
  database: 'PRODUCTION (Real Data Only)',
  note: 'Always using production database for real data'
});