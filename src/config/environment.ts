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
  
  // Development configuration
  const devConfig = {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://nwoteszpvvefbopbbvrl.supabase.co',
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53b3Rlc3pwdnZlZmJvcGJidnJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NzY1MzQsImV4cCI6MjA2NTI1MjUzNH0.x9Ncuy3O_ZHEjcG-9x_Psa5eHweviIyKuh0OiFCbExI',
    appUrl: 'http://localhost:8080'
  };

  // Production configuration  
  const prodConfig = {
    supabaseUrl: import.meta.env.VITE_SUPABASE_PROD_URL || 'https://nvryyufpbcruyqqndyjn.supabase.co',
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_PROD_ANON_KEY || 'PRODUCTION_KEY_NEEDED',
    appUrl: 'https://stepperslife.com'
  };

  const config = isProduction ? prodConfig : devConfig;

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

// Log environment info (only in development)
if (env.isDevelopment) {
  console.log('🔧 Environment Configuration:', {
    environment: env.appEnv,
    supabaseUrl: env.supabaseUrl,
    appUrl: env.appUrl,
    hasValidKey: env.supabaseAnonKey !== 'PRODUCTION_KEY_NEEDED',
    database: env.supabaseUrl.includes('nwoteszpvvefbopbbvrl') ? 'Development' : 'Production',
    branch: env.supabaseUrl.includes('nwoteszpvvefbopbbvrl') ? 'development' : 'main'
  });
}