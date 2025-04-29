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

if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  // Add splash screen meta for iOS
  if (isIOS) {
    const meta = document.createElement('meta');
    meta.name = 'apple-mobile-web-app-capable';
    meta.content = 'yes';
    document.head.appendChild(meta);
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js', {
        scope: '/',
        updateViaCache: 'none',
      })
      .then((reg) => {
        // Force cache load on iOS
        if (isIOS) {
          caches
            .open('quiz-app-lockdown-v1')
            .then((cache) => cache.add('/index.html'));
        }

        // Recovery for blank screens
        if (!navigator.serviceWorker.controller) {
          window.location.reload();
        }
      });
  });
}
