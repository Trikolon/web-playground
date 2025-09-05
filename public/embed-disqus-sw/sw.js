/*
Service Worker for Disqus script caching
Scope: current directory
*/
const CACHE_NAME = 'disqus-script-cache-v1';
const DISQUS_HOST = 'newser.disqus.com';
const SCRIPT_PATHS = new Set(['/embed.js', '/count.js']);

self.addEventListener('install', (event) => {
  // Activate immediately on first load
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle Disqus embed/count scripts
  if (
    url.hostname === DISQUS_HOST &&
    SCRIPT_PATHS.has(url.pathname) &&
    request.destination === 'script'
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);

        const fetchAndUpdate = fetch(request)
          .then((response) => {
            // Cache successful or opaque responses
            if (response && (response.ok || response.type === 'opaque')) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch((error) => {
            console.error('SW Fetch failed:', error);
          });

        if (cached) {
          // Return cached immediately; update in background
          event.waitUntil(fetchAndUpdate);
          return cached;
        }

        // No cache yet: go to network
        const network = await fetchAndUpdate;
        // If network failed too, fall back to cached (likely null)
        return network || cached;
      })(),
    );
  }
});
