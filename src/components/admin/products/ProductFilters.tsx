import { Search, RotateCcw } from 'lucide-react'
import type { CategoryRow, ProductFiltersState, ProductSortOption, StockFilter } from '../../../types/product'
import type { ProductStatus } from '../../../types/database.types'

interface ProductFiltersProps {
  filters: ProductFiltersState
  categories: CategoryRow[]
  onChange: (next: ProductFiltersState) => void
  onReset: () => void
}

export default function ProductFilters({
  filters,
  categories,
  onChange,
  onReset,
}: ProductFiltersProps) {
  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.categoryId !== 'all' ||
    filters.status !== 'all' ||
    filters.stock !== 'all' ||
    filters.sort !== 'newest'

  return (
    <div className="rounded-card border border-sand bg-white p-4 shadow-sm space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
        {/* Search */}
        <div className="md:col-span-4">
          <label htmlFor="product-search" className="sr-only">
            Search products
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              id="product-search"
              type="search"
              value={filters.search}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              placeholder="Search name (EN/TA) or SKU..."
              className="w-full rounded-control border border-sand bg-ivory/40 py-2 pl-9 pr-3 text-sm text-charcoal placeholder:text-muted focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
            />
          </div>
        </div>

        {/* Category */}
        <div className="md:col-span-3">
          <label htmlFor="filter-category" className="sr-only">
            Filter by category
          </label>
          <select
            id="filter-category"
            value={filters.categoryId}
            onChange={(e) => onChange({ ...filters, categoryId: e.target.value })}
            className="w-full rounded-control border border-sand bg-ivory/40 px-3 py-2 text-sm text-charcoal focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name_en} ({cat.name_ta})
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="md:col-span-2">
          <label htmlFor="filter-status" className="sr-only">
            Filter by status
          </label>
          <select
            id="filter-status"
            value={filters.status}
            onChange={(e) =>
              onChange({ ...filters, status: e.target.value as ProductStatus | 'all' })
            }
            className="w-full rounded-control border border-sand bg-ivory/40 px-3 py-2 text-sm text-charcoal focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Stock */}
        <div className="md:col-span-2">
          <label htmlFor="filter-stock" className="sr-only">
            Filter by stock availability
          </label>
          <select
            id="filter-stock"
            value={filters.stock}
            onChange={(e) => onChange({ ...filters, stock: e.target.value as StockFilter })}
            className="w-full rounded-control border border-sand bg-ivory/40 px-3 py-2 text-sm text-charcoal focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
          >
            <option value="all">All Stock</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>

        {/* Sort */}
        <div className="md:col-span-1 lg:col-span-1">
          <label htmlFor="filter-sort" className="sr-only">
            Sort products
          </label>
          <select
            id="filter-sort"
            value={filters.sort}
            onChange={(e) => onChange({ ...filters, sort: e.target.value as ProductSortOption })}
            aria-label="Sort products"
            className="w-full rounded-control border border-sand bg-ivory/40 px-2.5 py-2 text-sm text-charcoal focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name_asc">Name (A–Z)</option>
            <option value="price_asc">Price: Low–High</option>
            <option value="price_desc">Price: High–Low</option>
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-burgundy hover:underline"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Reset Filters</span>
          </button>
        </div>
      )}
    </div>
  )
}
