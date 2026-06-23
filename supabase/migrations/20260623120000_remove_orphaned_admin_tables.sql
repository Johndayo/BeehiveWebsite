-- Migration: Remove orphaned admin-only app_settings objects
-- This migration removes the legacy admin/management settings table and any
-- security policies specifically attached to it, without touching
-- public.consultation_submissions or other public-facing submission data.

-- Drop app_settings-specific RLS policies if they still exist.
DROP POLICY IF EXISTS "Authenticated users can insert settings" ON public.app_settings;
DROP POLICY IF EXISTS "Authenticated users can update settings" ON public.app_settings;
DROP POLICY IF EXISTS "Authenticated users can read settings" ON public.app_settings;
DROP POLICY IF EXISTS "Allow read app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Allow upsert app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Allow update app settings" ON public.app_settings;

-- Drop the admin-only app_settings table.
DROP TABLE IF EXISTS public.app_settings CASCADE;

-- There are no explicit app_settings database functions found in current SQL migrations.
-- If there are any remaining functions or objects depending on app_settings, the CASCADE above will clean them up safely.
