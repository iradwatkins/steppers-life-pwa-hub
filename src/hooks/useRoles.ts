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
  // For testing without login, always return admin access
  const [roles] = useState<UserRoles>({
    role: 'admin',
    isAdmin: true,
    isOrganizer: true,
    isUser: true,
    hasOrganizer: true,
    organizerId: 'test-organizer-id',
  });
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const updateUserRole = async (newRole: UserRole): Promise<boolean> => {
    // For testing, always return success
    return true;
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