import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary'
import { initBrowserEnv } from './lib/env'
import { ensureIradIsAdmin } from './utils/ensureAdminUser'

// Initialize environment variables
initBrowserEnv();

// Ensure admin user is properly set up
ensureIradIsAdmin().catch(console.error);

// Enhanced PWA install detection with better timing
// Initialize global variables first to avoid temporal dead zone errors
let deferredPrompt: any = null;
let installPromptReceived: boolean = false;

// Simplified development mode helpers
const setupDevelopmentPWAHelpers = () => {
  if (!import.meta.env.DEV) return;
  
  // Mock install prompt for development testing
  window.mockPWAInstall = () => {
    const mockEvent = {
      preventDefault: () => {},
      prompt: () => Promise.resolve({ outcome: 'accepted' })
    };
    handleBeforeInstallPrompt(mockEvent);
  };
  
  // Development PWA status checker
  window.checkPWAStatus = () => {
    console.log('PWA Status:', {
      serviceWorker: 'serviceWorker' in navigator,
      installPrompt: installPromptReceived,
      deferredPrompt: !!deferredPrompt,
      isHTTPS: location.protocol === 'https:'
    });
  };
};

// Enhanced display mode detection
const getDisplayMode = () => {
  if (navigator.standalone) return 'standalone-ios';
  if (window.matchMedia('(display-mode: standalone)').matches) return 'standalone';
  if (window.matchMedia('(display-mode: minimal-ui)').matches) return 'minimal-ui';
  if (window.matchMedia('(display-mode: fullscreen)').matches) return 'fullscreen';
  return 'browser';
};

// Simplified beforeinstallprompt handler
const handleBeforeInstallPrompt = (e: any) => {
  e.preventDefault();
  deferredPrompt = e;
  window.deferredPrompt = e;
  installPromptReceived = true;
  window.dispatchEvent(new CustomEvent('pwainstallable', { detail: e }));
  return false;
};

// Track successful installation - defined after variable declarations
const handleAppInstalled = (evt: any) => {
  console.log('🎉 PWA was installed successfully!', evt);
  
  // Clear the deferred prompt
  deferredPrompt = null;
  window.deferredPrompt = null;
  installPromptReceived = false;
  
  // Dispatch custom event
  window.dispatchEvent(new CustomEvent('pwainstalled'));
  
  // Track installation for analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', 'app_installed', {
      method: 'pwa'
    });
  }
};

// Simplified service worker registration
const registerServiceWorker = async () => {
  // COMPLETELY DISABLE service worker registration to avoid conflicts
  console.log('Service worker registration disabled');
  return null;
};

// Enhanced user engagement detection
const setupUserEngagement = () => {
  let engagementScore = 0;
  const requiredScore = 3; // Chrome's typical requirement
  
  // Check if we're on the staff install page
  const isDownloadPage = window.location.pathname === '/download';
  
  const trackEngagement = (type: string) => {
    engagementScore++;
    
    // Only log significant engagement events to reduce console spam
    const shouldLog = engagementScore <= requiredScore || type.includes('staff') || type.includes('immediate');
    if (shouldLog && import.meta.env.DEV) {
      console.log(`📈 User engagement: ${type} (score: ${engagementScore}/${requiredScore})`);
    }
    
    if (engagementScore >= requiredScore || isDownloadPage) {
      sessionStorage.setItem('pwa-engagement', 'true');
      if (import.meta.env.DEV && engagementScore === requiredScore) {
        console.log('✅ User engagement threshold met for PWA install');
      }
    }
  };
  
  // Immediately fulfill engagement requirements on staff install page
  if (isDownloadPage) {
    console.log('📱 Staff install page - immediately fulfilling engagement requirements');
    sessionStorage.setItem('pwa-engagement', 'true');
    sessionStorage.setItem('user-interacted', 'true');
    localStorage.setItem('pwa-visited', 'true');
    trackEngagement('staff-page-visit');
    trackEngagement('immediate-engagement');
    trackEngagement('bypass-requirements');
  }
  
  // Track various user interactions
  const engagementEvents = ['click', 'scroll', 'keydown', 'touchstart'];
  engagementEvents.forEach(event => {
    document.addEventListener(event, () => trackEngagement(event), { once: true });
  });
  
  // Automatic engagement after time delay (reduced for staff page)
  setTimeout(() => {
    trackEngagement('time-spent');
  }, isDownloadPage ? 1000 : 5000);
  
  // Page navigation tracking - temporarily disabled to prevent browser throttling
  // TODO: Re-enable with better implementation after performance issues are resolved
  /*
  let navigationCount = 0;
  let lastNavigationTime = 0;
  const navigationThrottle = 5000; // Only track navigation once per 5 seconds
  
  const originalPushState = history.pushState;
  history.pushState = function(...args) {
    const now = Date.now();
    if (now - lastNavigationTime >= navigationThrottle) {
      navigationCount++;
      trackEngagement(`navigation-${navigationCount}`);
      lastNavigationTime = now;
    }
    return originalPushState.apply(history, args);
  };
  */
};

// Check if app is already installed with enhanced detection
const checkInstallationStatus = () => {
  const displayMode = getDisplayMode();
  
  console.log('📱 PWA Display Mode:', displayMode);
  
  const isInstalled = displayMode === 'standalone' || displayMode === 'standalone-ios';
  
  if (isInstalled) {
    console.log('✅ App is running as installed PWA');
  } else {
    console.log('🌐 App is running in browser mode');
  }
  
  return isInstalled;
};

// Force Chrome to reevaluate PWA installability
const triggerInstallabilityCheck = () => {
  // Force Chrome to check installability by triggering events
  setTimeout(() => {
    if (!installPromptReceived && !checkInstallationStatus()) {
      console.log('🔄 Triggering Chrome installability check...');
      
      // Simulate user interaction to trigger Chrome's internal checks
      const event = new Event('click', { bubbles: true, cancelable: true });
      document.body.dispatchEvent(event);
      
      // Force service worker update check
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => registration.update());
        });
      }
      
      // Dispatch a custom event that might trigger Chrome's checks
      window.dispatchEvent(new CustomEvent('beforeinstallprompt-check'));
    }
  }, 2000);
};

// Simplified main initialization
const initializePWA = async () => {
  // Set up development helpers
  setupDevelopmentPWAHelpers();
  
  // Set up user engagement tracking
  setupUserEngagement();
  
  // Add event listeners for PWA events
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.addEventListener('appinstalled', handleAppInstalled);
  
  // Register service worker
  await registerServiceWorker();
  
  // Only do extensive checking on download page
  if (window.location.pathname === '/download') {
    triggerInstallabilityCheck();
  }
};

// Global types for TypeScript
declare global {
  interface Window {
    deferredPrompt: any;
    mockPWAInstall?: () => void;
    checkPWAStatus?: () => void;
  }
}

// Initialize everything when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePWA);
} else {
  initializePWA();
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
