import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { pwaAuthService, PWAUser, PWAUserRole, BiometricAuthResult, DeviceAuthResult } from '@/services/pwaAuthService';
import { toast } from '@/components/ui/sonner';

interface UsePWAAuthReturn {
  user: PWAUser | null;
  isLoading: boolean;
  isOnline: boolean;
  isOfflineMode: boolean;
  lastSyncTime: Date | null;
  error: string | null;
  isBiometricAvailable: boolean;
  supportedBiometricTypes: string[];
  hasRole: (roles: PWAUserRole | PWAUserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
  hasEventAccess: (eventId: string) => boolean;
  signInWithRoles: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  authenticateWithBiometric: () => Promise<BiometricAuthResult>;
  authenticateWithDevice: (deviceAuth: string) => Promise<DeviceAuthResult>;
  validateSession: (operation: string) => Promise<boolean>;
  refreshAuthCache: () => Promise<void>;
  clearOfflineAuth: () => void;
  syncWithWebAuth: () => Promise<void>;
}

interface PWAAuthState {
  user: PWAUser | null;
  isLoading: boolean;
  isOnline: boolean;
  isOfflineMode: boolean;
  lastSyncTime: Date | null;
  error: string | null;
  isBiometricAvailable: boolean;
  supportedBiometricTypes: string[];
}

export const usePWAAuth = (): UsePWAAuthReturn => {
  const { user: webUser, signOut } = useAuth();
  
  const [state, setState] = useState<PWAAuthState>({
    user: null,
    isLoading: true,
    isOnline: navigator.onLine,
    isOfflineMode: false,
    lastSyncTime: null,
    error: null,
    isBiometricAvailable: false,
    supportedBiometricTypes: []
  });

  // Initialize PWA auth state
  useEffect(() => {
    let isMounted = true;
    
    const initializePWAAuth = async () => {
      try {
        // Check for cached authentication first
        const cachedAuth = await pwaAuthService.getCachedAuthData().catch(() => null);
        
        if (cachedAuth && isMounted) {
          setState(prev => ({
            ...prev,
            user: cachedAuth.user,
            isOfflineMode: true,
            lastSyncTime: new Date(cachedAuth.expiresAt),
            isLoading: false,
            error: null
          }));
        }

        // Check biometric availability
        const biometricSupport = await pwaAuthService.isBiometricAvailable().catch(() => ({
          available: false,
          types: []
        }));

        if (isMounted) {
          setState(prev => ({
            ...prev,
            isBiometricAvailable: biometricSupport.available,
            supportedBiometricTypes: biometricSupport.types,
            isLoading: false
          }));
        }

        // Sync with online auth if available and online
        if (navigator.onLine && webUser) {
          await syncWithWebAuth();
        }
      } catch (error) {
        console.error('PWA auth initialization failed:', error);
        if (isMounted) {
          setState(prev => ({
            ...prev,
            error: 'Failed to initialize PWA authentication',
            isLoading: false
          }));
        }
      }
    };

    initializePWAAuth();

    return () => {
      isMounted = false;
    };
  }, [webUser]);

  // Sync with web authentication when available
  const syncWithWebAuth = async () => {
    if (!webUser || !navigator.onLine) return;

    try {
      // Convert web user to PWA user with roles
      const pwaUser: PWAUser = {
        ...webUser,
        role: 'event_staff', // Default role, would be fetched from API
        events: [], // Would be fetched from API
        permissions: ['check_in', 'view_attendance']
      };

      setState(prev => ({
        ...prev,
        user: pwaUser,
        isOfflineMode: false,
        lastSyncTime: new Date(),
        error: null
      }));

      // Cache for offline use
      await pwaAuthService.cacheAuthData(
        pwaUser,
        { access_token: 'mock_token', refresh_token: 'mock_refresh' } as any,
        [pwaUser.role!],
        pwaUser.events || []
      ).catch(error => {
        console.warn('Failed to cache auth data:', error);
        // Continue without caching if IndexedDB fails
      });

    } catch (error) {
      console.error('Failed to sync with web auth:', error);
    }
  };

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      syncWithWebAuth();
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [webUser]);

  // Background sync when coming online
  const refreshAuthCache = async () => {
    if (!navigator.onLine) {
      throw new Error('Cannot refresh cache while offline');
    }

    try {
      await pwaAuthService.syncAuthState();
      const freshAuth = await pwaAuthService.getCachedAuthData().catch(() => null);
      
      if (freshAuth) {
        setState(prev => ({
          ...prev,
          user: freshAuth.user,
          lastSyncTime: new Date(),
          isOfflineMode: false,
          error: null
        }));
      }
    } catch (error) {
      console.error('Failed to refresh auth cache:', error);
      throw error;
    }
  };

  // Clear offline authentication
  const clearOfflineAuth = () => {
    try {
      pwaAuthService.clearAuthCache();
      setState(prev => ({
        ...prev,
        user: null,
        isOfflineMode: false,
        lastSyncTime: null,
        error: null
      }));
    } catch (error) {
      console.error('Failed to clear offline auth:', error);
    }
  };

  // Role and permission checking
  const hasRole = (roles: PWAUserRole | PWAUserRole[]): boolean => {
    if (!state.user?.role) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(state.user.role);
  };

  const hasPermission = (permission: string): boolean => {
    if (!state.user?.permissions) return false;
    return state.user.permissions.includes(permission);
  };

  const hasEventAccess = (eventId: string): boolean => {
    if (!state.user?.events) return true; // Grant access if no event restrictions
    return state.user.events.includes(eventId);
  };

  // PWA-specific sign-in with role validation
  const signInWithRoles = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const result = await pwaAuthService.signInWithRoles(email, password);
      
      if (result.success && result.user) {
        setState(prev => ({
          ...prev,
          user: result.user,
          isOfflineMode: false,
          lastSyncTime: new Date(),
          error: null
        }));
        
        toast.success(`Welcome back, ${result.user.role || 'user'}!`, {
          description: 'Authentication successful.'
        });
        
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Biometric authentication
  const authenticateWithBiometric = useCallback(async (): Promise<BiometricAuthResult> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const result = await pwaAuthService.authenticateWithBiometric();
      
      if (result.success && result.user) {
        setState(prev => ({
          ...prev,
          user: result.user,
          isOfflineMode: true,
          error: null
        }));
        
        toast.success('Biometric authentication successful', {
          description: 'Logged in with biometric credentials.'
        });
      }
      
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Device authentication (PIN, pattern, etc.)
  const authenticateWithDevice = useCallback(async (deviceAuth: string): Promise<DeviceAuthResult> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const result = await pwaAuthService.authenticateWithDevice(deviceAuth);
      
      if (result.success && result.user) {
        setState(prev => ({
          ...prev,
          user: result.user,
          isOfflineMode: true,
          error: null
        }));
        
        toast.success('Device authentication successful', {
          description: 'Logged in with device credentials.'
        });
      }
      
      return result;
    } catch (error: any) {
      return { success: false, type: 'pin', error: error.message };
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Session validation
  const validateSession = useCallback(async (operation: string): Promise<boolean> => {
    try {
      const isValid = await pwaAuthService.validateSessionForOperation(operation);
      
      if (!isValid && !state.isOfflineMode) {
        toast.error('Session expired', {
          description: 'Please sign in again to continue.'
        });
        await signOut();
        setState(prev => ({ ...prev, user: null, isOfflineMode: false, error: 'Session expired' }));
      }
      
      return isValid;
    } catch (error) {
      console.error('Session validation failed:', error);
      return false;
    }
  }, [state.isOfflineMode, signOut]);

  return {
    user: state.user,
    isLoading: state.isLoading,
    isOnline: state.isOnline,
    isOfflineMode: state.isOfflineMode,
    lastSyncTime: state.lastSyncTime,
    error: state.error,
    isBiometricAvailable: state.isBiometricAvailable,
    supportedBiometricTypes: state.supportedBiometricTypes,
    hasRole,
    hasPermission,
    hasEventAccess,
    signInWithRoles,
    authenticateWithBiometric,
    authenticateWithDevice,
    validateSession,
    refreshAuthCache,
    clearOfflineAuth,
    syncWithWebAuth
  };
}; 