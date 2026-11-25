import type { QuoteStatus } from '../../../types/database.types'

const STYLES: Record<QuoteStatus, string> = {
  new: 'border-indigo-200 bg-indigo-50 text-indigo-800',
  contacted: 'border-amber-200 bg-amber-50 text-amber-800',
  quoted: 'border-purple-200 bg-purple-50 text-purple-800',
  accepted: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  closed: 'border-stone-200 bg-stone-100 text-stone-700',
}

const LABELS: Record<QuoteStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  quoted: 'Quoted',
  accepted: 'Accepted',
  closed: 'Closed',
}

export default function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  )
}
