/**
 * serviceWorkerRegistration.js - Enhanced PWA Support
 *
 * Fixes included:
 * 1. Aggressive cache control for stale PWA issues
 * 2. Debug logging for iOS-specific problems
 * 3. Forceful cache purging on updates
 */

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

// ==================== CACHE CONTROL IMPROVEMENTS ====================
const CACHE_NAME = 'quiz-app-v3'; // Changed version forces new cache

/**
 * Enhanced register function with iOS-specific handling
 * @param {Object} config - Optional callbacks for SW events
 */
export function register(config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);

    // Skip if PUBLIC_URL is cross-origin
    if (publicUrl.origin !== window.location.origin) {
      console.warn('SW: Different origin detected, skipping registration');
      return;
    }

    // iOS-specific load event handling
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config);
        logResourcesToCache(); // Debug helper
      } else {
        registerValidSW(swUrl, config);
      }
    });
  }
}

// ==================== CACHE PURGING ====================
async function purgeOldCaches() {
  const keys = await caches.keys();
  return Promise.all(
    keys
      .filter((key) => key !== CACHE_NAME)
      .map((key) => {
        console.log(`SW: Deleting old cache ${key}`);
        return caches.delete(key);
      })
  );
}

// ==================== DEBUG TOOLS ====================
function logResourcesToCache() {
  if (!isLocalhost) return;

  caches.open(CACHE_NAME).then((cache) => {
    cache.keys().then((requests) => {
      console.log(
        'SW: Cached resources:',
        requests.map((r) => r.url)
      );
    });
  });
}

// ==================== CORE REGISTRATION ====================
function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      // Force immediate controller takeover
      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // UPDATE SCENARIO
              console.log('SW: New content available');

              // Purge ALL old caches aggressively
              purgeOldCaches().then(() => {
                if (config?.onUpdate) config.onUpdate(registration);
                // Force refresh for all tabs (iOS workaround)
                registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
              });
            } else {
              // FIRST INSTALL
              console.log('SW: Content cached for offline');
              if (config?.onSuccess) config.onSuccess(registration);
            }
          }
        });
      });

      // Periodic cache check (every 6 hours)
      setInterval(() => registration.update(), 21600000);
    })
    .catch((error) => {
      console.error('SW: Registration failed:', error);
    });
}

// ==================== VALIDATION ====================
function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, { headers: { 'Service-Worker': 'script' } })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      const isValid =
        response.status === 200 && contentType?.includes('javascript');

      if (!isValid) {
        console.warn('SW: Invalid content - unregistering');
        return unregister().then(() => window.location.reload());
      }
      registerValidSW(swUrl, config);
    })
    .catch(() => {
      console.log('SW: Offline mode active');
    });
}

// ==================== NUCLEAR OPTION ====================
export function unregister() {
  if ('serviceWorker' in navigator) {
    Promise.all([
      navigator.serviceWorker.ready.then((reg) => reg.unregister()),
      purgeOldCaches(),
    ]).then(() => {
      console.log('SW: Unregistered and caches purged');
      if (window.location.href.includes('chrome://')) return;
      window.location.reload(); // Auto-refresh after cleanup
    });
  }
}

// ==================== PWA INSTALL PROMPT HANDLING ====================
let deferredPrompt = null; // Will store the install prompt event

// Store install prompt event when browser triggers it
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('PWA: Install prompt available');

  // Show install button if exists in DOM
  const installButton = document.getElementById('install-button');
  if (installButton) {
    installButton.style.display = 'block';
    installButton.addEventListener('click', handleInstallClick);
  }
});

// Clean up event listeners when needed
function removeInstallButtonListener() {
  const installButton = document.getElementById('install-button');
  if (installButton) {
    installButton.removeEventListener('click', handleInstallClick);
  }
}

// Handle the actual installation flow
async function handleInstallClick() {
  if (!deferredPrompt) {
    console.warn('PWA: No install prompt available');
    return;
  }

  try {
    const choiceResult = await deferredPrompt.prompt();
    console.log(`PWA: User ${choiceResult.outcome} the install`);

    if (choiceResult.outcome === 'accepted') {
      // Track successful installs if needed
      console.log('PWA: Installing...');
    }
  } catch (error) {
    console.error('PWA: Install failed', error);
  } finally {
    deferredPrompt = null;
    removeInstallButtonListener();
  }
}

// Optional: Track successful installation
window.addEventListener('appinstalled', () => {
  console.log('PWA: Successfully installed');
  removeInstallButtonListener();
});
