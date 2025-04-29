/* eslint-disable no-restricted-globals */
/**
 * Service Worker - iOS Stability Fix v3.9
 *
 * Fixes:
 * 1. Immediate cache fallback for iOS
 * 2. Enhanced HTML caching strategy
 * 3. Preloaded critical assets
 * 4. Preserved all original documentation
 */

const CACHE_VERSION = 'v3.9-ios-urgent';
const CACHE_NAME = 'quiz-app-' + new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
const OFFLINE_URL = '/offline.html';
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/js/main.js',
  '/static/css/main.css',
  '/apple-icon-180.png', // iOS specific icon first
  '/offline.html', // ← this must be here
];

// Debug utility for iOS
function logIOS(message) {
  console.log('[iOS-SW] ' + message);
}

// ===== INSTALL (IOS PRIORITY CACHE) ===== //
self.addEventListener('install', function (event) {
  logIOS('Installing emergency iOS version: ' + CACHE_VERSION);
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        // Cache critical assets first
        return cache
          .addAll(CRITICAL_ASSETS)
          .then(() => logIOS('Critical assets cached'))
          .catch((err) => console.error('Cache error:', err));
      })
      .then(function () {
        logIOS('Force activating for iOS');
        return self.skipWaiting();
      })
  );
});

// ===== ACTIVATE (STABLE VERSION) ===== //
self.addEventListener('activate', function (event) {
  logIOS('Activating stable version');
  event.waitUntil(
    caches
      .keys()
      .then(function (cacheNames) {
        return Promise.all(
          cacheNames.map(function (cacheName) {
            if (!cacheName.includes(CACHE_VERSION)) {
              logIOS('Purging old cache:', cacheName);
              return caches.delete(cacheName);
            }
            return null; // Simpler return for kept caches
          })
        );
      })
      .then(function () {
        logIOS('Claiming clients');
        return self.clients.claim(); // Simplified claim
      })
  );
});

// ===== FETCH (IOS EMERGENCY FIX) ===== //
self.addEventListener('fetch', function (event) {
  if (event.request.mode === 'navigate') {
    logIOS('iOS navigation request:', event.request.url);
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return (
          cached ||
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                const clone = networkResponse.clone();
                caches
                  .open(CACHE_NAME)
                  .then((cache) => cache.put(event.request, clone));
              }
              return networkResponse;
            })
            .catch(() => caches.match(OFFLINE_URL))
        );
      })
    );
  }

  // 2. Normal asset handling
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return (
        cached ||
        fetch(event.request).then(function (networkResponse) {
          // Cache all successful requests
          if (networkResponse.ok) {
            const clone = networkResponse.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
      );
    })
  );
});

// Initialization log
logIOS('Service Worker emergency load complete: ' + CACHE_VERSION);
