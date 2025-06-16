import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePWA } from '@/hooks/usePWA';

interface PWAContextType {
  isPWAMode: boolean;
  canAccessPWAFeatures: boolean;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  lastSync: Date | null;
  isOfflineReady: boolean;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { isOnline, isInstalled } = usePWA();
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isOfflineReady, setIsOfflineReady] = useState(false);

  // Check if running in PWA mode
  const isPWAMode = isInstalled || window.matchMedia('(display-mode: standalone)').matches;

  // Determine if user can access PWA features (authenticated staff/organizers)
  const canAccessPWAFeatures = !!(user && (
    user.user_metadata?.role === 'organizer' ||
    user.user_metadata?.role === 'staff' ||
    user.user_metadata?.role === 'admin'
  ));

  // Handle offline data sync
  useEffect(() => {
    if (!canAccessPWAFeatures) return;

    const handleSync = async () => {
      if (isOnline && syncStatus === 'idle') {
        setSyncStatus('syncing');
        try {
          // Sync logic would go here
          // For now, simulate sync
          await new Promise(resolve => setTimeout(resolve, 1000));
          setSyncStatus('synced');
          setLastSync(new Date());
          setIsOfflineReady(true);
        } catch (error) {
          setSyncStatus('error');
          console.error('PWA sync error:', error);
        }
      }
    };

    handleSync();
  }, [isOnline, canAccessPWAFeatures, syncStatus]);

  // Reset sync status after some time
  useEffect(() => {
    if (syncStatus === 'synced' || syncStatus === 'error') {
      const timer = setTimeout(() => setSyncStatus('idle'), 3000);
      return () => clearTimeout(timer);
    }
  }, [syncStatus]);

  const value: PWAContextType = {
    isPWAMode,
    canAccessPWAFeatures,
    syncStatus,
    lastSync,
    isOfflineReady,
  };

  return (
    <PWAContext.Provider value={value}>
      {children}
    </PWAContext.Provider>
  );
};

export const usePWAContext = (): PWAContextType => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWAContext must be used within a PWAProvider');
  }
  return context;
};