-- ==============================================================================
-- VAAGAI METALS TRADERS — COMPLETE PHASE 2B DATABASE SCHEMA & MIGRATION
-- Generated: 2026-11-22
-- Includes: Extensions, Tables, Constraints, Triggers, RLS, Grants, Storage, Seed
-- ==============================================================================

-- 1. EXTENSIONS & CORE FUNCTIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

-- 2. CORE TABLES
-- A. user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'customer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT uq_user_roles_user_role UNIQUE (user_id, role)
);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- B. profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'ta')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, preferred_language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- C. categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL CHECK (slug ~* '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name_en TEXT NOT NULL,
  name_ta TEXT NOT NULL,
  description_en TEXT,
  description_ta TEXT,
  image_path TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON public.categories(sort_order);

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- D. products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  slug TEXT UNIQUE NOT NULL CHECK (slug ~* '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  sku TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_ta TEXT NOT NULL,
  description_en TEXT,
  description_ta TEXT,
  material TEXT,
  pricing_type TEXT NOT NULL DEFAULT 'fixed' CHECK (pricing_type IN ('fixed', 'variant', 'enquiry')),
  base_price_paise BIGINT CHECK (base_price_paise IS NULL OR base_price_paise >= 0),
  compare_at_price_paise BIGINT CHECK (compare_at_price_paise IS NULL OR compare_at_price_paise >= 0),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- E. product_variants
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_sku TEXT UNIQUE NOT NULL,
  variant_name_en TEXT NOT NULL,
  variant_name_ta TEXT NOT NULL,
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  price_paise BIGINT NOT NULL CHECK (price_paise >= 0),
  compare_at_price_paise BIGINT CHECK (compare_at_price_paise IS NULL OR compare_at_price_paise >= 0),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  weight_grams INTEGER CHECK (weight_grams IS NULL OR weight_grams >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(variant_sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_is_active ON public.product_variants(is_active);

CREATE TRIGGER trg_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- F. product_images
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  alt_text_en TEXT,
  alt_text_ta TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_is_primary ON public.product_images(is_primary);
CREATE INDEX IF NOT EXISTS idx_product_images_sort_order ON public.product_images(sort_order);

-- G. store_settings
CREATE TABLE IF NOT EXISTS public.store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_store_settings_key ON public.store_settings(key);

CREATE TRIGGER trg_store_settings_updated_at
  BEFORE UPDATE ON public.store_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- H. audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- 3. ROW LEVEL SECURITY (RLS) & ACCESS CONTROL
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

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.product_variants TO anon, authenticated;
GRANT SELECT ON public.product_images TO anon, authenticated;
GRANT SELECT ON public.store_settings TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;

GRANT ALL ON public.categories TO authenticated;
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.product_variants TO authenticated;
GRANT ALL ON public.product_images TO authenticated;
GRANT ALL ON public.store_settings TO authenticated;
GRANT ALL ON public.user_roles TO authenticated;
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- Policies
CREATE POLICY "user_roles_select_policy" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "user_roles_admin_insert" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "user_roles_admin_update" ON public.user_roles FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "user_roles_admin_delete" ON public.user_roles FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_insert_policy" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_admin()) WITH CHECK (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_delete_policy" ON public.profiles FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "categories_select_policy" ON public.categories FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_admin());
CREATE POLICY "categories_admin_insert" ON public.categories FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "categories_admin_update" ON public.categories FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "categories_admin_delete" ON public.categories FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "products_select_policy" ON public.products FOR SELECT TO anon, authenticated USING (status = 'published' OR public.is_admin());
CREATE POLICY "products_admin_insert" ON public.products FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "products_admin_update" ON public.products FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "products_admin_delete" ON public.products FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "product_variants_select_policy" ON public.product_variants FOR SELECT TO anon, authenticated USING (
  (is_active = true AND EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_variants.product_id AND p.status = 'published'))
  OR public.is_admin()
);
CREATE POLICY "product_variants_admin_insert" ON public.product_variants FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "product_variants_admin_update" ON public.product_variants FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "product_variants_admin_delete" ON public.product_variants FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "product_images_select_policy" ON public.product_images FOR SELECT TO anon, authenticated USING (
  EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_images.product_id AND p.status = 'published')
  OR public.is_admin()
);
CREATE POLICY "product_images_admin_insert" ON public.product_images FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "product_images_admin_update" ON public.product_images FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "product_images_admin_delete" ON public.product_images FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "store_settings_select_policy" ON public.store_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "store_settings_admin_insert" ON public.store_settings FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "store_settings_admin_update" ON public.store_settings FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "store_settings_admin_delete" ON public.store_settings FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "audit_logs_admin_select" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "audit_logs_insert" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- 4. STORAGE CONFIGURATION
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
CREATE POLICY "Admins can update product images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images' AND public.is_admin()) WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
CREATE POLICY "Admins can delete product images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images' AND public.is_admin());

-- 5. GENUINE STRUCTURAL SEED DATA
INSERT INTO public.categories (slug, name_en, name_ta, description_en, description_ta, sort_order, is_active)
VALUES
  ('pooja-items', 'Pooja Items', 'பூஜைப் பொருட்கள்', 'Sacred lamps, bell sets, thali plates, and traditional worship essentials for everyday and festival prayers.', 'தினசரி மற்றும் பண்டிகைக் கால வழிபாட்டிற்கான மங்களகரமான விளக்குகள், மணி மற்றும் பூஜை பாத்திரங்கள்.', 1, true),
  ('brassware', 'Brassware', 'பித்தளைப் பொருட்கள்', 'Handcrafted brass vessels, urulis, serving sets, and heirloom utensils celebrating South Indian tradition.', 'தென்னிந்திய பாரம்பரியத்தைப் பிரதிபலிக்கும் கைவினைப் பித்தளைப் பாத்திரங்கள், உருளிகள் மற்றும் பரிமாறும் பொருட்கள்.', 2, true),
  ('silverware', 'Silverware', 'வெள்ளிப் பொருட்கள்', 'Finely crafted silverware and silver-plated accessories for pooja rooms, auspicious ceremonies, and timeless gifting.', 'பூஜை அறை, மங்களகரமான நிகழ்வுகள் மற்றும் பரிசளிப்பிற்கான நேர்த்தியான வெள்ளிப் பொருட்கள்.', 3, true),
  ('cast-iron', 'Cast Iron', 'வார்ப்பிரும்பு பாத்திரங்கள்', 'Pre-seasoned kadai, dosa tawa, appam pans, and paniyaram pans built to last generations for wholesome cooking.', 'ஆரோக்கியமான சமையலுக்கு தலைமுறை தலைமுறையாக நீடித்து உழைக்கும் தோசைக் கல், கடாய் மற்றும் பணியாரக் கல்.', 4, true),
  ('aluminium', 'Aluminium Products', 'அலுமினியப் பொருட்கள்', 'Durable, lightweight aluminium cookware, degchi pots, steam cookers, and daily kitchen utilities.', 'தினசரி பயன்பாட்டிற்கு உகந்த நீடித்த, எடைக் குறைந்த அலுமினிய சமையல் பாத்திரங்கள்.', 5, true),
  ('traditional-lamps', 'Traditional Lamps', 'பாரம்பரிய விளக்குகள்', 'Authentic Annam vilakku, Kamakshi vilakku, hanging bells, and temple lamps crafted in pure metal.', 'தூய உலோகத்தில் வார்க்கப்பட்ட அன்ன விளக்கு, காமாட்சி விளக்கு மற்றும் பாரம்பரிய கோயில் விளக்குகள்.', 6, true),
  ('kitchen-accessories', 'Kitchen Accessories', 'சமையலறை உபகரணங்கள்', 'Spice containers, ladles, strainers, brass filter coffee makers, and traditional food preparation tools.', 'அஞ்சறைப் பெட்டி, கரண்டிகள், பித்தளை ஃபில்டர் காபி பாத்திரங்கள் மற்றும் சமையலறை உபகரணங்கள்.', 7, true),
  ('decor-gifts', 'Decor & Gifts', 'அலங்காரப் பொருட்கள்', 'Aesthetic metal accents, decorative urlis, wall hangings, and thoughtful gifts for housewarmings and weddings.', 'வீட்டு விசேஷங்கள், திருமணங்கள் மற்றும் இல்ல அலங்காரத்திற்கான அழகான உலோகப் பொருட்கள் மற்றும் உருளிகள்.', 8, true)
ON CONFLICT (slug) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ta = EXCLUDED.name_ta,
  description_en = EXCLUDED.description_en,
  description_ta = EXCLUDED.description_ta,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

INSERT INTO public.store_settings (key, value, description)
VALUES
  ('store_profile', jsonb_build_object(
    'business_name', 'Vaagai Metals Traders',
    'tagline_en', 'Tradition in Every Detail. Quality in Every Product.',
    'tagline_ta', 'ஒவ்வொரு பொருளிலும் பாரம்பரியம். ஒவ்வொரு தேர்விலும் தரம்.',
    'instagram_url', 'https://www.instagram.com/vaagai_metals_traders/',
    'languages', jsonb_build_array('en', 'ta'),
    'default_language', 'en'
  ), 'General store branding and profile details'),
  ('contact_info', jsonb_build_object(
    'phone', null,
    'whatsapp_url', null,
    'address_en', null,
    'address_ta', null,
    'email', null
  ), 'Public customer support and showroom contact details'),
  ('delivery_config', jsonb_build_object(
    'local_delivery_enabled', true,
    'courier_delivery_enabled', true,
    'supported_region', 'Tamil Nadu, India',
    'currency', 'INR',
    'currency_symbol', '₹'
  ), 'Fulfillment, delivery serviceability and regional currency configuration')
ON CONFLICT (key) DO NOTHING;
