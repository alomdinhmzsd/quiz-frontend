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
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Create root and render app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for offline capabilities
serviceWorkerRegistration.register();

// Start performance measurement
reportWebVitals();
