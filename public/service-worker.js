/* eslint-disable no-restricted-globals */
/**
 * service-worker.js - v4.1
 *
 * Full offline support for AWS Quiz App
 * - Caches frontend critical assets
 * - Caches backend questions API
 * - Provides graceful offline fallback
 * - Optimized for iOS and Chrome quirks
 */

// ========== GLOBAL CONFIGURATION ==========

// Service worker cache versioning
const CACHE_VERSION = 'v4.1-complete';
// Create a unique cache name based on today's date
const CACHE_NAME = 'quiz-app-' + new Date().toISOString().split('T')[0];
// Offline fallback page location
const OFFLINE_URL = '/offline.html';
// Real working backend API URL for questions
const API_QUESTIONS_URL =
  'https://quiz-backend-kb5w.onrender.com/api/questions';

// List of critical assets to cache upfront
const CRITICAL_ASSETS = [
  '/', // Root page
  '/index.html', // Main entry page
  '/manifest.json', // PWA manifest
  '/static/js/main.js', // Main JavaScript bundle
  '/static/css/main.css', // Main CSS styles
  '/apple-icon-180.png', // iOS homescreen icon
  '/offline.html', // Fallback offline page
  API_QUESTIONS_URL, // ✅ Backend questions API
];

// Debug logger function for service worker messages
function logSW(message) {
  console.log('[SW] ' + message);
}

// ========== INSTALL EVENT ==========

// Fires when the service worker is first installed
self.addEventListener('install', (event) => {
  logSW(`Installing version: ${CACHE_VERSION}`);

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      try {
        // Pre-cache critical frontend files
        await cache.addAll(CRITICAL_ASSETS);
        logSW('Critical assets cached successfully');

        // Manually fetch and cache the backend questions API
        const response = await fetch(API_QUESTIONS_URL);
        if (response.ok) {
          await cache.put(API_QUESTIONS_URL, response.clone());
          logSW('✅ /api/questions fetched and cached');
        }
      } catch (err) {
        console.error('[SW] Install error:', err);
      }
    })()
  );

  // Immediately activate the new service worker without waiting
  self.skipWaiting();
});

// ========== ACTIVATE EVENT ==========

// Fires when the service worker is activated (after install)
self.addEventListener('activate', (event) => {
  logSW('Activating new service worker...');

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete any old caches that do not match the current version
            if (!cacheName.includes(CACHE_VERSION)) {
              logSW('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
            return null;
          })
        );
      })
      .then(() => self.clients.claim()) // Take control of open pages immediately
  );
});

// ========== FETCH EVENT ==========

// Intercepts every network request made by the app
self.addEventListener('fetch', (event) => {
  // Handle navigation requests (page loads)
  if (event.request.mode === 'navigate') {
    logSW('Navigation fetch:', event.request.url);

    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Successful network response
          return response;
        })
        .catch(() => {
          // If network fails, fallback to offline page
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // Handle all other asset requests (JS, CSS, API, images, etc.)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        // Serve from cache if available
        return cached;
      }

      // Otherwise, try to fetch it live
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
          // If both cache and network fail, fallback to offline page
          return caches.match(OFFLINE_URL);
        });
    })
  );
});

// ========== INITIALIZATION LOG ==========
logSW('Service Worker loaded: ' + CACHE_VERSION);
