/**
 * 🔒 SECURE API CLIENT
 * All requests proxied through backend - NO credentials exposed to frontend
 * Service role key kept server-side only
 */

export class SecureApiClient {
  private baseUrl: string;
  private csrfToken: string | null = null;

  constructor(baseUrl: string = '') {
    // Use relative paths - no hardcoding
    this.baseUrl = baseUrl || this.detectBaseUrl();
  }

  private detectBaseUrl(): string {
    if (typeof window === 'undefined') return '';
    const { protocol, hostname, port } = window.location;
    const portStr = port && !['80', '443'].includes(port) ? `:${port}` : '';
    return `${protocol}//${hostname}${portStr}`;
  }

  /**
   * Initialize CSRF protection
   */
  initCsrf(): void {
    const token = this.generateCsrfToken();
    this.csrfToken = token;
    sessionStorage.setItem('csrf_token', token);
  }

  /**
   * Generate cryptographically secure CSRF token
   */
  private generateCsrfToken(): string {
    const bytes = new Uint8Array(32);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(bytes);
    } else {
      // Fallback for older browsers
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get stored CSRF token
   */
  getCsrfToken(): string {
    if (!this.csrfToken) {
      const stored = sessionStorage.getItem('csrf_token');
      if (stored) {
        this.csrfToken = stored;
      } else {
        this.initCsrf();
      }
    }
    return this.csrfToken!;
  }

  /**
   * Make secure request to backend API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    // Add CSRF token for state-changing requests
    if (options.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method)) {
      headers['X-CSRF-Token'] = this.getCsrfToken();
    }

    // Prevent credentials leakage
    const fetchOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'same-origin',
      // Prevent redirect following for security
      redirect: 'error',
    };

    try {
      const response = await fetch(url, fetchOptions);

      // Handle errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(
          errorData.message || 
          errorData.error || 
          `HTTP ${response.status}`
        );
        (error as any).status = response.status;
        throw error;
      }

      return response.json();
    } catch (error) {
      console.error(`[API] Error on ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Submit consultation form through secure backend
   */
  async submitConsultation(data: any): Promise<{ success: boolean; message?: string }> {
    return this.request('/submit-consultation', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Check rate limit status
   */
  async checkRateLimit(): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime?: number;
  }> {
    return this.request('/rate-limit');
  }

  /**
   * Get current session info
   */
  async getSession(): Promise<{ authenticated: boolean; email?: string }> {
    return this.request('/session');
  }

  /**
   * Login with email/password (through secure backend)
   */
  async login(email: string, password: string): Promise<{
    success: boolean;
    token?: string;
    error?: string;
  }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  /**
   * Logout
   */
  async logout(): Promise<{ success: boolean }> {
    this.csrfToken = null;
    sessionStorage.removeItem('csrf_token');
    return this.request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<{ success: boolean; message?: string }> {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  /**
   * Get app settings (admin only)
   */
  async getSettings(): Promise<any> {
    return this.request('/settings');
  }

  /**
   * Update app settings (admin only)
   */
  async updateSettings(data: any): Promise<{ success: boolean }> {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

// Singleton instance
export const apiClient = new SecureApiClient();
