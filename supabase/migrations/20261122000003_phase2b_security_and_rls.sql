-- ==============================================================================
-- Migration: 20261122000003_phase2b_security_and_rls.sql
-- Description: Robust Row Level Security (RLS) policies and explicit API grants
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Helper function: is_admin()
-- Evaluates whether the currently authenticated caller has role = 'admin'.
-- SECURITY DEFINER avoids recursive RLS checks on user_roles.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
$$;

-- Restrict function execution: only authenticated and anon roles can invoke it
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- ------------------------------------------------------------------------------
-- 2. Enable RLS on every application table
-- ------------------------------------------------------------------------------
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 3. Explicit SQL Grants for PostgREST API
-- ------------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Public readable tables (access further constrained by RLS)
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.product_variants TO anon, authenticated;
GRANT SELECT ON public.product_images TO anon, authenticated;
GRANT SELECT ON public.store_settings TO anon, authenticated;

-- Customer profile tables
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;

-- Admin management permissions (writes strictly governed by RLS is_admin())
GRANT ALL ON public.categories TO authenticated;
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.product_variants TO authenticated;
GRANT ALL ON public.product_images TO authenticated;
GRANT ALL ON public.store_settings TO authenticated;
GRANT ALL ON public.user_roles TO authenticated;
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;

-- Service role bypass
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- ------------------------------------------------------------------------------
-- 4. Table-by-Table RLS Policies
-- ------------------------------------------------------------------------------

-- 4.A user_roles
-- Users may view their own role; admins may view all roles.
CREATE POLICY "user_roles_select_policy"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- Only admins may grant or revoke roles. Customers cannot self-promote.
CREATE POLICY "user_roles_admin_insert"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "user_roles_admin_update"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "user_roles_admin_delete"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 4.B profiles
-- Users can view their own profile; admins can view all profiles.
CREATE POLICY "profiles_select_policy"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.is_admin());

-- Users can insert their own profile.
CREATE POLICY "profiles_insert_policy"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid() OR public.is_admin());

-- Users can update their own permitted profile fields; admins can update any profile.
CREATE POLICY "profiles_update_policy"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

-- Only admins can delete profiles.
CREATE POLICY "profiles_delete_policy"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 4.C categories
-- Anyone can view active categories. Admins can view all categories.
CREATE POLICY "categories_select_policy"
  ON public.categories
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR public.is_admin());

-- Only admins can insert, update, or delete categories.
CREATE POLICY "categories_admin_insert"
  ON public.categories
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "categories_admin_update"
  ON public.categories
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "categories_admin_delete"
  ON public.categories
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 4.D products
-- Public visitors can only view published products. Admins can view all (draft, archived, published).
CREATE POLICY "products_select_policy"
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published' OR public.is_admin());

-- Only admins can modify products.
CREATE POLICY "products_admin_insert"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "products_admin_update"
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "products_admin_delete"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 4.E product_variants
-- Anyone can view active variants of published products. Admins can view all.
CREATE POLICY "product_variants_select_policy"
  ON public.product_variants
  FOR SELECT
  TO anon, authenticated
  USING (
    (is_active = true AND EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_variants.product_id
        AND p.status = 'published'
    ))
    OR public.is_admin()
  );

-- Only admins can modify variants.
CREATE POLICY "product_variants_admin_insert"
  ON public.product_variants
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "product_variants_admin_update"
  ON public.product_variants
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "product_variants_admin_delete"
  ON public.product_variants
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 4.F product_images
-- Anyone can view images of published products. Admins can view all images.
CREATE POLICY "product_images_select_policy"
  ON public.product_images
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_images.product_id
        AND p.status = 'published'
    )
    OR public.is_admin()
  );

-- Only admins can modify product images.
CREATE POLICY "product_images_admin_insert"
  ON public.product_images
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "product_images_admin_update"
  ON public.product_images
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "product_images_admin_delete"
  ON public.product_images
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 4.G store_settings
-- Anyone can read public business configuration.
CREATE POLICY "store_settings_select_policy"
  ON public.store_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only admins can change store settings.
CREATE POLICY "store_settings_admin_insert"
  ON public.store_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "store_settings_admin_update"
  ON public.store_settings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "store_settings_admin_delete"
  ON public.store_settings
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 4.H audit_logs
-- Only admins can view audit logs.
CREATE POLICY "audit_logs_admin_select"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Authenticated users or database triggers can append audit logs.
CREATE POLICY "audit_logs_insert"
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Explicitly disallow UPDATE and DELETE for all client roles (Append-only security guarantee).
-- By omitting UPDATE and DELETE policies, PostgreSQL denies all updates and deletions on audit_logs.
