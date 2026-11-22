-- ==============================================================================
-- Migration: 20261122000005_phase2b_seed_data.sql
-- Description: Baseline structural seed data for Vaagai Metals Traders.
--              Includes genuine categories and default store settings.
--              No fake products, fake prices, or hardcoded admin accounts.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Genuine Product Categories (from src/data/categories.ts & project.md)
-- ------------------------------------------------------------------------------
INSERT INTO public.categories (slug, name_en, name_ta, description_en, description_ta, sort_order, is_active)
VALUES
  (
    'pooja-items',
    'Pooja Items',
    'பூஜைப் பொருட்கள்',
    'Sacred lamps, bell sets, thali plates, and traditional worship essentials for everyday and festival prayers.',
    'தினசரி மற்றும் பண்டிகைக் கால வழிபாட்டிற்கான மங்களகரமான விளக்குகள், மணி மற்றும் பூஜை பாத்திரங்கள்.',
    1,
    true
  ),
  (
    'brassware',
    'Brassware',
    'பித்தளைப் பொருட்கள்',
    'Handcrafted brass vessels, urulis, serving sets, and heirloom utensils celebrating South Indian tradition.',
    'தென்னிந்திய பாரம்பரியத்தைப் பிரதிபலிக்கும் கைவினைப் பித்தளைப் பாத்திரங்கள், உருளிகள் மற்றும் பரிமாறும் பொருட்கள்.',
    2,
    true
  ),
  (
    'silverware',
    'Silverware',
    'வெள்ளிப் பொருட்கள்',
    'Finely crafted silverware and silver-plated accessories for pooja rooms, auspicious ceremonies, and timeless gifting.',
    'பூஜை அறை, மங்களகரமான நிகழ்வுகள் மற்றும் பரிசளிப்பிற்கான நேர்த்தியான வெள்ளிப் பொருட்கள்.',
    3,
    true
  ),
  (
    'cast-iron',
    'Cast Iron',
    'வார்ப்பிரும்பு பாத்திரங்கள்',
    'Pre-seasoned kadai, dosa tawa, appam pans, and paniyaram pans built to last generations for wholesome cooking.',
    'ஆரோக்கியமான சமையலுக்கு தலைமுறை தலைமுறையாக நீடித்து உழைக்கும் தோசைக் கல், கடாய் மற்றும் பணியாரக் கல்.',
    4,
    true
  ),
  (
    'aluminium',
    'Aluminium Products',
    'அலுமினியப் பொருட்கள்',
    'Durable, lightweight aluminium cookware, degchi pots, steam cookers, and daily kitchen utilities.',
    'தினசரி பயன்பாட்டிற்கு உகந்த நீடித்த, எடைக் குறைந்த அலுமினிய சமையல் பாத்திரங்கள்.',
    5,
    true
  ),
  (
    'traditional-lamps',
    'Traditional Lamps',
    'பாரம்பரிய விளக்குகள்',
    'Authentic Annam vilakku, Kamakshi vilakku, hanging bells, and temple lamps crafted in pure metal.',
    'தூய உலோகத்தில் வார்க்கப்பட்ட அன்ன விளக்கு, காமாட்சி விளக்கு மற்றும் பாரம்பரிய கோயில் விளக்குகள்.',
    6,
    true
  ),
  (
    'kitchen-accessories',
    'Kitchen Accessories',
    'சமையலறை உபகரணங்கள்',
    'Spice containers, ladles, strainers, brass filter coffee makers, and traditional food preparation tools.',
    'அஞ்சறைப் பெட்டி, கரண்டிகள், பித்தளை ஃபில்டர் காபி பாத்திரங்கள் மற்றும் சமையலறை உபகரணங்கள்.',
    7,
    true
  ),
  (
    'decor-gifts',
    'Decor & Gifts',
    'அலங்காரப் பொருட்கள்',
    'Aesthetic metal accents, decorative urlis, wall hangings, and thoughtful gifts for housewarmings and weddings.',
    'வீட்டு விசேஷங்கள், திருமணங்கள் மற்றும் இல்ல அலங்காரத்திற்கான அழகான உலோகப் பொருட்கள் மற்றும் உருளிகள்.',
    8,
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ta = EXCLUDED.name_ta,
  description_en = EXCLUDED.description_en,
  description_ta = EXCLUDED.description_ta,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

-- ------------------------------------------------------------------------------
-- 2. Baseline Store Settings
-- ------------------------------------------------------------------------------
INSERT INTO public.store_settings (key, value, description)
VALUES
  (
    'store_profile',
    jsonb_build_object(
      'business_name', 'Vaagai Metals Traders',
      'tagline_en', 'Tradition in Every Detail. Quality in Every Product.',
      'tagline_ta', 'ஒவ்வொரு பொருளிலும் பாரம்பரியம். ஒவ்வொரு தேர்விலும் தரம்.',
      'instagram_url', 'https://www.instagram.com/vaagai_metals_traders/',
      'languages', jsonb_build_array('en', 'ta'),
      'default_language', 'en'
    ),
    'General store branding and profile details'
  ),
  (
    'contact_info',
    jsonb_build_object(
      'phone', null,
      'whatsapp_url', null,
      'address_en', null,
      'address_ta', null,
      'email', null
    ),
    'Public customer support and showroom contact details'
  ),
  (
    'delivery_config',
    jsonb_build_object(
      'local_delivery_enabled', true,
      'courier_delivery_enabled', true,
      'supported_region', 'Tamil Nadu, India',
      'currency', 'INR',
      'currency_symbol', '₹'
    ),
    'Fulfillment, delivery serviceability and regional currency configuration'
  )
ON CONFLICT (key) DO NOTHING;
