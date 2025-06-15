/**
 * Environment variables helper for browser context
 * 
 * This approach ensures that Vite environment variables are properly
 * available in browser contexts without causing 'process is not defined' errors.
 */

// Define the type of environment variables we expect
export interface EnvVariables {
  VITE_API_URL?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  [key: string]: string | undefined;
}

// Default values for environment variables
const defaultEnv: EnvVariables = {
  VITE_API_URL: 'https://revmdncwzztxxinjlzoc.supabase.co/functions/v1',
  VITE_SUPABASE_URL: 'https://revmdncwzztxxinjlzoc.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJldm1kbmN3eno3eHhpbmpsem9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3NjM4MDQsImV4cCI6MjA0OTMzOTgwNH0.8bCWJEOjf9Q3JzpJUr5PxT0k2zZDTp7KH2QaJtHMLh8',
};

/**
 * Initialize environment variables for browser context
 * This function collects Vite environment variables and makes them
 * available on the window object for browser components
 */
export function initBrowserEnv(): void {
  if (typeof window !== 'undefined') {
    // Create the __ENV object on window if it doesn't exist
    if (!(window as any).__ENV) {
      (window as any).__ENV = {};
    }
    
    // For Vite, import.meta.env contains all environment variables
    // Copy them to the window.__ENV object
    try {
      Object.entries(import.meta.env).forEach(([key, value]) => {
        if (typeof value === 'string') {
          (window as any).__ENV[key] = value;
        }
      });
    } catch (e) {
      console.warn('Could not access import.meta.env variables:', e);
    }
    
    // Add default values for any missing environment variables
    Object.entries(defaultEnv).forEach(([key, value]) => {
      if (!(window as any).__ENV[key]) {
        (window as any).__ENV[key] = value;
      }
    });
    
    console.log('Browser environment variables initialized');
  }
}

/**
 * Get an environment variable
 * @param key The environment variable name
 * @param defaultValue Optional default value if the environment variable is not set
 * @returns The environment variable value or the default value
 */
export function getEnv(key: string, defaultValue?: string): string {
  // For client-side
  if (typeof window !== 'undefined') {
    // First try window.__ENV
    if ((window as any).__ENV?.[key]) {
      return (window as any).__ENV[key];
    }
    
    // Then try import.meta.env
    try {
      const value = (import.meta.env as any)[key];
      if (value) return value;
    } catch (e) {
      // Ignore errors accessing import.meta.env
    }
    
    return defaultValue || '';
  }
  
  // For server-side or build time
  try {
    const value = (import.meta.env as any)[key];
    if (value) return value;
  } catch (e) {
    // Ignore errors accessing import.meta.env
  }
  
  return defaultValue || '';
}

/**
 * Get all environment variables
 * @returns All environment variables as an object
 */
export function getAllEnv(): EnvVariables {
  if (typeof window !== 'undefined') {
    return (window as any).__ENV || defaultEnv;
  }
  
  // For server-side or build time
  try {
    const env: EnvVariables = {};
    Object.entries(import.meta.env).forEach(([key, value]) => {
      if (typeof value === 'string') {
        env[key] = value;
      }
    });
    return { ...defaultEnv, ...env };
  } catch (e) {
    return defaultEnv;
  }
} 