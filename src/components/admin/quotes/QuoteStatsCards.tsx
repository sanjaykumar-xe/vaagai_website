import type { QuoteStats } from '../../../types/quote'

interface QuoteStatsCardsProps {
  stats: QuoteStats
  isLoading: boolean
}

export default function QuoteStatsCards({ stats, isLoading }: QuoteStatsCardsProps) {
  const cards = [
    { label: 'Total Enquiries', value: stats.total, accent: 'text-burgundy' },
    { label: 'New', value: stats.new, accent: 'text-indigo-700' },
    { label: 'Contacted', value: stats.contacted, accent: 'text-amber-700' },
    { label: 'Quoted', value: stats.quoted, accent: 'text-purple-700' },
    { label: 'Accepted', value: stats.accepted, accent: 'text-emerald-700' },
    { label: 'Closed', value: stats.closed, accent: 'text-stone-600' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => (
        <div key={card.label} className="rounded-card border border-sand bg-white p-4 shadow-sm">
          <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted">
            {card.label}
          </p>
          <p className={`mt-1.5 font-display text-2xl font-semibold ${card.accent}`}>
            {isLoading ? '—' : card.value}
          </p>
        </div>
      ))}
    </div>
  )
}
