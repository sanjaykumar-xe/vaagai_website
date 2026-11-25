import type { Database, Json, PricingType } from './database.types'

type CategoryRow = Database['public']['Tables']['categories']['Row']
type ProductImageRow = Database['public']['Tables']['product_images']['Row']
type ProductVariantRow = Database['public']['Tables']['product_variants']['Row']

export interface StorefrontCategory {
  id: string
  slug: string
  name_en: string
  name_ta: string
  description_en: string | null
  description_ta: string | null
  image_path: string | null
  image_url: string | null
  sort_order: number
}

export interface StorefrontImage {
  id: string
  storage_path: string
  public_url: string
  alt_text_en: string | null
  alt_text_ta: string | null
  sort_order: number
  is_primary: boolean
}

export interface StorefrontVariant {
  id: string
  variant_sku: string
  variant_name_en: string
  variant_name_ta: string
  attributes: Json
  price_paise: number
  compare_at_price_paise: number | null
  stock_quantity: number
  weight_grams: number | null
}

export interface StorefrontProduct {
  id: string
  slug: string
  sku: string
  name_en: string
  name_ta: string
  description_en: string | null
  description_ta: string | null
  material: string | null
  pricing_type: PricingType
  base_price_paise: number | null
  compare_at_price_paise: number | null
  is_featured: boolean
  created_at: string
  category: Pick<CategoryRow, 'id' | 'slug' | 'name_en' | 'name_ta'> | null
  images: StorefrontImage[]
  primary_image: StorefrontImage | null
  variants: StorefrontVariant[]
  price_range_paise: {
    min: number | null
    max: number | null
  }
  in_stock: boolean
}

export type PublicCatalogSort =
  | 'newest'
  | 'name_asc'
  | 'name_desc'
  | 'price_asc'
  | 'price_desc'

export interface PublicCatalogOptions {
  page?: number
  pageSize?: number
  categorySlug?: string
  search?: string
  sort?: PublicCatalogSort
  featuredOnly?: boolean
}

export interface PublicCatalogResult {
  items: StorefrontProduct[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export type RawStorefrontCategoryRow = Pick<
  CategoryRow,
  | 'id'
  | 'slug'
  | 'name_en'
  | 'name_ta'
  | 'description_en'
  | 'description_ta'
  | 'image_path'
  | 'sort_order'
>

export type RawStorefrontImageRow = Pick<
  ProductImageRow,
  'id' | 'storage_path' | 'alt_text_en' | 'alt_text_ta' | 'sort_order' | 'is_primary'
>

export type RawStorefrontVariantRow = Pick<
  ProductVariantRow,
  | 'id'
  | 'variant_sku'
  | 'variant_name_en'
  | 'variant_name_ta'
  | 'attributes'
  | 'price_paise'
  | 'compare_at_price_paise'
  | 'stock_quantity'
  | 'weight_grams'
> & { is_active?: boolean }
