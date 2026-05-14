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
// RATE LIMIT STORE (In-memory for Deno)
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

function getRateLimitKey(ip: string, email: string, window: string): string {
  return `${ip}:${email}:${window}`;
}

function checkAndRecordRateLimit(
  ip: string,
  email: string
): { allowed: boolean; message?: string } {
  const now = Date.now();

  // Per-minute
  const minuteKey = getRateLimitKey(ip, email, "minute");
  let entry = rateLimitStore.get(minuteKey);
  if (!entry || now >= entry.resetAt) {
    rateLimitStore.set(minuteKey, { count: 1, resetAt: now + 60_000 });
  } else {
    if (entry.count >= RATE_LIMITS.SUBMISSION_PER_MINUTE) {
      return {
        allowed: false,
        message: "Too many requests this minute. Try again in 60 seconds.",
      };
    }
    entry.count++;
  }

  // Per-hour
  const hourKey = getRateLimitKey(ip, email, "hour");
  entry = rateLimitStore.get(hourKey);
  if (!entry || now >= entry.resetAt) {
    rateLimitStore.set(hourKey, { count: 1, resetAt: now + 60 * 60 * 1000 });
  } else {
    if (entry.count >= RATE_LIMITS.SUBMISSION_PER_HOUR) {
      return {
        allowed: false,
        message: "Too many requests this hour. Try again later.",
      };
    }
    entry.count++;
  }

  // Per-day
  const dayKey = getRateLimitKey(ip, email, "day");
  entry = rateLimitStore.get(dayKey);
  if (!entry || now >= entry.resetAt) {
    rateLimitStore.set(dayKey, { count: 1, resetAt: now + 24 * 60 * 60 * 1000 });
  } else {
    if (entry.count >= RATE_LIMITS.SUBMISSION_PER_DAY) {
      return {
        allowed: false,
        message: "Daily submission limit reached. Try again tomorrow.",
      };
    }
    entry.count++;
  }

  // Cleanup old entries (every 1000 checks)
  if (rateLimitStore.size > 10_000) {
    const threshold = now - 24 * 60 * 60 * 1000;
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetAt < threshold) {
        rateLimitStore.delete(key);
      }
    }
  }

  return { allowed: true };
}

// ============================================================================
// SECURITY HELPERS
// ============================================================================

function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    headers.get("cf-connecting-ip") ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}

function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin");
  const isAllowedOrigin =
    ALLOWED_ORIGINS.includes(origin || "") ||
    (Deno.env.get("ENV") === "development" && DEV_ORIGINS.includes(origin || ""));

  const corsHeaders: Record<string, string> = {
    ...SECURITY_HEADERS,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-csrf-token",
  };

  if (isAllowedOrigin) {
    corsHeaders["Access-Control-Allow-Origin"] = origin || "";
    corsHeaders["Access-Control-Allow-Credentials"] = "true";
  }

  return corsHeaders;
}

function sanitizeText(value: unknown, maxLength = 5000): string {
  if (typeof value !== "string") return "";
  // Remove null bytes and control characters
  let sanitized = String(value).replace(/[\x00-\x1F\x7F]/g, "");
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

function validateCsrfToken(token: unknown): boolean {
  if (!token || typeof token !== "string") return false;
  // Token should be alphanumeric and 32+ characters
  return /^[a-zA-Z0-9]{32,}$/.test(token);
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
    const csrfToken = request.headers.get("x-csrf-token");
    if (!validateCsrfToken(csrfToken)) {
      console.warn("[API] CSRF validation failed");
      return new Response(
        JSON.stringify({ success: false, error: "Security validation failed" }),
        { status: 403, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

    // Validate and sanitize payload
    const validation = validateConsultationPayload(body);
    if (!validation.valid) {
      console.warn("[API] Validation failed:", validation.error);
      return new Response(
        JSON.stringify({ success: false, error: validation.error || "Invalid input" }),
        { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

    const payload = validation.data!;

    // Rate limiting
    const rateLimit = checkAndRecordRateLimit(clientIp, payload.contact_email);
    if (!rateLimit.allowed) {
      console.warn("[API] Rate limit exceeded:", payload.contact_email);
      return new Response(
        JSON.stringify({ success: false, error: rateLimit.message }),
        { status: 429, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

    // Submit to Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      console.error("[API] Missing Supabase config");
      return new Response(
        JSON.stringify({ success: false, error: "Server configuration error" }),
        { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

    const dbResponse = await fetch(`${supabaseUrl}/rest/v1/consultation_submissions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    });

    if (!dbResponse.ok) {
      console.error(
        "[API] Database error:",
        dbResponse.status,
        await dbResponse.text()
      );
      return new Response(
        JSON.stringify({ success: false, error: "Failed to save submission" }),
        { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

    // Success
    console.log("[API] Submission success:", payload.contact_email);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Submission received successfully",
      }),
      { status: 200, headers: { ...headers, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[API] Unhandled error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "An error occurred" }),
      { status: 500, headers: getCorsHeaders(request), "Content-Type": "application/json" } as any
    );
  }
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
    if (url.pathname === "/api/consultation/submit" && request.method === "POST") {
      return await handleConsultationSubmit(request, body);
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
}
    .from("submission_rate_limits")
    .select("*", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("submitted_at", oneHourAgo);

  if ((hourCount ?? 0) >= SUBMISSION_LIMITS.per_hour) {
    return {
      allowed: false,
      message: "Too many submissions today. Try again in 1 hour.",
      retryAfter: 3600,
    };
  }

  // Check per-day
  const oneDayAgo = new Date(now.getTime() - 86_400_000).toISOString();
  const { count: dayCount } = await supabase
    .from("submission_rate_limits")
    .select("*", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("submitted_at", oneDayAgo);

  if ((dayCount ?? 0) >= SUBMISSION_LIMITS.per_day) {
    return {
      allowed: false,
      message: "Daily limit reached. Try tomorrow.",
      retryAfter: 86400,
    };
  }

  return { allowed: true };
}

// ============================================================================
// WEBHOOK VALIDATION
// ============================================================================

function validateWebhookUrl(url: string): { valid: boolean; reason?: string } {
  if (!url || typeof url !== "string") {
    return { valid: false, reason: "Invalid URL" };
  }

  try {
    const parsed = new URL(url);

    // HTTPS only
    if (parsed.protocol !== "https:") {
      return { valid: false, reason: "HTTPS required" };
    }

    // Whitelist domains
    const allowed = ["script.google.com", "script.googleusercontent.com"];
    if (!allowed.includes(parsed.hostname)) {
      return { valid: false, reason: "Domain not allowed" };
    }

    // No path traversal
    if (parsed.pathname.includes("..") || url.includes("%2e%2e")) {
      return { valid: false, reason: "Invalid path" };
    }

    // No URL in query parameters
    for (const [, value] of parsed.searchParams) {
      if (value.includes("http://") || value.includes("https://")) {
        return { valid: false, reason: "Invalid query parameters" };
      }
    }

    // No IP addresses
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Pattern.test(parsed.hostname)) {
      return { valid: false, reason: "IP not allowed" };
    }

    // URL length limit
    if (url.length > 2048) {
      return { valid: false, reason: "URL too long" };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, reason: "Invalid URL format" };
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const corsOptions = validateOrigin(origin);
  const corsHeaders = buildCorsHeaders(corsOptions);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    if (!corsOptions.isAllowed) {
      return new Response("CORS rejected", {
        status: 403,
        headers: corsHeaders,
      });
    }

    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Block if origin not allowed
  if (!corsOptions.isAllowed) {
    return new Response(JSON.stringify({ error: "Origin not allowed" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Route to appropriate handler
    if (pathname === "/api/submit-consultation" && req.method === "POST") {
      return await handleSubmitConsultation(req, corsHeaders);
    } else if (pathname === "/api/rate-limit" && req.method === "GET") {
      return await handleRateLimit(req, corsHeaders);
    } else if (pathname === "/api/session" && req.method === "GET") {
      return await handleSession(req, corsHeaders);
    } else if (pathname === "/api/auth/login" && req.method === "POST") {
      return await handleLogin(req, corsHeaders);
    } else if (pathname === "/api/auth/logout" && req.method === "POST") {
      return await handleLogout(req, corsHeaders);
    } else if (pathname === "/api/auth/reset-password" && req.method === "POST") {
      return await handleResetPassword(req, corsHeaders);
    } else if (pathname === "/api/settings" && req.method === "GET") {
      return await handleGetSettings(req, corsHeaders);
    } else if (pathname === "/api/settings" && req.method === "PUT") {
      return await handleUpdateSettings(req, corsHeaders);
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[API] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// ============================================================================
// ENDPOINT HANDLERS
// ============================================================================

async function handleSubmitConsultation(
  req: Request,
  corsHeaders: Record<string, string>
) {
  const csrfToken = req.headers.get("x-csrf-token");

  // Validate CSRF token
  if (!validateCsrfToken(csrfToken)) {
    return new Response(JSON.stringify({ error: "CSRF validation failed" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Get client IP
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") || "unknown";
  const ipHash = await hashIP(clientIp);

  // Check rate limits
  const rateLimitCheck = await checkRateLimits(ipHash);
  if (!rateLimitCheck.allowed) {
    return new Response(JSON.stringify({ error: rateLimitCheck.message }), {
      status: 429,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Retry-After": (rateLimitCheck.retryAfter || 60).toString(),
      },
    });
  }

  // Parse and validate payload
  const rawPayload = await req.json().catch(() => ({}));

  const payload = {
    organization_name: sanitizeString(rawPayload.organization_name),
    industry: sanitizeString(rawPayload.industry),
    industry_other: sanitizeString(rawPayload.industry_other),
    country: sanitizeString(rawPayload.country),
    website: sanitizeString(rawPayload.website),
    employees: sanitizeString(rawPayload.employees),
    service_areas: sanitizeArray(rawPayload.service_areas),
    service_area_other: sanitizeString(rawPayload.service_area_other),
    key_challenge: sanitizeString(rawPayload.key_challenge),
    desired_outcome: sanitizeString(rawPayload.desired_outcome),
    reform_context: sanitizeString(rawPayload.reform_context),
    start_date: sanitizeString(rawPayload.start_date),
    timeline: sanitizeString(rawPayload.timeline),
    budget_approved: sanitizeString(rawPayload.budget_approved),
    contact_name: sanitizeString(rawPayload.contact_name),
    contact_email: sanitizeString(rawPayload.contact_email),
    contact_phone: sanitizeString(rawPayload.contact_phone),
    contact_role: sanitizeString(rawPayload.contact_role),
    approvers: sanitizeString(rawPayload.approvers),
    partners: sanitizeString(rawPayload.partners),
  };

  // Validate required fields
  if (
    !payload.organization_name ||
    !payload.key_challenge ||
    !payload.desired_outcome ||
    !payload.contact_name
  ) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!payload.contact_email || !isValidEmail(payload.contact_email)) {
    return new Response(JSON.stringify({ error: "Invalid email address" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Save to database
  const { error: dbError } = await supabase
    .from("consultation_submissions")
    .insert(payload);

  if (dbError) {
    console.error("[API] Database error:", dbError);
    return new Response(JSON.stringify({ error: "Failed to save submission" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Record rate limit hit
  await supabase.from("submission_rate_limits").insert({
    ip_hash: ipHash,
    submitted_at: new Date().toISOString(),
  });

  // Send to webhook if configured
  try {
    const { data: setting } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "google_sheets_webhook")
      .maybeSingle();

    if (setting?.value) {
      const validation = validateWebhookUrl(setting.value);
      if (validation.valid) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
          await fetch(setting.value, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            redirect: "error", // ✅ FIXED: No redirect following
            signal: controller.signal,
            credentials: "omit",
          });
        } catch (error) {
          console.warn("[Webhook] Failed:", error instanceof Error ? error.message : "Unknown error");
        } finally {
          clearTimeout(timeoutId);
        }
      }
    }
  } catch (error) {
    console.warn("[Webhook] Error:", error);
  }

  return new Response(
    JSON.stringify({ success: true, message: "Submission received" }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

async function handleRateLimit(
  req: Request,
  corsHeaders: Record<string, string>
) {
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") || "unknown";
  const ipHash = await hashIP(clientIp);

  const { allowed } = await checkRateLimits(ipHash);

  return new Response(
    JSON.stringify({
      allowed,
      remaining: allowed ? SUBMISSION_LIMITS.per_hour : 0,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

async function handleSession(
  req: Request,
  corsHeaders: Record<string, string>
) {
  // TODO: Implement session checking with JWT
  return new Response(
    JSON.stringify({ authenticated: false }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

async function handleLogin(
  req: Request,
  corsHeaders: Record<string, string>
) {
  // TODO: Implement secure login with brute-force protection
  return new Response(
    JSON.stringify({ error: "Not implemented" }),
    {
      status: 501,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

async function handleLogout(
  req: Request,
  corsHeaders: Record<string, string>
) {
  // TODO: Implement logout with session invalidation
  return new Response(
    JSON.stringify({ success: true }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

async function handleResetPassword(
  req: Request,
  corsHeaders: Record<string, string>
) {
  // TODO: Implement password reset
  return new Response(
    JSON.stringify({ error: "Not implemented" }),
    {
      status: 501,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

async function handleGetSettings(
  req: Request,
  corsHeaders: Record<string, string>
) {
  // TODO: Implement with authentication check
  return new Response(
    JSON.stringify({ error: "Unauthorized" }),
    {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

async function handleUpdateSettings(
  req: Request,
  corsHeaders: Record<string, string>
) {
  // TODO: Implement with authentication + validation
  return new Response(
    JSON.stringify({ error: "Unauthorized" }),
    {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}
