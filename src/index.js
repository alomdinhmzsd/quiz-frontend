/**
 * index.js - STABLE SERVICE WORKER REGISTRATION v3.7
 * Changes:
 * 1. Removed timestamp parameter causing refresh loops
 * 2. Simplified iOS detection
 * 3. Added controlled update checks
 * 4. Restored StrictMode
 */

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

// ===== SERVICE WORKER REGISTRATION =====
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  window.addEventListener('load', () => {
    // Removed timestamp parameter - now uses file content hash
    const swUrl = '/service-worker.js';

    navigator.serviceWorker
      .register(swUrl, {
        scope: '/',
        updateViaCache: 'none',
      })
      .then((reg) => {
        console.log(`Service Worker registered (iOS: ${isIOS})`);

        // Only force reload if controller changes AFTER initial load
        let initialLoad = true;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!initialLoad) {
            console.log('Controller changed - reloading');
            window.location.reload();
          }
          initialLoad = false;
        });

        // Check for updates every 2 hours
        setInterval(() => {
          console.log('Checking for updates...');
          reg.update();
        }, 2 * 60 * 60 * 1000);
      })
      .catch((err) => console.error('SW registration failed:', err));
  });
}
