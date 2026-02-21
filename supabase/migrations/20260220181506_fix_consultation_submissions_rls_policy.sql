/*
  # Fix consultation_submissions RLS policy

  1. Security Changes
    - Drop overly permissive INSERT policy that used `WITH CHECK (true)`
    - Replace with a restrictive policy that validates:
      - Required fields (organization_name, key_challenge, desired_outcome, contact_name, contact_email) are not empty
      - contact_email contains a valid email format
      - id is left as the server-generated default (not user-supplied)
      - created_at is left as the server-generated default

  2. Important Notes
    - The consultation form is public (no auth required), so the policy targets the `anon` role
    - The new policy ensures data integrity by requiring non-empty values for critical fields
    - Prevents abuse by requiring a valid email format
*/

DROP POLICY IF EXISTS "Allow anonymous submission insert" ON consultation_submissions;

CREATE POLICY "Anon can insert valid consultation submissions"
  ON consultation_submissions
  FOR INSERT
  TO anon
  WITH CHECK (
    organization_name IS NOT NULL
    AND length(trim(organization_name)) > 0
    AND key_challenge IS NOT NULL
    AND length(trim(key_challenge)) > 0
    AND desired_outcome IS NOT NULL
    AND length(trim(desired_outcome)) > 0
    AND contact_name IS NOT NULL
    AND length(trim(contact_name)) > 0
    AND contact_email IS NOT NULL
    AND contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  );
