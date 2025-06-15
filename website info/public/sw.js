// Simple service worker that unregisters itself
// This fixes the "Failed to update a ServiceWorker" error

self.addEventListener('install', () => {
  console.log('Service Worker: Installed (unregistering)');
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  console.log('Service Worker: Activated (unregistering)');
  // Unregister this service worker
  self.registration.unregister().then(() => {
    console.log('Service Worker: Unregistered successfully');
  });
});

// Don't cache anything - just unregister
self.addEventListener('fetch', (event) => {
  // Let the browser handle all requests normally
  return;
});