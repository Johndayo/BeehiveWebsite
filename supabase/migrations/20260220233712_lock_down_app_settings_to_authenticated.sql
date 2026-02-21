/*
  # Lock down app_settings table to authenticated users only

  1. Security Changes
    - Drop all existing permissive anonymous policies on app_settings
    - Create new restrictive policies that require authentication:
      - Authenticated users can read settings
      - Authenticated users can insert settings
      - Authenticated users can update settings
    - Anonymous users can NO LONGER read or modify settings

  2. Important Notes
    - This prevents unauthenticated visitors from viewing or changing
      the Google Sheets webhook URL (or any future settings)
    - The Settings page will now require login to function
    - The edge function uses service_role_key so it can still read settings
*/

DROP POLICY IF EXISTS "Allow read app settings" ON app_settings;
DROP POLICY IF EXISTS "Allow upsert app settings" ON app_settings;
DROP POLICY IF EXISTS "Allow update app settings" ON app_settings;

CREATE POLICY "Authenticated users can read settings"
  ON app_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert settings"
  ON app_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update settings"
  ON app_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
