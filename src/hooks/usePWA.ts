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
  const [hasUpdated, setHasUpdated] = useState(false);

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
    },
    onOfflineReady() {
      console.log('SW offline ready');
    },
  });

  // Enhanced update service worker function
  const updateServiceWorker = async (reloadPage?: boolean): Promise<void> => {
    try {
      console.log('Updating service worker...');
      
      // Mark that we've attempted an update
      setHasUpdated(true);
      
      if (reloadPage !== false) {
        console.log('Using force update method...');
        // Use our simplified force update method
        await forceUpdate();
      } else {
        // Just update without reloading
        await originalUpdateServiceWorker(false);
      }
    } catch (error) {
      console.error('Failed to update service worker:', error);
      
      if (reloadPage !== false) {
        console.log('Fallback: immediate page reload...');
        // Immediate fallback: just reload
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
    needRefresh: needRefresh && !hasUpdated,
    updateServiceWorker,
    installPWA,
  };
};