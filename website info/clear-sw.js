// Service Worker Clear Script
// Run this in browser console to clear service worker and cache

async function clearServiceWorkerAndCache() {
  console.log('🧹 Clearing service worker and cache...');
  
  try {
    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      console.log('Found caches:', cacheNames);
      
      await Promise.all(
        cacheNames.map(async (cacheName) => {
          console.log(`Deleting cache: ${cacheName}`);
          await caches.delete(cacheName);
        })
      );
      console.log('✅ All caches cleared');
    }
    
    // Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log('Found service worker registrations:', registrations.length);
      
      await Promise.all(
        registrations.map(async (registration) => {
          console.log('Unregistering service worker:', registration.scope);
          await registration.unregister();
        })
      );
      console.log('✅ All service workers unregistered');
    }
    
    console.log('🎉 Service worker and cache cleared successfully!');
    console.log('Please refresh the page to get the new service worker.');
    
  } catch (error) {
    console.error('❌ Error clearing service worker and cache:', error);
  }
}

// Run the cleanup
clearServiceWorkerAndCache();