/**
 * Portal App — Single Source of Truth for API Backend Configuration
 * 
 * When deploying or changing the backend URL for the Portal App,
 * edit DEFAULT_BACKEND_URL here (or set VITE_BACKEND_URL in .env).
 */
export const DEFAULT_BACKEND_URL = 'http://127.0.0.1:8000';

// Resolves backend base URL (e.g. "https://civillink.jobaleengineering.com")
export const BACKEND_URL = (() => {
  const envBackend =
    (typeof process !== 'undefined' && (process.env?.VITE_BACKEND_URL || process.env?.BACKEND_URL)) ||
    (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_BACKEND_URL || import.meta.env?.BACKEND_URL));

  if (typeof envBackend === 'string' && envBackend.trim().length > 0) {
    return envBackend.trim().replace(/\/+$/, '');
  }

  return DEFAULT_BACKEND_URL;
})();

// Resolves the full API URL (e.g. "https://civillink.jobaleengineering.com/api/v1")
export const API_BASE_URL = `${BACKEND_URL}/api/v1`;

/**
 * Resolves the active base URL:
 * - Local Dev (isDev === true): '/api/v1' (routes through Vite proxy)
 * - Production Build: absolute remote backend URL
 */
export function getBaseApiUrl(isDev = false) {
  if (isDev) {
    return '/api/v1';
  }

  const envApi =
    (typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL);

  if (typeof envApi === 'string' && envApi.trim().length > 0) {
    let url = envApi.trim().replace(/\/+$/, '');
    if (url.startsWith('http://') || url.startsWith('https://')) {
      if (url.endsWith('/api')) return `${url}/v1`;
      if (!url.endsWith('/api/v1')) return `${url}/api/v1`;
      return url;
    }
  }

  return API_BASE_URL;
}

/**
 * Citizen Client App URL
 * Destination URL for citizen feedback QR posters.
 */
export const DEFAULT_CLIENT_URL = 'https://client.pharmasoft-et.com';

export function getClientBaseUrl() {
  const envClient =
    (typeof process !== 'undefined' && (process.env?.VITE_CLIENT_URL || process.env?.CLIENT_URL)) ||
    (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_CLIENT_URL || import.meta.env?.CLIENT_URL));

  if (typeof envClient === 'string' && envClient.trim().length > 0) {
    return envClient.trim().replace(/\/+$/, '');
  }

  return DEFAULT_CLIENT_URL;
}


