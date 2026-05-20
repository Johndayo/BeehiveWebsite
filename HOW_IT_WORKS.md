# How the Consultation Form Submission Works

## Overview

The consultation form is a **secure, multi-step form** that collects business consultation data. It uses a **frontend → backend API gateway → Supabase database → Google Sheets** pipeline with comprehensive security protections.

---

## 🎯 Step-by-Step Submission Flow

### 1️⃣ FRONTEND: Form Data Collection & Validation

**Location:** `src/components/ConsultationForm.tsx`

The form is a 5-step wizard that collects user information progressively:

```typescript
// Step 1: Organization Info (name, industry, country)
// Step 2: Service Areas (multi-select engagement areas)
// Step 3: Institutional Objectives (key challenge, desired outcome)
// Step 4: Scope & Timeline (budget, timeline, start date)
// Step 5: Decision Process (contact info: name, email, phone, role)
```

#### Form State Management:
```typescript
export default function ConsultationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<StepErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
}
```

#### Frontend Data Validation:
```typescript
function validateStep(step: number, formData: FormData): StepErrors {
  const errors: StepErrors = {};
  
  switch (step) {
    case 1:
      const orgName = sanitizer.sanitizeText(formData.organizationName);
      if (!validator.isValidText(orgName, 1, 200)) {
        errors.organizationName = 'Organization name is required (1-200 characters)';
        securityLogger.logInvalidInput('organizationName', 'Invalid length');
      }
      break;
    case 2:
      if (formData.serviceAreas.length === 0) {
        errors.serviceAreas = 'Please select at least one engagement area';
      }
      break;
    case 3:
      const challenge = sanitizer.sanitizeText(formData.keyChallenge);
      if (!validator.isValidText(challenge, 10, 2000)) {
        errors.keyChallenge = 'Please describe the key challenge (10-2000 characters)';
      }
      break;
    case 4:
      if (!formData.budgetApproved) {
        errors.budgetApproved = 'Please indicate budget status';
      }
      break;
    case 5:
      const nameValidation = validate.name(formData.contactName);
      const emailValidation = validate.email(formData.contactEmail);
      const phoneValidation = validate.phone(formData.contactPhone);
      // Validate all contact fields...
      break;
  }
  
  return errors;
}
```

#### Input Sanitization on Change:
```typescript
function handleChange(field: keyof FormData, value: string | string[] | boolean) {
  // 🔒 Sanitize text inputs before storing
  let sanitizedValue = value;
  if (typeof value === 'string') {
    sanitizedValue = sanitizer.sanitizeText(value);
  }
  
  setFormData((prev) => ({ ...prev, [field]: sanitizedValue }));
  // Clear error for this field when user starts correcting it
  if (errors[field]) {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }
}
```

---

### 2️⃣ FRONTEND: CSRF Token Protection

**Location:** `src/lib/csrf.ts` & `src/components/ConsultationForm.tsx`

Before submission, a CSRF token is generated and validated:

#### Initialize CSRF Token:
```typescript
useEffect(() => {
  const initCsrf = async () => {
    try {
      const token = await csrf.getToken();
      setCsrfToken(token);
    } catch (error) {
      console.error('[ConsultationForm] Failed to initialize CSRF token:', error);
    }
  };
  initCsrf();
}, []);
```

#### CSRF Validation Before Submit:
```typescript
async function handleSubmit() {
  // ... step validation ...
  
  // 🔒 Validate CSRF token before submitting
  if (!csrfToken) {
    const error = 'Security token missing. Please refresh and try again.';
    setSubmitError(error);
    securityLogger.logCsrfValidationFailed();
    return;
  }

  if (!(await csrf.validateToken(csrfToken))) {
    const error = 'Security validation failed. Please refresh and try again.';
    setSubmitError(error);
    securityLogger.logCsrfValidationFailed();
    return;
  }

  // Continue with submission...
}
```

---

### 3️⃣ FRONTEND: Payload Preparation & Sanitization

**Location:** `src/components/ConsultationForm.tsx`

All form data is sanitized **again** before sending to the backend:

```typescript
// 🔒 Sanitize all text fields and validate before submission
const payload = {
  organization_name: sanitizer.sanitizeText(formData.organizationName).trim(),
  industry: sanitizer.sanitizeText(formData.industry).trim(),
  industry_other: sanitizer.sanitizeText(formData.industryOther).trim(),
  country: sanitizer.sanitizeText(formData.country).trim(),
  website: sanitizer.sanitizeUrl(formData.website.trim()),
  employees: sanitizer.sanitizeText(formData.employees).trim(),
  service_areas: formData.serviceAreas, // Already validated as array
  service_area_other: sanitizer.sanitizeText(formData.serviceAreaOther).trim(),
  key_challenge: sanitizer.sanitizeText(formData.keyChallenge).trim(),
  desired_outcome: sanitizer.sanitizeText(formData.desiredOutcome).trim(),
  reform_context: sanitizer.sanitizeText(formData.reformContext).trim(),
  start_date: formData.startDate,
  timeline: sanitizer.sanitizeText(formData.timeline).trim(),
  budget_approved: formData.budgetApproved,
  contact_name: sanitizer.sanitizeText(formData.contactName).trim(),
  contact_email: sanitizer.sanitizeEmail(formData.contactEmail.trim()),
  contact_phone: sanitizer.sanitizePhone(formData.contactPhone.trim()),
  contact_role: sanitizer.sanitizeText(formData.contactRole).trim(),
  approvers: sanitizer.sanitizeText(formData.approvers).trim(),
  partners: sanitizer.sanitizeText(formData.partners).trim(),
  csrf_token: csrfToken, // Include CSRF token with submission
};

// 🔒 Final validation of critical fields
const emailValidation = validate.email(payload.contact_email);
if (!emailValidation.valid) {
  setIsSubmitting(false);
  const error = `Invalid email: ${emailValidation.error}`;
  setSubmitError(error);
  return;
}
```

---

### 4️⃣ FRONTEND: Send to API Gateway

**Location:** `src/lib/secure-api.ts`

The payload is sent to the backend API Gateway via secure `fetch`:

```typescript
export class SecureApiClient {
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

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${this.apiGatewayUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
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

        throw new Error(errorMessage);
      }

      const data: ApiResponse<T> = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`API request failed: ${String(error)}`);
    }
  }
}
```

#### In the Form Component:
```typescript
try {
  // ✅ Use secure backend API instead of direct Supabase call
  // No credentials exposed to frontend, CSRF token included
  const result = await apiClient.submitConsultation(payload);

  if (!result.success) {
    const msg = result.message || 'Submission failed. Please try again.';
    setIsSubmitting(false);
    setSubmitError(msg);
    securityLogger.log(
      SecurityEventType.DATA_MODIFICATION,
      'Consultation form submission failed',
      'failure',
      EventSeverity.WARNING
    );
    return;
  }

  // 🔒 Log successful submission
  securityLogger.log(
    SecurityEventType.DATA_MODIFICATION,
    'Consultation form submitted successfully',
    'success',
    EventSeverity.INFO
  );
} catch (error) {
  setIsSubmitting(false);
  const errorMessage = error instanceof Error ? error.message : 'Network error. Please try again.';
  setSubmitError(errorMessage);
  return;
}

setIsSubmitting(false);
setIsSubmitted(true);
```

---

### 5️⃣ BACKEND: API Gateway Request Handler

**Location:** `supabase/functions/api-gateway/index.ts`

The backend API Gateway processes the request with multiple security layers:

#### Security Headers & CORS:
```typescript
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
```

#### CSRF Token Validation:
```typescript
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
```

#### Input Validation & Sanitization (Backend):
```typescript
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
```

#### Rate Limiting:
```typescript
// Rate limiting
const rateLimit = checkAndRecordRateLimit(clientIp, payload.contact_email);
if (!rateLimit.allowed) {
  console.warn("[API] Rate limit exceeded:", payload.contact_email);
  return new Response(
    JSON.stringify({ success: false, error: rateLimit.message }),
    { status: 429, headers: { ...headers, "Content-Type": "application/json" } }
  );
}

// Rate limits:
// - 1 submission per minute
// - 3 submissions per hour
// - 10 submissions per day
```

---

### 6️⃣ BACKEND: Save to Supabase Database

**Location:** `supabase/functions/api-gateway/index.ts`

The validated payload is saved to the Supabase database:

```typescript
const dbResponse = await fetch(`${supabaseUrl}/rest/v1/consultation_submissions`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${supabaseKey}`,
    apikey: supabaseKey,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

if (!dbResponse.ok) {
  const dbError = await dbResponse.text();
  console.error("[API] Database error:", dbError);
  return new Response(
    JSON.stringify({ success: false, error: "Failed to save submission" }),
    { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
  );
}
```

**Database Table:** `consultation_submissions`

Stores all submission fields with timestamps and security metadata.

---

### 7️⃣ BACKEND: Send to Google Sheets Webhook

**Location:** `supabase/functions/api-gateway/index.ts`

After saving to the database, the data is also sent to Google Sheets (if a webhook URL is configured):

#### Fetch Webhook URL from Settings:
```typescript
// 🔒 Send to Google Sheets webhook if configured
try {
  const webhookResponse = await fetch(`${supabaseUrl}/rest/v1/app_settings?key=eq.google_sheets_webhook`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${supabaseKey}`,
      apikey: supabaseKey,
      "Content-Type": "application/json",
    },
  });

  if (webhookResponse.ok) {
    const settings = await webhookResponse.json();
    if (Array.isArray(settings) && settings.length > 0 && settings[0].value) {
      const webhookUrl = settings[0].value;

      // Validate webhook URL to prevent SSRF
      if (isValidUrl(webhookUrl) && webhookUrl.includes("script.google.com")) {
        try {
          // Send to Google Sheets with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },  // ✅ FIXED: Use text/plain to avoid CORS preflight
            body: JSON.stringify(payload),
            redirect: "error",
            signal: controller.signal,
            credentials: "omit",
          });

          clearTimeout(timeoutId);
          console.log("[API] Google Sheets webhook sent successfully");
        } catch (webhookErr) {
          console.warn(
            "[API] Google Sheets webhook failed:",
            webhookErr instanceof Error ? webhookErr.message : "Unknown error"
          );
          // Don't fail the submission if webhook fails
        }
      } else {
        console.warn("[API] Invalid Google Sheets webhook URL");
      }
    }
  }
} catch (settingsErr) {
  console.warn(
    "[API] Failed to fetch webhook settings:",
    settingsErr instanceof Error ? settingsErr.message : "Unknown error"
  );
  // Don't fail the submission if settings fetch fails
}
```

#### Key Points:
- **Content-Type: `text/plain`** - Avoids CORS preflight OPTIONS request
- **redirect: "error"** - Prevents open redirect attacks
- **5-second timeout** - Prevents hanging requests
- **Webhook URL validation** - Only allows Google Apps Script URLs
- **Non-blocking** - Webhook failures don't fail the main submission

#### Google Apps Script Handler (Apps Script Side):

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = e.parameter || {};

  // Parse service_areas if sent as JSON string
  try {
    data.service_areas = data.service_areas ? JSON.parse(data.service_areas) : [];
  } catch (err) {
    data.service_areas = [];
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp', 'Organization', 'Industry', 'Country', 'Website',
      'Employees', 'Service Areas', 'Key Challenge', 'Desired Outcome',
      'Reform Context', 'Start Date', 'Timeline', 'Budget Approved',
      'Contact Name', 'Contact Email', 'Contact Phone', 'Contact Role',
      'Approvers', 'Partners'
    ]);
  }

  sheet.appendRow([
    new Date().toISOString(),
    data.organization_name || '',
    data.industry || '',
    data.country || '',
    data.website || '',
    data.employees || '',
    (data.service_areas || []).join(', '),
    data.key_challenge || '',
    data.desired_outcome || '',
    data.reform_context || '',
    data.start_date || '',
    data.timeline || '',
    data.budget_approved || '',
    data.contact_name || '',
    data.contact_email || '',
    data.contact_phone || '',
    data.contact_role || '',
    data.approvers || '',
    data.partners || ''
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*');
}
```

---

### 8️⃣ BACKEND: Return Success Response

```typescript
// Success
console.log("[API] Submission success:", payload.contact_email);

return new Response(
  JSON.stringify({
    success: true,
    message: "Submission received successfully",
  }),
  { status: 200, headers: { ...headers, "Content-Type": "application/json" } }
);
```

---

### 9️⃣ FRONTEND: Show Success View

**Location:** `src/components/SuccessView.tsx`

After successful submission, the form displays a success message and allows the user to reset or close the form.

```typescript
if (isSubmitted) {
  return <SuccessView onReset={handleReset} />;
}

function handleReset() {
  setFormData(initialFormData);
  setCurrentStep(1);
  setErrors({});
  setSubmitError('');
  setIsSubmitted(false);
}
```

---

## 🔒 Security Features

### 1. **CSRF Protection**
- CSRF token generated on form load
- Token included in every submission
- Token validated server-side before processing

### 2. **Input Sanitization**
- Frontend sanitization when user types
- Backend re-sanitization before database/webhook
- Prevents XSS, injection attacks, and data corruption

### 3. **Input Validation**
- Frontend validation per step
- Backend validation of entire payload
- Type checking and length limits
- Email format validation
- URL validation for website and webhook fields

### 4. **Rate Limiting**
- Per-minute limit: 1 submission
- Per-hour limit: 3 submissions
- Per-day limit: 10 submissions
- Tracked by IP + email combination

### 5. **Secure API Design**
- No Supabase credentials exposed to frontend
- Service role key kept server-side only
- All requests go through API Gateway
- Same-origin only for credentials

### 6. **CORS Protection**
- Whitelist of allowed origins
- CORS headers only sent to allowed origins
- Prevents cross-origin data leakage

### 7. **Security Headers**
```typescript
const SECURITY_HEADERS = {
  "Content-Security-Policy": "default-src 'self'; script-src 'self'; ...",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
};
```

### 8. **SSRF & Open Redirect Prevention**
- Webhook URL validated against whitelist of Google domains
- Redirect option set to "error" or "manual"
- Blocks arbitrary redirects to attacker-controlled URLs

### 9. **Error Handling**
- Generic error messages to frontend
- Detailed logging server-side
- No information leakage to users or attackers

### 10. **Audit Logging**
- Security events logged with timestamps
- Log types: CSRF failures, invalid inputs, rate limits, successful submissions
- Helps detect and investigate suspicious activity

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 1. Generate CSRF Token                               │  │
│  │ 2. Multi-step form with validation on each step      │  │
│  │ 3. Sanitize inputs as user types                     │  │
│  │ 4. Final sanitization before submission              │  │
│  │ 5. Validate CSRF token                               │  │
│  │ 6. Send payload via secure fetch                     │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │
                    POST /api/consultation/submit
                    Content-Type: application/json
                    x-csrf-token: [token]
                    Payload: {...formData, csrf_token}
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│            BACKEND API GATEWAY (Deno Edge)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 1. Validate CSRF token                               │  │
│  │ 2. Extract client IP                                 │  │
│  │ 3. Validate request body                             │  │
│  │ 4. Sanitize all fields                               │  │
│  │ 5. Check rate limits (IP + email)                    │  │
│  │ 6. Send to Supabase database                         │  │
│  │ 7. Fetch Google Sheets webhook URL                   │  │
│  │ 8. Send to Google Sheets (text/plain)                │  │
│  │ 9. Return success response                           │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────┬──────────────────────────┬───────────────────┘
               │                          │
               ▼                          ▼
    ┌─────────────────────┐    ┌──────────────────────────────┐
    │ SUPABASE DATABASE   │    │ GOOGLE SHEETS WEBHOOK        │
    │ consultation_       │    │ POST Content-Type: text/plain│
    │ submissions table   │    │ Body: {JSON data}            │
    │                     │    │ → Google Apps Script         │
    │ - Stores all fields │    │ → Appends row to sheet       │
    │ - Audit trail       │    │                              │
    │ - Rate limits       │    │ (Non-blocking, ~5s timeout)  │
    └─────────────────────┘    └──────────────────────────────┘
               │
               └─────────────────────────┬────────────────────┘
                                         │
                         Response: {success: true}
                                         │
                                         ▼
                    ┌──────────────────────────────────────┐
                    │  FRONTEND: Show Success Message      │
                    │  Allow user to reset form            │
                    └──────────────────────────────────────┘
```

---

## 🚀 Deployment & Configuration

### Environment Variables Required:
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
ENV=production
```

### Deploy Commands:
```bash
# Deploy API Gateway
supabase functions deploy api-gateway

# Deploy Send to Sheets function (if used separately)
supabase functions deploy send-to-sheets
```

---

## 📝 Example Request/Response

### Request (Frontend → API Gateway):
```json
{
  "organization_name": "Acme Corp",
  "industry": "Technology",
  "industry_other": "",
  "country": "United States",
  "website": "https://acmecorp.com",
  "employees": "50-100",
  "service_areas": ["Strategy", "Operations"],
  "service_area_other": "",
  "key_challenge": "Need to improve operational efficiency",
  "desired_outcome": "Streamlined processes and better team coordination",
  "reform_context": "Digital transformation initiative",
  "start_date": "2024-06-01",
  "timeline": "6 months",
  "budget_approved": true,
  "contact_name": "John Smith",
  "contact_email": "john@acmecorp.com",
  "contact_phone": "+1-555-0100",
  "contact_role": "Chief Operating Officer",
  "approvers": "Board of Directors",
  "partners": "External consulting firm",
  "csrf_token": "abcd1234efgh5678ijkl9012mnop3456"
}
```

### Headers:
```
POST /functions/v1/api-gateway HTTP/1.1
Host: xxxxx.supabase.co
Content-Type: application/json
x-csrf-token: abcd1234efgh5678ijkl9012mnop3456
Origin: https://beehiveassociates.com
```

### Response (Success):
```json
{
  "success": true,
  "message": "Submission received successfully"
}
```

### Response (Error - Rate Limited):
```json
{
  "success": false,
  "error": "Too many requests this hour. Try again later."
}
```

---

## 🐛 Troubleshooting

### Issue: "Security validation failed"
- **Cause**: CSRF token missing or expired
- **Fix**: Refresh the page to get a new token

### Issue: "Invalid email address"
- **Cause**: Email format validation failed
- **Fix**: Enter a valid email (e.g., user@domain.com)

### Issue: "Too many requests"
- **Cause**: Rate limit exceeded
- **Fix**: Wait before submitting again (per-minute: 1, per-hour: 3, per-day: 10)

### Issue: "Submission failed" but data saved
- **Cause**: Likely Google Sheets webhook failed (non-blocking)
- **Status**: Data is in database, Google Sheets sync failed
- **Fix**: Check webhook URL configuration in settings

---

## 📞 Support

For issues or questions about the form submission flow, refer to:
- `src/components/ConsultationForm.tsx` - Frontend form logic
- `src/lib/secure-api.ts` - API client
- `supabase/functions/api-gateway/index.ts` - Backend handler
- `src/lib/validation.ts` - Validation rules
