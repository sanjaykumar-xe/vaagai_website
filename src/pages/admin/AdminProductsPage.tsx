import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/common/Toast'
import type { ProductStatus } from '../../types/database.types'
import type {
  CategoryRow,
  ProductFiltersState,
  ProductStats,
  ProductWithDetails,
} from '../../types/product'
import {
  deleteOrArchiveProduct,
  fetchAdminCategories,
  fetchAdminProducts,
  fetchProductStats,
  updateProductStatus,
} from '../../services/adminProducts'
import Button from '../../components/common/Button'
import ProductStatsCards from '../../components/admin/products/ProductStatsCards'
import ProductFilters from '../../components/admin/products/ProductFilters'
import ProductTable from '../../components/admin/products/ProductTable'
import ProductDeleteDialog from '../../components/admin/products/ProductDeleteDialog'
import { EmptyState, LoadingState } from '../../components/admin/products/StateViews'

const PAGE_SIZE = 10

const DEFAULT_FILTERS: ProductFiltersState = {
  search: '',
  categoryId: 'all',
  status: 'all',
  stock: 'all',
  sort: 'newest',
}

export default function AdminProductsPage() {
  const { user } = useAuth()
  const toast = useToast()

  const [stats, setStats] = useState<ProductStats>({
    total: 0,
    published: 0,
    draft: 0,
    archived: 0,
    outOfStock: 0,
  })
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [filters, setFilters] = useState<ProductFiltersState>(DEFAULT_FILTERS)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)

  const [products, setProducts] = useState<ProductWithDetails[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoadingList, setIsLoadingList] = useState(true)
  const [listError, setListError] = useState<string | null>(null)

  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProductWithDetails | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Debounce search input (350ms)
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(filters.search)
      setPage(1)
    }, 350)
    return () => window.clearTimeout(timer)
  }, [filters.search])

  const loadStatsAndCategories = useCallback(async () => {
    setIsLoadingStats(true)
    try {
      const [statsData, catData] = await Promise.all([
        fetchProductStats(),
        fetchAdminCategories(),
      ])
      setStats(statsData)
      setCategories(catData)
    } catch (err) {
      console.error('[AdminProducts] Failed to load stats/categories:', err)
    } finally {
      setIsLoadingStats(false)
    }
  }, [])

  useEffect(() => {
    loadStatsAndCategories()
  }, [loadStatsAndCategories])

  const loadProducts = useCallback(async () => {
    setIsLoadingList(true)
    setListError(null)
    try {
      const effectiveFilters: ProductFiltersState = {
        ...filters,
        search: debouncedSearch,
      }
      const { items, totalCount: count } = await fetchAdminProducts(
        effectiveFilters,
        page,
        PAGE_SIZE,
      )
      setProducts(items)
      setTotalCount(count)
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Failed to load products.')
    } finally {
      setIsLoadingList(false)
    }
  }, [
    filters.categoryId,
    filters.status,
    filters.stock,
    filters.sort,
    debouncedSearch,
    page,
  ])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handleFiltersChange = (next: ProductFiltersState) => {
    const searchChanged = next.search !== filters.search
    setFilters(next)
    if (!searchChanged) {
      setPage(1)
    }
  }

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS)
    setDebouncedSearch('')
    setPage(1)
  }

  const handleToggleStatus = async (
    product: ProductWithDetails,
    nextStatus: ProductStatus,
  ) => {
    setUpdatingStatusId(product.id)
    try {
      await updateProductStatus(product.id, nextStatus, user?.id)
      toast(
        nextStatus === 'published'
          ? `"${product.name_en}" is now published.`
          : `"${product.name_en}" moved to ${nextStatus}.`,
      )
      await Promise.all([loadProducts(), loadStatsAndCategories()])
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to update product status.')
    } finally {
      setUpdatingStatusId(null)
    }
  }

  const handleConfirmDelete = async (mode: 'archive' | 'delete') => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteOrArchiveProduct(deleteTarget.id, mode, user?.id)
      toast(
        mode === 'archive'
          ? `"${deleteTarget.name_en}" has been archived.`
          : `"${deleteTarget.name_en}" was permanently deleted.`,
      )
      setDeleteTarget(null)
      await Promise.all([loadProducts(), loadStatsAndCategories()])
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Action failed. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const hasActiveFilters =
    debouncedSearch.trim() !== '' ||
    filters.categoryId !== 'all' ||
    filters.status !== 'all' ||
    filters.stock !== 'all'

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-charcoal">
            Products
          </h1>
          <p className="mt-1 text-sm text-muted">
            Manage your product catalogue, pricing, inventory and visibility.
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-control bg-burgundy px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-wine transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Live Stats */}
      <ProductStatsCards stats={stats} isLoading={isLoadingStats} />

      {/* Search & Filters */}
      <ProductFilters
        filters={filters}
        categories={categories}
        onChange={handleFiltersChange}
        onReset={handleResetFilters}
      />

      {/* Catalogue Table / States */}
      {isLoadingList ? (
        <LoadingState label="Loading product catalogue..." />
      ) : listError ? (
        <div
          role="alert"
          className="flex flex-col items-center justify-center rounded-panel border border-red-200 bg-red-50 px-6 py-10 text-center"
        >
          <AlertCircle className="h-8 w-8 text-red-600 mb-2" aria-hidden="true" />
          <p className="text-sm font-medium text-red-800">{listError}</p>
          <Button variant="secondary" onClick={loadProducts} className="mt-4">
            Try Again
          </Button>
        </div>
      ) : products.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            title="No matching products"
            description="No products matched your current search or filter criteria."
            action={
              <Button variant="secondary" onClick={handleResetFilters}>
                Clear Filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            title="Your catalogue is empty"
            description="Start adding traditional metalware, pooja items, and kitchenware to your Vaagai Metals Traders catalogue."
            action={
              <Link
                to="/admin/products/new"
                className="inline-flex items-center gap-2 rounded-control bg-burgundy px-5 py-2.5 text-sm font-semibold text-white hover:bg-wine transition-colors"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Add Your First Product</span>
              </Link>
            }
          />
        )
      ) : (
        <ProductTable
          products={products}
          page={page}
          pageSize={PAGE_SIZE}
          totalCount={totalCount}
          updatingStatusId={updatingStatusId}
          onPageChange={setPage}
          onToggleStatus={handleToggleStatus}
          onRequestDelete={setDeleteTarget}
        />
      )}

      {/* Confirmation Dialog */}
      <ProductDeleteDialog
        product={deleteTarget}
        isProcessing={isDeleting}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
