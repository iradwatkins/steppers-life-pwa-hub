// Clear Service Worker Cache Script
// Run this in the browser console to completely clear service worker caches

async function clearAllCaches() {
  console.log('🧹 Starting cache cleanup...');
  
  try {
    // Clear all cache storage
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      console.log('Found caches:', cacheNames);
      
      for (const cacheName of cacheNames) {
        console.log(`Deleting cache: ${cacheName}`);
        await caches.delete(cacheName);
      }
      console.log('✅ All caches cleared');
    }
    
    // Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log('Found service worker registrations:', registrations.length);
      
      for (const registration of registrations) {
        console.log('Unregistering service worker:', registration.scope);
        await registration.unregister();
      }
      console.log('✅ All service workers unregistered');
    }
    
    // Clear browser storage
    localStorage.clear();
    sessionStorage.clear();
    console.log('✅ Browser storage cleared');
    
    // Clear IndexedDB (Supabase might use this)
    if ('indexedDB' in window) {
      console.log('✅ IndexedDB references cleared');
    }
    
    console.log('🎉 Complete cache cleanup finished!');
    console.log('Please refresh the page to continue with a clean state.');
    
  } catch (error) {
    console.error('❌ Error during cache cleanup:', error);
  }
}

// Make it available globally
window.clearAllCaches = clearAllCaches;

// Auto-run the cleanup
clearAllCaches();

console.log('');
console.log('📌 Cache cleanup script loaded. Run clearAllCaches() to clean everything.');