import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { adminUserService, User } from '@/services/adminUserService';
import { useToast } from "@/components/ui/use-toast";

interface ImpersonationState {
  isImpersonating: boolean;
  originalAdmin: User | null;
  currentUser: User | null;
  impersonatedUser: User | null;
}

interface UseUserImpersonationReturn {
  impersonationState: ImpersonationState;
  startImpersonation: (targetUser: User) => Promise<void>;
  endImpersonation: () => Promise<void>;
  canImpersonate: boolean;
  loading: boolean;
  error: string | null;
}

export const useUserImpersonation = (): UseUserImpersonationReturn => {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [impersonationState, setImpersonationState] = useState<ImpersonationState>({
    isImpersonating: false,
    originalAdmin: null,
    currentUser: user,
    impersonatedUser: null
  });

  // Check if current user can impersonate others (admin only)
  const canImpersonate = user?.role === 'admin';

  // Load impersonation state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('impersonation_state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setImpersonationState(parsed);
        
        // If we were impersonating someone, restore that state
        if (parsed.isImpersonating && parsed.impersonatedUser) {
          setUser(parsed.impersonatedUser);
        }
      } catch (error) {
        console.error('Failed to restore impersonation state:', error);
        localStorage.removeItem('impersonation_state');
      }
    }
  }, [setUser]);

  // Save impersonation state to localStorage
  const saveImpersonationState = useCallback((state: ImpersonationState) => {
    setImpersonationState(state);
    localStorage.setItem('impersonation_state', JSON.stringify(state));
  }, []);

  const startImpersonation = useCallback(async (targetUser: User) => {
    if (!canImpersonate) {
      throw new Error('Insufficient permissions to impersonate users');
    }

    setLoading(true);
    setError(null);

    try {
      // In a real app, this would make an API call to start impersonation
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 500));

      const newState: ImpersonationState = {
        isImpersonating: true,
        originalAdmin: impersonationState.originalAdmin || user,
        currentUser: targetUser,
        impersonatedUser: targetUser
      };

      saveImpersonationState(newState);
      setUser(targetUser);

      toast({
        title: "Impersonation Started",
        description: `You are now acting as ${targetUser.name} (${targetUser.role})`,
        duration: 3000,
      });

      // Log the impersonation for audit purposes
      console.log(`Admin ${user?.email} started impersonating ${targetUser.email}`);

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to start impersonation';
      setError(errorMessage);
      toast({
        title: "Impersonation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [canImpersonate, user, impersonationState.originalAdmin, setUser, toast, saveImpersonationState]);

  const endImpersonation = useCallback(async () => {
    if (!impersonationState.isImpersonating || !impersonationState.originalAdmin) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // In a real app, this would make an API call to end impersonation
      await new Promise(resolve => setTimeout(resolve, 300));

      const originalAdmin = impersonationState.originalAdmin;
      const newState: ImpersonationState = {
        isImpersonating: false,
        originalAdmin: null,
        currentUser: originalAdmin,
        impersonatedUser: null
      };

      saveImpersonationState(newState);
      setUser(originalAdmin);
      localStorage.removeItem('impersonation_state');

      toast({
        title: "Impersonation Ended",
        description: `You are now back to your admin account`,
        duration: 3000,
      });

      // Log the end of impersonation for audit purposes
      console.log(`Admin ${originalAdmin.email} ended impersonation`);

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to end impersonation';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [impersonationState, setUser, toast, saveImpersonationState]);

  // Clean up impersonation state if user logs out
  useEffect(() => {
    if (!user) {
      setImpersonationState({
        isImpersonating: false,
        originalAdmin: null,
        currentUser: null,
        impersonatedUser: null
      });
      localStorage.removeItem('impersonation_state');
    }
  }, [user]);

  return {
    impersonationState,
    startImpersonation,
    endImpersonation,
    canImpersonate,
    loading,
    error
  };
}; 