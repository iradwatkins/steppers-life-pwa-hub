import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateProfile: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN') {
          toast.success('Successfully signed in!');
        } else if (event === 'SIGNED_OUT') {
          toast.info('Signed out successfully');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`,
          },
        },
      });

      if (error) throw error;

      toast.success('Registration successful! Please check your email to verify your account.');
    } catch (error) {
      const authError = error as AuthError;
      toast.error(authError.message || 'An error occurred during registration');
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error) {
      const authError = error as AuthError;
      toast.error(authError.message || 'An error occurred during sign in');
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      const authError = error as AuthError;
      toast.error(authError.message || 'An error occurred during Google sign in');
      throw error;
    }
  };

  const sendMagicLink = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      toast.success('Magic link sent! Please check your email.');
    } catch (error) {
      const authError = error as AuthError;
      toast.error(authError.message || 'An error occurred sending magic link');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Check if there's a session before attempting to sign out
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        // No active session, just clear local state
        setSession(null);
        setUser(null);
        toast.info('Already signed out');
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        // If sign out fails due to session issues, clear local state anyway
        if (error.message.includes('session') || error.message.includes('Auth session missing')) {
          setSession(null);
          setUser(null);
          toast.info('Signed out successfully');
          return;
        }
        throw error;
      }
    } catch (error) {
      const authError = error as AuthError;
      // For auth session errors, don't show error toast - just sign out locally
      if (authError.message?.includes('session') || authError.message?.includes('Auth session missing')) {
        setSession(null);
        setUser(null);
        toast.info('Signed out successfully');
        return;
      }
      toast.error(authError.message || 'An error occurred during sign out');
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      toast.success('Password reset email sent! Please check your inbox.');
    } catch (error) {
      const authError = error as AuthError;
      toast.error(authError.message || 'An error occurred sending reset email');
      throw error;
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (!user?.email) {
        throw new Error('No user email found');
      }

      // First verify current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (verifyError) {
        throw new Error('Current password is incorrect');
      }

      // Update to new password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success('Password updated successfully!');
    } catch (error) {
      const authError = error as Error;
      toast.error(authError.message || 'An error occurred updating password');
      throw error;
    }
  };

  const updateProfile = async (userData: any) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: userData,
      });

      if (error) throw error;

      toast.success('Profile updated successfully!');
    } catch (error) {
      const authError = error as AuthError;
      toast.error(authError.message || 'An error occurred updating profile');
      throw error;
    }
  };

  const deleteAccount = async () => {
    try {
      // Note: Supabase doesn't have a direct delete user method in client-side
      // This would typically require a server-side function or admin API call
      // For now, we'll provide a warning and redirect to support
      
      toast.error('Account deletion requires contacting support. Please email hello@stepperslife.com');
      throw new Error('Account deletion not available - contact support');
    } catch (error) {
      const authError = error as Error;
      toast.error(authError.message || 'An error occurred with account deletion');
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    sendMagicLink,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
