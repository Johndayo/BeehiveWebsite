# 🚨 CRITICAL SECURITY FIXES - QUICK START GUIDE

## Do These IMMEDIATELY (This Week)

### 1️⃣ Rotate Supabase Anonymous Key ⏰ 30 min

```bash
# 1. Go to Supabase Dashboard
# 2. Navigate to: Settings → API → Reveal
# 3. Copy the current ANON_KEY (for backup)
# 4. Click "Rotate" button next to ANON_KEY
# 5. Copy the new key
# 6. Update all environments with new key
# 7. Test that old key returns 401 Unauthorized
```

**Why:** Credentials exposed in frontend code and browser DevTools

---

### 2️⃣ Remove Supabase Key from Frontend ⏰ 2 hours

```typescript
// ❌ DELETE THIS: src/lib/supabase.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ✅ REPLACE WITH API GATEWAY: Create backend proxy
// New file: src/lib/api.ts

const API_BASE = process.env.VITE_API_BASE_URL || 'https://beehiveassociates.com/api';

export async function submitConsultationForm(data: any) {
  const response = await fetch(`${API_BASE}/submit-consultation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Submission failed');
  }

  return response.json();
}

// Update ConsultationForm.tsx to use this API instead of direct Supabase call
```

---

### 3️⃣ Fix CORS Misconfiguration ⏰ 1 hour

```typescript
// Update: supabase/functions/send-to-sheets/index.ts

const ALLOWED_ORIGINS = [
  'https://beehiveassociates.com',
  'https://www.beehiveassociates.com',
];

const corsHeaders = (origin: string | null) => {
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "none",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
};

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const headers = corsHeaders(origin);
  
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
    return new Response("CORS blocked", { status: 403, headers });
  }

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers });
  }

  // ... rest of handler
});
```

---

### 4️⃣ Enable HTTPS + HSTS Headers ⏰ 1 hour

**Option A: If using Vercel**
```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' https://fonts.googleapis.com; style-src 'self' https://fonts.googleapis.com 'nonce-{NONCE}'; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co; img-src 'self' data: https:; frame-ancestors 'none';"
        }
      ]
    }
  ]
}
```

**Option B: If using Netlify**
```toml
# netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    Strict-Transport-Security = "max-age=63072000; includeSubDomains; preload"
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    Content-Security-Policy = "default-src 'self'; script-src 'self' https://fonts.googleapis.com; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co; img-src 'self' data: https:; frame-ancestors 'none';"
```

**Option C: If using nginx**
```nginx
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://fonts.googleapis.com; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co; img-src 'self' data: https:; frame-ancestors 'none';" always;
```

---

### 5️⃣ Fix Open Redirect + URL Validation ⏰ 1.5 hours

```typescript
// Update: supabase/functions/send-to-sheets/index.ts

function isValidWebhookUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    
    // Only allow Google domains
    const allowed = ['script.google.com', 'script.googleusercontent.com'];
    if (!allowed.includes(parsed.hostname)) {
      return false;
    }
    
    // HTTPS only
    if (parsed.protocol !== 'https:') {
      return false;
    }
    
    // No path traversal
    if (parsed.pathname.includes('..')) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

// Disable redirect following
const webhookUrl = setting.value;

if (!isValidWebhookUrl(webhookUrl)) {
  console.error("Invalid webhook URL");
  // Skip webhook call
} else {
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "error",  // ✅ Changed from "follow"
    });
  } catch (err) {
    console.error("Webhook failed:", err);
  }
}
```

---

### 6️⃣ Add Rate Limiting to Submissions ⏰ 2 hours

```typescript
// Update: supabase/functions/send-to-sheets/index.ts

const MAX_SUBMISSIONS = {
  per_minute: 1,
  per_hour: 3,
  per_day: 10,
};

async function checkRateLimits(ipHash: string) {
  const now = new Date();
  
  // Per minute
  const lastMin = new Date(now.getTime() - 60000).toISOString();
  const { count: minCount } = await supabase
    .from("submission_rate_limits")
    .select("*", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("submitted_at", lastMin);

  if ((minCount ?? 0) >= MAX_SUBMISSIONS.per_minute) {
    return { allowed: false, status: 429, msg: "Too frequent. Wait 1 minute." };
  }

  // Per hour
  const lastHour = new Date(now.getTime() - 3600000).toISOString();
  const { count: hourCount } = await supabase
    .from("submission_rate_limits")
    .select("*", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("submitted_at", lastHour);

  if ((hourCount ?? 0) >= MAX_SUBMISSIONS.per_hour) {
    return { allowed: false, status: 429, msg: "Too many submissions. Try again in 1 hour." };
  }

  // Per day
  const lastDay = new Date(now.getTime() - 86400000).toISOString();
  const { count: dayCount } = await supabase
    .from("submission_rate_limits")
    .select("*", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("submitted_at", lastDay);

  if ((dayCount ?? 0) >= MAX_SUBMISSIONS.per_day) {
    return { allowed: false, status: 429, msg: "Daily limit reached. Try tomorrow." };
  }

  return { allowed: true };
}

// Check before processing
const rateLimitCheck = await checkRateLimits(ipHash);
if (!rateLimitCheck.allowed) {
  return new Response(
    JSON.stringify({ error: rateLimitCheck.msg }),
    {
      status: rateLimitCheck.status,
      headers: { ...corsHeaders, "Retry-After": "3600" },
    }
  );
}
```

---

### 7️⃣ Add Brute-Force Protection to Login ⏰ 2.5 hours

```typescript
// New file: hooks/useLoginSecurity.ts

export function useLoginSecurity() {
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_MS = 15 * 60 * 1000; // 15 min

  const [attempts, setAttempts] = useState<Array<{timestamp: number, failed: boolean}>>([]);
  const [locked, setLocked] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  function checkLockout(email: string): boolean {
    if (!locked || !lockedUntil) return false;
    
    if (Date.now() > lockedUntil) {
      setLocked(false);
      setAttempts([]);
      return false;
    }
    
    return true;
  }

  function recordFailedAttempt() {
    const recentFailures = attempts
      .filter(a => !a.failed && Date.now() - a.timestamp < 300000) // Last 5 min
      .length + 1;

    setAttempts(prev => [...prev, { timestamp: Date.now(), failed: true }]);

    if (recentFailures >= MAX_ATTEMPTS) {
      setLocked(true);
      setLockedUntil(Date.now() + LOCKOUT_MS);
    }
  }

  function recordSuccessfulAttempt() {
    setAttempts([]);
    setLocked(false);
    setLockedUntil(null);
  }

  return { checkLockout, recordFailedAttempt, recordSuccessfulAttempt, locked, lockedUntil };
}

// Use in LoginPage.tsx
export default function LoginPage({ onLogin, onResetPassword }: LoginPageProps) {
  const { checkLockout, recordFailedAttempt, recordSuccessfulAttempt, locked, lockedUntil } = 
    useLoginSecurity();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (checkLockout(email)) {
      const remaining = Math.ceil((lockedUntil! - Date.now()) / 60000);
      setError(`Account locked. Try again in ${remaining} minutes.`);
      return;
    }

    setLoading(true);
    const { error } = await onLogin(email.trim(), password);
    setLoading(false);

    if (error) {
      recordFailedAttempt();
      setError('Invalid credentials');
    } else {
      recordSuccessfulAttempt();
      // Login successful
    }
  }

  return (
    // ... form JSX
  );
}
```

---

### 8️⃣ Add CSRF Token Protection ⏰ 1.5 hours

```typescript
// New file: lib/csrf.ts
export class CsrfToken {
  static generate(): string {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  }

  static store(token: string) {
    sessionStorage.setItem('csrf', token);
  }

  static get(): string | null {
    return sessionStorage.getItem('csrf');
  }
}

// In App.tsx initialization
useEffect(() => {
  if (!CsrfToken.get()) {
    CsrfToken.store(CsrfToken.generate());
  }
}, []);

// In ConsultationForm.tsx
async function handleSubmit() {
  const csrfToken = CsrfToken.get();
  
  const res = await fetch(sheetsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    body: JSON.stringify(payload),
  });
}

// In backend (supabase function)
function validateCsrfToken(token: string | null): boolean {
  if (!token || token.length !== 64) return false;
  // Validate format (hex string, 64 chars)
  return /^[a-f0-9]{64}$/.test(token);
}

if (req.method === "POST") {
  const csrfToken = req.headers.get("x-csrf-token");
  if (!validateCsrfToken(csrfToken)) {
    return new Response("CSRF validation failed", { status: 403 });
  }
}
```

---

## Testing Checklist

After implementing fixes:

```bash
# 1. Test CORS
curl -X OPTIONS "https://[project].supabase.co/functions/v1/send-to-sheets" \
  -H "Origin: https://attacker.com" \
  -v
# Should NOT return ALLOW-ORIGIN header

# 2. Test HTTPS redirect
curl -I http://beehiveassociates.com
# Should redirect to https://

# 3. Test security headers
curl -I https://beehiveassociates.com | grep -E "HSTS|X-Frame|Content-Security"
# Should show all headers present

# 4. Test rate limiting
for i in {1..10}; do
  curl -X POST "https://[project].supabase.co/functions/v1/send-to-sheets" \
    -H "Content-Type: application/json" \
    -d '{"test":"data"}'
done
# After 1 attempt should return 429 Too Many Requests

# 5. Verify old API key blocked
curl -X GET "https://[project].supabase.co/rest/v1/consultation_submissions?limit=1" \
  -H "Authorization: Bearer [old-key]"
# Should return 401 Unauthorized
```

---

## Deployment Steps

1. **Backup Database**
   ```sql
   -- Backup command (Supabase)
   pg_dump [connection_string] > backup_$(date +%Y%m%d).sql
   ```

2. **Deploy in Order**
   - First: Environment variable updates
   - Second: Security headers configuration
   - Third: API function updates
   - Fourth: Frontend code updates
   - Fifth: Monitor for issues

3. **Verification**
   - Test all forms work correctly
   - Check admin login works
   - Verify Google Sheets integration
   - Monitor error logs for 24 hours

4. **Communicate Changes**
   - Notify users of any changes
   - Update documentation
   - Train admin users if needed

---

## Ongoing Maintenance

### Weekly
- [ ] Review error logs
- [ ] Check for failed login attempts
- [ ] Monitor rate limit blocks

### Monthly
- [ ] Run security scan: `npm audit`
- [ ] Check for dependency updates
- [ ] Review access logs

### Quarterly
- [ ] Full security audit
- [ ] Penetration testing
- [ ] Update security policies

---

## Emergency Contacts

**Security Incident:** security@beehiveassociates.com
**DevOps Support:** devops@beehiveassociates.com
**Admin Access:** Only [person] has admin credentials (stored in secure vault)

---

**Priority:** CRITICAL - Complete by End of Week
**Estimated Time:** 12-15 hours
**Team Required:** 2 developers + 1 DevOps engineer

