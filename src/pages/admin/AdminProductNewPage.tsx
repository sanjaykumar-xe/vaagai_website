import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/common/Toast'
import type {
  CategoryRow,
  ProductFormValues,
  ProductImageInput,
} from '../../types/product'
import { createProduct, fetchAdminCategories } from '../../services/adminProducts'
import ProductForm from '../../components/admin/products/ProductForm'
import { LoadingState } from '../../components/admin/products/StateViews'

const INITIAL_FORM_VALUES: ProductFormValues = {
  name_en: '',
  name_ta: '',
  slug: '',
  sku: '',
  description_en: '',
  description_ta: '',
  category_id: '',
  material: '',
  pricing_type: 'fixed',
  base_price_rupees: '',
  compare_at_price_rupees: '',
  stock_quantity: '0',
  low_stock_threshold: '5',
  status: 'draft',
  is_featured: false,
  variants: [],
}

export default function AdminProductNewPage() {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [isLoadingCats, setIsLoadingCats] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    fetchAdminCategories()
      .then((cats) => {
        if (mounted) setCategories(cats)
      })
      .catch((err) => {
        if (mounted) {
          setServerError(err instanceof Error ? err.message : 'Failed to load categories.')
        }
      })
      .finally(() => {
        if (mounted) setIsLoadingCats(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const handleCreate = async (values: ProductFormValues, images: ProductImageInput[]) => {
    setServerError(null)
    setIsSubmitting(true)
    try {
      await createProduct(values, images, user?.id)
      toast(`"${values.name_en}" created successfully.`)
      navigate('/admin/products', { replace: true })
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Failed to create product.')
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
          Add New Product
        </h1>
        <p className="mt-1 text-sm text-muted">
          Create a bilingual product listing with pricing, stock, and gallery images.
        </p>
      </div>

      {isLoadingCats ? (
        <LoadingState label="Preparing product form..." />
      ) : (
        <ProductForm
          mode="create"
          categories={categories}
          initialValues={INITIAL_FORM_VALUES}
          initialImages={[]}
          isSubmitting={isSubmitting}
          serverError={serverError}
          onSubmit={handleCreate}
        />
      )}
    </div>
  )
}
