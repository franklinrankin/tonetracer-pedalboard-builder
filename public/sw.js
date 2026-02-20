// Boardsie Service Worker - Network First Strategy
// This ensures users always get the latest version

// Skip caching entirely - always fetch from network
// This prevents stale content issues with PWA updates

self.addEventListener('install', () => {
  // Immediately activate new service worker
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clear all old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => caches.delete(name))
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Always fetch from network - no caching
// This ensures the PWA always shows the latest deployed version
self.addEventListener('fetch', (event) => {
  // Just let the request go through normally
  // No caching = always fresh content
});
