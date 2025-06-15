// Complete Browser Cleanup for SteppersLife
// Run this in browser console to completely reset all cached data

(async function forceCleanup() {
  console.log('🚀 Starting complete browser cleanup for SteppersLife...');
  
  try {
    // 1. Unregister ALL service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log(`Found ${registrations.length} service worker registrations`);
      
      for (let registration of registrations) {
        console.log('Unregistering service worker:', registration.scope);
        await registration.unregister();
      }
      
      // Force stop any active service workers
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage('SKIP_WAITING');
      }
      
      console.log('✅ All service workers unregistered');
    }
    
    // 2. Clear ALL caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      console.log(`Found ${cacheNames.length} caches:`, cacheNames);
      
      for (let cacheName of cacheNames) {
        console.log('Deleting cache:', cacheName);
        await caches.delete(cacheName);
      }
      
      console.log('✅ All caches cleared');
    }
    
    // 3. Clear localStorage and sessionStorage
    if (typeof Storage !== 'undefined') {
      const localStorageCount = localStorage.length;
      const sessionStorageCount = sessionStorage.length;
      
      localStorage.clear();
      sessionStorage.clear();
      
      console.log(`✅ Cleared ${localStorageCount} localStorage items and ${sessionStorageCount} sessionStorage items`);
    }
    
    // 4. Clear IndexedDB (if any)
    if ('indexedDB' in window) {
      try {
        const databases = await indexedDB.databases();
        for (let db of databases) {
          if (db.name) {
            console.log('Deleting IndexedDB:', db.name);
            indexedDB.deleteDatabase(db.name);
          }
        }
        console.log('✅ IndexedDB cleared');
      } catch (e) {
        console.log('IndexedDB cleanup skipped (not supported)');
      }
    }
    
    // 5. Clear any Supabase specific storage
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // 6. Clear cookies related to localhost
    if (location.hostname === 'localhost') {
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      console.log('✅ Localhost cookies cleared');
    }
    
    console.log('🎉 Complete cleanup finished!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Close this browser tab');
    console.log('2. Close all other SteppersLife tabs');
    console.log('3. Open a fresh tab and navigate to http://localhost:8080');
    console.log('4. Try accessing /admin after logging in');
    
    // Auto-redirect after cleanup
    setTimeout(() => {
      if (confirm('Cleanup complete! Close this tab and open a fresh one?')) {
        window.close();
      }
    }, 2000);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
})();