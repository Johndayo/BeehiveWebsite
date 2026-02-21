/*
  # Create consultation_submissions table

  1. New Tables
    - `consultation_submissions`
      - `id` (uuid, primary key) - unique submission identifier
      - `organization_name` (text, not null) - name of the submitting organization
      - `industry` (text) - industry/sector of the organization
      - `industry_other` (text) - custom industry if "Other" selected
      - `country` (text) - country of the organization
      - `website` (text) - organization website URL
      - `employees` (text) - employee count range
      - `service_areas` (text array) - selected engagement focus areas
      - `service_area_other` (text) - custom service area if "Other" selected
      - `key_challenge` (text, not null) - primary institutional challenge
      - `desired_outcome` (text, not null) - desired outcome description
      - `reform_context` (text) - broader reform context
      - `start_date` (text) - desired engagement start date
      - `timeline` (text) - proposed timeline
      - `budget_approved` (text, not null) - budget approval status
      - `contact_name` (text, not null) - full name of contact person
      - `contact_email` (text, not null) - email of contact person
      - `contact_phone` (text) - phone number
      - `contact_role` (text) - role/title of contact
      - `approvers` (text) - key decision approvers
      - `partners` (text) - external partners involved
      - `created_at` (timestamptz) - submission timestamp

  2. Security
    - Enable RLS on `consultation_submissions` table
    - Add policy for anonymous users to insert new submissions
    - No SELECT/UPDATE/DELETE policies for anonymous users (data is protected)
*/

CREATE TABLE IF NOT EXISTS consultation_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name text NOT NULL,
  industry text DEFAULT '',
  industry_other text DEFAULT '',
  country text DEFAULT '',
  website text DEFAULT '',
  employees text DEFAULT '',
  service_areas text[] DEFAULT '{}',
  service_area_other text DEFAULT '',
  key_challenge text NOT NULL,
  desired_outcome text NOT NULL,
  reform_context text DEFAULT '',
  start_date text DEFAULT '',
  timeline text DEFAULT '',
  budget_approved text NOT NULL DEFAULT '',
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text DEFAULT '',
  contact_role text DEFAULT '',
  approvers text DEFAULT '',
  partners text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE consultation_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous submission insert"
  ON consultation_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);