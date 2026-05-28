/**
 * 🔒 Input Validation & Sanitization Module
 * Prevents XSS, injection attacks, and malformed inputs
 * 
 * Usage:
 *   if (!validator.isValidEmail(email)) throw new Error('Invalid email');
 *   const clean = sanitizer.sanitizeText(userInput);
 */

import DOMPurify from 'dompurify';

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-()]{10,}$/,
  URL: /^https?:\/\/.+/,  
  WEBHOOK_URL: /^https:\/\/script\.google\.com\/macros\/d\/.*\/usercontent\/\?/,  
  NAME: /^[a-zA-Z\s\-']{1,100}$/,  

  TEXT: /^[a-zA-Z0-9\s\-.,!?()&']{1,5000}$/,
  NUMBER: /^-?\d+(\.\d{1,2})?$/,
  ALPHANUMERIC: /^[a-zA-Z0-9_\-]{1,50}$/,
};

// ============================================================================
// VALIDATORS
// ============================================================================

export const validator = {
  /**
   * Validates email format
   */
  isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    const trimmed = email.trim().toLowerCase();
    if (trimmed.length > 254) return false; // RFC 5321
    return VALIDATION_RULES.EMAIL.test(trimmed);
  },

  /**
   * Validates phone number format
   */
  isValidPhone(phone: string): boolean {
    if (!phone || typeof phone !== 'string') return false;
    const trimmed = phone.trim();
    return VALIDATION_RULES.PHONE.test(trimmed);
  },

  /**
   * Validates URL format (http/https only)
   */
  isValidUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    try {
      const trimmed = url.trim();
      if (!VALIDATION_RULES.URL.test(trimmed)) return false;
      new URL(trimmed); // Will throw if invalid
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Validates Google Sheets webhook URL specifically
   */
  isValidWebhookUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    return VALIDATION_RULES.WEBHOOK_URL.test(trimmed);
  },

  /**
   * Validates person name
   */
  isValidName(name: string): boolean {
    if (!name || typeof name !== 'string') return false;
    const trimmed = name.trim();
    return trimmed.length >= 2 && trimmed.length <= 100 && VALIDATION_RULES.NAME.test(trimmed);
  },

  /**
   * Validates text field (generic text validation)
   */
  isValidText(text: string, minLength = 1, maxLength = 5000): boolean {
    if (!text || typeof text !== 'string') return false;
    const trimmed = text.trim();
    return trimmed.length >= minLength && trimmed.length <= maxLength;
  },

  /**
   * Validates number
   */
  isValidNumber(value: any): boolean {
    if (value === null || value === undefined || value === '') return false;
    const num = Number(value);
    return !isNaN(num) && isFinite(num);
  },

  /**
   * Validates positive integer
   */
  isValidInteger(value: any, min = 0, max = Infinity): boolean {
    if (!this.isValidNumber(value)) return false;
    const num = Number(value);
    return Number.isInteger(num) && num >= min && num <= max;
  },

  /**
   * Validates file size
   */
  isValidFileSize(size: number, maxSizeInMB = 10): boolean {
    const maxBytes = maxSizeInMB * 1024 * 1024;
    return size > 0 && size <= maxBytes;
  },

  /**
   * Validates file type
   */
  isValidFileType(mimeType: string, allowedTypes: string[]): boolean {
    if (!mimeType || typeof mimeType !== 'string') return false;
    return allowedTypes.includes(mimeType.toLowerCase());
  },

  /**
   * Validates date format (YYYY-MM-DD)
   */
  isValidDate(dateString: string): boolean {
    if (!dateString || typeof dateString !== 'string') return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  },

  /**
   * Validates that value is not null/undefined/empty
   */
  isRequired(value: any): boolean {
    return value !== null && value !== undefined && value !== '';
  },

  /**
   * Validates a value against a whitelist
   */
  isInWhitelist(value: string, whitelist: string[]): boolean {
    return whitelist.includes(value);
  },

  /**
   * Validates password strength
   * Requires: min 12 chars, uppercase, lowercase, number, special char
   */
  isStrongPassword(password: string): boolean {
    if (!password || typeof password !== 'string' || password.length < 12) return false;
    return (
      /[A-Z]/.test(password) && // uppercase
      /[a-z]/.test(password) && // lowercase
      /\d/.test(password) && // number
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) // special char
    );
  },
};

// ============================================================================
// SANITIZERS
// ============================================================================

export const sanitizer = {
  /**
   * Sanitizes text by removing HTML tags and dangerous characters
   */
  sanitizeText(text: string): string {
    if (!text || typeof text !== 'string') return '';
    // Preserve user-entered spacing while removing HTML tags and dangerous characters
    return DOMPurify.sanitize(text, {
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: [],
    });
  },

  /**
   * Sanitizes HTML allowing safe tags (for rich text)
   */
  sanitizeHtml(html: string): string {
    if (!html || typeof html !== 'string') return '';
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      ALLOW_DATA_ATTR: false,
      FORCE_BODY: false,
    });
  },

  /**
   * Sanitizes URL to prevent javascript: and data: protocols
   */
  sanitizeUrl(url: string): string {
    if (!url || typeof url !== 'string') return '';
    const trimmed = url.trim();
    // Reject dangerous protocols
    if (trimmed.match(/^(javascript|data|vbscript):/i)) return '';
    return trimmed;
  },

  /**
   * Removes all HTML tags (plain text extraction)
   */
  stripHtml(html: string): string {
    if (!html || typeof html !== 'string') return '';
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });
  },

  /**
   * Escapes special characters for safe display in HTML
   */
  escapeHtml(text: string): string {
    if (!text || typeof text !== 'string') return '';
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
  },

  /**
   * Sanitizes email to lowercase and trim
   */
  sanitizeEmail(email: string): string {
    if (!email || typeof email !== 'string') return '';
    return email.trim().toLowerCase();
  },

  /**
   * Normalizes phone number
   */
  sanitizePhone(phone: string): string {
    if (!phone || typeof phone !== 'string') return '';
    // Remove all non-digit characters except +
    return phone.replace(/[^\d+]/g, '').slice(-15);
  },

  /**
   * Removes null bytes and control characters
   */
  removeControlCharacters(text: string): string {
    if (!text || typeof text !== 'string') return '';
    // Remove null bytes and control characters (ASCII 0-31 and 127)
    return text.replace(/[\x00-\x1F\x7F]/g, '');
  },

  /**
   * Normalizes whitespace
   */
  normalizeWhitespace(text: string): string {
    if (!text || typeof text !== 'string') return '';
    return text.replace(/\s+/g, ' ').trim();
  },

  /**
   * Sanitizes a JSON object recursively
   */
  sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') return this.sanitizeText(obj);
    if (Array.isArray(obj)) return obj.map((item) => this.sanitizeObject(item));
    if (typeof obj === 'object') {
      const sanitized: Record<string, any> = {};
      for (const [key, value] of Object.entries(obj)) {
        if (typeof key === 'string' && !key.match(/^__/)) {
          sanitized[key] = this.sanitizeObject(value);
        }
      }
      return sanitized;
    }
    return obj;
  },
};

// ============================================================================
// COMPOSITE VALIDATORS (combine validation + sanitization)
// ============================================================================

export const validate = {
  /**
   * Validate and sanitize email
   */
  email(value: string): { valid: boolean; value: string; error?: string } {
    const sanitized = sanitizer.sanitizeEmail(value);
    if (!validator.isValidEmail(sanitized)) {
      return { valid: false, value: '', error: 'Invalid email format' };
    }
    return { valid: true, value: sanitized };
  },

  /**
   * Validate and sanitize name
   */
  name(value: string): { valid: boolean; value: string; error?: string } {
    const sanitized = sanitizer.sanitizeText(value);
    if (!validator.isValidName(sanitized)) {
      return { valid: false, value: '', error: 'Invalid name format (2-100 characters)' };
    }
    return { valid: true, value: sanitized };
  },

  /**
   * Validate and sanitize phone
   */
  phone(value: string): { valid: boolean; value: string; error?: string } {
    const sanitized = sanitizer.sanitizePhone(value);
    if (!validator.isValidPhone(sanitized)) {
      return { valid: false, value: '', error: 'Invalid phone format' };
    }
    return { valid: true, value: sanitized };
  },

  /**
   * Validate and sanitize text
   */
  text(value: string, minLength = 1, maxLength = 5000): { valid: boolean; value: string; error?: string } {
    const sanitized = sanitizer.sanitizeText(value);
    if (!validator.isValidText(sanitized, minLength, maxLength)) {
      return {
        valid: false,
        value: '',
        error: `Text must be ${minLength}-${maxLength} characters`,
      };
    }
    return { valid: true, value: sanitized };
  },

  /**
   * Validate and sanitize URL
   */
  url(value: string): { valid: boolean; value: string; error?: string } {
    const sanitized = sanitizer.sanitizeUrl(value);
    if (!validator.isValidUrl(sanitized)) {
      return { valid: false, value: '', error: 'Invalid URL format' };
    }
    return { valid: true, value: sanitized };
  },

  /**
   * Validate webhook URL specifically
   */
  webhookUrl(value: string): { valid: boolean; value: string; error?: string } {
    const sanitized = sanitizer.sanitizeUrl(value);
    if (!validator.isValidWebhookUrl(sanitized)) {
      return {
        valid: false,
        value: '',
        error: 'Must be a valid Google Sheets webhook URL (https://script.google.com/macros/...)',
      };
    }
    return { valid: true, value: sanitized };
  },
};

// ============================================================================
// RATE LIMITING HELPERS
// ============================================================================

export const rateLimitHelper = {
  /**
   * Creates a rate limit key from IP address
   */
  getIpKey(ip: string): string {
    return `rate_limit:ip:${ip}`;
  },

  /**
   * Creates a rate limit key from email
   */
  getEmailKey(email: string): string {
    return `rate_limit:email:${sanitizer.sanitizeEmail(email)}`;
  },

  /**
   * Creates a rate limit key from user fingerprint
   */
  getFingerprintKey(fingerprint: string): string {
    return `rate_limit:fingerprint:${fingerprint}`;
  },

  /**
   * Combines multiple factors into a rate limit key
   */
  getCompositeKey(ip: string, email: string, fingerprint?: string): string {
    const parts = [ip, sanitizer.sanitizeEmail(email), fingerprint || ''].filter((p) => p);
    return `rate_limit:composite:${parts.join(':')}`;
  },
};

// ============================================================================
// EXPORT EVERYTHING
// ============================================================================

export default {
  validator,
  sanitizer,
  validate,
  rateLimitHelper,
  VALIDATION_RULES,
};
