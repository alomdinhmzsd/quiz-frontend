/* eslint-disable no-restricted-globals */
/**
 * service-worker.js - v4.0
 *
 * Full offline support for PWA
 * - Caches critical assets + quiz API
 * - Graceful fallback using offline.html
 * - Handles both navigation + static requests
 * - Works on Safari, iOS quirks, Chrome
 */

const CACHE_VERSION = 'v4.0-complete';
const CACHE_NAME = 'quiz-app-' + new Date().toISOString().split('T')[0];
const OFFLINE_URL = '/offline.html';

const CRITICAL_ASSETS = [
  '/', // root page
  '/index.html',
  '/manifest.json',
  '/static/js/main.js',
  '/static/css/main.css',
  '/apple-icon-180.png',
  '/offline.html', // offline fallback page
  '/api/questions', // ✅ pre-cache quiz API response
];

// Logging utility
function logSW(message) {
  console.log('[SW] ' + message);
}

// ========== INSTALL ==========
self.addEventListener('install', (event) => {
  logSW(`Installing version: ${CACHE_VERSION}`);
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(CRITICAL_ASSETS).then(() => {
          logSW('Critical assets cached');
        });
      })
      .catch((err) => console.error('[SW] Cache error:', err))
  );
  self.skipWaiting(); // Force immediate activation
});

// ========== ACTIVATE ==========
self.addEventListener('activate', (event) => {
  logSW('Activating new service worker...');
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheName.includes(CACHE_VERSION)) {
              logSW('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
            return null;
          })
        );
      })
      .then(() => self.clients.claim()) // Claim control immediately
  );
});

// ========== FETCH ==========
self.addEventListener('fetch', (event) => {
  // Handle navigational requests (like page loads)
  if (event.request.mode === 'navigate') {
    logSW('Navigation fetch:', event.request.url);
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // ✅ Success - return it
          return response;
        })
        .catch(() => {
          // ❌ Network failed - use offline page
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // Handle all other requests (JS, CSS, API, images)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      // ✅ Serve from cache if available
      if (cached) {
        return cached;
      }

      // 🚀 Try to fetch and cache it
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const clone = networkResponse.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          // ❌ Network failed and not cached - fallback to offline.html
          return caches.match(OFFLINE_URL);
        });
    })
  );
});

// Initial log
logSW('Service Worker loaded: ' + CACHE_VERSION);
