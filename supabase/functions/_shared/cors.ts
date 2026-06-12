/**
 * 🔒 CORS Headers Configuration
 * Shared across all Deno Edge Functions
 */

const ALLOWED_ORIGINS = [
  'https://consultbeehive.com',
  'https://www.consultbeehive.com',
];

const DEV_ORIGINS = ['http://localhost:5173', 'http://localhost:3000'];

export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-csrf-token, authorization",
  "Access-Control-Max-Age": "86400",
};

export function validateOrigin(origin: string | null): boolean {
  if (!origin) return false;
  const normalizedOrigin = origin.trim();
  if (ALLOWED_ORIGINS.includes(normalizedOrigin)) return true;
  if (typeof Deno !== 'undefined' && Deno.env.get('ENV') === 'development') {
    return DEV_ORIGINS.includes(normalizedOrigin);
  }
  return false;
}
