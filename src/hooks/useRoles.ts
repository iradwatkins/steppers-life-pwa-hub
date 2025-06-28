import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface UserRoles {
  role: UserRole;
  isAdmin: boolean;
  isOrganizer: boolean;
  isUser: boolean;
  hasOrganizer: boolean;
  organizerId?: string;
}

export const useRoles = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRoles>({
    role: 'user',
    isAdmin: false,
    isOrganizer: false,
    isUser: true,
    hasOrganizer: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user?.id) {
        setRoles({
          role: 'user',
          isAdmin: false,
          isOrganizer: false,
          isUser: true,
          hasOrganizer: false,
        });
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch user profile to get role
        let { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            // Profile doesn't exist, create it
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email || '',
                full_name: user.user_metadata?.full_name || '',
                role: 'user'
              })
              .select('role')
              .single();

            if (createError) throw createError;
            profile = newProfile;
          } else {
            throw profileError;
          }
        }

        const userRole = profile?.role || 'user';

        // Check if user has an organizer profile
        const { data: organizer, error: organizerError } = await supabase
          .from('organizers')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (organizerError && organizerError.code !== 'PGRST116') {
          console.warn('Error fetching organizer:', organizerError);
        }

        const hasOrganizer = !!organizer;
        const organizerId = organizer?.id;

        setRoles({
          role: userRole,
          isAdmin: userRole === 'admin',
          isOrganizer: userRole === 'organizer' || hasOrganizer,
          isUser: userRole === 'user',
          hasOrganizer,
          organizerId,
        });

      } catch (err: any) {
        console.error('Error fetching user roles:', err);
        setError(err.message || 'Failed to fetch user roles');
        
        // Fallback to basic user role
        setRoles({
          role: 'user',
          isAdmin: false,
          isOrganizer: false,
          isSuperAdmin: false,
          isUser: true,
          hasOrganizer: false,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRoles();
  }, [user?.id, user?.email]);

  const updateUserRole = async (newRole: UserRole): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setRoles(prev => ({
        ...prev,
        role: newRole,
        isAdmin: newRole === 'admin',
        isOrganizer: newRole === 'organizer' || prev.hasOrganizer,
        isUser: newRole === 'user',
      }));

      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      return false;
    }
  };

  const hasPermission = (requiredRole: UserRole | UserRole[]): boolean => {
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    // Admin has all permissions
    if (roles.isAdmin) return true;
    
    // Check if user has any of the required roles
    return requiredRoles.some(role => {
      switch (role) {
        case 'admin':
          return roles.isAdmin;
        case 'organizer':
          return roles.isOrganizer;
        case 'user':
          return true; // All users have user permissions
        default:
          return false;
      }
    });
  };

  const canCreateEvents = (): boolean => {
    return roles.hasOrganizer || roles.isAdmin;
  };

  const canManageEvents = (eventOrganizerId?: string): boolean => {
    if (roles.isAdmin) return true;
    if (!roles.hasOrganizer) return false;
    if (!eventOrganizerId) return false;
    return roles.organizerId === eventOrganizerId;
  };

  const canAccessAdmin = (): boolean => {
    return roles.isAdmin;
  };

  return {
    ...roles,
    isLoading,
    error,
    updateUserRole,
    hasPermission,
    canCreateEvents,
    canManageEvents,
    canAccessAdmin,
  };
};