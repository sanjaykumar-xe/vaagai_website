import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Inbox,
  RotateCcw,
  Search,
} from 'lucide-react'
import type { QuoteStatus } from '../../types/database.types'
import {
  QUOTE_STATUS_OPTIONS,
  type QuoteFiltersState,
  type QuoteStats,
  type QuoteSummaryRow,
} from '../../types/quote'
import { fetchAdminQuotes, fetchQuoteStats } from '../../services/adminQuotes'
import Button from '../../components/common/Button'
import QuoteStatsCards from '../../components/admin/quotes/QuoteStatsCards'
import QuoteStatusBadge from '../../components/admin/quotes/QuoteStatusBadge'
import { LoadingState } from '../../components/admin/products/StateViews'

const PAGE_SIZE = 10

const DEFAULT_FILTERS: QuoteFiltersState = {
  search: '',
  status: 'all',
  sort: 'newest',
}

export default function AdminQuotesPage() {
  const [stats, setStats] = useState<QuoteStats>({
    total: 0,
    new: 0,
    contacted: 0,
    quoted: 0,
    accepted: 0,
    closed: 0,
  })
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  const [filters, setFilters] = useState<QuoteFiltersState>(DEFAULT_FILTERS)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)

  const [quotes, setQuotes] = useState<QuoteSummaryRow[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoadingList, setIsLoadingList] = useState(true)
  const [listError, setListError] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(filters.search)
      setPage(1)
    }, 350)
    return () => window.clearTimeout(timer)
  }, [filters.search])

  const loadStats = useCallback(async () => {
    setIsLoadingStats(true)
    try {
      const data = await fetchQuoteStats()
      setStats(data)
    } catch (err) {
      console.error('[AdminQuotes] Failed to load stats:', err)
    } finally {
      setIsLoadingStats(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const loadQuotes = useCallback(async () => {
    setIsLoadingList(true)
    setListError(null)
    try {
      const { items, totalCount: count } = await fetchAdminQuotes(
        { ...filters, search: debouncedSearch },
        page,
        PAGE_SIZE,
      )
      setQuotes(items)
      setTotalCount(count)
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Failed to load quotation enquiries.')
    } finally {
      setIsLoadingList(false)
    }
  }, [filters.status, filters.sort, debouncedSearch, page])

  useEffect(() => {
    loadQuotes()
  }, [loadQuotes])

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS)
    setDebouncedSearch('')
    setPage(1)
  }

  const hasActiveFilters =
    debouncedSearch.trim() !== '' || filters.status !== 'all' || filters.sort !== 'newest'

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const startIdx = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const endIdx = Math.min(totalCount, page * PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-charcoal">
          Quotation Enquiries
        </h1>
        <p className="mt-1 text-sm text-muted">
          Review customer quotation requests, update enquiry status, and record private follow-up notes.
        </p>
      </div>

      <QuoteStatsCards stats={stats} isLoading={isLoadingStats} />

      {/* Search & Filters */}
      <div className="rounded-card border border-sand bg-white p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="md:col-span-6">
            <label htmlFor="quote-search" className="sr-only">
              Search enquiries
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <input
                id="quote-search"
                type="search"
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                placeholder="Search reference #, customer name, or phone..."
                className="w-full rounded-control border border-sand bg-ivory/40 py-2 pl-9 pr-3 text-sm text-charcoal placeholder:text-muted focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <label htmlFor="quote-status-filter" className="sr-only">
              Filter by status
            </label>
            <select
              id="quote-status-filter"
              value={filters.status}
              onChange={(e) => {
                setFilters((prev) => ({
                  ...prev,
                  status: e.target.value as QuoteStatus | 'all',
                }))
                setPage(1)
              }}
              className="w-full rounded-control border border-sand bg-ivory/40 px-3 py-2 text-sm text-charcoal focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
            >
              <option value="all">All Statuses</option>
              {QUOTE_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label htmlFor="quote-sort" className="sr-only">
              Sort enquiries
            </label>
            <select
              id="quote-sort"
              value={filters.sort}
              onChange={(e) => {
                setFilters((prev) => ({
                  ...prev,
                  sort: e.target.value as 'newest' | 'oldest',
                }))
                setPage(1)
              }}
              className="w-full rounded-control border border-sand bg-ivory/40 px-3 py-2 text-sm text-charcoal focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-burgundy hover:underline"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Table / States */}
      {isLoadingList ? (
        <LoadingState label="Loading quotation enquiries..." />
      ) : listError ? (
        <div
          role="alert"
          className="flex flex-col items-center justify-center rounded-panel border border-red-200 bg-red-50 px-6 py-10 text-center"
        >
          <AlertCircle className="h-8 w-8 text-red-600 mb-2" aria-hidden="true" />
          <p className="text-sm font-medium text-red-800">{listError}</p>
          <Button variant="secondary" onClick={loadQuotes} className="mt-4">
            Try Again
          </Button>
        </div>
      ) : quotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-panel border border-dashed border-sand bg-white px-6 py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ivory text-burgundy">
            <Inbox className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="font-display text-lg font-semibold text-charcoal">
            {hasActiveFilters ? 'No matching enquiries' : 'No quotation enquiries yet'}
          </h2>
          <p className="mt-1 max-w-md text-sm text-muted">
            {hasActiveFilters
              ? 'No enquiries matched your search or status filter.'
              : 'Customer quotation requests submitted through /quote/request will appear here.'}
          </p>
          {hasActiveFilters && (
            <Button variant="secondary" onClick={handleReset} className="mt-4">
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-sand bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-sand text-left text-sm">
              <thead className="bg-ivory/70 text-xs font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3.5">
                    Reference
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Customer
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Phone
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Submitted
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Items
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/70 bg-white">
                {quotes.map((q) => (
                  <tr key={q.id} className="hover:bg-ivory/40 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-xs font-semibold text-burgundy">
                      <Link to={`/admin/quotes/${q.id}`} className="hover:underline">
                        {q.reference_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-charcoal">{q.customer_name}</p>
                      <p className="text-xs text-muted">{q.customer_location}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-charcoal">
                      {q.customer_phone}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-muted">
                      {new Date(q.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-charcoal">
                      <span className="font-semibold">{q.lineCount}</span> product
                      {q.lineCount === 1 ? '' : 's'} ·{' '}
                      <span className="font-semibold">{q.totalUnits}</span> unit
                      {q.totalUnits === 1 ? '' : 's'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <QuoteStatusBadge status={q.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <Link
                        to={`/admin/quotes/${q.id}`}
                        className="inline-flex items-center gap-1.5 rounded-control border border-sand bg-white px-3 py-1.5 text-xs font-semibold text-burgundy hover:bg-champagne/30"
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>View Details</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-sand bg-ivory/50 px-4 py-3 sm:flex-row">
            <p className="text-xs text-muted">
              Showing <span className="font-semibold text-charcoal">{startIdx}</span> to{' '}
              <span className="font-semibold text-charcoal">{endIdx}</span> of{' '}
              <span className="font-semibold text-charcoal">{totalCount}</span> enquiries
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="inline-flex items-center gap-1 rounded-control border border-sand bg-white px-3 py-1.5 text-xs font-medium text-charcoal hover:bg-ivory disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Previous</span>
              </button>
              <span className="text-xs font-medium text-charcoal">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-1 rounded-control border border-sand bg-white px-3 py-1.5 text-xs font-medium text-charcoal hover:bg-ivory disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
