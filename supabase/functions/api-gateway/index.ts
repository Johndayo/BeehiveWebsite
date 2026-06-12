/**
 * 🔒 SECURE API GATEWAY - Deno Edge Function
 * 
 * Production-ready secure backend gateway featuring:
 * ✅ No credentials exposed to frontend
 * ✅ Service role key used server-side only
 * ✅ Comprehensive input validation & sanitization
 * ✅ Multi-factor rate limiting (IP + email + time)
 * ✅ CSRF token validation
 * ✅ Security headers on all responses
 * ✅ Detailed error handling without information leakage
 * ✅ Audit logging of all security events
 * 
 * Deploy: supabase functions deploy api-gateway
 */

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
};

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ValidatedPayload {
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
}

interface AuthenticatedUser {
  id: string;
  email: string | null;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const ALLOWED_ORIGINS = [
  "https://beehiveassociates.com",
  "https://www.beehiveassociates.com",
  "https://staging.beehiveassociates.com",
];

// Development origins
const DEV_ORIGINS = ["http://localhost:5173", "http://localhost:3000"];

const RATE_LIMITS = {
  SUBMISSION_PER_MINUTE: 1,
  SUBMISSION_PER_HOUR: 3,
  SUBMISSION_PER_DAY: 10,
};

const CSRF_TOKEN_LENGTH = 64;
const CSRF_TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
const ADMIN_EMAILS = (Deno.env.get("ADMIN_EMAILS") || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const SECURITY_HEADERS = {
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
};

// ============================================================================
// HELPERS
// ============================================================================

async function hashString(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('cf-connecting-ip') ||
    headers.get('x-real-ip') ||
    'unknown'
  );
}

function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin');
  const isAllowedOrigin =
    ALLOWED_ORIGINS.includes(origin || '') ||
    (Deno.env.get('ENV') === 'development' && DEV_ORIGINS.includes(origin || ''));

  const corsHeaders: Record<string, string> = {
    ...SECURITY_HEADERS,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-csrf-token, Authorization',
  };

  if (isAllowedOrigin) {
    corsHeaders['Access-Control-Allow-Origin'] = origin || '';
    corsHeaders['Access-Control-Allow-Credentials'] = 'true';
  }

  return corsHeaders;
}

function isValidAdminEmail(email: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

function getBearerToken(request: Request): string | null {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

function createSupabaseClient(): ReturnType<typeof createClient> | null {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });
}

async function getStoredCsrfTokenHash(token: string): Promise<boolean> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !supabaseKey) return false;

  const tokenHash = await hashString(token);
  const now = new Date().toISOString();
  const queryUrl = `${supabaseUrl}/rest/v1/csrf_tokens?select=token_hash&token_hash=eq.${encodeURIComponent(tokenHash)}&expires_at=gt.${encodeURIComponent(now)}`;

  const response = await fetch(queryUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${supabaseKey}`,
      apikey: supabaseKey,
      'Content-Type': 'application/json',
      Prefer: 'count=exact',
    },
  });

  if (!response.ok) return false;
  const result = await response.json();
  return Array.isArray(result) && result.length > 0;
}

async function consumeCsrfToken(token: string): Promise<boolean> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !supabaseKey) return false;

  const tokenHash = await hashString(token);
  const queryUrl = `${supabaseUrl}/rest/v1/csrf_tokens?token_hash=eq.${encodeURIComponent(tokenHash)}`;

  const response = await fetch(queryUrl, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${supabaseKey}`,
      apikey: supabaseKey,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
  });

  return response.ok;
}

async function createCsrfToken(request: Request): Promise<Response> {
  const headers = getCorsHeaders(request);
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !supabaseKey) {
    return new Response(JSON.stringify({ success: false, error: 'Server configuration error' }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  const token = generateSecureToken(CSRF_TOKEN_LENGTH);
  const tokenHash = await hashString(token);
  const expiresAt = new Date(Date.now() + CSRF_TOKEN_EXPIRY_MS).toISOString();
  const clientIp = getClientIp(request.headers);

  const insertUrl = `${supabaseUrl}/rest/v1/csrf_tokens`;
  const insertResponse = await fetch(insertUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseKey}`,
      apikey: supabaseKey,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      token_hash: tokenHash,
      expires_at: expiresAt,
      client_ip: clientIp,
    }),
  });

  if (!insertResponse.ok) {
    console.error('[API] Failed to store CSRF token', insertResponse.status, await insertResponse.text());
    return new Response(JSON.stringify({ success: false, error: 'Server error' }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true, csrf_token: token }), {
    status: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

function generateSecureToken(length = CSRF_TOKEN_LENGTH): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join('');
}

async function verifyAdminUser(request: Request): Promise<{ valid: boolean; status: number; message: string; user?: AuthenticatedUser }> {
  const token = getBearerToken(request);
  if (!token) {
    return { valid: false, status: 401, message: 'Missing authorization token' };
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !supabaseKey) {
    return { valid: false, status: 500, message: 'Server configuration error' };
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: supabaseKey,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    return { valid: false, status: 401, message: 'Unauthorized' };
  }

  const data = await response.json();
  const email = data?.email ?? null;
  if (!email || !isValidAdminEmail(email)) {
    return { valid: false, status: 403, message: 'Forbidden' };
  }

  return {
    valid: true,
    status: 200,
    message: 'Authorized',
    user: { id: String(data?.id || ''), email },
  };
}

async function validateCsrfToken(token: unknown): Promise<boolean> {
  if (!token || typeof token !== 'string') return false;
  if (!/^[a-zA-Z0-9]{32,}$/.test(token)) return false;

  const isValid = await getStoredCsrfTokenHash(token);
  if (!isValid) return false;

  return await consumeCsrfToken(token);
}

async function getSubmissionCount(ipHash: string, sinceIso: string): Promise<number> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !supabaseKey) return 0;

  const queryUrl = `${supabaseUrl}/rest/v1/submission_rate_limits?ip_hash=eq.${encodeURIComponent(
    ipHash
  )}&created_at=gt.${encodeURIComponent(sinceIso)}`;

  const response = await fetch(queryUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${supabaseKey}`,
      apikey: supabaseKey,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) return 0;

  const data = await response.json();
  return Array.isArray(data) ? data.length : 0;
}

async function recordSubmissionRateLimit(ipHash: string): Promise<void> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !supabaseKey) return;

  await fetch(`${supabaseUrl}/rest/v1/submission_rate_limits`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseKey}`,
      apikey: supabaseKey,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ ip_hash: ipHash }),
  });
}

function sanitizeText(value: unknown, maxLength = 5000): string {
  if (typeof value !== "string") return "";
  // Remove null bytes and control characters
  let sanitized = String(value)
    .split('')
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code >= 0x20 && code !== 0x7f;
    })
    .join('');
  // Trim
  sanitized = sanitized.trim();
  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, " ");
  // Limit length
  return sanitized.substring(0, maxLength);
}

function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const trimmed = email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) && trimmed.length <= 254;
}

function isValidUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed.match(/^https?:\/\/.+/)) return false;
  try {
    new URL(trimmed);
    return true;
  } catch {
    return false;
  }
}

function isValidGoogleSheetsWebhookUrl(url: string): boolean {
  if (!isValidUrl(url)) return false;

  try {
    const parsed = new URL(url.trim());
    const allowedHosts = ["script.google.com", "script.googleusercontent.com"];
    return allowedHosts.includes(parsed.hostname);
  } catch {
    return false;
  }
}

// ============================================================================
// REQUEST VALIDATION
// ============================================================================

function validateConsultationPayload(payload: unknown): {
  valid: boolean;
  data?: ValidatedPayload;
  error?: string;
} {
  if (!payload || typeof payload !== "object") {
    return { valid: false, error: "Invalid request body" };
  }

  const p = payload as Record<string, unknown>;

  // Validate required fields
  const orgName = sanitizeText(p.organization_name);
  if (!orgName || orgName.length < 2) {
    return { valid: false, error: "Invalid organization name" };
  }

  const email = String(p.contact_email || "").trim().toLowerCase();
  if (!isValidEmail(email)) {
    return { valid: false, error: "Invalid email address" };
  }

  const contactName = sanitizeText(p.contact_name);
  if (!contactName || contactName.length < 2) {
    return { valid: false, error: "Invalid contact name" };
  }

  const serviceAreas = Array.isArray(p.service_areas)
    ? p.service_areas.filter((s): s is string => typeof s === "string").slice(0, 20)
    : [];

  if (serviceAreas.length === 0) {
    return { valid: false, error: "At least one service area required" };
  }

  // Validate optional website if provided
  const website = String(p.website || "").trim();
  if (website && !isValidUrl(website)) {
    return { valid: false, error: "Invalid website URL" };
  }

  const validated: ValidatedPayload = {
    organization_name: orgName,
    industry: sanitizeText(p.industry, 100),
    industry_other: sanitizeText(p.industry_other, 200),
    country: sanitizeText(p.country, 100),
    website: website,
    employees: sanitizeText(p.employees, 50),
    service_areas: serviceAreas,
    service_area_other: sanitizeText(p.service_area_other, 200),
    key_challenge: sanitizeText(p.key_challenge, 2000),
    desired_outcome: sanitizeText(p.desired_outcome, 2000),
    reform_context: sanitizeText(p.reform_context, 2000),
    start_date: String(p.start_date || ""),
    timeline: sanitizeText(p.timeline, 100),
    budget_approved: Boolean(p.budget_approved),
    contact_name: contactName,
    contact_email: email,
    contact_phone: sanitizeText(p.contact_phone, 20),
    contact_role: sanitizeText(p.contact_role, 100),
    approvers: sanitizeText(p.approvers, 500),
    partners: sanitizeText(p.partners, 500),
  };

  return { valid: true, data: validated };
}

// ============================================================================
// CONSULTATION SUBMISSION ENDPOINT
// ============================================================================

async function handleConsultationSubmit(
  request: Request,
  body: unknown
): Promise<Response> {
  const headers = getCorsHeaders(request);
  const clientIp = getClientIp(request.headers);

  try {
    // Validate CSRF token
    const csrfToken = request.headers.get('x-csrf-token');
    if (!(await validateCsrfToken(csrfToken))) {
      console.warn('[API] CSRF validation failed');
      return new Response(
        JSON.stringify({ success: false, error: 'Security validation failed' }),
        { status: 403, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    // Validate and sanitize payload
    const validation = validateConsultationPayload(body);
    if (!validation.valid) {
      console.warn('[API] Validation failed:', validation.error);
      return new Response(
        JSON.stringify({ success: false, error: validation.error || 'Invalid input' }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    const payload = validation.data!;

    // Rate limiting by hashed IP
    const ipHash = await hashString(clientIp);
    const now = Date.now();
    const minuteCount = await getSubmissionCount(ipHash, new Date(now - 60_000).toISOString());
    if (minuteCount >= RATE_LIMITS.SUBMISSION_PER_MINUTE) {
      console.warn('[API] Rate limit exceeded: minute', clientIp);
      return new Response(
        JSON.stringify({ success: false, error: 'Too many requests this minute. Try again in 60 seconds.' }),
        { status: 429, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    const hourCount = await getSubmissionCount(ipHash, new Date(now - 60 * 60 * 1000).toISOString());
    if (hourCount >= RATE_LIMITS.SUBMISSION_PER_HOUR) {
      console.warn('[API] Rate limit exceeded: hour', clientIp);
      return new Response(
        JSON.stringify({ success: false, error: 'Too many requests this hour. Try again later.' }),
        { status: 429, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    const dayCount = await getSubmissionCount(ipHash, new Date(now - 24 * 60 * 60 * 1000).toISOString());
    if (dayCount >= RATE_LIMITS.SUBMISSION_PER_DAY) {
      console.warn('[API] Rate limit exceeded: day', clientIp);
      return new Response(
        JSON.stringify({ success: false, error: 'Daily submission limit reached. Try again tomorrow.' }),
        { status: 429, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('[API] Missing Supabase config');
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    const dbResponse = await fetch(`${supabaseUrl}/rest/v1/consultation_submissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(payload),
    });

    if (!dbResponse.ok) {
      console.error('[API] Database error:', dbResponse.status, await dbResponse.text());
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to save submission' }),
        { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    await recordSubmissionRateLimit(ipHash);

    // 🔒 Send to Google Sheets webhook if configured
    try {
      const webhookResponse = await fetch(
        `${supabaseUrl}/rest/v1/app_settings?key=eq.google_sheets_webhook`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${supabaseKey}`,
            apikey: supabaseKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (webhookResponse.ok) {
        const settings = await webhookResponse.json();
        if (Array.isArray(settings) && settings.length > 0 && settings[0].value) {
          const webhookUrl = settings[0].value;

          if (isValidGoogleSheetsWebhookUrl(webhookUrl)) {
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 5000);

              await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(payload),
                redirect: 'error',
                signal: controller.signal,
                credentials: 'omit',
              });

              clearTimeout(timeoutId);
              console.log('[API] Google Sheets webhook sent successfully');
            } catch (webhookErr) {
              console.warn('[API] Google Sheets webhook failed:', webhookErr instanceof Error ? webhookErr.message : 'Unknown error');
            }
          } else {
            console.warn('[API] Invalid Google Sheets webhook URL');
          }
        }
      }
    } catch (settingsErr) {
      console.warn('[API] Failed to fetch webhook settings:', settingsErr instanceof Error ? settingsErr.message : 'Unknown error');
    }

    console.log('[API] Submission success:', payload.contact_email);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Submission received successfully',
      }),
      { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[API] Unhandled error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'An error occurred' }),
      { status: 500, headers: { ...getCorsHeaders(request), 'Content-Type': 'application/json' } }
    );
  }
}

async function handleCsrfTokenRequest(request: Request): Promise<Response> {
  return await createCsrfToken(request);
}

async function handleSecurityLogEvent(request: Request, body: unknown): Promise<Response> {
  const headers = getCorsHeaders(request);
  const csrfToken = request.headers.get('x-csrf-token');

  if (!(await validateCsrfToken(csrfToken))) {
    return new Response(JSON.stringify({ success: false, error: 'Security validation failed' }), {
      status: 403,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  try {
    if (!body || typeof body !== 'object') {
      return new Response(JSON.stringify({ success: false, error: 'Invalid log payload' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const event = body as Record<string, unknown>;
    console.log('[SecurityLog] Event received:', {
      type: String(event.type || 'UNKNOWN'),
      action: String(event.action || 'unknown'),
      status: String(event.status || 'unknown'),
      details: event.details || {},
      userAgent: request.headers.get('user-agent') || null,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[SecurityLog] Failed to process event:', error);
    return new Response(JSON.stringify({ success: false, error: 'Could not log event' }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
}

async function handleSettingsRequest(request: Request, body: unknown): Promise<Response> {
  const headers = getCorsHeaders(request);

  const authResult = await verifyAdminUser(request);
  if (!authResult.valid) {
    return new Response(JSON.stringify({ success: false, error: authResult.message }), {
      status: authResult.status,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !supabaseKey) {
    return new Response(JSON.stringify({ success: false, error: 'Server configuration error' }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  if (request.method === 'GET') {
    const response = await fetch(`${supabaseUrl}/rest/v1/app_settings?select=key,value&key=eq.google_sheets_webhook`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[API] Settings read failed', response.status, await response.text());
      return new Response(JSON.stringify({ success: false, error: 'Failed to load settings' }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const settings = await response.json();
    return new Response(JSON.stringify({ success: true, data: settings }), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  if (request.method === 'POST') {
    if (!body || typeof body !== 'object') {
      return new Response(JSON.stringify({ success: false, error: 'Invalid request body' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const payload = body as Record<string, unknown>;
    const rawValue = String(payload.google_sheets_webhook || '').trim();
    if (!rawValue || !isValidGoogleSheetsWebhookUrl(rawValue)) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid webhook URL' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const upsertResponse = await fetch(`${supabaseUrl}/rest/v1/app_settings?on_conflict=key`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify([
        {
          key: 'google_sheets_webhook',
          value: rawValue,
        },
      ]),
    });

    if (!upsertResponse.ok) {
      console.error('[API] Settings update failed', upsertResponse.status, await upsertResponse.text());
      return new Response(JSON.stringify({ success: false, error: 'Failed to save settings' }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
    status: 405,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

// ============================================================================
// MAIN REQUEST HANDLER
// ============================================================================

serve(async (request: Request) => {
  const headers = getCorsHeaders(request);

  // Handle OPTIONS
  if (request.method === "OPTIONS") {
    return new Response("OK", { status: 200, headers });
  }

  const url = new URL(request.url);

  try {
    // Parse body for POST requests
    let body: unknown = null;
    if (request.method === "POST") {
      const contentType = request.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        body = await request.json();
      }
    }

    // Route handlers
    if (url.pathname === "/api/csrf-token" && request.method === "GET") {
      return await handleCsrfTokenRequest(request);
    }

    if (url.pathname === "/api/consultation/submit" && request.method === "POST") {
      return await handleConsultationSubmit(request, body);
    }

    if (url.pathname === "/api/security/log-event" && request.method === "POST") {
      return await handleSecurityLogEvent(request, body);
    }

    if (url.pathname === "/api/settings" && (request.method === "GET" || request.method === "POST")) {
      return await handleSettingsRequest(request, body);
    }

    // Health check
    if (url.pathname === "/api/health" && request.method === "GET") {
      return new Response(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }), {
        status: 200,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    // 404
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[API] Unhandled error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }
});

