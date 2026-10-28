/**
 * In-Memory & Session-Scoped Token Utilities
 *
 * Adheres to security guidelines:
 * - Tokens are NEVER persisted to localStorage or unencrypted permanent disk storage.
 * - Retains token in-memory with tab-scoped sessionStorage to survive page refreshes.
 * - Cleared immediately upon tab closure or logout.
 * - Supports extraction of Laravel Sanctum XSRF-TOKEN cookie for stateful SPA mode.
 */

const SESSION_TOKEN_KEY = 'civiclink_session_token';
const SESSION_ROLE_KEY = 'civiclink_session_role';
const SESSION_USER_KEY = 'civiclink_session_user';
let inMemoryToken: string | null = null;

export const tokenStorage = {
  getToken(): string | null {
    if (inMemoryToken) return inMemoryToken;

    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const stored = window.sessionStorage.getItem(SESSION_TOKEN_KEY);
        if (stored) {
          inMemoryToken = stored;
          return stored;
        }
      } catch {
        // sessionStorage access blocked or unavailable
      }
    }

    return null;
  },

  hasToken(): boolean {
    return Boolean(this.getToken());
  },

  setToken(token: string | null): void {
    inMemoryToken = token;

    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        if (token) {
          window.sessionStorage.setItem(SESSION_TOKEN_KEY, token);
        } else {
          window.sessionStorage.removeItem(SESSION_TOKEN_KEY);
        }
      } catch {
        // sessionStorage access blocked or unavailable
      }
    }
  },

  getSessionRole<T extends string = string>(): T | null {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        return window.sessionStorage.getItem(SESSION_ROLE_KEY) as T | null;
      } catch {
        return null;
      }
    }
    return null;
  },

  setSessionRole(role: string | null): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        if (role) {
          window.sessionStorage.setItem(SESSION_ROLE_KEY, role);
        } else {
          window.sessionStorage.removeItem(SESSION_ROLE_KEY);
        }
      } catch {
        // sessionStorage access blocked or unavailable
      }
    }
  },

  getSessionUser<T = unknown>(): T | null {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const raw = window.sessionStorage.getItem(SESSION_USER_KEY);
        return raw ? (JSON.parse(raw) as T) : null;
      } catch {
        return null;
      }
    }
    return null;
  },

  setSessionUser(user: unknown | null): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        if (user) {
          window.sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
        } else {
          window.sessionStorage.removeItem(SESSION_USER_KEY);
        }
      } catch {
        // sessionStorage access blocked or unavailable
      }
    }
  },

  clearToken(): void {
    inMemoryToken = null;

    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        window.sessionStorage.removeItem(SESSION_TOKEN_KEY);
        window.sessionStorage.removeItem(SESSION_ROLE_KEY);
        window.sessionStorage.removeItem(SESSION_USER_KEY);
      } catch {
        // sessionStorage access blocked or unavailable
      }
    }
  },
};

/**
 * Reads a cookie value by name from document.cookie.
 * Commonly used for Laravel's XSRF-TOKEN cookie.
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
  return match ? decodeURIComponent(match[3]) : null;
}
