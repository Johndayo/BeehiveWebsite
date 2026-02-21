/*
  # Add rate limit tracking for consultation submissions

  1. New Tables
    - `submission_rate_limits`
      - `id` (uuid, primary key)
      - `ip_hash` (text, not null) - SHA-256 hash of the client IP (no raw IPs stored)
      - `submitted_at` (timestamptz) - when the submission occurred

  2. Security
    - Enable RLS on the table
    - Allow anonymous inserts (the edge function uses service_role, but just in case)
    - No SELECT/UPDATE/DELETE for anon (they cannot read or manipulate rate limit records)

  3. Index
    - Composite index on (ip_hash, submitted_at) for fast lookups

  4. Notes
    - The edge function will check this table before processing submissions
    - Old records can be cleaned up periodically
    - Storing hashed IPs preserves privacy while enabling rate limiting
*/

CREATE TABLE IF NOT EXISTS submission_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE submission_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_time 
  ON submission_rate_limits (ip_hash, submitted_at);
