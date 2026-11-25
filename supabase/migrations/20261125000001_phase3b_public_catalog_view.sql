-- ==============================================================================
-- Migration: 20261125000001_phase3b_public_catalog_view.sql
-- Description: Create SECURITY INVOKER view public.public_catalog_products
--              computing effective_price_paise across fixed, variant, and
--              enquiry pricing types for accurate server-side sorting & pagination
--              while strictly enforcing public RLS policies.
-- ==============================================================================

CREATE OR REPLACE VIEW public.public_catalog_products
WITH (security_invoker = true) AS
SELECT
  p.id,
  p.category_id,
  p.slug,
  p.sku,
  p.name_en,
  p.name_ta,
  p.description_en,
  p.description_ta,
  p.material,
  p.pricing_type,
  p.base_price_paise,
  p.compare_at_price_paise,
  p.status,
  p.is_featured,
  p.created_at,
  p.updated_at,
  CASE
    WHEN p.pricing_type = 'enquiry' THEN NULL
    WHEN p.pricing_type = 'variant' THEN (
      SELECT MIN(pv.price_paise)
      FROM public.product_variants pv
      WHERE pv.product_id = p.id
        AND pv.is_active = true
    )
    ELSE p.base_price_paise
  END AS effective_price_paise
FROM public.products p
WHERE p.status = 'published';

REVOKE ALL ON public.public_catalog_products FROM PUBLIC;
GRANT SELECT ON public.public_catalog_products TO anon, authenticated;
