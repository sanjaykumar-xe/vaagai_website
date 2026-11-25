import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  PackageOpen,
  RotateCcw,
  Search,
} from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import {
  fetchActiveCategories,
  fetchAvailableMaterials,
  fetchPublicCatalog,
} from '../services/storefront'
import type {
  PublicCatalogResult,
  PublicCatalogSort,
  StorefrontCategory,
} from '../types/storefront'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import BackToTop from '../components/common/BackToTop'
import ProductCard from '../components/common/ProductCard'
import Button from '../components/common/Button'

const PAGE_SIZE = 12
const VALID_SORTS = new Set<PublicCatalogSort>([
  'newest',
  'name_asc',
  'name_desc',
  'price_asc',
  'price_desc',
])

function CatalogSkeletonGrid() {
  return (
    <div
      className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4"
      aria-busy="true"
      aria-label="Loading products"
    >
      {Array.from({ length: 8 }).map((_, idx) => (
        <div
          key={idx}
          className="flex h-full flex-col overflow-hidden rounded-card border border-sand bg-white animate-pulse"
        >
          <div className="aspect-square bg-ivory" />
          <div className="flex flex-1 flex-col gap-2 p-4">
            <div className="h-4 w-3/4 rounded bg-sand/70" />
            <div className="h-3 w-1/2 rounded bg-sand/50" />
            <div className="mt-2 h-4 w-1/3 rounded bg-sand/70" />
            <div className="mt-auto pt-3">
              <div className="h-10 w-full rounded-control bg-sand/50" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ShopPage() {
  const { lang, t } = useLang()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const categoryParam = searchParams.get('category') || 'all'
  const materialParam = searchParams.get('material') || 'all'
  const qParam = searchParams.get('q') || ''
  const rawSort = searchParams.get('sort') as PublicCatalogSort | null
  const sortParam: PublicCatalogSort = rawSort && VALID_SORTS.has(rawSort) ? rawSort : 'newest'
  const rawPage = Number.parseInt(searchParams.get('page') || '1', 10)
  const pageParam = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1

  const [searchInput, setSearchInput] = useState(qParam)
  const [categories, setCategories] = useState<StorefrontCategory[]>([])
  const [materials, setMaterials] = useState<string[]>([])
  const [catalog, setCatalog] = useState<PublicCatalogResult>({
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: PAGE_SIZE,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Keep local search input in sync if URL query param changes externally (e.g. header search)
  useEffect(() => {
    setSearchInput(qParam)
  }, [qParam])

  // Debounce search input into URL `?q=`
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmed = searchInput.trim()
      if (trimmed !== qParam) {
        const next = new URLSearchParams(searchParams)
        if (trimmed) {
          next.set('q', trimmed)
        } else {
          next.delete('q')
        }
        next.delete('page')
        setSearchParams(next, { replace: true })
      }
    }, 350)
    return () => window.clearTimeout(timer)
  }, [searchInput, qParam, searchParams, setSearchParams])

  // Load filter options (active categories & available materials)
  useEffect(() => {
    let mounted = true
    Promise.all([fetchActiveCategories(), fetchAvailableMaterials()])
      .then(([cats, mats]) => {
        if (!mounted) return
        setCategories(cats)
        setMaterials(mats)
      })
      .catch((err) => {
        console.error('[ShopPage] Failed to load filter options:', err)
      })
    return () => {
      mounted = false
    }
  }, [])

  const loadCatalog = useCallback(
    async (isActiveRef?: { current: boolean }) => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await fetchPublicCatalog({
          page: pageParam,
          pageSize: PAGE_SIZE,
          categorySlug: categoryParam,
          material: materialParam,
          search: qParam,
          sort: sortParam,
        })
        if (!isActiveRef || isActiveRef.current) {
          setCatalog(result)
        }
      } catch (err) {
        if (!isActiveRef || isActiveRef.current) {
          setError(err instanceof Error ? err.message : t('shop.error'))
        }
      } finally {
        if (!isActiveRef || isActiveRef.current) {
          setIsLoading(false)
        }
      }
    },
    [pageParam, categoryParam, materialParam, qParam, sortParam, t],
  )

  useEffect(() => {
    const isActiveRef = { current: true }
    loadCatalog(isActiveRef)
    return () => {
      isActiveRef.current = false
    }
  }, [loadCatalog])

  const updateParam = (key: string, value: string, resetPage = true) => {
    const next = new URLSearchParams(searchParams)
    if (!value || value === 'all' || (key === 'sort' && value === 'newest')) {
      next.delete(key)
    } else {
      next.set(key, value)
    }
    if (resetPage) {
      next.delete('page')
    }
    setSearchParams(next)
  }

  const clearAllFilters = () => {
    setSearchInput('')
    setSearchParams({})
  }

  const hasActiveFilters =
    categoryParam !== 'all' ||
    materialParam !== 'all' ||
    qParam.trim() !== '' ||
    sortParam !== 'newest'

  const activeCategory = categories.find((c) => c.slug === categoryParam)
  const startIdx = catalog.totalCount === 0 ? 0 : (catalog.page - 1) * catalog.pageSize + 1
  const endIdx = Math.min(catalog.totalCount, catalog.page * catalog.pageSize)

  return (
    <div className="flex min-h-screen flex-col bg-ivory/40">
      <Header />

      <main className="flex-1">
        {/* Page Header Banner */}
        <section className="border-b border-sand bg-white">
          <div className="mx-auto max-w-site px-4 py-8 sm:px-6 md:py-12 lg:px-8">
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-burgundy">
              {activeCategory
                ? lang === 'ta' && activeCategory.name_ta
                  ? activeCategory.name_ta
                  : activeCategory.name_en
                : t('shop.title')}
            </h1>
            <p className="mt-2 max-w-2xl text-sm sm:text-base text-muted">
              {activeCategory
                ? (lang === 'ta' ? activeCategory.description_ta : activeCategory.description_en) ||
                  t('shop.desc')
                : t('shop.desc')}
            </p>
          </div>
        </section>

        {/* Filters & Catalogue Grid */}
        <section className="mx-auto max-w-site px-4 py-8 sm:px-6 lg:px-8 space-y-6">
          {/* Filter Bar */}
          <div className="rounded-card border border-sand bg-white p-4 shadow-sm space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
              {/* Search */}
              <div className="md:col-span-4">
                <label htmlFor="shop-search" className="sr-only">
                  {t('a11y.search')}
                </label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                    aria-hidden="true"
                  />
                  <input
                    id="shop-search"
                    type="search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder={t('search.placeholder')}
                    className="min-h-[2.75rem] w-full rounded-control border border-sand bg-ivory/40 py-2 pl-9 pr-3 text-sm text-charcoal placeholder:text-muted focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="md:col-span-3">
                <label htmlFor="shop-category" className="sr-only">
                  {t('nav.categories')}
                </label>
                <select
                  id="shop-category"
                  value={categoryParam}
                  onChange={(e) => updateParam('category', e.target.value)}
                  className="min-h-[2.75rem] w-full rounded-control border border-sand bg-ivory/40 px-3 py-2 text-sm text-charcoal focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
                >
                  <option value="all">{t('shop.allCategories')}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {lang === 'ta' && cat.name_ta
                        ? `${cat.name_ta} (${cat.name_en})`
                        : `${cat.name_en} (${cat.name_ta})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Material Filter */}
              <div className="md:col-span-2">
                <label htmlFor="shop-material" className="sr-only">
                  Material
                </label>
                <select
                  id="shop-material"
                  value={materialParam}
                  onChange={(e) => updateParam('material', e.target.value)}
                  className="min-h-[2.75rem] w-full rounded-control border border-sand bg-ivory/40 px-3 py-2 text-sm text-charcoal focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
                >
                  <option value="all">{t('shop.allMaterials')}</option>
                  {materials.map((mat) => (
                    <option key={mat} value={mat}>
                      {mat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="md:col-span-3">
                <label htmlFor="shop-sort" className="sr-only">
                  Sort products
                </label>
                <select
                  id="shop-sort"
                  value={sortParam}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  className="min-h-[2.75rem] w-full rounded-control border border-sand bg-ivory/40 px-3 py-2 text-sm text-charcoal focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
                >
                  <option value="newest">{t('shop.sort.newest')}</option>
                  <option value="name_asc">{t('shop.sort.nameAsc')}</option>
                  <option value="name_desc">{t('shop.sort.nameDesc')}</option>
                  <option value="price_asc">{t('shop.sort.priceAsc')}</option>
                  <option value="price_desc">{t('shop.sort.priceDesc')}</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-muted">
              <p>
                {isLoading
                  ? 'Loading...'
                  : catalog.totalCount === 0
                  ? '0 products found'
                  : `Showing ${startIdx}–${endIdx} of ${catalog.totalCount} product${
                      catalog.totalCount === 1 ? '' : 's'
                    }`}
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-1.5 font-semibold text-burgundy hover:underline"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t('shop.clearFilters')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Results Grid / States */}
          {isLoading ? (
            <CatalogSkeletonGrid />
          ) : error ? (
            <div
              role="alert"
              className="flex flex-col items-center justify-center rounded-panel border border-sand bg-white px-6 py-12 text-center"
            >
              <AlertCircle className="mb-3 h-8 w-8 text-burgundy" aria-hidden="true" />
              <p className="text-sm font-medium text-charcoal">{t('shop.error')}</p>
              <Button variant="secondary" onClick={() => loadCatalog()} className="mt-4">
                {t('retry')}
              </Button>
            </div>
          ) : catalog.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-panel border border-sand bg-white px-6 py-14 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ivory text-burgundy">
                <PackageOpen className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="font-display text-xl font-semibold text-charcoal">
                {t('shop.emptyTitle')}
              </h2>
              <p className="mt-1.5 max-w-md text-sm text-muted">{t('shop.emptyDesc')}</p>
              {hasActiveFilters && (
                <Button variant="secondary" onClick={clearAllFilters} className="mt-5">
                  {t('shop.clearFilters')}
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
                {catalog.items.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onView={() => navigate(`/products/${encodeURIComponent(product.slug)}`)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {catalog.totalPages > 1 && (
                <nav
                  aria-label="Catalogue pagination"
                  className="flex items-center justify-center gap-3 pt-4"
                >
                  <button
                    type="button"
                    disabled={!catalog.hasPreviousPage}
                    onClick={() => updateParam('page', String(catalog.page - 1), false)}
                    className="inline-flex min-h-[2.5rem] items-center gap-1.5 rounded-control border border-sand bg-white px-4 py-2 text-xs font-semibold text-charcoal hover:bg-ivory disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    <span>{t('shop.prev')}</span>
                  </button>

                  <span className="text-xs font-medium text-charcoal">
                    Page {catalog.page} of {catalog.totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={!catalog.hasNextPage}
                    onClick={() => updateParam('page', String(catalog.page + 1), false)}
                    className="inline-flex min-h-[2.5rem] items-center gap-1.5 rounded-control border border-sand bg-white px-4 py-2 text-xs font-semibold text-charcoal hover:bg-ivory disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span>{t('shop.next')}</span>
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  )
}
