/**
 * index.js - Application Entry Point
 *
 * The first JavaScript file executed when the application starts.
 * Responsibilities:
 * - Renders the root React component
 * - Sets up StrictMode for development checks
 * - Registers service worker for PWA features
 * - Initializes web vitals reporting
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Simplified service worker registration
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js?' + Date.now())
      .then((reg) => {
        console.log('SW registered:', reg);

        // Check for updates every hour
        setInterval(() => reg.update(), 60 * 60 * 1000);

        // Handle controller change (for iOS)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });
      })
      .catch((err) => console.error('SW registration failed:', err));
  });
}

reportWebVitals();
