/*
  # Add CSRF token tracking table

  1. New Table
    - `csrf_tokens`
      - `token_hash` (text, primary key)
      - `created_at` (timestamptz, not null, default now())
      - `expires_at` (timestamptz, not null)
      - `client_ip` (text)

  2. Security
    - Enable RLS and deny all direct access for non-service-role clients
    - Service role access bypasses RLS so the edge function can manage tokens safely
*/

CREATE TABLE IF NOT EXISTS csrf_tokens (
  token_hash text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  client_ip text
);

ALTER TABLE csrf_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct client access to csrf tokens"
  ON csrf_tokens
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);
