import type { Database, QuoteStatus } from './database.types'

export type QuoteRequestRow = Database['public']['Tables']['quote_requests']['Row']
export type QuoteRequestItemRow = Database['public']['Tables']['quote_request_items']['Row']

export interface QuoteSummaryRow extends QuoteRequestRow {
  lineCount: number
  totalUnits: number
}

export interface QuoteDetail extends QuoteRequestRow {
  items: QuoteRequestItemRow[]
  lineCount: number
  totalUnits: number
}

export interface QuoteStats {
  total: number
  new: number
  contacted: number
  quoted: number
  accepted: number
  closed: number
}

export interface QuoteFiltersState {
  search: string
  status: QuoteStatus | 'all'
  sort: 'newest' | 'oldest'
}

export const QUOTE_STATUS_OPTIONS: { value: QuoteStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'closed', label: 'Closed' },
]
