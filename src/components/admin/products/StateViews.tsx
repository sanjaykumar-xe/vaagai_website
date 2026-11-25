import type { ReactNode } from 'react'
import { PackageOpen } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-panel border border-dashed border-sand bg-white px-6 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ivory text-burgundy">
        <PackageOpen className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="font-display text-lg font-semibold text-charcoal">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function LoadingState({ label = 'Loading catalogue...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-panel border border-sand bg-white px-6 py-14 text-center">
      <div className="h-8 w-8 animate-spin rounded-full border-3 border-burgundy border-t-gold" />
      <p className="mt-3 text-sm font-medium text-muted">{label}</p>
    </div>
  )
}
