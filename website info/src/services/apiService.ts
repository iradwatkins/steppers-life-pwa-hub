import { supabase } from '@/integrations/supabase/client';
import { getEnv } from '@/lib/env';

// Base URL for the backend API
const API_BASE_URL = getEnv('VITE_API_URL', 'http://localhost:8000/api/v1');

/**
 * Check if backend API is available
 */
async function isBackendAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Fetch API wrapper that includes authentication header and error handling
 */
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  try {
    // Get current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    // Set up headers with authentication
    const headers = new Headers(options.headers || {});
    
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    
    // Add auth token if available
    if (session?.access_token) {
      headers.set('Authorization', `Bearer ${session.access_token}`);
    }
    
    // Make the request with the auth header
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Handle common errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Check for authentication errors
      if (response.status === 401) {
        // Refresh session on auth error
        await supabase.auth.refreshSession();
        throw new Error('Authentication error: Please sign in again');
      }
      
      // For other errors, throw with details
      const errorMessage = errorData.detail || errorData.message || `API error: ${response.statusText}`;
      throw new Error(errorMessage);
    }
    
    // Parse the response
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * API Service for making authenticated requests to the backend
 */
const apiService = {
  /**
   * Make a GET request
   */
  get: async <T>(endpoint: string, params?: Record<string, string>): Promise<T> => {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    
    // Add query parameters if provided
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    return fetchWithAuth(url.toString(), { method: 'GET' });
  },
  
  /**
   * Make a POST request
   */
  post: async <T>(endpoint: string, data?: any): Promise<T> => {
    return fetchWithAuth(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },
  
  /**
   * Make a PUT request
   */
  put: async <T>(endpoint: string, data?: any): Promise<T> => {
    return fetchWithAuth(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },
  
  /**
   * Make a DELETE request
   */
  delete: async <T>(endpoint: string): Promise<T> => {
    return fetchWithAuth(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
    });
  },
  
  /**
   * Get user profile from Supabase backend
   */
  getUserProfile: async () => {
    try {
      // Try backend API first
      if (await isBackendAvailable()) {
        return await fetchWithAuth(`${API_BASE_URL}/auth/supabase/me`);
      }
      
      // Fallback to Supabase directly
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single();
        
      return {
        ...profile,
        role: roles?.role || 'buyer'
      };
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw error;
    }
  },
};

export default apiService; 