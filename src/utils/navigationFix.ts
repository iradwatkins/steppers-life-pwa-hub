/**
 * Navigation Fix Utility
 * Fixes React Router navigation issues where URL changes but components don't re-render
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to force component re-render when location changes
 * Use this in components that aren't responding to route changes
 */
export const useLocationChange = (callback?: (location: any) => void) => {
  const location = useLocation();

  useEffect(() => {
    // Force scroll to top on route change
    window.scrollTo(0, 0);
    
    // Call optional callback
    if (callback) {
      callback(location);
    }
  }, [location.pathname, location.search, location.hash]);

  return location;
};

/**
 * Force refresh of current route
 */
export const forceRouteRefresh = () => {
  // Force a re-render by updating the URL with a timestamp
  const currentUrl = window.location.pathname + window.location.search;
  const separator = window.location.search ? '&' : '?';
  const refreshParam = `${separator}_refresh=${Date.now()}`;
  
  window.history.replaceState(null, '', currentUrl + refreshParam);
  setTimeout(() => {
    window.history.replaceState(null, '', currentUrl);
  }, 10);
};

/**
 * Get a unique key for React components based on current route
 * Use this as a key prop to force component remounting on route changes
 */
export const getRouteKey = (location?: any) => {
  const loc = location || window.location;
  return `${loc.pathname}${loc.search}${loc.hash}`;
};

/**
 * Navigation event listeners for debugging
 */
export const debugNavigation = () => {
  if (process.env.NODE_ENV === 'development') {
    // Listen for navigation events
    window.addEventListener('popstate', (event) => {
      console.log('🔄 Navigation: popstate event', {
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
        state: event.state
      });
    });

    // Override pushState and replaceState to log navigation
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function(state, title, url) {
      console.log('🔄 Navigation: pushState', { state, title, url });
      return originalPushState.apply(this, arguments);
    };

    window.history.replaceState = function(state, title, url) {
      console.log('🔄 Navigation: replaceState', { state, title, url });
      return originalReplaceState.apply(this, arguments);
    };
  }
}; 