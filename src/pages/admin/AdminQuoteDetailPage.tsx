import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Copy,
  Loader2,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Save,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/common/Toast'
import type { QuoteStatus } from '../../types/database.types'
import { QUOTE_STATUS_OPTIONS, type QuoteDetail } from '../../types/quote'
import {
  buildAdminWhatsAppFollowupUrl,
  fetchAdminQuoteById,
  updateQuoteAdminNotes,
  updateQuoteStatus,
} from '../../services/adminQuotes'
import { formatPaiseToINR } from '../../utils/formatters'
import Button from '../../components/common/Button'
import QuoteStatusBadge from '../../components/admin/quotes/QuoteStatusBadge'
import { LoadingState } from '../../components/admin/products/StateViews'

const CONSEQUENTIAL_STATUSES = new Set<QuoteStatus>(['accepted', 'closed'])

export default function AdminQuoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [quote, setQuote] = useState<QuoteDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [pendingStatus, setPendingStatus] = useState<QuoteStatus>('new')
  const [confirmingStatus, setConfirmingStatus] = useState<QuoteStatus | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const [adminNotes, setAdminNotes] = useState('')
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const [copiedRef, setCopiedRef] = useState(false)

  const loadDetail = useCallback(async () => {
    if (!id) {
      setLoadError('Invalid quotation ID.')
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setLoadError(null)
    try {
      const detail = await fetchAdminQuoteById(id)
      setQuote(detail)
      setPendingStatus(detail.status)
      setAdminNotes(detail.admin_notes || '')
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load quotation details.')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadDetail()
  }, [loadDetail])

  const handleCopyReference = async () => {
    if (!quote) return
    try {
      await navigator.clipboard.writeText(quote.reference_number)
      setCopiedRef(true)
      toast(`Copied ${quote.reference_number}`)
      window.setTimeout(() => setCopiedRef(false), 2000)
    } catch {
      toast('Unable to copy reference number.')
    }
  }

  const executeStatusUpdate = async (targetStatus: QuoteStatus) => {
    if (!quote || isUpdatingStatus || targetStatus === quote.status) return
    setIsUpdatingStatus(true)
    setConfirmingStatus(null)
    try {
      const updated = await updateQuoteStatus(
        quote.id,
        targetStatus,
        quote.status,
        user?.id,
      )
      setQuote((prev) => (prev ? { ...prev, ...updated } : prev))
      setPendingStatus(updated.status)
      toast(`Status updated to "${updated.status}".`)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to update status.')
      setPendingStatus(quote.status)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleStatusChangeRequest = () => {
    if (!quote || pendingStatus === quote.status || isUpdatingStatus) return
    if (CONSEQUENTIAL_STATUSES.has(pendingStatus)) {
      setConfirmingStatus(pendingStatus)
      return
    }
    executeStatusUpdate(pendingStatus)
  }

  const handleSaveAdminNotes = async () => {
    if (!quote || isSavingNotes) return
    setIsSavingNotes(true)
    try {
      const updated = await updateQuoteAdminNotes(quote.id, adminNotes, user?.id)
      setQuote((prev) => (prev ? { ...prev, ...updated } : prev))
      setAdminNotes(updated.admin_notes || '')
      toast('Internal admin notes saved.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to save internal notes.')
    } finally {
      setIsSavingNotes(false)
    }
  }

  if (isLoading) {
    return <LoadingState label="Loading quotation details..." />
  }

  if (loadError || !quote) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center rounded-panel border border-red-200 bg-red-50 px-6 py-12 text-center"
      >
        <AlertCircle className="h-8 w-8 text-red-600 mb-2" aria-hidden="true" />
        <p className="text-sm font-medium text-red-800">
          {loadError || 'Quotation enquiry could not be loaded.'}
        </p>
        <Button
          variant="secondary"
          onClick={() => navigate('/admin/quotes')}
          className="mt-4"
        >
          Back to Enquiries
        </Button>
      </div>
    )
  }

  const whatsappUrl = buildAdminWhatsAppFollowupUrl(
    quote.customer_phone,
    quote.reference_number,
    quote.customer_name,
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/admin/quotes"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-burgundy hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to Quotation Enquiries</span>
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-2xl font-bold text-charcoal">
              {quote.reference_number}
            </h1>
            <button
              type="button"
              onClick={handleCopyReference}
              className="inline-flex items-center gap-1 rounded-control border border-sand bg-white px-2.5 py-1 text-xs font-medium text-charcoal hover:bg-ivory"
              title="Copy quotation reference"
            >
              {copiedRef ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
              )}
              <span>{copiedRef ? 'Copied' : 'Copy Ref'}</span>
            </button>
            <QuoteStatusBadge status={quote.status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: Customer Info, Requested Products, Internal Notes */}
        <div className="space-y-6 lg:col-span-2">
          {/* Customer Information */}
          <section className="rounded-panel border border-sand bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="font-display text-lg font-semibold text-charcoal border-b border-sand pb-3">
              Customer Information
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Full Name
                </p>
                <p className="mt-1 font-semibold text-charcoal">{quote.customer_name}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Phone Number
                </p>
                <p className="mt-1 font-mono font-medium text-charcoal">
                  {quote.customer_phone}
                </p>
              </div>

              {quote.customer_email && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Email
                  </p>
                  <a
                    href={`mailto:${quote.customer_email}`}
                    className="mt-1 inline-flex items-center gap-1.5 text-burgundy hover:underline"
                  >
                    <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{quote.customer_email}</span>
                  </a>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  City / Location
                </p>
                <p className="mt-1 inline-flex items-center gap-1.5 text-charcoal">
                  <MapPin className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
                  <span>{quote.customer_location}</span>
                </p>
              </div>
            </div>

            {quote.additional_notes && (
              <div className="rounded-control border border-sand bg-ivory/60 p-3.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Customer Requirements (Original)
                </p>
                <p className="mt-1 text-sm text-charcoal whitespace-pre-line">
                  {quote.additional_notes}
                </p>
              </div>
            )}

            {/* Communication Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={`tel:${quote.customer_phone.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-2 rounded-control border border-burgundy/40 bg-white px-4 py-2 text-xs font-semibold text-burgundy hover:bg-champagne/30 transition-colors"
              >
                <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Call Customer</span>
              </a>

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-control bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800 transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Message on WhatsApp</span>
                </a>
              )}
            </div>
          </section>

          {/* Requested Products (Historical Snapshots) */}
          <section className="overflow-hidden rounded-panel border border-sand bg-white shadow-sm">
            <div className="border-b border-sand px-5 py-4 sm:px-6">
              <h2 className="font-display text-lg font-semibold text-charcoal">
                Requested Products ({quote.lineCount} line{quote.lineCount === 1 ? '' : 's'} ·{' '}
                {quote.totalUnits} unit{quote.totalUnits === 1 ? '' : 's'})
              </h2>
              <p className="mt-0.5 text-xs text-muted">
                Historical snapshots captured at submission time; preserved even if catalogue items change.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-sand text-left text-sm">
                <thead className="bg-ivory/70 text-xs font-semibold uppercase tracking-wider text-muted">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      Product (EN / TA)
                    </th>
                    <th scope="col" className="px-4 py-3">
                      SKU Snapshot
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Variant
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      Qty
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      Ref. Unit Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/70 bg-white">
                  {quote.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-charcoal">
                          {item.product_name_en_snapshot}
                        </p>
                        <p className="text-xs text-muted">{item.product_name_ta_snapshot}</p>
                        {!item.product_id && (
                          <span className="mt-1 inline-block rounded bg-stone-100 px-1.5 py-0.5 text-[0.65rem] text-stone-600">
                            Original product removed
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-charcoal">
                        {item.product_sku_snapshot}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-charcoal">
                        {item.variant_name_snapshot || '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-charcoal">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-xs font-medium text-burgundy">
                        {item.unit_price_paise_snapshot !== null
                          ? formatPaiseToINR(item.unit_price_paise_snapshot)
                          : 'On Enquiry'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Internal Administrative Notes */}
          <section className="rounded-panel border border-sand bg-white p-5 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-sand pb-3">
              <h2 className="font-display text-lg font-semibold text-charcoal flex items-center gap-2">
                <Lock className="h-4 w-4 text-gold" aria-hidden="true" />
                <span>Internal Admin Notes</span>
              </h2>
              <span className="text-xs font-medium text-muted">Private · Admin Only</span>
            </div>

            <textarea
              aria-label="Internal admin notes"
              rows={4}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Record quoted prices, follow-up dates, or internal fulfilment notes (never visible to customers)..."
              className="w-full rounded-control border border-sand bg-ivory/30 p-3 text-sm text-charcoal focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
            />

            <div className="flex justify-end">
              <Button
                type="button"
                disabled={isSavingNotes}
                onClick={handleSaveAdminNotes}
              >
                {isSavingNotes ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>Saving Notes...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" aria-hidden="true" />
                    <span>Save Internal Notes</span>
                  </>
                )}
              </Button>
            </div>
          </section>
        </div>

        {/* Right Column: Quotation Metadata & Status Management */}
        <div className="space-y-6">
          <section className="rounded-panel border border-sand bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="font-display text-lg font-semibold text-charcoal border-b border-sand pb-3">
              Quotation Metadata
            </h2>

            <dl className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Submitted</dt>
                <dd className="font-medium text-charcoal">
                  {new Date(quote.created_at).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Last Updated</dt>
                <dd className="font-medium text-charcoal">
                  {new Date(quote.updated_at).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Product Lines</dt>
                <dd className="font-semibold text-charcoal">{quote.lineCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Total Units</dt>
                <dd className="font-semibold text-charcoal">{quote.totalUnits}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-panel border border-sand bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="font-display text-lg font-semibold text-charcoal border-b border-sand pb-3">
              Status Management
            </h2>

            <div>
              <label
                htmlFor="quote-status-select"
                className="block text-xs font-semibold uppercase tracking-wider text-charcoal"
              >
                Enquiry Status
              </label>
              <select
                id="quote-status-select"
                value={pendingStatus}
                onChange={(e) => {
                  setConfirmingStatus(null)
                  setPendingStatus(e.target.value as QuoteStatus)
                }}
                className="mt-1.5 w-full rounded-control border border-sand bg-ivory/30 px-3 py-2 text-sm text-charcoal focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
              >
                {QUOTE_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {confirmingStatus ? (
              <div className="rounded-control border border-amber-300 bg-amber-50 p-3.5 space-y-3 text-xs text-amber-950">
                <p className="font-medium">
                  Confirm changing status to{' '}
                  <span className="font-bold uppercase">{confirmingStatus}</span>?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => executeStatusUpdate(confirmingStatus)}
                    className="rounded-control bg-burgundy px-3 py-1.5 font-semibold text-white hover:bg-wine disabled:opacity-50"
                  >
                    {isUpdatingStatus ? 'Updating...' : 'Confirm'}
                  </button>
                  <button
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => {
                      setConfirmingStatus(null)
                      setPendingStatus(quote.status)
                    }}
                    className="rounded-control border border-sand bg-white px-3 py-1.5 font-semibold text-charcoal hover:bg-ivory"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                disabled={isUpdatingStatus || pendingStatus === quote.status}
                onClick={handleStatusChangeRequest}
                className="w-full justify-center disabled:opacity-50"
              >
                {isUpdatingStatus ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>Updating Status...</span>
                  </>
                ) : (
                  <span>Update Status</span>
                )}
              </Button>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
