const CACHE_NAME = 'ledger-pwa-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install Event - Caching Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean old caches if updated
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});
// sw.js - Handles push events sent from server when app is closed
self.addEventListener('push', (event) => {
    let data = { title: 'Money Report Reminder', body: 'Time to log your daily expenses!' };
    
    if (event.data) {
        data = event.data.json();
    }

    const options = {
        body: data.body,
        icon: 'icon-192.png',
        badge: 'icon-192.png',
        vibrate: [200, 100, 200],
        sound: 'default'
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});
// Fetch Event - Serve from Cache, fall back to Network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (event.request.method === 'GET') {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      });
    })
  );
});
