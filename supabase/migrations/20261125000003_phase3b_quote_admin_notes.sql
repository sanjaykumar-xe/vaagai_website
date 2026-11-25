-- ==============================================================================
-- Migration: 20261125000003_phase3b_quote_admin_notes.sql
-- Description: Add nullable internal admin_notes to public.quote_requests and
--              ensure quote_requests SELECT is strictly restricted to admins
--              so private business notes are never exposed to non-admins.
-- ==============================================================================

ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Ensure SELECT on quote_requests (including admin_notes) is strictly admin-only.
DROP POLICY IF EXISTS "quote_requests_admin_select" ON public.quote_requests;
CREATE POLICY "quote_requests_admin_select"
  ON public.quote_requests
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "quote_request_items_admin_select" ON public.quote_request_items;
CREATE POLICY "quote_request_items_admin_select"
  ON public.quote_request_items
  FOR SELECT
  TO authenticated
  USING (public.is_admin());
