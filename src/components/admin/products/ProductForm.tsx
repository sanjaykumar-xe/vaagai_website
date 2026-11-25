import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Loader2, Plus, Trash2, Save } from 'lucide-react'
import type { PricingType, ProductStatus } from '../../../types/database.types'
import type {
  CategoryRow,
  ProductFormValues,
  ProductImageInput,
  ProductVariantInput,
} from '../../../types/product'
import {
  formatPaiseToINR,
  generateSlug,
  isValidSlug,
  rupeesToPaise,
} from '../../../utils/formatters'
import Button from '../../common/Button'
import ProductImageUploader from './ProductImageUploader'

interface ProductFormProps {
  mode: 'create' | 'edit'
  categories: CategoryRow[]
  initialValues: ProductFormValues
  initialImages: ProductImageInput[]
  isSubmitting: boolean
  serverError: string | null
  onSubmit: (
    values: ProductFormValues,
    images: ProductImageInput[],
    removedImages: { id: string; storage_path: string }[],
  ) => Promise<void>
}

const emptyVariant = (baseSku: string, index: number): ProductVariantInput => ({
  variant_sku: baseSku ? `${baseSku}-V${index + 1}` : '',
  variant_name_en: '',
  variant_name_ta: '',
  price_rupees: '',
  compare_at_price_rupees: '',
  stock_quantity: '0',
  weight_grams: '',
  is_active: true,
})

export default function ProductForm({
  mode,
  categories,
  initialValues,
  initialImages,
  isSubmitting,
  serverError,
  onSubmit,
}: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(initialValues)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(mode === 'edit')
  const [images, setImages] = useState<ProductImageInput[]>(initialImages)
  const [removedImages, setRemovedImages] = useState<{ id: string; storage_path: string }[]>([])
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleNameEnChange = (nameEn: string) => {
    setValues((prev) => ({
      ...prev,
      name_en: nameEn,
      slug: slugManuallyEdited ? prev.slug : generateSlug(nameEn),
    }))
  }

  const handleAddVariant = () => {
    setValues((prev) => ({
      ...prev,
      variants: [...prev.variants, emptyVariant(prev.sku, prev.variants.length)],
    }))
  }

  const handleUpdateVariant = (index: number, patch: Partial<ProductVariantInput>) => {
    setValues((prev) => ({
      ...prev,
      variants: prev.variants.map((v, idx) => (idx === index ? { ...v, ...patch } : v)),
    }))
  }

  const handleRemoveVariant = (index: number) => {
    setValues((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, idx) => idx !== index),
    }))
  }

  const validateForm = (): string | null => {
    if (!values.name_en.trim()) return 'Product name in English is required.'
    if (!values.name_ta.trim()) return 'Product name in Tamil is required.'
    if (!values.slug.trim()) return 'Product slug is required.'
    if (!isValidSlug(values.slug.trim())) {
      return 'Slug may only contain lowercase letters, numbers, and single hyphens (e.g. brass-kuthuvilakku).'
    }
    if (!values.sku.trim()) return 'Product SKU is required.'

    if (values.pricing_type === 'fixed') {
      const selling = rupeesToPaise(values.base_price_rupees)
      if (selling === null || Number.isNaN(selling) || selling < 0) {
        return 'Please enter a valid non-negative selling price in rupees.'
      }
      const mrp = rupeesToPaise(values.compare_at_price_rupees)
      if (Number.isNaN(mrp)) {
        return 'Original price / MRP must be a valid non-negative number.'
      }
      if (mrp !== null && mrp < selling) {
        return 'Original price (MRP) cannot be less than the selling price.'
      }
      const stock = Number(values.stock_quantity)
      if (!Number.isInteger(stock) || stock < 0) {
        return 'Stock quantity must be a whole non-negative number.'
      }
    }

    if (values.pricing_type === 'variant') {
      if (values.variants.length === 0) {
        return 'Please add at least one variant when using Variant Pricing.'
      }
      for (let i = 0; i < values.variants.length; i += 1) {
        const v = values.variants[i]
        if (!v.variant_name_en.trim() || !v.variant_name_ta.trim()) {
          return `Variant #${i + 1} requires both English and Tamil names.`
        }
        if (!v.variant_sku.trim()) {
          return `Variant #${i + 1} requires a unique variant SKU.`
        }
        const vp = rupeesToPaise(v.price_rupees)
        if (vp === null || Number.isNaN(vp) || vp < 0) {
          return `Variant #${i + 1} requires a valid non-negative selling price.`
        }
        const vMrp = rupeesToPaise(v.compare_at_price_rupees)
        if (Number.isNaN(vMrp) || (vMrp !== null && vMrp < vp)) {
          return `Variant #${i + 1} MRP cannot be less than its selling price.`
        }
        const vStock = Number(v.stock_quantity)
        if (!Number.isInteger(vStock) || vStock < 0) {
          return `Variant #${i + 1} stock quantity must be a whole non-negative number.`
        }
      }
    }

    return null
  }

  const handleFormSubmit = async (e: FormEvent, overrideStatus?: ProductStatus) => {
    e.preventDefault()
    setValidationError(null)

    const error = validateForm()
    if (error) {
      setValidationError(error)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const finalValues = overrideStatus ? { ...values, status: overrideStatus } : values
    await onSubmit(finalValues, images, removedImages)
  }

  const displayError = validationError || serverError
  const previewPaise = rupeesToPaise(values.base_price_rupees)

  return (
    <form onSubmit={(e) => handleFormSubmit(e)} className="space-y-6" noValidate>
      {displayError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-card border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
          <p>{displayError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: Core Details, Pricing, Images */}
        <div className="space-y-6 lg:col-span-2">
          {/* A. Basic Information */}
          <section className="rounded-panel border border-sand bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="font-display text-lg font-semibold text-charcoal border-b border-sand pb-3">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name_en" className="block text-xs font-semibold uppercase tracking-wider text-charcoal">
                  Product Name (English) *
                </label>
                <input
                  id="name_en"
                  type="text"
                  required
                  value={values.name_en}
                  onChange={(e) => handleNameEnChange(e.target.value)}
                  placeholder="e.g. Brass Kuthuvilakku 12 Inch"
                  className="mt-1.5 w-full rounded-control border border-sand bg-ivory/30 px-3 py-2 text-sm text-charcoal focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
                />
              </div>

              <div>
                <label htmlFor="name_ta" className="block text-xs font-semibold uppercase tracking-wider text-charcoal">
                  Product Name (Tamil) *
                </label>
                <input
                  id="name_ta"
                  type="text"
                  required
                  value={values.name_ta}
                  onChange={(e) => setValues({ ...values, name_ta: e.target.value })}
                  placeholder="e.g. பித்தளை குத்துவிளக்கு 12 அங்குலம்"
                  className="mt-1.5 w-full rounded-control border border-sand bg-ivory/30 px-3 py-2 text-sm text-charcoal focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="slug" className="block text-xs font-semibold uppercase tracking-wider text-charcoal">
                  URL Slug *
                </label>
                <input
                  id="slug"
                  type="text"
                  required
                  value={values.slug}
                  onChange={(e) => {
                    setSlugManuallyEdited(true)
                    setValues({ ...values, slug: e.target.value.toLowerCase() })
                  }}
                  placeholder="brass-kuthuvilakku-12-inch"
                  className="mt-1.5 w-full rounded-control border border-sand bg-ivory/30 px-3 py-2 font-mono text-xs text-charcoal focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
                />
              </div>

              <div>
                <label htmlFor="sku" className="block text-xs font-semibold uppercase tracking-wider text-charcoal">
                  SKU *
                </label>
                <input
                  id="sku"
                  type="text"
                  required
                  value={values.sku}
                  onChange={(e) => setValues({ ...values, sku: e.target.value.toUpperCase() })}
                  placeholder="VMT-BR-001"
                  className="mt-1.5 w-full rounded-control border border-sand bg-ivory/30 px-3 py-2 font-mono text-xs text-charcoal focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description_en" className="block text-xs font-semibold uppercase tracking-wider text-charcoal">
                Description (English)
              </label>
              <textarea
                id="description_en"
                rows={3}
                value={values.description_en}
                onChange={(e) => setValues({ ...values, description_en: e.target.value })}
                placeholder="Craftsmanship details, dimensions, and traditional usage..."
                className="mt-1.5 w-full rounded-control border border-sand bg-ivory/30 px-3 py-2 text-sm text-charcoal focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
              />
            </div>

            <div>
              <label htmlFor="description_ta" className="block text-xs font-semibold uppercase tracking-wider text-charcoal">
                Description (Tamil)
              </label>
              <textarea
                id="description_ta"
                rows={3}
                value={values.description_ta}
                onChange={(e) => setValues({ ...values, description_ta: e.target.value })}
                placeholder="பொருளின் விவரங்கள் மற்றும் பயன்பாடு..."
                className="mt-1.5 w-full rounded-control border border-sand bg-ivory/30 px-3 py-2 text-sm text-charcoal focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
              />
            </div>
          </section>

          {/* B. Pricing & Inventory */}
          <section className="rounded-panel border border-sand bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-sand pb-3">
              <h2 className="font-display text-lg font-semibold text-charcoal">
                Pricing & Inventory
              </h2>
              <select
                aria-label="Pricing Type"
                value={values.pricing_type}
                onChange={(e) =>
                  setValues({ ...values, pricing_type: e.target.value as PricingType })
                }
                className="rounded-control border border-sand bg-ivory/50 px-3 py-1.5 text-xs font-semibold text-charcoal focus:border-burgundy focus:outline-none"
              >
                <option value="fixed">Fixed Price (Standard)</option>
                <option value="variant">Multiple Variants (Sizes / Weights)</option>
                <option value="enquiry">Enquiry Only (Price on Request)</option>
              </select>
            </div>

            {values.pricing_type === 'fixed' && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="base_price" className="block text-xs font-semibold uppercase tracking-wider text-charcoal">
                    Selling Price (₹) *
                  </label>
                  <input
                    id="base_price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={values.base_price_rupees}
                    onChange={(e) => setValues({ ...values, base_price_rupees: e.target.value })}
                    placeholder="499.00"
                    className="mt-1.5 w-full rounded-control border border-sand bg-ivory/30 px-3 py-2 text-sm text-charcoal focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
                  />
                  {previewPaise !== null && !Number.isNaN(previewPaise) && (
                    <p className="mt-1 text-[0.7rem] text-muted">
                      Stored as {previewPaise.toLocaleString('en-IN')} paise ({formatPaiseToINR(previewPaise)})
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="compare_price" className="block text-xs font-semibold uppercase tracking-wider text-charcoal">
                    Original Price / MRP (₹)
                  </label>
                  <input
                    id="compare_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={values.compare_at_price_rupees}
                    onChange={(e) =>
                      setValues({ ...values, compare_at_price_rupees: e.target.value })
                    }
                    placeholder="599.00"
                    className="mt-1.5 w-full rounded-control border border-sand bg-ivory/30 px-3 py-2 text-sm text-charcoal focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
                  />
                </div>

                <div>
                  <label htmlFor="stock_quantity" className="block text-xs font-semibold uppercase tracking-wider text-charcoal">
                    Stock Quantity *
                  </label>
                  <input
                    id="stock_quantity"
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={values.stock_quantity}
                    onChange={(e) => setValues({ ...values, stock_quantity: e.target.value })}
                    className="mt-1.5 w-full rounded-control border border-sand bg-ivory/30 px-3 py-2 text-sm text-charcoal focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
                  />
                </div>
              </div>
            )}

            {values.pricing_type === 'variant' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted">
                    Define sizes, weights, or capacities with individual SKUs, prices, and stock.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="inline-flex items-center gap-1 rounded-control border border-burgundy/40 bg-white px-3 py-1.5 text-xs font-semibold text-burgundy hover:bg-champagne/30"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Add Variant</span>
                  </button>
                </div>

                {values.variants.map((variant, idx) => (
                  <div
                    key={variant.id || idx}
                    className="rounded-card border border-sand bg-ivory/40 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-burgundy">
                        Variant #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-red-700 hover:underline"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <input
                        type="text"
                        placeholder="Name (EN) e.g. 12 Inch *"
                        value={variant.variant_name_en}
                        onChange={(e) =>
                          handleUpdateVariant(idx, { variant_name_en: e.target.value })
                        }
                        className="rounded-control border border-sand bg-white px-2.5 py-1.5 text-xs text-charcoal focus:border-burgundy focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Name (TA) e.g. 12 அங்குலம் *"
                        value={variant.variant_name_ta}
                        onChange={(e) =>
                          handleUpdateVariant(idx, { variant_name_ta: e.target.value })
                        }
                        className="rounded-control border border-sand bg-white px-2.5 py-1.5 text-xs text-charcoal focus:border-burgundy focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Variant SKU *"
                        value={variant.variant_sku}
                        onChange={(e) =>
                          handleUpdateVariant(idx, { variant_sku: e.target.value.toUpperCase() })
                        }
                        className="rounded-control border border-sand bg-white px-2.5 py-1.5 font-mono text-xs text-charcoal focus:border-burgundy focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Price (₹) *"
                        value={variant.price_rupees}
                        onChange={(e) =>
                          handleUpdateVariant(idx, { price_rupees: e.target.value })
                        }
                        className="rounded-control border border-sand bg-white px-2.5 py-1.5 text-xs text-charcoal focus:border-burgundy focus:outline-none"
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="MRP (₹)"
                        value={variant.compare_at_price_rupees}
                        onChange={(e) =>
                          handleUpdateVariant(idx, { compare_at_price_rupees: e.target.value })
                        }
                        className="rounded-control border border-sand bg-white px-2.5 py-1.5 text-xs text-charcoal focus:border-burgundy focus:outline-none"
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="Stock *"
                        value={variant.stock_quantity}
                        onChange={(e) =>
                          handleUpdateVariant(idx, { stock_quantity: e.target.value })
                        }
                        className="rounded-control border border-sand bg-white px-2.5 py-1.5 text-xs text-charcoal focus:border-burgundy focus:outline-none"
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="Weight (g)"
                        value={variant.weight_grams}
                        onChange={(e) =>
                          handleUpdateVariant(idx, { weight_grams: e.target.value })
                        }
                        className="rounded-control border border-sand bg-white px-2.5 py-1.5 text-xs text-charcoal focus:border-burgundy focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {values.pricing_type === 'enquiry' && (
              <p className="rounded-control border border-sand bg-ivory/60 p-3 text-xs text-muted">
                Enquiry-only items display "Price on Request" on the storefront and invite customers to contact Vaagai Metals Traders directly.
              </p>
            )}
          </section>

          {/* C. Product Images */}
          <section className="rounded-panel border border-sand bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="font-display text-lg font-semibold text-charcoal border-b border-sand pb-3">
              Product Images
            </h2>
            <ProductImageUploader
              images={images}
              onChange={setImages}
              onMarkRemoved={(removed) => setRemovedImages((prev) => [...prev, removed])}
            />
          </section>
        </div>

        {/* Right Column: Organization, Attributes & Actions */}
        <div className="space-y-6">
          <section className="rounded-panel border border-sand bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="font-display text-lg font-semibold text-charcoal border-b border-sand pb-3">
              Organization & Visibility
            </h2>

            <div>
              <label htmlFor="category_id" className="block text-xs font-semibold uppercase tracking-wider text-charcoal">
                Category
              </label>
              <select
                id="category_id"
                value={values.category_id}
                onChange={(e) => setValues({ ...values, category_id: e.target.value })}
                className="mt-1.5 w-full rounded-control border border-sand bg-ivory/30 px-3 py-2 text-sm text-charcoal focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
              >
                <option value="">Uncategorized</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name_en} ({cat.name_ta})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="material" className="block text-xs font-semibold uppercase tracking-wider text-charcoal">
                Material
              </label>
              <input
                id="material"
                type="text"
                value={values.material}
                onChange={(e) => setValues({ ...values, material: e.target.value })}
                placeholder="e.g. Pure Brass, Cast Iron, Silver"
                className="mt-1.5 w-full rounded-control border border-sand bg-ivory/30 px-3 py-2 text-sm text-charcoal focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-xs font-semibold uppercase tracking-wider text-charcoal">
                Visibility Status
              </label>
              <select
                id="status"
                value={values.status}
                onChange={(e) =>
                  setValues({ ...values, status: e.target.value as ProductStatus })
                }
                className="mt-1.5 w-full rounded-control border border-sand bg-ivory/30 px-3 py-2 text-sm text-charcoal focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
              >
                <option value="draft">Draft (Hidden from Storefront)</option>
                <option value="published">Published (Live on Storefront)</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={values.is_featured}
                onChange={(e) => setValues({ ...values, is_featured: e.target.checked })}
                className="h-4 w-4 rounded border-sand text-burgundy focus:ring-burgundy"
              />
              <span className="text-sm font-medium text-charcoal">
                Feature this product
              </span>
            </label>
          </section>

          {/* Action Card */}
          <section className="rounded-panel border border-sand bg-white p-5 sm:p-6 shadow-sm space-y-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Saving Product...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" aria-hidden="true" />
                  <span>{mode === 'create' ? 'Save Product' : 'Save Changes'}</span>
                </>
              )}
            </Button>

            {values.status !== 'published' && (
              <Button
                type="button"
                variant="secondary"
                disabled={isSubmitting}
                onClick={(e) => handleFormSubmit(e, 'published')}
                className="w-full justify-center"
              >
                <span>{mode === 'create' ? 'Create & Publish' : 'Save & Publish'}</span>
              </Button>
            )}

            <Link
              to="/admin/products"
              className="block w-full rounded-control border border-sand bg-ivory/40 py-2.5 text-center text-xs font-semibold text-charcoal hover:bg-ivory transition-colors"
            >
              Cancel
            </Link>
          </section>
        </div>
      </div>
    </form>
  )
}
