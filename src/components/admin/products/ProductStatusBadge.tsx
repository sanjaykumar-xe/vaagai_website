import type { PricingType, ProductStatus } from '../../../types/database.types'
import { LOW_STOCK_DEFAULT_THRESHOLD } from '../../../types/product'

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const styles: Record<ProductStatus, string> = {
    published: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    draft: 'border-amber-200 bg-amber-50 text-amber-800',
    archived: 'border-stone-200 bg-stone-100 text-stone-700',
  }

  const labels: Record<ProductStatus, string> = {
    published: 'Published',
    draft: 'Draft',
    archived: 'Archived',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}

export function StockStatusBadge({
  stock,
  pricingType,
}: {
  stock: number
  pricingType: PricingType
}) {
  if (pricingType === 'enquiry') {
    return (
      <span className="inline-flex items-center rounded-full border border-sand bg-ivory px-2.5 py-0.5 text-xs font-medium text-muted">
        Enquiry Only
      </span>
    )
  }

  if (stock <= 0) {
    return (
      <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
        Out of Stock
      </span>
    )
  }

  if (stock <= LOW_STOCK_DEFAULT_THRESHOLD) {
    return (
      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
        Low ({stock})
      </span>
    )
  }

  return (
    <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
      {stock} in stock
    </span>
  )
}
