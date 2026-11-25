import { Package, CheckCircle2, FileEdit, AlertTriangle } from 'lucide-react'
import type { ProductStats } from '../../../types/product'

interface ProductStatsCardsProps {
  stats: ProductStats
  isLoading: boolean
}

export default function ProductStatsCards({ stats, isLoading }: ProductStatsCardsProps) {
  const cards = [
    {
      label: 'Total Products',
      value: stats.total,
      icon: Package,
      accent: 'text-burgundy',
      subtext: 'All items in catalogue',
    },
    {
      label: 'Published',
      value: stats.published,
      icon: CheckCircle2,
      accent: 'text-emerald-700',
      subtext: 'Live on storefront',
    },
    {
      label: 'Drafts',
      value: stats.draft,
      icon: FileEdit,
      accent: 'text-amber-700',
      subtext: 'Hidden from public',
    },
    {
      label: 'Out of Stock',
      value: stats.outOfStock,
      icon: AlertTriangle,
      accent: 'text-red-700',
      subtext: 'Zero active inventory',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className="rounded-card border border-sand bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                {card.label}
              </span>
              <Icon className={`h-4 w-4 ${card.accent}`} aria-hidden="true" />
            </div>
            <p className="mt-2 font-display text-2xl font-semibold text-charcoal">
              {isLoading ? '—' : card.value}
            </p>
            <p className="mt-0.5 text-xs text-muted">{card.subtext}</p>
          </div>
        )
      })}
    </div>
  )
}
