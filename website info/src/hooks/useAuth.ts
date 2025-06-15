import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Database } from '@/integrations/supabase/types';
import apiService from '@/services/apiService';

type UserRole = Database['public']['Enums']['app_role'];

// Extended user type with backend profile data
interface ExtendedUser extends User {
  backendProfile?: {
    id: number;
    role: string;
    status: string;
    is_verified: boolean;
    is_active: boolean;
  };
}

export const useAuth = () => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>('buyer');

  // Function to fetch user role from database
  const fetchUserRole = async (userId: string): Promise<UserRole> => {
    try {
      console.log('Fetching role for user:', userId);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('is_primary', true)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return 'buyer'; // Default to buyer if error
      }

      console.log('User role data:', data);
      return data?.role as UserRole || 'buyer';
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      return 'buyer'; // Default to buyer if any exception
    }
  };

  // Function to update user's metadata with their role
  const updateUserMetadata = async (userId: string, role: UserRole): Promise<void> => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { role }
      });

      if (error) {
        console.error('Error updating user metadata:', error);
      } else {
        console.log('User metadata updated with role:', role);
      }
    } catch (error) {
      console.error('Error in updateUserMetadata:', error);
    }
  };

  // Function to create a user role if it doesn't exist
  const ensureUserRole = async (userId: string, role: UserRole = 'buyer'): Promise<void> => {
    try {
      // First check if the user already has a primary role
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, profile_id')
        .eq('user_id', userId)
        .eq('is_primary', true)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for "no rows returned"
        console.error('Error checking user role:', error);
        return;
      }
      
      // If user doesn't have a primary role yet, they should have been created by the trigger
      // But let's double-check and create if needed
      if (!data) {
        console.log('No primary role found, checking if user profile exists...');
        
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('user_id', userId)
          .single();
          
        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          return;
        }
        
        if (profile) {
          console.log('Creating new user role:', role);
          const { error: insertError } = await supabase
            .from('user_roles')
            .insert({ 
              user_id: userId, 
              profile_id: profile.id,
              role: role,
              is_primary: true,
              granted_by: userId
            });
          
          if (insertError) {
            console.error('Error creating user role:', insertError);
          }
        }
      }
    } catch (error) {
      console.error('Error in ensureUserRole:', error);
    }
  };

  // Function to get a user with their role
  const getUserWithRole = async (currentUser: User): Promise<ExtendedUser> => {
    // If user already has role in metadata, use it
    if (currentUser.user_metadata?.role) {
      setUserRole(currentUser.user_metadata.role as UserRole);
    } else {
      // Otherwise fetch role and update metadata
      const role = await fetchUserRole(currentUser.id);
      await updateUserMetadata(currentUser.id, role);
      setUserRole(role);
    }
    
    // Get backend profile data if available
    try {
      const backendProfile = await apiService.getUserProfile();
      
      // Return extended user with backend profile
      return {
        ...currentUser,
        backendProfile,
        user_metadata: {
          ...currentUser.user_metadata,
          role: userRole
        }
      };
    } catch (error) {
      console.error('Failed to get backend profile:', error);
      
      // Return user without backend profile
      return {
        ...currentUser,
        user_metadata: {
          ...currentUser.user_metadata,
          role: userRole
        }
      };
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          // Ensure user has a role in the database
          await ensureUserRole(session.user.id);
          // Get user with role and backend profile
          const userWithRole = await getUserWithRole(session.user);
          setUser(userWithRole);
        } else {
          setUser(null);
          setUserRole('buyer');
        }
        
        setLoading(false);
        
        if (event === 'SIGNED_IN') {
          toast.success("Successfully signed in!");
        } else if (event === 'SIGNED_OUT') {
          toast.success("Successfully signed out!");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email);
      setSession(session);
      
      if (session?.user) {
        // Ensure user has a role in the database
        await ensureUserRole(session.user.id);
        // Get user with role and backend profile
        const userWithRole = await getUserWithRole(session.user);
        setUser(userWithRole);
      } else {
        setUser(null);
        setUserRole('buyer');
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      // Ensure user has a role
      if (data.user) {
        await ensureUserRole(data.user.id);
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Handle specific error cases
      if (error.message.includes('Invalid login credentials')) {
        return { success: false, error: 'Invalid email or password' };
      } else if (error.message.includes('Email not confirmed')) {
        return { success: false, error: 'Please check your email and click the confirmation link before signing in' };
      } else {
        return { success: false, error: error.message };
      }
    }
  };

  const signInWithMagicLink = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      });
      
      if (error) {
        throw error;
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Magic link error:', error);
      return { success: false, error: error.message };
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Use the most basic implementation
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      
      if (error) {
        throw error;
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Google sign in error:', error);
      return { success: false, error: error.message };
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: 'buyer', // Set default role to buyer
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Create user role entry
      if (data.user) {
        await ensureUserRole(data.user.id, 'buyer');
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      if (error.message.includes('User already registered')) {
        return { success: false, error: 'This email is already registered. Try signing in instead.' };
      } else {
        return { success: false, error: error.message };
      }
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
      setUserRole('buyer');
      setLoading(false);
      return { success: true };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  };

  // Helper function to check if user has a specific role
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    console.log('hasRole called with:', role);
    
    if (!user) {
      console.log('hasRole: No user authenticated');
      return false;
    }
    
    // Special hardcoded check for iradwatkins@gmail.com to always be admin
    if (user.email === 'iradwatkins@gmail.com') {
      if (role === 'admin' || (Array.isArray(role) && role.includes('admin'))) {
        console.log('Admin access granted for iradwatkins@gmail.com');
        return true;
      }
    }
    
    // Check both user metadata and database role
    const metadataRole = user.user_metadata?.role;
    const currentRole = userRole || metadataRole || 'buyer';
    
    console.log('hasRole debug:', {
      userEmail: user.email,
      userId: user.id,
      requestedRole: role,
      metadataRole,
      currentRole,
      userRole,
      backendProfileRole: user.backendProfile?.role,
      hasBackendProfile: !!user.backendProfile
    });
    
    // Special case for admin: check both metadata and database
    if (role === 'admin' || (Array.isArray(role) && role.includes('admin'))) {
      // For admin role, we need to check both the current role and the database role
      const isAdmin = currentRole === 'admin' || user.backendProfile?.role === 'admin';
      console.log('Admin check result:', { 
        currentRole, 
        backendRole: user.backendProfile?.role, 
        isAdmin,
        metadataRole,
        userRole
      });
      return isAdmin;
    }
    
    if (Array.isArray(role)) {
      const hasAnyRole = role.includes(currentRole);
      console.log('Array role check:', { role, currentRole, hasAnyRole });
      return hasAnyRole;
    }
    
    const hasExactRole = currentRole === role;
    console.log('Exact role check:', { role, currentRole, hasExactRole });
    return hasExactRole;
  };

  // Get the current user's role
  const getUserRole = (): UserRole => {
    // Special case for iradwatkins@gmail.com
    if (user?.email === 'iradwatkins@gmail.com') {
      return 'admin';
    }
    return userRole;
  };

  // Check if user has backend verification
  const hasBackendVerification = (): boolean => {
    return !!user?.backendProfile?.is_verified;
  };

  // Get the backend profile
  const getBackendProfile = () => {
    return user?.backendProfile;
  };

  return {
    user,
    session,
    loading,
    signIn,
    signInWithMagicLink,
    signInWithGoogle,
    signUp,
    signOut,
    hasRole,
    getUserRole,
    hasBackendVerification,
    getBackendProfile,
  };
};
