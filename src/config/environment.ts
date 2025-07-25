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
    supabaseUrl: 'https://nwoteszpvvefbopbbvrl.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53b3Rlc3pwdnZlZmJvcGJidnJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NzY1MzQsImV4cCI6MjA2NTI1MjUzNH0.x9Ncuy3O_ZHEjcG-9x_Psa5eHweviIyKuh0OiFCbExI',
    appUrl: 'http://localhost:8080'
  };
  
  // Production configuration
  const prodConfig = {
    supabaseUrl: 'https://voaxyetbqhmgbvcxsttf.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvYXh5ZXRicWhtZ2J2Y3hzdHRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MTg5NTgsImV4cCI6MjA2NjE5NDk1OH0.PMBz2_OWWL5uY8qYAwUHEoRG0iRyRld8oqK44qYvx-Q',
    appUrl: 'https://stepperslife.com'
  };

  // Use environment variables if provided, otherwise use defaults based on environment
  const config = {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || (isProduction ? prodConfig.supabaseUrl : devConfig.supabaseUrl),
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || (isProduction ? prodConfig.supabaseAnonKey : devConfig.supabaseAnonKey),
    appUrl: import.meta.env.VITE_APP_URL || (isProduction ? prodConfig.appUrl : devConfig.appUrl)
  };

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
  database: env.isProduction ? 'PRODUCTION' : 'DEVELOPMENT',
  note: env.isProduction ? 'Using production database' : 'Using development database'
});