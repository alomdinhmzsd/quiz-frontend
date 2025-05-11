/**
 * config.js - Application Configuration
 *
 * Contains environment-based configuration variables.
 * Currently only exports the API base URL from environment variables.
 */

/**
 * config.js - Application Configuration (Vite-compatible)
 */

const rawUrl = import.meta.env.VITE_APP_API_URL;

export const API_BASE_URL = rawUrl?.startsWith('http://')
  ? rawUrl.replace('http://', 'https://')
  : rawUrl || 'https://quiz-backend-kb5w.onrender.com';
