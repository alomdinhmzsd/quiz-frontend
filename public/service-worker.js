/* eslint-disable no-restricted-globals */
/**
 * service-worker.js - v4.2
 *
 * PWA Quiz App Full Offline Support
 * - Pre-cache critical frontend assets
 * - Pre-cache all questions list (/api/questions)
 * - Dynamically cache each individual question (/api/questions/:id)
 * - Graceful offline fallback
 * - Handles iOS and Chrome quirks
 */

// ========== GLOBAL CONFIGURATION ==========

// Cache version and naming
const CACHE_VERSION = 'v4.2-complete';
const CACHE_NAME = 'quiz-app-' + new Date().toISOString().split('T')[0];

// Offline fallback page
const OFFLINE_URL = '/offline.html';

// Real backend API endpoint
const API_QUESTIONS_URL =
  'https://quiz-backend-kb5w.onrender.com/api/questions';

// Critical assets to pre-cache
const CRITICAL_ASSETS = [
  '/', // Root page
  '/index.html', // Main entry page
  '/manifest.json', // PWA manifest
  '/static/js/main.js', // Main JavaScript bundle
  '/static/css/main.css', // Main CSS
  '/apple-icon-180.png', // iOS home screen icon
  '/offline.html', // Fallback page when offline
  API_QUESTIONS_URL, // Fetch and cache all questions list
];

// Debug logger utility
function logSW(message) {
  console.log('[SW] ' + message);
}

// ========== INSTALL EVENT ==========

// Triggered when service worker is first installed
self.addEventListener('install', (event) => {
  logSW(`Installing service worker: ${CACHE_VERSION}`);

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      try {
        // Pre-cache critical assets
        await cache.addAll(CRITICAL_ASSETS);
        logSW('Critical assets pre-cached successfully');

        // Manually cache the full list of questions
        const response = await fetch(API_QUESTIONS_URL);
        if (response.ok) {
          await cache.put(API_QUESTIONS_URL, response.clone());
          logSW('✅ /api/questions list cached');
        }
      } catch (err) {
        console.error('[SW] Error during install:', err);
      }
    })()
  );

  self.skipWaiting(); // Force new SW to activate immediately
});

// ========== ACTIVATE EVENT ==========

// Triggered when service worker is activated (after install)
self.addEventListener('activate', (event) => {
  logSW('Activating new service worker...');

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheName.includes(CACHE_VERSION)) {
              logSW('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
            return null;
          })
        )
      )
      .then(() => self.clients.claim()) // Take over open tabs immediately
  );
});

// ========== FETCH EVENT ==========

// Intercepts every fetch made by the app
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // ========= SPECIAL CASE: Handle dynamic caching for individual questions =========
  if (request.url.includes('/api/questions/') && request.method === 'GET') {
    logSW('Dynamic question fetch detected:', request.url);

    event.respondWith(
      fetch(request)
        .then((response) => {
          // ✅ Save successful dynamic question fetch into cache
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // ❌ If offline, serve the cached question if available
          return caches.match(request).then((cached) => {
            return cached || caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // ========= Handle page navigation =========
  if (request.mode === 'navigate') {
    logSW('Navigation fetch:', request.url);

    event.respondWith(
      fetch(request)
        .then((response) => response)
        .catch(() => caches.match(OFFLINE_URL)) // Fallback to offline page
    );
    return;
  }

  // ========= Handle other static assets (JS, CSS, images) =========
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached; // ✅ Serve cached file if exists
      }

      return fetch(request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(OFFLINE_URL)); // Fallback if all fails
    })
  );
});

// ========== INITIALIZATION LOG ==========
logSW('Service Worker fully loaded: ' + CACHE_VERSION);
