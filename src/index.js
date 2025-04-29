/**
 * index.js - IOS HOTFIX ENTRY POINT
 * Changes:
 * 1. Added iOS-specific registration logic
 * 2. Removed StrictMode (temporarily for debugging)
 * 3. Added force-reload on controller change
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // Removed StrictMode temporarily to isolate iOS issues
  <App />
);

// ===== IOS-SPECIFIC SERVICE WORKER SETUP =====
if ('serviceWorker' in navigator) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  window.addEventListener('load', () => {
    const swUrl = `/service-worker.js?ios=${isIOS}&t=${Date.now()}`;

    navigator.serviceWorker
      .register(swUrl, {
        scope: '/',
        updateViaCache: 'none', // Critical for iOS
      })
      .then((reg) => {
        console.log('IOS SW Registered:', reg);

        // Force refresh when new SW takes over
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('IOS Controller Change - Reloading');
          window.location.reload(true); // Hard reload
        });

        // Manual update check every 2 hours
        setInterval(() => reg.update(), 2 * 60 * 60 * 1000);
      });
  });
}
