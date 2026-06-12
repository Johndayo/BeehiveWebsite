/**
 * 🔒 SECURE API CLIENT
 * All requests proxied through backend API Gateway
 * - NO credentials exposed to frontend
 * - Service role key kept server-side only
 * - CSRF protection on all state-changing operations
 * - Input sanitization server-side
 * - Rate limiting server-side
 */

import { csrf } from './csrf';

export interface ConsultationPayload {
  organization_name: string;
  industry: string;
  industry_other: string;
  country: string;
  website: string;
  employees: string;
  service_areas: string[];
  service_area_other: string;
  key_challenge: string;
  desired_outcome: string;
  reform_context: string;
  start_date: string;
  timeline: string;
  budget_approved: boolean;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  contact_role: string;
  approvers: string;
  partners: string;
  csrf_token?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

function normalizeApiGatewayUrl(rawUrl: string): string {
  const trimmed = rawUrl.replace(/\/+$|^\s+|\s+$/g, '');

  if (import.meta.env.DEV) {
    return '/api';
  }

  if (/^https?:\/\//.test(trimmed) && !trimmed.endsWith('/api')) {
    return `${trimmed}/api`;
  }
  return trimmed;
}

function getApiGatewayHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (anonKey) {
    headers.apikey = anonKey;
    headers.Authorization = `Bearer ${anonKey}`;
  }
  return headers;
}

export class SecureApiClient {
  private baseUrl: string;
  private apiGatewayUrl: string;

  constructor(baseUrl: string = '', apiGatewayUrl: string = '') {
    this.baseUrl = baseUrl || this.detectBaseUrl();
    // API gateway can be different subdomain/service
    this.apiGatewayUrl = apiGatewayUrl || normalizeApiGatewayUrl(import.meta.env.VITE_API_BASE_URL || '/api');
  }

  private detectBaseUrl(): string {
    if (typeof window === 'undefined') return '';
    const { protocol, hostname, port } = window.location;
    const portStr = port && !['80', '443'].includes(port) ? `:${port}` : '';
    return `${protocol}//${hostname}${portStr}`;
  }

  private buildEndpoint(endpoint: string): string {
    if (this.apiGatewayUrl.startsWith('http://') || this.apiGatewayUrl.startsWith('https://')) {
      return `${this.apiGatewayUrl}${endpoint}`;
    }
    return `${this.baseUrl}${this.apiGatewayUrl}${endpoint}`;
  }

  /**
   * Make secure request to API Gateway
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildEndpoint(endpoint);

    const headers: Record<string, string> = {
      ...getApiGatewayHeaders(),
      ...((options.headers as Record<string, string>) || {}),
    };

    // Add CSRF token for state-changing requests
    if (options.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method)) {
      const csrfToken = await csrf.getToken();
      headers['x-csrf-token'] = csrfToken;
    }

    // Secure fetch options
    const fetchOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'same-origin', // Only send cookies for same-origin
      redirect: 'error', // Don't follow redirects
    };

    try {
      const response = await fetch(url, fetchOptions);

      // Handle HTTP errors
      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch (e) {
          // Response wasn't JSON
        }

        const errorMessage =
          errorData.message ||
          errorData.error ||
          `HTTP ${response.status}: ${response.statusText}`;

        // Rate limit error
        if (response.status === 429) {
          throw new Error('Too many requests. Please wait before trying again.');
        }

        // CSRF error
        if (response.status === 403) {
          throw new Error('Security validation failed. Please refresh and try again.');
        }

        // Validation error
        if (response.status === 400) {
          throw new Error(errorMessage);
        }

        // Server error
        if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }

        throw new Error(errorMessage);
      }

      // Parse response
      const data: ApiResponse<T> = await response.json();
      return data;
    } catch (error) {
      // Re-throw with context
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`API request failed: ${String(error)}`);
    }
  }

  /**
   * Submit consultation form through secure API Gateway
   */
  async submitConsultation(payload: ConsultationPayload): Promise<ApiResponse> {
    // Get CSRF token for submission
    const csrfToken = await csrf.getToken();

    // Include CSRF token in payload
    const payloadWithCsrf: any = {
      ...payload,
      csrf_token: csrfToken,
    };

    return this.request<{ id: string }>(
      '/consultation/submit',
      {
        method: 'POST',
        body: JSON.stringify(payloadWithCsrf),
      }
    );
  }

  /**
   * Get settings (admin only)
   */
  async getSettings(): Promise<ApiResponse> {
    return this.request('/settings', {
      method: 'GET',
    });
  }

  /**
   * Update settings (admin only)
   */
  async updateSettings(settings: Record<string, any>): Promise<ApiResponse> {
    return this.request('/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/health', {
      method: 'GET',
    });
  }
}

// Singleton instance
export const apiClient = new SecureApiClient();
