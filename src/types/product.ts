import type { Database, PricingType, ProductStatus } from './database.types'

export type CategoryRow = Database['public']['Tables']['categories']['Row']
export type ProductRow = Database['public']['Tables']['products']['Row']
export type ProductVariantRow = Database['public']['Tables']['product_variants']['Row']
export type ProductImageRow = Database['public']['Tables']['product_images']['Row']

export interface ProductWithDetails extends ProductRow {
  category: Pick<CategoryRow, 'id' | 'name_en' | 'name_ta' | 'slug'> | null
  product_images: ProductImageRow[]
  product_variants: ProductVariantRow[]
}

export interface ProductStats {
  total: number
  published: number
  draft: number
  archived: number
  outOfStock: number
}

export type StockFilter = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'
export type ProductSortOption =
  | 'newest'
  | 'oldest'
  | 'name_asc'
  | 'price_asc'
  | 'price_desc'

export interface ProductFiltersState {
  search: string
  categoryId: string
  status: ProductStatus | 'all'
  stock: StockFilter
  sort: ProductSortOption
}

export interface ProductVariantInput {
  id?: string
  variant_sku: string
  variant_name_en: string
  variant_name_ta: string
  price_rupees: string
  compare_at_price_rupees: string
  stock_quantity: string
  weight_grams: string
  is_active: boolean
}

export interface ProductImageInput {
  id?: string
  storage_path?: string
  preview_url: string
  file?: File
  alt_text_en: string
  alt_text_ta: string
  sort_order: number
  is_primary: boolean
  is_existing: boolean
}

export interface ProductFormValues {
  name_en: string
  name_ta: string
  slug: string
  sku: string
  description_en: string
  description_ta: string
  category_id: string
  material: string
  pricing_type: PricingType
  base_price_rupees: string
  compare_at_price_rupees: string
  stock_quantity: string
  low_stock_threshold: string
  status: ProductStatus
  is_featured: boolean
  variants: ProductVariantInput[]
}

export const LOW_STOCK_DEFAULT_THRESHOLD = 5
