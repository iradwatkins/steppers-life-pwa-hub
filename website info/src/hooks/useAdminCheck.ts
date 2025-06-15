import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export const useAdminCheck = () => {
  const { user, hasRole } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      console.log('useAdminCheck: Starting admin status check');
      console.log('useAdminCheck: User state:', user ? {
        email: user.email,
        id: user.id,
        metadata: user.user_metadata,
        backendProfile: user.backendProfile
      } : 'No user');
      
      if (!user) {
        console.log('useAdminCheck: No user authenticated');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Check if user has admin role using the hasRole function
        console.log('useAdminCheck: Calling hasRole("admin")');
        const adminStatus = hasRole('admin');
        console.log(`useAdminCheck: Admin status for ${user.email}: ${adminStatus}`);
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, hasRole]);

  return { isAdmin, loading };
};
