/**
 * config.js - Application Configuration
 *
 * Contains environment-based configuration variables.
 * Currently only exports the API base URL from environment variables.
 */

/**
 * config.js - Application Configuration
 * Updated to enforce HTTPS
 */
export const API_BASE_URL = process.env.REACT_APP_API_URL?.startsWith('http://')
  ? process.env.REACT_APP_API_URL.replace('http://', 'https://')
  : process.env.REACT_APP_API_URL || 'https://quiz-backend-kb5w.onrender.com';
