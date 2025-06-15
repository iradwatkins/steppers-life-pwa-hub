import { useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import backendAuthService, { BackendUser } from '@/services/backendAuthService';
import { toast } from '@/components/ui/sonner';

export interface HybridUser extends SupabaseUser {
  backendProfile?: BackendUser;
}

export interface AuthState {
  user: HybridUser | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
}

/**
 * Hybrid Authentication Hook
 * Combines Supabase authentication with backend user management
 */
export const useHybridAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isAuthenticated: false,
  });

  /**
   * Fetch user profile from backend using current session
   */
  const fetchBackendProfile = async (user: SupabaseUser): Promise<BackendUser | null> => {
    try {
      // Only fetch if we have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const backendUser = await backendAuthService.getCurrentUser();
      return backendUser;
    } catch (error) {
      console.error('Failed to fetch backend profile:', error);
      // Don't throw error here - just return null and user can still use Supabase auth
      return null;
    }
  };

  /**
   * Update auth state with both Supabase user and backend profile
   */
  const updateAuthState = async (user: SupabaseUser | null, session: Session | null) => {
    setAuthState(prev => ({ ...prev, loading: true }));

    try {
      let hybridUser: HybridUser | null = null;
      
      if (user && session) {
        // Try to get backend profile
        const backendProfile = await fetchBackendProfile(user);
        
        hybridUser = {
          ...user,
          backendProfile,
        };
      }

      setAuthState({
        user: hybridUser,
        session,
        loading: false,
        isAuthenticated: !!hybridUser,
      });
    } catch (error) {
      console.error('Auth state update failed:', error);
      setAuthState({
        user: null,
        session: null,
        loading: false,
        isAuthenticated: false,
      });
    }
  };

  /**
   * Initialize authentication
   */
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          await updateAuthState(session?.user || null, session);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        if (mounted) {
          setAuthState({
            user: null,
            session: null,
            loading: false,
            isAuthenticated: false,
          });
        }
      }
    };

    initializeAuth();

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (mounted) {
          await updateAuthState(session?.user || null, session);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Sign in with email/password
   */
  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Auth state will be updated by the auth listener
      toast.success('Signed in successfully');
      return { data, error: null };
    } catch (error: any) {
      console.error('Sign in failed:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
      toast.error(error.message || 'Sign in failed');
      return { data: null, error };
    }
  };

  /**
   * Sign up with email/password
   */
  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;

      toast.success('Account created successfully! Please check your email for verification.');
      return { data, error: null };
    } catch (error: any) {
      console.error('Sign up failed:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
      toast.error(error.message || 'Sign up failed');
      return { data: null, error };
    }
  };

  /**
   * Sign out
   */
  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      // Try to logout from backend first (optional)
      try {
        await backendAuthService.logout();
      } catch (error) {
        console.warn('Backend logout failed:', error);
        // Continue with Supabase logout even if backend fails
      }

      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      toast.success('Signed out successfully');
      return { error: null };
    } catch (error: any) {
      console.error('Sign out failed:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
      toast.error(error.message || 'Sign out failed');
      return { error };
    }
  };

  /**
   * Reset password
   */
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      toast.success('Password reset email sent');
      return { error: null };
    } catch (error: any) {
      console.error('Password reset failed:', error);
      toast.error(error.message || 'Password reset failed');
      return { error };
    }
  };

  /**
   * Update password
   */
  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success('Password updated successfully');
      return { error: null };
    } catch (error: any) {
      console.error('Password update failed:', error);
      toast.error(error.message || 'Password update failed');
      return { error };
    }
  };

  /**
   * Refresh backend profile
   */
  const refreshBackendProfile = async () => {
    if (!authState.user) return;

    try {
      const backendProfile = await fetchBackendProfile(authState.user);
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, backendProfile } : null,
      }));
    } catch (error) {
      console.error('Failed to refresh backend profile:', error);
    }
  };

  /**
   * Check if user has specific role
   */
  const hasRole = (role: string): boolean => {
    return authState.user?.backendProfile?.role === role;
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roles: string[]): boolean => {
    if (!authState.user?.backendProfile?.role) return false;
    return roles.includes(authState.user.backendProfile.role);
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    refreshBackendProfile,
    hasRole,
    hasAnyRole,
  };
};