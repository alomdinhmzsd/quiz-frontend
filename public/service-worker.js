/* eslint-disable no-restricted-globals */
const CACHE_VERSION = 'v3';
const CACHE_NAME = `quiz-app-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html'; // Create this fallback page
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/js/main.js',
  '/static/css/main.css',
  '/logo192.png',
  '/apple-icon-180.png',
];

// ===== INSTALL ===== //
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching core assets');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('Skipping waiting phase');
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('Pre-caching failed:', err);
      })
  );
});

// ===== ACTIVATE ===== //
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
            return null; // Explicit return for non-deleted caches
          })
        );
      })
      .then(() => {
        console.log('Claiming clients');
        return self.clients.claim();
      })
  );
});

// ===== FETCH ===== //
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and chrome-extension
  if (
    event.request.method !== 'GET' ||
    event.request.url.startsWith('chrome-extension://')
  ) {
    return;
  }

  // Network-first for HTML, cache-first for assets
  if (event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // Cache fresh HTML response
          const responseClone = networkResponse.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, responseClone));
          return networkResponse;
        })
        .catch(() => caches.match(OFFLINE_URL))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return (
          cachedResponse ||
          fetch(event.request)
            .then((networkResponse) => {
              // Cache fresh asset responses
              if (event.request.url.startsWith('http')) {
                const responseClone = networkResponse.clone();
                caches
                  .open(CACHE_NAME)
                  .then((cache) => cache.put(event.request, responseClone));
              }
              return networkResponse;
            })
            .catch(() => {
              // Asset-specific fallback
              if (event.request.destination === 'image') {
                return caches.match('/placeholder.png');
              }
            })
        );
      })
    );
  }
});

// ===== PUSH NOTIFICATIONS ===== //
self.addEventListener('push', (event) => {
  const data = event.data?.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'New quiz available', {
      body: data.body || 'Check out the latest questions!',
      icon: '/logo192.png',
    })
  );
});
