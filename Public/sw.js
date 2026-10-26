// sw.js - Service Worker with cache busting
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Always fetch fresh from network to prevent serving stale cached HTML
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
