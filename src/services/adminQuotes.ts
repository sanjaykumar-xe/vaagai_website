import { supabase } from '../lib/supabase'
import type { Database, QuoteStatus } from '../types/database.types'
import type {
  QuoteDetail,
  QuoteFiltersState,
  QuoteRequestItemRow,
  QuoteRequestRow,
  QuoteStats,
  QuoteSummaryRow,
} from '../types/quote'
import { translateDatabaseError } from './adminProducts'

async function logQuoteAudit(
  actorUserId: string | undefined,
  action: string,
  quoteId: string,
  metadata: Record<string, unknown>,
): Promise<void> {
  if (!actorUserId) return
  try {
    await supabase.from('audit_logs').insert({
      actor_user_id: actorUserId,
      action,
      entity_type: 'quote_request',
      entity_id: quoteId,
      metadata: metadata as Database['public']['Tables']['audit_logs']['Insert']['metadata'],
    })
  } catch (err) {
    console.warn('[Audit] Failed to record quote audit log:', err)
  }
}

/**
 * Fetch live quotation counts grouped by status from Supabase.
 */
export async function fetchQuoteStats(): Promise<QuoteStats> {
  const [totalRes, newRes, contactedRes, quotedRes, acceptedRes, closedRes] = await Promise.all([
    supabase.from('quote_requests').select('*', { count: 'exact', head: true }),
    supabase.from('quote_requests').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('quote_requests').select('*', { count: 'exact', head: true }).eq('status', 'contacted'),
    supabase.from('quote_requests').select('*', { count: 'exact', head: true }).eq('status', 'quoted'),
    supabase.from('quote_requests').select('*', { count: 'exact', head: true }).eq('status', 'accepted'),
    supabase.from('quote_requests').select('*', { count: 'exact', head: true }).eq('status', 'closed'),
  ])

  const firstErr =
    totalRes.error ||
    newRes.error ||
    contactedRes.error ||
    quotedRes.error ||
    acceptedRes.error ||
    closedRes.error

  if (firstErr) {
    throw new Error(translateDatabaseError(firstErr, 'Failed to load quotation statistics.'))
  }

  return {
    total: totalRes.count ?? 0,
    new: newRes.count ?? 0,
    contacted: contactedRes.count ?? 0,
    quoted: quotedRes.count ?? 0,
    accepted: acceptedRes.count ?? 0,
    closed: closedRes.count ?? 0,
  }
}

interface RawQuoteListRow extends QuoteRequestRow {
  quote_request_items: { id: string; quantity: number }[] | null
}

/**
 * Fetch paginated, filtered, and sorted quotation enquiries for administrators.
 */
export async function fetchAdminQuotes(
  filters: QuoteFiltersState,
  page: number,
  pageSize: number,
): Promise<{ items: QuoteSummaryRow[]; totalCount: number }> {
  let query = supabase
    .from('quote_requests')
    .select('*, quote_request_items(id, quantity)', { count: 'exact' })

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  const trimmed = filters.search.trim()
  if (trimmed) {
    const escaped = trimmed.replace(/[%_]/g, '\\$&')
    query = query.or(
      `reference_number.ilike.%${escaped}%,customer_name.ilike.%${escaped}%,customer_phone.ilike.%${escaped}%`,
    )
  }

  query = query.order('created_at', { ascending: filters.sort === 'oldest' })

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, count, error } = await query
  if (error) {
    throw new Error(translateDatabaseError(error, 'Failed to load quotation enquiries.'))
  }

  const items: QuoteSummaryRow[] = ((data ?? []) as unknown as RawQuoteListRow[]).map((row) => {
    const reqItems = row.quote_request_items || []
    return {
      ...row,
      lineCount: reqItems.length,
      totalUnits: reqItems.reduce((sum, item) => sum + (item.quantity || 0), 0),
    }
  })

  return {
    items,
    totalCount: count ?? 0,
  }
}

interface RawQuoteDetailRow extends QuoteRequestRow {
  quote_request_items: QuoteRequestItemRow[] | null
}

/**
 * Fetch a single quotation request with all historical item snapshots.
 */
export async function fetchAdminQuoteById(id: string): Promise<QuoteDetail> {
  const { data, error } = await supabase
    .from('quote_requests')
    .select('*, quote_request_items(*)')
    .eq('id', id)
    .single()

  if (error || !data) {
    throw new Error(translateDatabaseError(error, 'Quotation enquiry not found or access denied.'))
  }

  const row = data as unknown as RawQuoteDetailRow
  const items = [...(row.quote_request_items || [])].sort((a, b) =>
    a.created_at.localeCompare(b.created_at),
  )

  return {
    ...row,
    items,
    lineCount: items.length,
    totalUnits: items.reduce((sum, item) => sum + (item.quantity || 0), 0),
  }
}

/**
 * Update quotation status and record a non-PII audit log entry.
 */
export async function updateQuoteStatus(
  id: string,
  nextStatus: QuoteStatus,
  previousStatus: QuoteStatus,
  actorUserId?: string,
): Promise<QuoteRequestRow> {
  const { data, error } = await supabase
    .from('quote_requests')
    .update({ status: nextStatus })
    .eq('id', id)
    .select('*')
    .single()

  if (error || !data) {
    throw new Error(translateDatabaseError(error, 'Failed to update quotation status.'))
  }

  await logQuoteAudit(actorUserId, 'quote.status.update', id, {
    from: previousStatus,
    to: nextStatus,
  })

  return data
}

/**
 * Update internal administrative notes without modifying customer instructions.
 */
export async function updateQuoteAdminNotes(
  id: string,
  adminNotes: string,
  actorUserId?: string,
): Promise<QuoteRequestRow> {
  const { data, error } = await supabase
    .from('quote_requests')
    .update({ admin_notes: adminNotes.trim() || null })
    .eq('id', id)
    .select('*')
    .single()

  if (error || !data) {
    throw new Error(translateDatabaseError(error, 'Failed to save internal notes.'))
  }

  await logQuoteAudit(actorUserId, 'quote.admin_notes.update', id, {
    hasNotes: Boolean(adminNotes.trim()),
  })

  return data
}

/**
 * Format a customer phone number into a WhatsApp follow-up link with a pre-filled reference message.
 */
export function buildAdminWhatsAppFollowupUrl(
  customerPhone: string,
  referenceNumber: string,
  customerName: string,
): string | null {
  const digits = customerPhone.replace(/\D/g, '')
  if (digits.length < 7) return null
  const waNumber = digits.length === 10 ? `91${digits}` : digits
  const message = `Hello ${customerName}, thank you for your quotation enquiry (${referenceNumber}) with Vaagai Metals Traders.`
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`
}
