self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  // You can pre-cache files here if needed
  event.waitUntil(
    caches.open('v1').then(cache => {
      return cache.addAll([
        '/',              // root
        'Index.html',
        'main.js',
        'styles.css'
      ]);
    })
  );
});

// Activate event – runs after install
self.addEventListener('activate', event => {
  console.log('Service Worker activated');
});

// Fetch event – intercepts network requests
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Serve cached file if available, otherwise fetch from network
      return response || fetch(event.request);
    })
  );
});
