const CACHE_NAME = 'sector-7-cache-v2';
const OFFLINE_URL = '/offline.html';

const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/styles.css',
  '/Sector-7.png',
];

// Cache assets during install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Take control immediately
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Handle fetch events
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then(response => {
        // If the response is a redirect, create a safe version
        if (response.redirected) {
          return response.clone().text().then(body => {
            return new Response(body, {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers
            });
          });
        }
        return response;
      }).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
  } else {
    // Non-navigation requests (e.g. CSS, images)
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).catch(() => {
          // Could return fallback image or blank response
        });
      })
    );
  }
});
