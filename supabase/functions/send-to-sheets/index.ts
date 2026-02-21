import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MAX_SUBMISSIONS_PER_HOUR = 5;
const MAX_FIELD_LENGTH = 5000;

function sanitizeString(value: unknown, maxLength = MAX_FIELD_LENGTH): string {
  if (typeof value !== "string") return "";
  return value.slice(0, maxLength).trim();
}

function sanitizeArray(value: unknown, maxItems = 20): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .slice(0, maxItems)
    .map((item) => item.slice(0, 200).trim());
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""));
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const clientIP =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const ipHash = await hashIP(clientIP);

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("submission_rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("submitted_at", oneHourAgo);

    if ((count ?? 0) >= MAX_SUBMISSIONS_PER_HOUR) {
      return new Response(
        JSON.stringify({
          error:
            "Too many submissions. Please wait before trying again.",
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const rawPayload = await req.json();

    const orgName = sanitizeString(rawPayload.organization_name);
    const contactEmail = sanitizeString(rawPayload.contact_email);
    const contactName = sanitizeString(rawPayload.contact_name);
    const keyChallenge = sanitizeString(rawPayload.key_challenge);
    const desiredOutcome = sanitizeString(rawPayload.desired_outcome);

    if (!orgName || !contactName || !keyChallenge || !desiredOutcome) {
      return new Response(
        JSON.stringify({ error: "Required fields are missing." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!contactEmail || !isValidEmail(contactEmail)) {
      return new Response(
        JSON.stringify({ error: "A valid email address is required." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const payload = {
      organization_name: orgName,
      industry: sanitizeString(rawPayload.industry),
      industry_other: sanitizeString(rawPayload.industry_other),
      country: sanitizeString(rawPayload.country),
      website: sanitizeString(rawPayload.website),
      employees: sanitizeString(rawPayload.employees),
      service_areas: sanitizeArray(rawPayload.service_areas),
      service_area_other: sanitizeString(rawPayload.service_area_other),
      key_challenge: keyChallenge,
      desired_outcome: desiredOutcome,
      reform_context: sanitizeString(rawPayload.reform_context),
      start_date: sanitizeString(rawPayload.start_date),
      timeline: sanitizeString(rawPayload.timeline),
      budget_approved: sanitizeString(rawPayload.budget_approved),
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: sanitizeString(rawPayload.contact_phone),
      contact_role: sanitizeString(rawPayload.contact_role),
      approvers: sanitizeString(rawPayload.approvers),
      partners: sanitizeString(rawPayload.partners),
    };

    const { error: dbError } = await supabase
      .from("consultation_submissions")
      .insert(payload);

    if (dbError) {
      return new Response(
        JSON.stringify({ error: "Failed to save submission." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    await supabase
      .from("submission_rate_limits")
      .insert({ ip_hash: ipHash });

    const { data: setting } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "google_sheets_webhook")
      .maybeSingle();

    if (setting?.value) {
      const webhookUrl = setting.value;

      if (
        !webhookUrl.startsWith("https://script.google.com/") &&
        !webhookUrl.startsWith("https://script.googleusercontent.com/")
      ) {
        console.error("Blocked SSRF attempt: webhook URL is not a Google domain");
      } else {
        try {
          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            redirect: "follow",
          });
        } catch (sheetErr) {
          console.error("Google Sheets webhook failed:", String(sheetErr));
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
