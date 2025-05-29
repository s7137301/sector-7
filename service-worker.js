"use strict";

const CACHE_NAME = "sector-7-static-v3";
const OFFLINE_PAGE = "/offline.html";
const CACHE_FILES = [
  "/",
  "/index.html",
  OFFLINE_PAGE,
  "/styles.css",
  "/Sector-7.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHE_FILES);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Check for navigation request and fallback
  if (event.request.mode === "navigate" && event.request.redirect === "follow") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_PAGE);
      })
    );
    return;
  }

  // For other files (CSS, images, etc.)
  const matchedCache = CACHE_FILES.find((file) => {
    return event.request.url.includes(file) ||
           (file.startsWith("/") && event.request.url.includes(self.location.origin + file));
  });

  if (matchedCache) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => cache.match(matchedCache))
    );
  }
});
