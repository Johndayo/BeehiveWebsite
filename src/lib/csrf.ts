/**
 * 🔒 CSRF Protection Module
 * Prevents Cross-Site Request Forgery attacks using token validation
 * 
 * Usage:
 *   // Generate token on page load
 *   const token = csrf.generateToken();
 *   
 *   // Validate token on form submission
 *   if (!csrf.validateToken(formToken, sessionToken)) {
 *     throw new Error('CSRF token invalid');
 *   }
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const CSRF_TOKEN_KEY = 'x-csrf-token';
const CSRF_TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
const CSRF_TOKEN_LENGTH = 32;

// ============================================================================
// TOKEN GENERATION
// ============================================================================

/**
 * Generates a cryptographically secure random token
 */
function generateSecureToken(length: number = CSRF_TOKEN_LENGTH): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars[array[i] % chars.length];
  }
  return token;
}

/**
 * Hashes a token using SHA-256
 */
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function normalizeApiGatewayUrl(rawUrl: string): string {
  const trimmed = rawUrl.replace(/\/+$|^\s+|\s+$/g, '');
  if (/^https?:\/\//.test(trimmed) && !trimmed.endsWith('/api')) {
    return `${trimmed}/api`;
  }
  return trimmed;
}

const API_GATEWAY_URL = normalizeApiGatewayUrl(import.meta.env.VITE_API_BASE_URL || '/api');

async function requestCsrfTokenFromServer(): Promise<string> {
  const response = await fetch(`${API_GATEWAY_URL}/csrf-token`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
  });

  if (!response.ok) {
    throw new Error('Failed to obtain CSRF token from server');
  }

  const data = await response.json();
  if (!data?.success || typeof data.csrf_token !== 'string') {
    throw new Error('Invalid CSRF token response from server');
  }

  return data.csrf_token;
}

// ============================================================================
// SESSION STORAGE (Server-side equivalent in API)
// ============================================================================

interface CsrfTokenData {
  token: string; // The token value
  hash: string; // SHA-256 hash of token
  createdAt: number; // Timestamp
  userAgent: string; // Browser user agent
  nonce: string; // Additional entropy
}

/**
 * Stores CSRF token data (normally done server-side in session)
 * For frontend, we store minimal info and send to server for validation
 */
export const csrfTokenStorage = {
  /**
   * Creates a new CSRF token entry
   */
  async create(): Promise<CsrfTokenData> {
    const token = await requestCsrfTokenFromServer();
    const hash = await hashToken(token);
    const nonce = generateSecureToken(16);

    const data: CsrfTokenData = {
      token,
      hash,
      createdAt: Date.now(),
      userAgent: navigator.userAgent,
      nonce,
    };

    // Store in session storage (cleared when tab closes)
    sessionStorage.setItem(CSRF_TOKEN_KEY, JSON.stringify(data));

    return data;
  },

  /**
   * Retrieves stored CSRF token data
   */
  get(): CsrfTokenData | null {
    const stored = sessionStorage.getItem(CSRF_TOKEN_KEY);
    if (!stored) return null;

    try {
      const data = JSON.parse(stored);
      // Validate token hasn't expired
      if (Date.now() - data.createdAt > CSRF_TOKEN_EXPIRY_MS) {
        sessionStorage.removeItem(CSRF_TOKEN_KEY);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  },

  /**
   * Clears stored CSRF token
   */
  clear(): void {
    sessionStorage.removeItem(CSRF_TOKEN_KEY);
  },

  /**
   * Refreshes CSRF token
   */
  async refresh(): Promise<CsrfTokenData> {
    this.clear();
    return this.create();
  },
};

// ============================================================================
// CSRF PROTECTION API
// ============================================================================

export const csrf = {
  /**
   * Generates or retrieves CSRF token for the current session
   */
  async getToken(): Promise<string> {
    let tokenData = csrfTokenStorage.get();
    if (!tokenData) {
      tokenData = await csrfTokenStorage.create();
    }
    return tokenData.token;
  },

  /**
   * Gets the token hash (sent in response headers)
   */
  async getTokenHash(): Promise<string> {
    const tokenData = await csrf.getToken();
    return await hashToken(tokenData);
  },

  /**
   * Validates a CSRF token against stored session data
   * Called by API gateway before processing requests
   */
  async validateToken(submittedToken: string): Promise<boolean> {
    const tokenData = csrfTokenStorage.get();

    if (!tokenData) {
      console.warn('[CSRF] No token data found in session');
      return false;
    }

    // Validate token matches
    if (submittedToken !== tokenData.token) {
      console.warn('[CSRF] Token mismatch');
      return false;
    }

    // Validate token hasn't expired
    if (Date.now() - tokenData.createdAt > CSRF_TOKEN_EXPIRY_MS) {
      console.warn('[CSRF] Token expired');
      csrfTokenStorage.clear();
      return false;
    }

    // Validate user agent hasn't changed (basic check)
    if (navigator.userAgent !== tokenData.userAgent) {
      console.warn('[CSRF] User agent mismatch (possible hijacking)');
      return false;
    }

    return true;
  },

  /**
   * Refreshes the CSRF token (should be done periodically)
   */
  async refreshToken(): Promise<string> {
    const data = await csrfTokenStorage.refresh();
    return data.token;
  },

  /**
   * Gets token for including in form or headers
   */
  async getTokenForRequest(): Promise<string> {
    return csrf.getToken();
  },

  /**
   * Initializes CSRF protection on page load
   */
  async initialize(): Promise<void> {
    const token = await csrf.getToken();
    console.debug('[CSRF] Initialized with token:', token.substring(0, 8) + '...');
  },

  /**
   * Cleans up CSRF tokens on logout
   */
  cleanup(): void {
    csrfTokenStorage.clear();
  },
};

// ============================================================================
// REACT HOOK FOR CSRF PROTECTION
// ============================================================================

/**
 * React Hook: useCsrfToken
 * Usage:
 *   const { token, refresh } = useCsrfToken();
 *   
 *   // Include token in form:
 *   <input type="hidden" name="csrf_token" value={token} />
 */
export function useCsrfToken() {
  const [token, setToken] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const initToken = async () => {
      try {
        await csrf.initialize();
        const newToken = await csrf.getToken();
        setToken(newToken);
      } catch (error) {
        console.error('[CSRF] Failed to initialize:', error);
      } finally {
        setLoading(false);
      }
    };

    initToken();

    return () => {
      csrf.cleanup();
    };
  }, []);

  const refresh = async () => {
    const newToken = await csrf.refreshToken();
    setToken(newToken);
    return newToken;
  };

  return { token, loading, refresh };
}

// Note: React import is handled at the module level in the hook
import * as React from 'react';

// ============================================================================
// MIDDLEWARE FOR FORM SUBMISSION
// ============================================================================

/**
 * Wraps a form submission handler to validate CSRF token
 */
export function withCsrfProtection<T extends readonly unknown[], R>(
  handler: (token: string, ...args: T) => Promise<R> | R
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    const token = await csrf.getToken();
    if (!(await csrf.validateToken(token))) {
      throw new Error('CSRF token validation failed. Please refresh the page and try again.');
    }
    return handler(token, ...args);
  };
}

// ============================================================================
// FETCH INTERCEPTOR
// ============================================================================

/**
 * Interceptor function to add CSRF token to fetch requests
 * 
 * Usage:
 *   const response = await fetch(url, addCsrfToken(options));
 */
export async function addCsrfToken(options: RequestInit = {}): Promise<RequestInit> {
  const token = await csrf.getToken();

  return {
    ...options,
    headers: {
      ...options.headers,
      'x-csrf-token': token,
      'Content-Type': 'application/json',
    },
  };
}

/**
 * Secure fetch wrapper that includes CSRF token
 */
export async function secureFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const csrfOptions = await addCsrfToken(options);
  return fetch(url, csrfOptions);
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  csrf,
  csrfTokenStorage,
  useCsrfToken,
  withCsrfProtection,
  addCsrfToken,
  secureFetch,
};
