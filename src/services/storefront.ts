import { supabase } from '../lib/supabase'
import type { PricingType } from '../types/database.types'
import type {
  PublicCatalogOptions,
  PublicCatalogResult,
  RawStorefrontCategoryRow,
  RawStorefrontImageRow,
  RawStorefrontVariantRow,
  StorefrontCategory,
  StorefrontImage,
  StorefrontProduct,
  StorefrontVariant,
} from '../types/storefront'
import type { QuoteCartItem } from '../context/QuoteCartContext'
import { isValidSlug } from '../utils/formatters'

const PRODUCT_IMAGES_BUCKET = 'product-images'
const DEFAULT_PAGE_SIZE = 12
const MAX_PAGE_SIZE = 48

export class StorefrontServiceError extends Error {
  readonly code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'StorefrontServiceError'
    this.code = code
  }
}

interface RawProductJoinRow {
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
  category: {
    id: string
    slug: string
    name_en: string
    name_ta: string
    is_active?: boolean
  } | null
  product_images: RawStorefrontImageRow[] | null
  product_variants: RawStorefrontVariantRow[] | null
}

const PUBLIC_PRODUCT_SELECT = `
  id,
  slug,
  sku,
  name_en,
  name_ta,
  description_en,
  description_ta,
  material,
  pricing_type,
  base_price_paise,
  compare_at_price_paise,
  is_featured,
  created_at,
  category:categories (
    id,
    slug,
    name_en,
    name_ta,
    is_active
  ),
  product_images (
    id,
    storage_path,
    alt_text_en,
    alt_text_ta,
    sort_order,
    is_primary
  ),
  product_variants (
    id,
    variant_sku,
    variant_name_en,
    variant_name_ta,
    attributes,
    price_paise,
    compare_at_price_paise,
    stock_quantity,
    weight_grams,
    is_active
  )
`

/**
 * Resolve public URL for an image path in the `product-images` bucket.
 */
export function resolveStoragePublicUrl(storagePath: string | null | undefined): string | null {
  if (!storagePath || !storagePath.trim()) return null
  if (/^https?:\/\//i.test(storagePath)) return storagePath
  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(storagePath)
  return data.publicUrl || null
}

function mapProductRow(row: RawProductJoinRow): StorefrontProduct {
  const images: StorefrontImage[] = [...(row.product_images || [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => ({
      id: img.id,
      storage_path: img.storage_path,
      public_url: resolveStoragePublicUrl(img.storage_path) || '',
      alt_text_en: img.alt_text_en,
      alt_text_ta: img.alt_text_ta,
      sort_order: img.sort_order,
      is_primary: img.is_primary,
    }))
    .filter((img) => img.public_url !== '')

  const primaryImage = images.find((img) => img.is_primary) || images[0] || null

  const activeVariants: StorefrontVariant[] = (row.product_variants || [])
    .filter((v) => v.is_active !== false)
    .map((v) => ({
      id: v.id,
      variant_sku: v.variant_sku,
      variant_name_en: v.variant_name_en,
      variant_name_ta: v.variant_name_ta,
      attributes: v.attributes,
      price_paise: v.price_paise,
      compare_at_price_paise: v.compare_at_price_paise,
      stock_quantity: v.stock_quantity,
      weight_grams: v.weight_grams,
    }))

  let minPrice: number | null = row.base_price_paise
  let maxPrice: number | null = row.base_price_paise

  if (row.pricing_type === 'enquiry') {
    minPrice = null
    maxPrice = null
  } else if (row.pricing_type === 'variant' && activeVariants.length > 0) {
    const prices = activeVariants.map((v) => v.price_paise)
    minPrice = Math.min(...prices)
    maxPrice = Math.max(...prices)
  }

  const inStock =
    row.pricing_type === 'enquiry'
      ? true
      : activeVariants.some((v) => (v.stock_quantity || 0) > 0)

  const activeCategory =
    row.category && row.category.is_active !== false
      ? {
          id: row.category.id,
          slug: row.category.slug,
          name_en: row.category.name_en,
          name_ta: row.category.name_ta,
        }
      : null

  return {
    id: row.id,
    slug: row.slug,
    sku: row.sku,
    name_en: row.name_en,
    name_ta: row.name_ta,
    description_en: row.description_en,
    description_ta: row.description_ta,
    material: row.material,
    pricing_type: row.pricing_type,
    base_price_paise: row.base_price_paise,
    compare_at_price_paise: row.compare_at_price_paise,
    is_featured: row.is_featured,
    created_at: row.created_at,
    category: activeCategory,
    images,
    primary_image: primaryImage,
    variants: activeVariants,
    price_range_paise: {
      min: minPrice,
      max: maxPrice,
    },
    in_stock: inStock,
  }
}

function handleQueryError(error: { message?: string; code?: string } | null, fallback: string): never {
  throw new StorefrontServiceError(error?.message || fallback, error?.code)
}

/**
 * Fetch all active product categories ordered by `sort_order`.
 */
export async function fetchActiveCategories(): Promise<StorefrontCategory[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, slug, name_en, name_ta, description_en, description_ta, image_path, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      handleQueryError(error, 'Unable to load product categories.')
    }

    return ((data ?? []) as RawStorefrontCategoryRow[]).map((cat) => ({
      ...cat,
      image_url: resolveStoragePublicUrl(cat.image_path),
    }))
  } catch (err) {
    if (err instanceof StorefrontServiceError) throw err
    throw new StorefrontServiceError(
      err instanceof Error ? err.message : 'Network error while loading categories.',
    )
  }
}

/**
 * Fetch published and featured products with category, gallery images, and active variants.
 */
export async function fetchFeaturedProducts(limit = 8): Promise<StorefrontProduct[]> {
  try {
    const safeLimit = Math.max(1, Math.min(limit, MAX_PAGE_SIZE))
    const { data, error } = await supabase
      .from('products')
      .select(PUBLIC_PRODUCT_SELECT)
      .eq('status', 'published')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(safeLimit)

    if (error) {
      handleQueryError(error, 'Unable to load featured products.')
    }

    return ((data ?? []) as unknown as RawProductJoinRow[]).map(mapProductRow)
  } catch (err) {
    if (err instanceof StorefrontServiceError) throw err
    throw new StorefrontServiceError(
      err instanceof Error ? err.message : 'Network error while loading featured products.',
    )
  }
}

/**
 * Fetch distinct non-empty material values from published products.
 */
export async function fetchAvailableMaterials(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('public_catalog_products')
      .select('material')
      .not('material', 'is', null)
      .order('material', { ascending: true })

    if (error) {
      handleQueryError(error, 'Unable to load product materials.')
    }

    const unique = new Set<string>()
    for (const row of data ?? []) {
      const m = row.material?.trim()
      if (m) unique.add(m)
    }
    return Array.from(unique)
  } catch (err) {
    if (err instanceof StorefrontServiceError) throw err
    throw new StorefrontServiceError(
      err instanceof Error ? err.message : 'Network error while loading materials.',
    )
  }
}

/**
 * Fetch paginated, filtered, and sorted published products for the public catalogue.
 * Uses `public.public_catalog_products` (SECURITY INVOKER view) for accurate
 * catalogue-wide sorting across fixed, variant, and enquiry pricing types.
 */
export async function fetchPublicCatalog(
  options: PublicCatalogOptions = {},
): Promise<PublicCatalogResult> {
  const page = Math.max(1, Math.floor(options.page ?? 1))
  const pageSize = Math.max(1, Math.min(Math.floor(options.pageSize ?? DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE))

  try {
    let categoryIdFilter: string | null = null

    if (options.categorySlug && options.categorySlug !== 'all') {
      const cleanSlug = options.categorySlug.trim().toLowerCase()
      if (!isValidSlug(cleanSlug)) {
        return {
          items: [],
          totalCount: 0,
          page,
          pageSize,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: page > 1,
        }
      }

      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', cleanSlug)
        .eq('is_active', true)
        .maybeSingle()

      if (catError) {
        handleQueryError(catError, 'Unable to verify selected category.')
      }

      if (!catData) {
        return {
          items: [],
          totalCount: 0,
          page,
          pageSize,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: page > 1,
        }
      }

      categoryIdFilter = catData.id
    }

    let viewQuery = supabase
      .from('public_catalog_products')
      .select('id', { count: 'exact' })

    if (categoryIdFilter) {
      viewQuery = viewQuery.eq('category_id', categoryIdFilter)
    }

    if (options.material && options.material !== 'all') {
      viewQuery = viewQuery.ilike('material', options.material.trim())
    }

    if (options.featuredOnly) {
      viewQuery = viewQuery.eq('is_featured', true)
    }

    const trimmedSearch = options.search?.trim() || ''
    if (trimmedSearch) {
      const escaped = trimmedSearch.replace(/[%_]/g, '\\$&')
      viewQuery = viewQuery.or(
        `name_en.ilike.%${escaped}%,name_ta.ilike.%${escaped}%,description_en.ilike.%${escaped}%,description_ta.ilike.%${escaped}%,material.ilike.%${escaped}%`,
      )
    }

    switch (options.sort) {
      case 'name_asc':
        viewQuery = viewQuery.order('name_en', { ascending: true })
        break
      case 'name_desc':
        viewQuery = viewQuery.order('name_en', { ascending: false })
        break
      case 'price_asc':
        viewQuery = viewQuery
          .order('effective_price_paise', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false })
        break
      case 'price_desc':
        viewQuery = viewQuery
          .order('effective_price_paise', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false })
        break
      case 'newest':
      default:
        viewQuery = viewQuery.order('created_at', { ascending: false })
        break
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    viewQuery = viewQuery.range(from, to)

    const { data: idRows, count, error: viewError } = await viewQuery
    if (viewError) {
      handleQueryError(viewError, 'Unable to load product catalogue.')
    }

    const totalCount = count ?? 0
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
    const orderedIds = (idRows ?? []).map((r) => r.id)

    if (orderedIds.length === 0) {
      return {
        items: [],
        totalCount,
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      }
    }

    const { data: fullRows, error: joinError } = await supabase
      .from('products')
      .select(PUBLIC_PRODUCT_SELECT)
      .eq('status', 'published')
      .in('id', orderedIds)

    if (joinError) {
      handleQueryError(joinError, 'Unable to load product details.')
    }

    const mappedById = new Map<string, StorefrontProduct>()
    for (const row of (fullRows ?? []) as unknown as RawProductJoinRow[]) {
      mappedById.set(row.id, mapProductRow(row))
    }

    const orderedItems = orderedIds
      .map((id) => mappedById.get(id))
      .filter((item): item is StorefrontProduct => Boolean(item))

    return {
      items: orderedItems,
      totalCount,
      page,
      pageSize,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    }
  } catch (err) {
    if (err instanceof StorefrontServiceError) throw err
    throw new StorefrontServiceError(
      err instanceof Error ? err.message : 'Network error while loading product catalogue.',
    )
  }
}

/**
 * Fetch a single published product by its URL slug.
 * Returns `null` if the slug is invalid or the product is unavailable/unpublished.
 */
export async function fetchPublicProductBySlug(slug: string): Promise<StorefrontProduct | null> {
  const cleanSlug = slug.trim().toLowerCase()
  if (!cleanSlug || !isValidSlug(cleanSlug)) {
    return null
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select(PUBLIC_PRODUCT_SELECT)
      .eq('slug', cleanSlug)
      .eq('status', 'published')
      .maybeSingle()

    if (error) {
      handleQueryError(error, 'Unable to load product details.')
    }

    if (!data) {
      return null
    }

    return mapProductRow(data as unknown as RawProductJoinRow)
  } catch (err) {
    if (err instanceof StorefrontServiceError) throw err
    throw new StorefrontServiceError(
      err instanceof Error ? err.message : 'Network error while loading product details.',
    )
  }
}

export interface RevalidatedQuoteLine {
  cartItem: QuoteCartItem
  product: StorefrontProduct
  variant: StorefrontVariant | null
  unitPricePaise: number | null
}

export interface QuoteCartRevalidationResult {
  validLines: RevalidatedQuoteLine[]
  unavailableItems: QuoteCartItem[]
}

/**
 * Revalidate all guest quote cart items against live Supabase published products
 * and active variants. Never trusts client-side cached prices or availability.
 */
export async function revalidateQuoteCartItems(
  cartItems: QuoteCartItem[],
): Promise<QuoteCartRevalidationResult> {
  if (cartItems.length === 0) {
    return { validLines: [], unavailableItems: [] }
  }

  try {
    const productIds = Array.from(new Set(cartItems.map((i) => i.productId)))
    const { data, error } = await supabase
      .from('products')
      .select(PUBLIC_PRODUCT_SELECT)
      .eq('status', 'published')
      .in('id', productIds)

    if (error) {
      handleQueryError(error, 'Unable to verify quote cart items.')
    }

    const byId = new Map<string, StorefrontProduct>()
    for (const row of (data ?? []) as unknown as RawProductJoinRow[]) {
      byId.set(row.id, mapProductRow(row))
    }

    const validLines: RevalidatedQuoteLine[] = []
    const unavailableItems: QuoteCartItem[] = []

    for (const item of cartItems) {
      const product = byId.get(item.productId)
      if (!product) {
        unavailableItems.push(item)
        continue
      }

      if (product.pricing_type === 'variant') {
        if (!item.variantId) {
          unavailableItems.push(item)
          continue
        }
        const matchedVariant = product.variants.find((v) => v.id === item.variantId)
        if (!matchedVariant) {
          unavailableItems.push(item)
          continue
        }
        validLines.push({
          cartItem: item,
          product,
          variant: matchedVariant,
          unitPricePaise: matchedVariant.price_paise,
        })
      } else if (product.pricing_type === 'fixed') {
        const matchedVariant = item.variantId
          ? product.variants.find((v) => v.id === item.variantId) ?? null
          : product.variants.find((v) => v.variant_sku === `${product.sku}-STD`) ||
            product.variants[0] ||
            null

        if (item.variantId && !matchedVariant) {
          unavailableItems.push(item)
          continue
        }

        validLines.push({
          cartItem: item,
          product,
          variant: matchedVariant,
          unitPricePaise: product.base_price_paise,
        })
      } else {
        // Enquiry-only product
        validLines.push({
          cartItem: item,
          product,
          variant: null,
          unitPricePaise: null,
        })
      }
    }

    return { validLines, unavailableItems }
  } catch (err) {
    if (err instanceof StorefrontServiceError) throw err
    throw new StorefrontServiceError(
      err instanceof Error ? err.message : 'Network error while verifying quote cart.',
    )
  }
}

export interface SubmitQuoteRequestInput {
  customer_name: string
  customer_phone: string
  customer_email?: string
  customer_location: string
  additional_notes?: string
  items: { product_id: string; variant_id: string | null; quantity: number }[]
  website?: string
}

export interface SubmitQuoteRequestResponse {
  reference_number: string
  status: string
  created_at: string
}

/**
 * Submit a guest quotation request securely via the Supabase Edge Function.
 */
export async function submitQuoteRequest(
  input: SubmitQuoteRequestInput,
): Promise<SubmitQuoteRequestResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('submit-quote-request', {
      body: input,
    })

    if (error) {
      let message = error.message || 'Unable to submit quotation request.'
      try {
        const ctx = (error as { context?: Response }).context
        if (ctx && typeof ctx.json === 'function') {
          const errBody = (await ctx.json()) as { error?: string }
          if (errBody?.error) message = errBody.error
        }
      } catch {
        // Use fallback error message
      }
      throw new StorefrontServiceError(message)
    }

    const res = data as SubmitQuoteRequestResponse | { error?: string } | null
    if (!res || !('reference_number' in res)) {
      throw new StorefrontServiceError(
        (res && 'error' in res && res.error) || 'Quotation submission failed.',
      )
    }

    return res
  } catch (err) {
    if (err instanceof StorefrontServiceError) throw err
    throw new StorefrontServiceError(
      err instanceof Error ? err.message : 'Network error while submitting quotation request.',
    )
  }
}
