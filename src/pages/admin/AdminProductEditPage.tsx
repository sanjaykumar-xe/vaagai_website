import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/common/Toast'
import type {
  CategoryRow,
  ProductFormValues,
  ProductImageInput,
  ProductWithDetails,
} from '../../types/product'
import {
  fetchAdminCategories,
  fetchProductById,
  getProductImageUrl,
  updateProduct,
} from '../../services/adminProducts'
import { paiseToRupeesInput } from '../../utils/formatters'
import ProductForm from '../../components/admin/products/ProductForm'
import { LoadingState } from '../../components/admin/products/StateViews'
import Button from '../../components/common/Button'

function mapProductToFormValues(product: ProductWithDetails): ProductFormValues {
  const defaultVariant = product.product_variants[0]

  return {
    name_en: product.name_en,
    name_ta: product.name_ta,
    slug: product.slug,
    sku: product.sku,
    description_en: product.description_en || '',
    description_ta: product.description_ta || '',
    category_id: product.category_id || '',
    material: product.material || '',
    pricing_type: product.pricing_type,
    base_price_rupees: paiseToRupeesInput(product.base_price_paise),
    compare_at_price_rupees: paiseToRupeesInput(product.compare_at_price_paise),
    stock_quantity: String(defaultVariant?.stock_quantity ?? 0),
    low_stock_threshold: '5',
    status: product.status,
    is_featured: product.is_featured,
    variants: product.product_variants.map((v) => ({
      id: v.id,
      variant_sku: v.variant_sku,
      variant_name_en: v.variant_name_en,
      variant_name_ta: v.variant_name_ta,
      price_rupees: paiseToRupeesInput(v.price_paise),
      compare_at_price_rupees: paiseToRupeesInput(v.compare_at_price_paise),
      stock_quantity: String(v.stock_quantity),
      weight_grams: v.weight_grams !== null ? String(v.weight_grams) : '',
      is_active: v.is_active,
    })),
  }
}

export default function AdminProductEditPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [initialValues, setInitialValues] = useState<ProductFormValues | null>(null)
  const [initialImages, setInitialImages] = useState<ProductImageInput[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setLoadError('Invalid product ID.')
      setIsLoading(false)
      return
    }

    let mounted = true
    setIsLoading(true)
    setLoadError(null)

    Promise.all([fetchAdminCategories(), fetchProductById(id)])
      .then(([cats, product]) => {
        if (!mounted) return
        setCategories(cats)
        setInitialValues(mapProductToFormValues(product))
        setInitialImages(
          product.product_images.map((img) => ({
            id: img.id,
            storage_path: img.storage_path,
            preview_url: getProductImageUrl(img.storage_path),
            alt_text_en: img.alt_text_en || '',
            alt_text_ta: img.alt_text_ta || '',
            sort_order: img.sort_order,
            is_primary: img.is_primary,
            is_existing: true,
          })),
        )
      })
      .catch((err) => {
        if (mounted) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load product.')
        }
      })
      .finally(() => {
        if (mounted) setIsLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [id])

  const handleUpdate = async (
    values: ProductFormValues,
    images: ProductImageInput[],
    removedImages: { id: string; storage_path: string }[],
  ) => {
    if (!id) return
    setServerError(null)
    setIsSubmitting(true)
    try {
      await updateProduct(id, values, images, removedImages, user?.id)
      toast(`"${values.name_en}" updated successfully.`)
      navigate('/admin/products', { replace: true })
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Failed to update product.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-burgundy hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to Products</span>
        </Link>
        <h1 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-charcoal">
          Edit Product
        </h1>
        <p className="mt-1 text-sm text-muted">
          Update product details, pricing, stock, visibility, and gallery images.
        </p>
      </div>

      {isLoading ? (
        <LoadingState label="Loading product details..." />
      ) : loadError || !initialValues ? (
        <div
          role="alert"
          className="flex flex-col items-center justify-center rounded-panel border border-red-200 bg-red-50 px-6 py-12 text-center"
        >
          <AlertCircle className="h-8 w-8 text-red-600 mb-2" aria-hidden="true" />
          <p className="text-sm font-medium text-red-800">
            {loadError || 'Product could not be loaded.'}
          </p>
          <Button
            variant="secondary"
            onClick={() => navigate('/admin/products')}
            className="mt-4"
          >
            Return to Products
          </Button>
        </div>
      ) : (
        <ProductForm
          mode="edit"
          categories={categories}
          initialValues={initialValues}
          initialImages={initialImages}
          isSubmitting={isSubmitting}
          serverError={serverError}
          onSubmit={handleUpdate}
        />
      )}
    </div>
  )
}
