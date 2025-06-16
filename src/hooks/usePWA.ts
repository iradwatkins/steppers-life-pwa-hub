import { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { forceUpdate, skipWaiting } from '@/utils/sw-utils';

interface PWAHookResult {
  isOnline: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  needRefresh: boolean;
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  installPWA: () => Promise<void>;
}

export const usePWA = (): PWAHookResult => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [hasUpdated, setHasUpdated] = useState(() => {
    return localStorage.getItem('pwa-has-updated') === 'true';
  });
  const [updateInProgress, setUpdateInProgress] = useState(false);
  
  // Detect if we're in development mode
  const isDevelopment = import.meta.env.DEV;

  const {
    needRefresh,
    updateServiceWorker: originalUpdateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
    onNeedRefresh() {
      console.log('SW needs refresh - new version available');
      
      // In development, don't show update prompts as they're triggered constantly
      if (isDevelopment) {
        console.log('Development mode: ignoring update prompt');
        return;
      }
      
      // In production, use a more robust version tracking
      const currentAppVersion = localStorage.getItem('app-version');
      const buildTime = import.meta.env.VITE_BUILD_TIME || Date.now().toString();
      
      // If this is a new version or first time, show the update prompt
      if (currentAppVersion !== buildTime) {
        setHasUpdated(false);
        setUpdateInProgress(false);
        localStorage.removeItem('pwa-has-updated');
        localStorage.setItem('app-version', buildTime);
        sessionStorage.removeItem('pwa-update-handled');
      }
    },
    onOfflineReady() {
      console.log('SW offline ready');
    },
  });

  // Enhanced update service worker function
  const updateServiceWorker = async (reloadPage?: boolean): Promise<void> => {
    // Prevent multiple simultaneous updates
    if (updateInProgress) {
      console.log('🔄 Update already in progress, skipping...');
      return;
    }

    try {
      console.log('🔄 Starting service worker update...');
      setUpdateInProgress(true);
      setHasUpdated(true);
      localStorage.setItem('pwa-has-updated', 'true');
      
      // Use the original update method
      await originalUpdateServiceWorker(reloadPage);
      
      console.log('✅ Service worker updated successfully');
      
      // The page will reload automatically, so we don't need to reset state
      
    } catch (error) {
      console.error('❌ Failed to update service worker:', error);
      
      // Reset state on error
      setUpdateInProgress(false);
      setHasUpdated(false);
      
      // Force reload as fallback
      if (reloadPage !== false) {
        console.log('🔄 Fallback: forcing page reload...');
        window.location.reload();
      }
    }
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installPWA = async (): Promise<void> => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setIsInstallable(false);
    }
    
    setDeferredPrompt(null);
  };

  return {
    isOnline,
    isInstallable,
    isInstalled,
    needRefresh: needRefresh && !hasUpdated && !updateInProgress && !isDevelopment,
    updateServiceWorker,
    installPWA,
  };
};