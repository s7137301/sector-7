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
  event.respondWith(
    fetch(event.request).catch(async () => {
      // If it's a navigation request, show the offline page
      if (event.request.mode === 'navigate') {
        return caches.match(OFFLINE_URL);
      }

      // Otherwise, try cache
      const cachedResponse = await caches.match(event.request);
      return cachedResponse;
    })
  );
});
