const CACHE_NAME = 'sector-7-cache-v1';
const OFFLINE_URL = '/offline.html';

const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/styles.css',
  '/Sector-7.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const request = event.request;

  // Handle navigation requests with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // For same-origin requests (your site's files)
  if (request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        return cachedResponse || fetch(request).catch(() => {
          // You can optionally return something here if fetch fails for non-navigation requests
          return cachedResponse; // fallback to cache if available
        });
      })
    );
    return;
  }

  // For cross-origin requests, just try fetch, no caching, catch fetch errors silently
  event.respondWith(
    fetch(request).catch(() => {
      // If fetch fails, just fail silently without throwing error in console
      return new Response('', { status: 503, statusText: 'Service Unavailable' });
    })
  );
});
