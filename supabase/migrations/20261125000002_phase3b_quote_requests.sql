-- ==============================================================================
-- Migration: 20261125000002_phase3b_quote_requests.sql
-- Description: Create quote_requests, quote_request_items, restrictive RLS,
--              and atomic submission RPC public.create_quote_request_atomic.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- A. quote_requests
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL CHECK (char_length(trim(customer_name)) BETWEEN 2 AND 120),
  customer_phone TEXT NOT NULL CHECK (char_length(trim(customer_phone)) BETWEEN 7 AND 25),
  customer_email TEXT,
  customer_location TEXT NOT NULL CHECK (char_length(trim(customer_location)) BETWEEN 2 AND 160),
  additional_notes TEXT,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'accepted', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_quote_requests_reference ON public.quote_requests(reference_number);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON public.quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at ON public.quote_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quote_requests_customer_id ON public.quote_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_phone_created ON public.quote_requests(customer_phone, created_at DESC);

CREATE TRIGGER trg_quote_requests_updated_at
  BEFORE UPDATE ON public.quote_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- B. quote_request_items
-- Preserves historical snapshots even if catalogue products/variants are deleted.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quote_request_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_request_id UUID NOT NULL REFERENCES public.quote_requests(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name_en_snapshot TEXT NOT NULL,
  product_name_ta_snapshot TEXT NOT NULL,
  product_sku_snapshot TEXT NOT NULL,
  variant_name_snapshot TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0 AND quantity <= 999),
  unit_price_paise_snapshot BIGINT CHECK (unit_price_paise_snapshot IS NULL OR unit_price_paise_snapshot >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_quote_request_items_request_id ON public.quote_request_items(quote_request_id);
CREATE INDEX IF NOT EXISTS idx_quote_request_items_product_id ON public.quote_request_items(product_id);
CREATE INDEX IF NOT EXISTS idx_quote_request_items_variant_id ON public.quote_request_items(variant_id);

-- ------------------------------------------------------------------------------
-- C. Row Level Security (Strict Admin-Only Management; No Open Anon Policies)
-- ------------------------------------------------------------------------------
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_request_items ENABLE ROW LEVEL SECURITY;

GRANT SELECT, UPDATE, DELETE ON public.quote_requests TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.quote_request_items TO authenticated;

GRANT ALL ON public.quote_requests TO service_role;
GRANT ALL ON public.quote_request_items TO service_role;

CREATE POLICY "quote_requests_admin_select"
  ON public.quote_requests
  FOR SELECT
  TO authenticated
  USING (public.is_admin() OR (customer_id IS NOT NULL AND customer_id = auth.uid()));

CREATE POLICY "quote_requests_admin_update"
  ON public.quote_requests
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "quote_requests_admin_delete"
  ON public.quote_requests
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "quote_request_items_admin_select"
  ON public.quote_request_items
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.quote_requests qr
      WHERE qr.id = quote_request_items.quote_request_id
        AND qr.customer_id IS NOT NULL
        AND qr.customer_id = auth.uid()
    )
  );

CREATE POLICY "quote_request_items_admin_update"
  ON public.quote_request_items
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "quote_request_items_admin_delete"
  ON public.quote_request_items
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- D. Atomic Quotation Creation RPC (service_role only, invoked by Edge Function)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_quote_request_atomic(
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_customer_email TEXT,
  p_customer_location TEXT,
  p_additional_notes TEXT,
  p_items JSONB,
  p_customer_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  reference_number TEXT,
  status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quote_id UUID;
  v_ref TEXT;
  v_created_at TIMESTAMPTZ;
  v_item JSONB;
  v_product_id UUID;
  v_variant_id UUID;
  v_qty INTEGER;
  v_prod RECORD;
  v_var RECORD;
  v_sku_snap TEXT;
  v_var_name_snap TEXT;
  v_price_snap BIGINT;
BEGIN
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'EMPTY_ITEMS: At least one product is required.';
  END IF;

  IF jsonb_array_length(p_items) > 50 THEN
    RAISE EXCEPTION 'TOO_MANY_ITEMS: Maximum 50 items per quotation request.';
  END IF;

  v_ref := 'VMT-Q-' || to_char(timezone('utc'::text, now()), 'YYYYMMDD') || '-' || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  INSERT INTO public.quote_requests (
    reference_number,
    customer_name,
    customer_phone,
    customer_email,
    customer_location,
    additional_notes,
    customer_id,
    status
  )
  VALUES (
    v_ref,
    trim(p_customer_name),
    trim(p_customer_phone),
    NULLIF(trim(COALESCE(p_customer_email, '')), ''),
    trim(p_customer_location),
    NULLIF(trim(COALESCE(p_additional_notes, '')), ''),
    p_customer_id,
    'new'
  )
  RETURNING quote_requests.id, quote_requests.created_at
  INTO v_quote_id, v_created_at;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_variant_id := NULLIF(v_item->>'variant_id', '')::UUID;
    v_qty := (v_item->>'quantity')::INTEGER;

    IF v_qty IS NULL OR v_qty <= 0 OR v_qty > 999 THEN
      RAISE EXCEPTION 'INVALID_QUANTITY: Quantity must be between 1 and 999.';
    END IF;

    SELECT p.id, p.sku, p.name_en, p.name_ta, p.pricing_type, p.base_price_paise, p.status
    INTO v_prod
    FROM public.products p
    WHERE p.id = v_product_id
      AND p.status = 'published';

    IF NOT FOUND THEN
      RAISE EXCEPTION 'PRODUCT_UNAVAILABLE: One or more selected products are no longer available.';
    END IF;

    v_var := NULL;
    v_sku_snap := v_prod.sku;
    v_var_name_snap := NULL;
    v_price_snap := NULL;

    IF v_prod.pricing_type = 'variant' THEN
      IF v_variant_id IS NULL THEN
        RAISE EXCEPTION 'VARIANT_REQUIRED: A valid option must be selected for %.', v_prod.name_en;
      END IF;

      SELECT pv.id, pv.variant_sku, pv.variant_name_en, pv.price_paise, pv.is_active
      INTO v_var
      FROM public.product_variants pv
      WHERE pv.id = v_variant_id
        AND pv.product_id = v_prod.id
        AND pv.is_active = true;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'VARIANT_UNAVAILABLE: Selected option for % is no longer available.', v_prod.name_en;
      END IF;

      v_sku_snap := v_var.variant_sku;
      v_var_name_snap := v_var.variant_name_en;
      v_price_snap := v_var.price_paise;
    ELSIF v_prod.pricing_type = 'fixed' THEN
      IF v_variant_id IS NOT NULL THEN
        SELECT pv.id, pv.variant_sku, pv.variant_name_en, pv.price_paise, pv.is_active
        INTO v_var
        FROM public.product_variants pv
        WHERE pv.id = v_variant_id
          AND pv.product_id = v_prod.id
          AND pv.is_active = true;

        IF NOT FOUND THEN
          RAISE EXCEPTION 'VARIANT_UNAVAILABLE: Selected option for % is no longer available.', v_prod.name_en;
        END IF;

        v_sku_snap := COALESCE(v_var.variant_sku, v_prod.sku);
        v_var_name_snap := v_var.variant_name_en;
        v_price_snap := COALESCE(v_prod.base_price_paise, v_var.price_paise);
      ELSE
        v_price_snap := v_prod.base_price_paise;
      END IF;
    ELSE
      -- enquiry pricing_type: price snapshot remains NULL (informational only)
      v_price_snap := NULL;
    END IF;

    INSERT INTO public.quote_request_items (
      quote_request_id,
      product_id,
      variant_id,
      product_name_en_snapshot,
      product_name_ta_snapshot,
      product_sku_snapshot,
      variant_name_snapshot,
      quantity,
      unit_price_paise_snapshot
    )
    VALUES (
      v_quote_id,
      v_prod.id,
      CASE WHEN v_var.id IS NOT NULL THEN v_var.id ELSE NULL END,
      v_prod.name_en,
      v_prod.name_ta,
      v_sku_snap,
      v_var_name_snap,
      v_qty,
      v_price_snap
    );
  END LOOP;

  RETURN QUERY SELECT v_quote_id, v_ref, 'new'::TEXT, v_created_at;
END;
$$;

REVOKE ALL ON FUNCTION public.create_quote_request_atomic(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_quote_request_atomic(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, UUID) TO service_role;
