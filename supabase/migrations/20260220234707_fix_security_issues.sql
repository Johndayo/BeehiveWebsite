/*
  # Fix Security Issues

  1. Index Cleanup
    - Drop unused index `idx_rate_limits_ip_time` on `submission_rate_limits`

  2. submission_rate_limits RLS Policies
    - Table is only accessed by the edge function using the service role key (bypasses RLS)
    - Add a restrictive SELECT policy for authenticated users so the table is not flagged as having no policies
    - The service role key bypasses RLS, so edge function access is unaffected

  3. app_settings Policy Fixes
    - Replace overly permissive INSERT policy (WITH CHECK was always true)
    - Replace overly permissive UPDATE policy (USING and WITH CHECK were always true)
    - New policies restrict authenticated users to only managing known setting keys
    - SELECT policy also tightened to only return known setting keys

  4. Important Notes
    - No data is dropped or deleted
    - All existing data remains intact
    - Edge function access via service role key is unaffected by RLS changes
*/

-- 1. Drop unused index
DROP INDEX IF EXISTS idx_rate_limits_ip_time;

-- 2. Add a policy for submission_rate_limits so RLS is not flagged as having no policies
-- This table is only accessed via service role (edge function), so we add a
-- restrictive SELECT policy that returns nothing for regular authenticated users.
CREATE POLICY "No direct client access to rate limits"
  ON submission_rate_limits
  FOR SELECT
  TO authenticated
  USING (false);

-- 3. Fix app_settings policies
-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can insert settings" ON app_settings;
DROP POLICY IF EXISTS "Authenticated users can update settings" ON app_settings;
DROP POLICY IF EXISTS "Authenticated users can read settings" ON app_settings;

-- Recreate with proper restrictions scoped to known setting keys
CREATE POLICY "Authenticated users can read known settings"
  ON app_settings
  FOR SELECT
  TO authenticated
  USING (key IN ('google_sheets_webhook'));

CREATE POLICY "Authenticated users can insert known settings"
  ON app_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (key IN ('google_sheets_webhook'));

CREATE POLICY "Authenticated users can update known settings"
  ON app_settings
  FOR UPDATE
  TO authenticated
  USING (key IN ('google_sheets_webhook'))
  WITH CHECK (key IN ('google_sheets_webhook'));
