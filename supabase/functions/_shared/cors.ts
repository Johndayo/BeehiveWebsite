/**
 * 🔒 CORS Headers Configuration
 * Shared across all Deno Edge Functions
 */

export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-csrf-token, authorization",
  "Access-Control-Max-Age": "86400",
};
