import { supabase } from '../lib/supabase'
import type { Database, ProductStatus } from '../types/database.types'
import {
  LOW_STOCK_DEFAULT_THRESHOLD,
  type CategoryRow,
  type ProductFiltersState,
  type ProductFormValues,
  type ProductImageInput,
  type ProductStats,
  type ProductWithDetails,
} from '../types/product'
import { rupeesToPaise } from '../utils/formatters'

const PRODUCT_IMAGES_BUCKET = 'product-images'
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

/**
 * Resolve public URL for an image stored in the product-images bucket.
 */
export function getProductImageUrl(storagePath: string): string {
  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}

/**
 * Validate a candidate image file before uploading to Supabase Storage.
 */
export function validateProductImageFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return `"${file.name}" is not a supported format. Please upload JPG, JPEG, PNG, or WebP images.`
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return `"${file.name}" exceeds the 5 MB file size limit.`
  }
  return null
}

/**
 * Translate raw Supabase / PostgreSQL error codes into safe user-facing messages.
 */
export function translateDatabaseError(error: unknown, fallback = 'An unexpected error occurred.'): string {
  if (!error || typeof error !== 'object') return fallback
  const err = error as { code?: string; message?: string; details?: string }
  const msg = (err.message || '').toLowerCase()

  if (err.code === '23505') {
    if (msg.includes('slug')) return 'A product with this URL slug already exists. Please choose a unique slug.'
    if (msg.includes('variant_sku')) return 'A variant with this SKU already exists. Every variant SKU must be unique.'
    if (msg.includes('sku')) return 'A product with this SKU already exists. Please enter a unique SKU.'
    return 'A record with these unique details already exists.'
  }

  if (err.code === '23503') {
    return 'This product cannot be deleted because it is referenced by existing records. Please archive it instead.'
  }

  if (err.code === '23514') {
    if (msg.includes('slug')) return 'Slug may only contain lowercase letters, numbers, and hyphens.'
    return 'One or more fields contain invalid values. Please check your inputs.'
  }

  if (err.code === '42501' || msg.includes('row-level security') || msg.includes('permission denied')) {
    return 'Permission denied. Verified administrator privileges are required for this action.'
  }

  return err.message || fallback
}

/**
 * Best-effort append-only audit log entry.
 */
async function logAdminAudit(
  actorUserId: string | undefined,
  action: string,
  entityId: string,
  metadata: Record<string, unknown>,
): Promise<void> {
  if (!actorUserId) return
  try {
    await supabase.from('audit_logs').insert({
      actor_user_id: actorUserId,
      action,
      entity_type: 'product',
      entity_id: entityId,
      metadata: metadata as Database['public']['Tables']['audit_logs']['Insert']['metadata'],
    })
  } catch (err) {
    console.warn('[Audit] Failed to record audit log:', err)
  }
}

/**
 * Fetch live product summary counts from Supabase.
 */
export async function fetchProductStats(): Promise<ProductStats> {
  const [totalRes, pubRes, draftRes, archRes, prodVariantsRes] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'archived'),
    supabase.from('products').select('id, pricing_type, product_variants(stock_quantity, is_active)'),
  ])

  let outOfStock = 0
  if (prodVariantsRes.data) {
    for (const row of prodVariantsRes.data) {
      if (row.pricing_type === 'enquiry') continue
      const activeVariants = (row.product_variants || []).filter((v) => v.is_active)
      const totalStock = activeVariants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0)
      if (totalStock <= 0) {
        outOfStock += 1
      }
    }
  }

  return {
    total: totalRes.count ?? 0,
    published: pubRes.count ?? 0,
    draft: draftRes.count ?? 0,
    archived: archRes.count ?? 0,
    outOfStock,
  }
}

/**
 * Fetch all categories for product assignment & filtering.
 */
export async function fetchAdminCategories(): Promise<CategoryRow[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    throw new Error(translateDatabaseError(error, 'Failed to load categories.'))
  }
  return data ?? []
}

/**
 * Compute aggregate stock for a product from its active variants.
 */
export function getProductTotalStock(product: ProductWithDetails): number {
  const activeVariants = (product.product_variants || []).filter((v) => v.is_active)
  return activeVariants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0)
}

/**
 * Fetch paginated, filtered, and sorted products for the admin table.
 */
export async function fetchAdminProducts(
  filters: ProductFiltersState,
  page: number,
  pageSize: number,
): Promise<{ items: ProductWithDetails[]; totalCount: number }> {
  // If stock filter is active, resolve matching product IDs first so pagination remains accurate
  let stockMatchedIds: string[] | null = null
  if (filters.stock !== 'all') {
    const { data: stockData, error: stockErr } = await supabase
      .from('products')
      .select('id, pricing_type, product_variants(stock_quantity, is_active)')

    if (stockErr) {
      throw new Error(translateDatabaseError(stockErr, 'Failed to filter products by stock.'))
    }

    stockMatchedIds = (stockData || [])
      .filter((p) => {
        if (p.pricing_type === 'enquiry') {
          return filters.stock === 'in_stock'
        }
        const total = (p.product_variants || [])
          .filter((v) => v.is_active)
          .reduce((sum, v) => sum + (v.stock_quantity || 0), 0)

        if (filters.stock === 'out_of_stock') return total <= 0
        if (filters.stock === 'low_stock') return total > 0 && total <= LOW_STOCK_DEFAULT_THRESHOLD
        if (filters.stock === 'in_stock') return total > 0
        return true
      })
      .map((p) => p.id)

    if (stockMatchedIds.length === 0) {
      return { items: [], totalCount: 0 }
    }
  }

  let query = supabase
    .from('products')
    .select(
      '*, category:categories(id, name_en, name_ta, slug), product_images(*), product_variants(*)',
      { count: 'exact' },
    )

  if (stockMatchedIds !== null) {
    query = query.in('id', stockMatchedIds)
  }

  if (filters.categoryId && filters.categoryId !== 'all') {
    query = query.eq('category_id', filters.categoryId)
  }

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  const trimmedSearch = filters.search.trim()
  if (trimmedSearch) {
    const escaped = trimmedSearch.replace(/[%_]/g, '\\$&')
    query = query.or(
      `name_en.ilike.%${escaped}%,name_ta.ilike.%${escaped}%,sku.ilike.%${escaped}%,description_en.ilike.%${escaped}%,description_ta.ilike.%${escaped}%`,
    )
  }

  switch (filters.sort) {
    case 'oldest':
      query = query.order('created_at', { ascending: true })
      break
    case 'name_asc':
      query = query.order('name_en', { ascending: true })
      break
    case 'price_asc':
      query = query.order('base_price_paise', { ascending: true, nullsFirst: false })
      break
    case 'price_desc':
      query = query.order('base_price_paise', { ascending: false, nullsFirst: false })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, count, error } = await query
  if (error) {
    throw new Error(translateDatabaseError(error, 'Failed to fetch product catalogue.'))
  }

  const items = ((data ?? []) as unknown as ProductWithDetails[]).map((item) => ({
    ...item,
    product_images: [...(item.product_images || [])].sort((a, b) => a.sort_order - b.sort_order),
  }))

  return {
    items,
    totalCount: count ?? 0,
  }
}

/**
 * Fetch a single product with category, images, and variants for editing.
 */
export async function fetchProductById(productId: string): Promise<ProductWithDetails> {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(id, name_en, name_ta, slug), product_images(*), product_variants(*)')
    .eq('id', productId)
    .single()

  if (error || !data) {
    throw new Error(translateDatabaseError(error, 'Product not found or access denied.'))
  }

  const product = data as unknown as ProductWithDetails
  product.product_images = [...(product.product_images || [])].sort((a, b) => a.sort_order - b.sort_order)
  return product
}

/**
 * Upload a single image file to Supabase Storage under `products/{productId}/{uniqueName}`.
 */
async function uploadImageToStorage(productId: string, file: File): Promise<string> {
  const safeExt = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
  const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  const storagePath = `products/${productId}/${uniqueId}.${safeExt}`

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

  if (error) {
    throw new Error(`Failed to upload "${file.name}": ${error.message}`)
  }

  return storagePath
}

/**
 * Create a new product along with its variants and uploaded images.
 * Performs safe cleanup of uploaded storage files if database insertion fails.
 */
export async function createProduct(
  values: ProductFormValues,
  images: ProductImageInput[],
  actorUserId?: string,
): Promise<string> {
  const basePricePaise =
    values.pricing_type === 'enquiry' ? null : rupeesToPaise(values.base_price_rupees)
  const compareAtPaise =
    values.pricing_type === 'enquiry' ? null : rupeesToPaise(values.compare_at_price_rupees)

  const { data: createdProduct, error: productError } = await supabase
    .from('products')
    .insert({
      category_id: values.category_id || null,
      slug: values.slug.trim(),
      sku: values.sku.trim(),
      name_en: values.name_en.trim(),
      name_ta: values.name_ta.trim(),
      description_en: values.description_en.trim() || null,
      description_ta: values.description_ta.trim() || null,
      material: values.material.trim() || null,
      pricing_type: values.pricing_type,
      base_price_paise: basePricePaise,
      compare_at_price_paise: compareAtPaise,
      status: values.status,
      is_featured: values.is_featured,
    })
    .select('id')
    .single()

  if (productError || !createdProduct) {
    throw new Error(translateDatabaseError(productError, 'Failed to create product.'))
  }

  const productId = createdProduct.id
  const uploadedPaths: string[] = []

  try {
    // 1. Insert variants
    if (values.pricing_type === 'variant' && values.variants.length > 0) {
      const variantRows = values.variants.map((v) => ({
        product_id: productId,
        variant_sku: v.variant_sku.trim(),
        variant_name_en: v.variant_name_en.trim(),
        variant_name_ta: v.variant_name_ta.trim(),
        price_paise: rupeesToPaise(v.price_rupees) ?? 0,
        compare_at_price_paise: rupeesToPaise(v.compare_at_price_rupees),
        stock_quantity: Math.max(0, parseInt(v.stock_quantity || '0', 10) || 0),
        weight_grams: v.weight_grams.trim() ? Math.max(0, parseInt(v.weight_grams, 10) || 0) : null,
        is_active: v.is_active,
      }))

      const { error: variantErr } = await supabase.from('product_variants').insert(variantRows)
      if (variantErr) throw variantErr
    } else if (values.pricing_type === 'fixed') {
      const stockQty = Math.max(0, parseInt(values.stock_quantity || '0', 10) || 0)
      const { error: defaultVarErr } = await supabase.from('product_variants').insert({
        product_id: productId,
        variant_sku: `${values.sku.trim()}-STD`,
        variant_name_en: 'Standard',
        variant_name_ta: 'நிலையானது',
        price_paise: basePricePaise ?? 0,
        compare_at_price_paise: compareAtPaise,
        stock_quantity: stockQty,
        is_active: true,
      })
      if (defaultVarErr) throw defaultVarErr
    }

    // 2. Upload images & insert product_images rows
    if (images.length > 0) {
      const imageRows: Database['public']['Tables']['product_images']['Insert'][] = []
      for (let i = 0; i < images.length; i += 1) {
        const img = images[i]
        if (!img.file) continue
        const path = await uploadImageToStorage(productId, img.file)
        uploadedPaths.push(path)
        imageRows.push({
          product_id: productId,
          storage_path: path,
          alt_text_en: img.alt_text_en.trim() || values.name_en.trim(),
          alt_text_ta: img.alt_text_ta.trim() || values.name_ta.trim(),
          sort_order: i,
          is_primary: img.is_primary,
        })
      }

      if (imageRows.length > 0) {
        // Ensure exactly one primary image if none selected
        if (!imageRows.some((r) => r.is_primary)) {
          imageRows[0].is_primary = true
        }
        const { error: imgErr } = await supabase.from('product_images').insert(imageRows)
        if (imgErr) throw imgErr
      }
    }

    await logAdminAudit(actorUserId, 'product.create', productId, {
      sku: values.sku.trim(),
      status: values.status,
    })

    return productId
  } catch (err) {
    // Cleanup uploaded storage objects and rollback product row on failure
    if (uploadedPaths.length > 0) {
      await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(uploadedPaths)
    }
    await supabase.from('products').delete().eq('id', productId)
    throw new Error(translateDatabaseError(err, 'Failed to save product details.'))
  }
}

/**
 * Update an existing product, its variants, and its gallery images.
 */
export async function updateProduct(
  productId: string,
  values: ProductFormValues,
  images: ProductImageInput[],
  removedImages: { id: string; storage_path: string }[],
  actorUserId?: string,
): Promise<void> {
  const basePricePaise =
    values.pricing_type === 'enquiry' ? null : rupeesToPaise(values.base_price_rupees)
  const compareAtPaise =
    values.pricing_type === 'enquiry' ? null : rupeesToPaise(values.compare_at_price_rupees)

  const { error: productError } = await supabase
    .from('products')
    .update({
      category_id: values.category_id || null,
      slug: values.slug.trim(),
      sku: values.sku.trim(),
      name_en: values.name_en.trim(),
      name_ta: values.name_ta.trim(),
      description_en: values.description_en.trim() || null,
      description_ta: values.description_ta.trim() || null,
      material: values.material.trim() || null,
      pricing_type: values.pricing_type,
      base_price_paise: basePricePaise,
      compare_at_price_paise: compareAtPaise,
      status: values.status,
      is_featured: values.is_featured,
    })
    .eq('id', productId)

  if (productError) {
    throw new Error(translateDatabaseError(productError, 'Failed to update product.'))
  }

  // Sync variants cleanly across pricing_type transitions
  const { data: existingVariants, error: existingVarErr } = await supabase
    .from('product_variants')
    .select('id, variant_sku')
    .eq('product_id', productId)

  if (existingVarErr) {
    throw new Error(translateDatabaseError(existingVarErr, 'Failed to load existing product variants.'))
  }

  const existingIds = new Set((existingVariants || []).map((v) => v.id))

  if (values.pricing_type === 'variant') {
    const keptIds = new Set<string>()
    for (const v of values.variants) {
      const payload = {
        product_id: productId,
        variant_sku: v.variant_sku.trim(),
        variant_name_en: v.variant_name_en.trim(),
        variant_name_ta: v.variant_name_ta.trim(),
        price_paise: rupeesToPaise(v.price_rupees) ?? 0,
        compare_at_price_paise: rupeesToPaise(v.compare_at_price_rupees),
        stock_quantity: Math.max(0, parseInt(v.stock_quantity || '0', 10) || 0),
        weight_grams: v.weight_grams.trim() ? Math.max(0, parseInt(v.weight_grams, 10) || 0) : null,
        is_active: v.is_active,
      }
      if (v.id && existingIds.has(v.id)) {
        keptIds.add(v.id)
        const { error: updVarErr } = await supabase
          .from('product_variants')
          .update(payload)
          .eq('id', v.id)
        if (updVarErr) throw new Error(translateDatabaseError(updVarErr))
      } else {
        const { error: insVarErr } = await supabase.from('product_variants').insert(payload)
        if (insVarErr) throw new Error(translateDatabaseError(insVarErr))
      }
    }

    const toDeleteIds = [...existingIds].filter((id) => !keptIds.has(id))
    if (toDeleteIds.length > 0) {
      const { error: delVarErr } = await supabase
        .from('product_variants')
        .delete()
        .in('id', toDeleteIds)
      if (delVarErr) throw new Error(translateDatabaseError(delVarErr))
    }
  } else if (values.pricing_type === 'fixed') {
    const stockQty = Math.max(0, parseInt(values.stock_quantity || '0', 10) || 0)
    const stdSku = `${values.sku.trim()}-STD`
    const retainedVariant =
      existingVariants?.find((v) => v.variant_sku === stdSku) ?? existingVariants?.[0]

    if (retainedVariant) {
      const { error: updErr } = await supabase
        .from('product_variants')
        .update({
          variant_sku: stdSku,
          variant_name_en: 'Standard',
          variant_name_ta: 'நிலையானது',
          price_paise: basePricePaise ?? 0,
          compare_at_price_paise: compareAtPaise,
          stock_quantity: stockQty,
          is_active: true,
        })
        .eq('id', retainedVariant.id)
      if (updErr) throw new Error(translateDatabaseError(updErr))

      const extraIds = [...existingIds].filter((id) => id !== retainedVariant.id)
      if (extraIds.length > 0) {
        const { error: delExtraErr } = await supabase
          .from('product_variants')
          .delete()
          .in('id', extraIds)
        if (delExtraErr) throw new Error(translateDatabaseError(delExtraErr))
      }
    } else {
      const { error: insErr } = await supabase.from('product_variants').insert({
        product_id: productId,
        variant_sku: stdSku,
        variant_name_en: 'Standard',
        variant_name_ta: 'நிலையானது',
        price_paise: basePricePaise ?? 0,
        compare_at_price_paise: compareAtPaise,
        stock_quantity: stockQty,
        is_active: true,
      })
      if (insErr) throw new Error(translateDatabaseError(insErr))
    }
  } else if (values.pricing_type === 'enquiry') {
    // Remove obsolete variants when switching to enquiry-only pricing
    if (existingIds.size > 0) {
      const { error: delAllErr } = await supabase
        .from('product_variants')
        .delete()
        .in('id', [...existingIds])
      if (delAllErr) throw new Error(translateDatabaseError(delAllErr))
    }
  }

  // Delete removed images from DB and Storage
  if (removedImages.length > 0) {
    const idsToDelete = removedImages.map((r) => r.id)
    const pathsToDelete = removedImages.map((r) => r.storage_path).filter(Boolean)
    await supabase.from('product_images').delete().in('id', idsToDelete)
    if (pathsToDelete.length > 0) {
      await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(pathsToDelete)
    }
  }

  // Upload new images and update sort order / primary / alt text on existing images
  const newlyUploadedPaths: string[] = []
  try {
    const hasPrimary = images.some((i) => i.is_primary)
    for (let i = 0; i < images.length; i += 1) {
      const img = images[i]
      const isPrimary = img.is_primary || (!hasPrimary && i === 0)
      if (img.is_existing && img.id) {
        const { error: updImgErr } = await supabase
          .from('product_images')
          .update({
            alt_text_en: img.alt_text_en.trim() || values.name_en.trim(),
            alt_text_ta: img.alt_text_ta.trim() || values.name_ta.trim(),
            sort_order: i,
            is_primary: isPrimary,
          })
          .eq('id', img.id)
        if (updImgErr) throw updImgErr
      } else if (img.file) {
        const path = await uploadImageToStorage(productId, img.file)
        newlyUploadedPaths.push(path)
        const { error: insImgErr } = await supabase.from('product_images').insert({
          product_id: productId,
          storage_path: path,
          alt_text_en: img.alt_text_en.trim() || values.name_en.trim(),
          alt_text_ta: img.alt_text_ta.trim() || values.name_ta.trim(),
          sort_order: i,
          is_primary: isPrimary,
        })
        if (insImgErr) throw insImgErr
      }
    }
  } catch (err) {
    if (newlyUploadedPaths.length > 0) {
      await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(newlyUploadedPaths)
    }
    throw new Error(translateDatabaseError(err, 'Failed to update product images.'))
  }

  await logAdminAudit(actorUserId, 'product.update', productId, {
    sku: values.sku.trim(),
    status: values.status,
  })
}

/**
 * Quick status change (Publish / Unpublish / Archive).
 */
export async function updateProductStatus(
  productId: string,
  status: ProductStatus,
  actorUserId?: string,
): Promise<void> {
  const { error } = await supabase.from('products').update({ status }).eq('id', productId)
  if (error) {
    throw new Error(translateDatabaseError(error, 'Failed to update product status.'))
  }
  await logAdminAudit(actorUserId, `product.status.${status}`, productId, { status })
}

/**
 * Archive or permanently delete a product and its associated storage images.
 */
export async function deleteOrArchiveProduct(
  productId: string,
  mode: 'archive' | 'delete',
  actorUserId?: string,
): Promise<void> {
  if (mode === 'archive') {
    await updateProductStatus(productId, 'archived', actorUserId)
    return
  }

  // Fetch image paths before deleting product (cascade deletes product_images rows)
  const { data: imgRows } = await supabase
    .from('product_images')
    .select('storage_path')
    .eq('product_id', productId)

  const storagePaths = (imgRows || []).map((r) => r.storage_path).filter(Boolean)

  const { error: delError } = await supabase.from('products').delete().eq('id', productId)
  if (delError) {
    throw new Error(translateDatabaseError(delError, 'Failed to delete product.'))
  }

  if (storagePaths.length > 0) {
    await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(storagePaths)
  }

  await logAdminAudit(actorUserId, 'product.delete', productId, {
    deletedImagesCount: storagePaths.length,
  })
}
