/*
  # Create app_settings table

  1. New Tables
    - `app_settings`
      - `id` (uuid, primary key)
      - `key` (text, unique) - setting identifier
      - `value` (text) - setting value
      - `updated_at` (timestamptz) - last update timestamp

  2. Security
    - Enable RLS on `app_settings` table
    - Allow anonymous users to read the google_sheets_webhook setting
    - Allow anonymous users to upsert the google_sheets_webhook setting
      (In a production app this would be restricted to admin/authenticated users,
       but since there is no auth in this project, anonymous access is required)

  3. Notes
    - This table stores application-wide configuration like the Google Sheets webhook URL
    - Uses upsert pattern via unique key constraint
*/

CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read app settings"
  ON app_settings
  FOR SELECT
  TO anon
  USING (key = 'google_sheets_webhook');

CREATE POLICY "Allow upsert app settings"
  ON app_settings
  FOR INSERT
  TO anon
  WITH CHECK (key = 'google_sheets_webhook');

CREATE POLICY "Allow update app settings"
  ON app_settings
  FOR UPDATE
  TO anon
  USING (key = 'google_sheets_webhook')
  WITH CHECK (key = 'google_sheets_webhook');
