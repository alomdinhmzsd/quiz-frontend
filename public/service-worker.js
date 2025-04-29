/* eslint-disable no-restricted-globals */
/**
 * Service Worker - iOS Stability Fix v3.3
 *
 * Fixes:
 * - Corrected fat arrow syntax
 * - Enhanced iOS client claiming
 * - Added cache version validation
 * - Improved HTML fallback for iOS
 */

const CACHE_VERSION = 'v3.3';
const CACHE_NAME = 'quiz-app-' + CACHE_VERSION;
const OFFLINE_URL = '/offline.html';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/js/main.js',
  '/static/css/main.css',
  '/logo192.png',
  '/apple-icon-180.png',
];

// Debug utility for iOS
function logIOS(message) {
  console.log('[iOS-SW] ' + message);
}

// ===== INSTALL ===== //
self.addEventListener('install', function (event) {
  logIOS('Installing new version: ' + CACHE_VERSION);
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        logIOS('Caching core assets');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(function () {
        logIOS('Skipping waiting phase');
        return self.skipWaiting();
      })
  );
});

// ===== ACTIVATE (iOS CRITICAL FIX) ===== //
self.addEventListener('activate', function (event) {
  logIOS('Activating and claiming clients');
  event.waitUntil(
    caches
      .keys()
      .then(function (cacheNames) {
        return Promise.all(
          cacheNames.map(function (cacheName) {
            if (cacheName !== CACHE_NAME) {
              logIOS('Deleting old cache: ' + cacheName);
              return caches.delete(cacheName);
            }
            return null;
          })
        );
      })
      .then(function () {
        logIOS('Claiming all clients');
        return self.clients.claim();
      })
  );
});

// ===== FETCH (iOS OPTIMIZED) ===== //
self.addEventListener('fetch', function (event) {
  // Special handling for HTML requests
  if (event.request.mode === 'navigate') {
    logIOS('Handling HTML request');
    event.respondWith(
      fetch(event.request)
        .then(function (response) {
          // Cache fresh HTML response
          var responseClone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(function () {
          logIOS('Using cached HTML fallback');
          return caches.match('/index.html').then(function (response) {
            return response || caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // Original asset handling
  event.respondWith(
    caches.match(event.request).then(function (cachedResponse) {
      return (
        cachedResponse ||
        fetch(event.request).then(function (networkResponse) {
          if (event.request.url.startsWith('http')) {
            var responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
      );
    })
  );
});

// Initialization log
logIOS('Service Worker loaded: ' + CACHE_VERSION);
