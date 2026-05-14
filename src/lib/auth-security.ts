/**
 * 🔒 Authentication Security Module
 * Handles secure authentication including brute-force protection, 
 * token refresh cycles, and session security
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const AUTH_STORAGE_KEY = 'auth_session';
const RATE_LIMIT_STORAGE_KEY = 'login_rate_limit';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const TOKEN_REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// BRUTE FORCE PROTECTION
// ============================================================================

interface LoginAttempt {
  attempts: number;
  lastAttempt: number;
  lockedUntil?: number;
}

export const bruteForceProtection = {
  /**
   * Records a failed login attempt
   */
  recordFailedAttempt(email: string): { allowed: boolean; attemptsRemaining: number; lockedUntil?: number } {
    const key = `${RATE_LIMIT_STORAGE_KEY}:${email}`;
    const stored = localStorage.getItem(key);
    let attempt: LoginAttempt = stored ? JSON.parse(stored) : { attempts: 0, lastAttempt: 0 };

    const now = Date.now();

    // Check if still locked out
    if (attempt.lockedUntil && now < attempt.lockedUntil) {
      return {
        allowed: false,
        attemptsRemaining: 0,
        lockedUntil: attempt.lockedUntil,
      };
    }

    // Reset attempts if lockout expired
    if (attempt.lockedUntil && now >= attempt.lockedUntil) {
      attempt = { attempts: 0, lastAttempt: 0 };
    }

    // Reset attempts if more than 1 hour since last attempt
    if (now - attempt.lastAttempt > 60 * 60 * 1000) {
      attempt = { attempts: 0, lastAttempt: 0 };
    }

    // Increment attempt counter
    attempt.attempts += 1;
    attempt.lastAttempt = now;

    // Lock account after max attempts
    if (attempt.attempts >= MAX_LOGIN_ATTEMPTS) {
      attempt.lockedUntil = now + LOCKOUT_DURATION_MS;
      localStorage.setItem(key, JSON.stringify(attempt));
      return {
        allowed: false,
        attemptsRemaining: 0,
        lockedUntil: attempt.lockedUntil,
      };
    }

    localStorage.setItem(key, JSON.stringify(attempt));
    return {
      allowed: true,
      attemptsRemaining: MAX_LOGIN_ATTEMPTS - attempt.attempts,
    };
  },

  /**
   * Clears failed attempts after successful login
   */
  clearAttempts(email: string): void {
    const key = `${RATE_LIMIT_STORAGE_KEY}:${email}`;
    localStorage.removeItem(key);
  },

  /**
   * Checks if account is locked
   */
  isLocked(email: string): { locked: boolean; lockedUntil?: number } {
    const key = `${RATE_LIMIT_STORAGE_KEY}:${email}`;
    const stored = localStorage.getItem(key);
    if (!stored) return { locked: false };

    try {
      const attempt: LoginAttempt = JSON.parse(stored);
      if (attempt.lockedUntil && Date.now() < attempt.lockedUntil) {
        return {
          locked: true,
          lockedUntil: attempt.lockedUntil,
        };
      }
    } catch (error) {
      console.error('[BruteForceProtection] Failed to parse stored attempts:', error);
    }

    return { locked: false };
  },
};

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

interface AuthSession {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  lastActivity: number;
  sessionId: string;
}

export const sessionManager = {
  /**
   * Creates a new session
   */
  createSession(
    userId: string,
    email: string,
    accessToken: string,
    refreshToken: string,
    expiresIn: number
  ): AuthSession {
    const session: AuthSession = {
      userId,
      email,
      accessToken,
      refreshToken,
      expiresAt: Date.now() + expiresIn * 1000,
      lastActivity: Date.now(),
      sessionId: this.generateSessionId(),
    };

    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    return session;
  },

  /**
   * Gets current session
   */
  getSession(): AuthSession | null {
    const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;

    try {
      const session: AuthSession = JSON.parse(stored);

      // Check if session has expired
      if (Date.now() > session.expiresAt) {
        this.clearSession();
        return null;
      }

      // Check if inactive too long
      if (Date.now() - session.lastActivity > SESSION_TIMEOUT_MS) {
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('[SessionManager] Failed to parse session:', error);
      this.clearSession();
      return null;
    }
  },

  /**
   * Updates last activity timestamp
   */
  updateActivity(): void {
    const session = this.getSession();
    if (session) {
      session.lastActivity = Date.now();
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    }
  },

  /**
   * Clears current session
   */
  clearSession(): void {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  },

  /**
   * Generates a unique session ID
   */
  generateSessionId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Gets access token
   */
  getAccessToken(): string | null {
    const session = this.getSession();
    return session?.accessToken || null;
  },

  /**
   * Gets refresh token
   */
  getRefreshToken(): string | null {
    const session = this.getSession();
    return session?.refreshToken || null;
  },

  /**
   * Gets user info from session
   */
  getUserInfo(): { userId: string; email: string } | null {
    const session = this.getSession();
    if (!session) return null;
    return {
      userId: session.userId,
      email: session.email,
    };
  },
};

// ============================================================================
// TOKEN REFRESH
// ============================================================================

let tokenRefreshTimeout: ReturnType<typeof setTimeout> | null = null;

export const tokenRefresh = {
  /**
   * Starts automatic token refresh
   */
  startAutoRefresh(refreshCallback: () => Promise<void>): void {
    if (tokenRefreshTimeout) {
      clearTimeout(tokenRefreshTimeout);
    }

    tokenRefreshTimeout = setInterval(async () => {
      try {
        const session = sessionManager.getSession();
        if (session) {
          // Refresh when 5 minutes remain
          if (Date.now() + TOKEN_REFRESH_INTERVAL_MS > session.expiresAt) {
            await refreshCallback();
          }
        }
      } catch (error) {
        console.error('[TokenRefresh] Failed to refresh token:', error);
      }
    }, TOKEN_REFRESH_INTERVAL_MS);
  },

  /**
   * Stops automatic token refresh
   */
  stopAutoRefresh(): void {
    if (tokenRefreshTimeout) {
      clearTimeout(tokenRefreshTimeout);
      tokenRefreshTimeout = null;
    }
  },

  /**
   * Resets auto-refresh timer
   */
  resetAutoRefresh(refreshCallback: () => Promise<void>): void {
    this.stopAutoRefresh();
    this.startAutoRefresh(refreshCallback);
  },
};

// ============================================================================
// DEVICE FINGERPRINTING
// ============================================================================

export const deviceFingerprint = {
  /**
   * Generates a device fingerprint for additional security
   * Combines multiple device characteristics
   */
  async generate(): Promise<string> {
    const components = [
      navigator.userAgent,
      navigator.language,
      navigator.platform,
      new Date().getTimezoneOffset(),
      window.screen.width,
      window.screen.height,
      window.screen.colorDepth,
    ].join('|');

    const encoder = new TextEncoder();
    const data = encoder.encode(components);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Verifies fingerprint matches current device
   */
  async verify(storedFingerprint: string): Promise<boolean> {
    const currentFingerprint = await this.generate();
    return currentFingerprint === storedFingerprint;
  },
};

// ============================================================================
// PASSWORD SECURITY
// ============================================================================

export const passwordSecurity = {
  /**
   * Checks if password meets minimum requirements
   */
  validateStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 12) {
      errors.push('Password must be at least 12 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain special character');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Generates a secure random password
   */
  generate(length: number = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
      password += chars[array[i] % chars.length];
    }

    return password;
  },

  /**
   * Hashes password client-side before sending (additional layer)
   * NOTE: Always use HTTPS and server-side hashing for production
   */
  async hashForTransport(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  },
};

// ============================================================================
// AUTHENTICATION HELPERS
// ============================================================================

export const authHelper = {
  /**
   * Checks if user is authenticated
   */
  isAuthenticated(): boolean {
    return sessionManager.getSession() !== null;
  },

  /**
   * Gets current user info
   */
  getCurrentUser(): { userId: string; email: string } | null {
    return sessionManager.getUserInfo();
  },

  /**
   * Performs secure logout
   */
  logout(): void {
    tokenRefresh.stopAutoRefresh();
    sessionManager.clearSession();
    // Clear sensitive data from memory
    localStorage.removeItem(RATE_LIMIT_STORAGE_KEY);
  },

  /**
   * Performs secure login
   */
  async login(
    email: string,
    userId: string,
    accessToken: string,
    refreshToken: string,
    expiresIn: number
  ): Promise<void> {
    // Clear any login attempts
    bruteForceProtection.clearAttempts(email);

    // Create session
    sessionManager.createSession(userId, email, accessToken, refreshToken, expiresIn);

    // Start auto-refresh
    tokenRefresh.startAutoRefresh(async () => {
      // Placeholder for token refresh logic
      console.log('[Auth] Token refresh triggered');
    });
  },

  /**
   * Handles failed login attempt
   */
  async handleFailedLogin(email: string): Promise<void> {
    const result = bruteForceProtection.recordFailedAttempt(email);

    if (!result.allowed) {
      const minutesRemaining = Math.ceil((result.lockedUntil! - Date.now()) / 1000 / 60);
      throw new Error(
        `Too many login attempts. Please try again in ${minutesRemaining} minutes.`
      );
    }
  },
};

// ============================================================================
// EXPORT
// ============================================================================

export default {
  bruteForceProtection,
  sessionManager,
  tokenRefresh,
  deviceFingerprint,
  passwordSecurity,
  authHelper,
};
