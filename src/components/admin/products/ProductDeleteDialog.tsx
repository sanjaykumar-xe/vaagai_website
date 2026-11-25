import { AlertTriangle, Archive, Trash2, X } from 'lucide-react'
import type { ProductWithDetails } from '../../../types/product'

interface ProductDeleteDialogProps {
  product: ProductWithDetails | null
  isProcessing: boolean
  onClose: () => void
  onConfirm: (mode: 'archive' | 'delete') => void
}

export default function ProductDeleteDialog({
  product,
  isProcessing,
  onClose,
  onConfirm,
}: ProductDeleteDialogProps) {
  if (!product) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div className="w-full max-w-md rounded-panel border border-sand bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-700">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="delete-dialog-title" className="font-display text-lg font-semibold text-charcoal">
                Remove Product
              </h2>
              <p className="text-xs text-muted">SKU: {product.sku}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-control p-1 text-muted hover:bg-ivory hover:text-charcoal"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-4 text-sm text-charcoal/85 leading-relaxed">
          You are about to remove <span className="font-semibold text-charcoal">{product.name_en}</span>.
          Archiving hides the product from your storefront while preserving its records. Permanent deletion removes the product, its variants, and all associated images from storage.
        </p>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-control border border-sand bg-white px-4 py-2 text-xs font-semibold text-charcoal hover:bg-ivory disabled:opacity-50"
          >
            Cancel
          </button>

          {product.status !== 'archived' && (
            <button
              type="button"
              onClick={() => onConfirm('archive')}
              disabled={isProcessing}
              className="inline-flex items-center justify-center gap-1.5 rounded-control border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
            >
              <Archive className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{isProcessing ? 'Processing...' : 'Archive Product'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onConfirm('delete')}
            disabled={isProcessing}
            className="inline-flex items-center justify-center gap-1.5 rounded-control bg-red-700 px-4 py-2 text-xs font-semibold text-white hover:bg-red-800 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isProcessing ? 'Deleting...' : 'Delete Permanently'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
