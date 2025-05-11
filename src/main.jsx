import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ======= SERVICE WORKER LOGIC (Safe for iOS) ======= //
window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const swPath = '/service-worker.js';

    if (isIOS) {
      const meta = document.createElement('meta');
      meta.name = 'apple-mobile-web-app-capable';
      meta.content = 'yes';
      document.head.appendChild(meta);
    }

    navigator.serviceWorker
      .register(swPath, {
        scope: '/',
        updateViaCache: 'none',
      })
      .then((registration) => {
        console.log('[SW] Registered:', registration);
        registration.update();
        if (!navigator.serviceWorker.controller) {
          console.warn('[SW] No active controller. Reloading...');
          window.location.reload();
        }

        window.clearCacheAndReload = () => {
          caches.keys().then((keys) =>
            Promise.all(keys.map((k) => caches.delete(k))).then(() => {
              console.log('[SW] Cache cleared. Reloading...');
              window.location.reload();
            })
          );
        };
      })
      .catch((error) => {
        console.error('[SW] Registration failed:', error);
      });
  } else {
    console.warn('[SW] Not supported in this browser');
  }
});
