/**
 * 🔒 Security Event Logging & Monitoring
 * Tracks security events for audit trails and threat detection
 */

// ============================================================================
// EVENT TYPES
// ============================================================================

export enum SecurityEventType {
  // Authentication events
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGIN_LOCKED = 'LOGIN_LOCKED',
  LOGOUT = 'LOGOUT',
  SESSION_EXPIRED = 'SESSION_EXPIRED',

  // Authorization events
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  PERMISSION_DENIED = 'PERMISSION_DENIED',

  // Data events
  DATA_ACCESS = 'DATA_ACCESS',
  DATA_MODIFICATION = 'DATA_MODIFICATION',
  DATA_DELETION = 'DATA_DELETION',
  SETTINGS_CHANGED = 'SETTINGS_CHANGED',

  // Security events
  CSRF_VALIDATION_FAILED = 'CSRF_VALIDATION_FAILED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  XSS_ATTEMPT_DETECTED = 'XSS_ATTEMPT_DETECTED',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',

  // Input validation events
  INVALID_INPUT = 'INVALID_INPUT',
  MALFORMED_REQUEST = 'MALFORMED_REQUEST',

  // Configuration events
  CONFIG_ACCESS = 'CONFIG_ACCESS',
  CONFIG_MODIFIED = 'CONFIG_MODIFIED',
}

// ============================================================================
// EVENT SEVERITY LEVELS
// ============================================================================

export enum EventSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

// ============================================================================
// EVENT STRUCTURE
// ============================================================================

export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: EventSeverity;
  timestamp: number;
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  resourceId?: string;
  action: string;
  status: 'success' | 'failure';
  details?: Record<string, any>;
  error?: string;
  fingerprint?: string;
}

// ============================================================================
// LOGGING SERVICE
// ============================================================================

class SecurityLogger {
  private events: SecurityEvent[] = [];
  private readonly MAX_LOCAL_EVENTS = 100;
  private readonly STORAGE_KEY = 'security_events_log';

  /**
   * Generates unique event ID
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Logs a security event
   */
  log(
    type: SecurityEventType,
    action: string,
    status: 'success' | 'failure',
    severity: EventSeverity = EventSeverity.INFO,
    details?: Record<string, any>
  ): SecurityEvent {
    const event: SecurityEvent = {
      id: this.generateEventId(),
      type,
      severity,
      timestamp: Date.now(),
      action,
      status,
      details,
      userAgent: navigator.userAgent,
    };

    // Store locally
    this.events.push(event);
    if (this.events.length > this.MAX_LOCAL_EVENTS) {
      this.events.shift(); // Remove oldest
    }

    // Persist to localStorage
    this.persistEvents();

    // Log to console in development
    if (import.meta.env.MODE === 'development') {
      console.log(`[${event.severity}] ${event.type}: ${event.action}`, event);
    }

    // Send to backend for central logging
    if (severity === EventSeverity.CRITICAL || severity === EventSeverity.ERROR) {
      this.sendToBackend(event).catch((err) =>
        console.error('[SecurityLogger] Failed to send event to backend:', err)
      );
    }

    return event;
  }

  /**
   * Logs authentication events
   */
  logAuthEvent(
    type: 'success' | 'failed' | 'locked',
    email: string,
    _details?: Record<string, any>
  ): SecurityEvent {
    const typeMap: Record<string, SecurityEventType> = {
      success: SecurityEventType.LOGIN_SUCCESS,
      failed: SecurityEventType.LOGIN_FAILED,
      locked: SecurityEventType.LOGIN_LOCKED,
    };

    return this.log(
      typeMap[type],
      `User login ${type}`,
      type === 'failed' || type === 'locked' ? 'failure' : 'success',
      type === 'locked' ? EventSeverity.WARNING : EventSeverity.INFO,
      { email }
    );
  }

  /**
   * Logs authorization failures
   */
  logUnauthorizedAccess(resource: string, userId?: string): SecurityEvent {
    return this.log(
      SecurityEventType.UNAUTHORIZED_ACCESS,
      `Unauthorized access to ${resource}`,
      'failure',
      EventSeverity.WARNING,
      { resource, userId }
    );
  }

  /**
   * Logs rate limit violations
   */
  logRateLimitExceeded(limitType: string, userId?: string): SecurityEvent {
    return this.log(
      SecurityEventType.RATE_LIMIT_EXCEEDED,
      `Rate limit exceeded: ${limitType}`,
      'failure',
      EventSeverity.WARNING,
      { limitType, userId }
    );
  }

  /**
   * Logs suspicious activity
   */
  logSuspiciousActivity(description: string, details?: Record<string, any>): SecurityEvent {
    return this.log(
      SecurityEventType.SUSPICIOUS_ACTIVITY,
      description,
      'failure',
      EventSeverity.ERROR,
      details
    );
  }

  /**
   * Logs XSS attempts
   */
  logXssAttempt(payload: string, location: string): SecurityEvent {
    return this.log(
      SecurityEventType.XSS_ATTEMPT_DETECTED,
      `Potential XSS attempt in ${location}`,
      'failure',
      EventSeverity.CRITICAL,
      { payload: payload.substring(0, 100), location }
    );
  }

  /**
   * Logs SQL injection attempts
   */
  logSqlInjectionAttempt(payload: string): SecurityEvent {
    return this.log(
      SecurityEventType.SQL_INJECTION_ATTEMPT,
      'Potential SQL injection attempt',
      'failure',
      EventSeverity.CRITICAL,
      { payload: payload.substring(0, 100) }
    );
  }

  /**
   * Logs invalid input
   */
  logInvalidInput(field: string, reason: string): SecurityEvent {
    return this.log(
      SecurityEventType.INVALID_INPUT,
      `Invalid input in field: ${field}`,
      'failure',
      EventSeverity.WARNING,
      { field, reason }
    );
  }

  /**
   * Logs CSRF validation failures
   */
  logCsrfValidationFailed(): SecurityEvent {
    return this.log(
      SecurityEventType.CSRF_VALIDATION_FAILED,
      'CSRF token validation failed',
      'failure',
      EventSeverity.ERROR
    );
  }

  /**
   * Logs data modifications
   */
  logDataModification(resource: string, userId: string, details?: Record<string, any>): SecurityEvent {
    return this.log(
      SecurityEventType.DATA_MODIFICATION,
      `Modified ${resource}`,
      'success',
      EventSeverity.INFO,
      { resource, userId, ...details }
    );
  }

  /**
   * Logs settings changes
   */
  logSettingsChanged(setting: string, oldValue: any, newValue: any, userId: string): SecurityEvent {
    return this.log(
      SecurityEventType.SETTINGS_CHANGED,
      `Setting changed: ${setting}`,
      'success',
      EventSeverity.WARNING,
      { setting, oldValue, newValue, userId }
    );
  }

  /**
   * Gets all logged events
   */
  getEvents(): SecurityEvent[] {
    return [...this.events];
  }

  /**
   * Gets events filtered by type
   */
  getEventsByType(type: SecurityEventType): SecurityEvent[] {
    return this.events.filter((e) => e.type === type);
  }

  /**
   * Gets critical events
   */
  getCriticalEvents(): SecurityEvent[] {
    return this.events.filter((e) => e.severity === EventSeverity.CRITICAL);
  }

  /**
   * Gets recent events
   */
  getRecentEvents(count: number = 10): SecurityEvent[] {
    return this.events.slice(-count);
  }

  /**
   * Clears all events
   */
  clearEvents(): void {
    this.events = [];
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Exports events as JSON
   */
  exportAsJson(): string {
    return JSON.stringify(this.events, null, 2);
  }

  /**
   * Persists events to localStorage
   */
  private persistEvents(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.events));
    } catch (error) {
      console.error('[SecurityLogger] Failed to persist events:', error);
    }
  }

  /**
   * Loads persisted events from localStorage
   */
  loadPersistedEvents(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.error('[SecurityLogger] Failed to load persisted events:', error);
    }
  }

  /**
   * Sends event to backend for centralized logging
   */
  private async sendToBackend(event: SecurityEvent): Promise<void> {
    try {
      const response = await fetch('/api/security/log-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        console.error('[SecurityLogger] Failed to send event to backend:', response.statusText);
      }
    } catch (error) {
      console.error('[SecurityLogger] Error sending event to backend:', error);
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const securityLogger = new SecurityLogger();

// Load persisted events on initialization
securityLogger.loadPersistedEvents();

// ============================================================================
// EXPORT
// ============================================================================

export default {
  securityLogger,
  SecurityEventType,
  EventSeverity,
};
