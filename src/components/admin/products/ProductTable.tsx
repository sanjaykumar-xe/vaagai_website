import { Link } from 'react-router-dom'
import {
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ImageOff,
  ChevronLeft,
  ChevronRight,
  Star,
} from 'lucide-react'
import type { ProductStatus } from '../../../types/database.types'
import type { ProductWithDetails } from '../../../types/product'
import { formatPaiseToINR } from '../../../utils/formatters'
import { getProductImageUrl, getProductTotalStock } from '../../../services/adminProducts'
import { ProductStatusBadge, StockStatusBadge } from './ProductStatusBadge'

interface ProductTableProps {
  products: ProductWithDetails[]
  page: number
  pageSize: number
  totalCount: number
  updatingStatusId: string | null
  onPageChange: (nextPage: number) => void
  onToggleStatus: (product: ProductWithDetails, nextStatus: ProductStatus) => void
  onRequestDelete: (product: ProductWithDetails) => void
}

export default function ProductTable({
  products,
  page,
  pageSize,
  totalCount,
  updatingStatusId,
  onPageChange,
  onToggleStatus,
  onRequestDelete,
}: ProductTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const startIdx = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const endIdx = Math.min(totalCount, page * pageSize)

  const renderPrice = (product: ProductWithDetails) => {
    if (product.pricing_type === 'enquiry') {
      return <span className="text-xs font-medium text-muted">On Enquiry</span>
    }

    if (product.pricing_type === 'variant' && product.product_variants.length > 0) {
      const prices = product.product_variants.map((v) => v.price_paise)
      const min = Math.min(...prices)
      const max = Math.max(...prices)
      if (min === max) {
        return <span className="font-medium text-charcoal">{formatPaiseToINR(min)}</span>
      }
      return (
        <span className="font-medium text-charcoal">
          {formatPaiseToINR(min)} – {formatPaiseToINR(max)}
        </span>
      )
    }

    return (
      <div>
        <span className="font-medium text-charcoal">
          {formatPaiseToINR(product.base_price_paise)}
        </span>
        {product.compare_at_price_paise &&
          product.base_price_paise !== null &&
          product.compare_at_price_paise > product.base_price_paise && (
            <span className="block text-xs text-muted line-through">
              {formatPaiseToINR(product.compare_at_price_paise)}
            </span>
          )}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-card border border-sand bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-sand text-left text-sm">
          <thead className="bg-ivory/70 text-xs font-semibold uppercase tracking-wider text-muted">
            <tr>
              <th scope="col" className="px-4 py-3.5">
                Image
              </th>
              <th scope="col" className="px-4 py-3.5">
                Product
              </th>
              <th scope="col" className="px-4 py-3.5">
                SKU
              </th>
              <th scope="col" className="px-4 py-3.5">
                Category
              </th>
              <th scope="col" className="px-4 py-3.5">
                Price
              </th>
              <th scope="col" className="px-4 py-3.5">
                Stock
              </th>
              <th scope="col" className="px-4 py-3.5">
                Status
              </th>
              <th scope="col" className="px-4 py-3.5 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand/70 bg-white">
            {products.map((product) => {
              const primaryImage =
                product.product_images.find((img) => img.is_primary) ||
                product.product_images[0]
              const totalStock = getProductTotalStock(product)
              const isBusy = updatingStatusId === product.id

              return (
                <tr key={product.id} className="hover:bg-ivory/40 transition-colors">
                  {/* Image */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="h-12 w-12 overflow-hidden rounded-control border border-sand bg-ivory flex items-center justify-center">
                      {primaryImage ? (
                        <img
                          src={getProductImageUrl(primaryImage.storage_path)}
                          alt={primaryImage.alt_text_en || product.name_en}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <ImageOff className="h-5 w-5 text-muted/60" aria-hidden="true" />
                      )}
                    </div>
                  </td>

                  {/* Product EN + TA */}
                  <td className="px-4 py-3 min-w-[13rem]">
                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/admin/products/${product.id}/edit`}
                        className="font-semibold text-charcoal hover:text-burgundy transition-colors"
                      >
                        {product.name_en}
                      </Link>
                      {product.is_featured && (
                        <Star
                          className="h-3.5 w-3.5 shrink-0 fill-gold text-gold"
                          aria-label="Featured product"
                        />
                      )}
                    </div>
                    <p className="text-xs text-muted mt-0.5">{product.name_ta}</p>
                  </td>

                  {/* SKU */}
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-charcoal">
                    {product.sku}
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {product.category ? (
                      <div>
                        <span className="text-xs font-medium text-charcoal">
                          {product.category.name_en}
                        </span>
                        <span className="block text-[0.7rem] text-muted">
                          {product.category.name_ta}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted">Uncategorized</span>
                    )}
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {renderPrice(product)}
                  </td>

                  {/* Stock */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StockStatusBadge
                      stock={totalStock}
                      pricingType={product.pricing_type}
                    />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <ProductStatusBadge status={product.status} />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      {product.status === 'published' ? (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => onToggleStatus(product, 'draft')}
                          title="Unpublish (move to Draft)"
                          className="rounded-control border border-sand bg-white p-1.5 text-muted hover:bg-ivory hover:text-charcoal disabled:opacity-50"
                          aria-label={`Unpublish ${product.name_en}`}
                        >
                          <EyeOff className="h-4 w-4" aria-hidden="true" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => onToggleStatus(product, 'published')}
                          title="Publish to Storefront"
                          className="rounded-control border border-sand bg-white p-1.5 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                          aria-label={`Publish ${product.name_en}`}
                        >
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        </button>
                      )}

                      <Link
                        to={`/admin/products/${product.id}/edit`}
                        title="Edit product"
                        className="rounded-control border border-sand bg-white p-1.5 text-burgundy hover:bg-champagne/30"
                        aria-label={`Edit ${product.name_en}`}
                      >
                        <Edit2 className="h-4 w-4" aria-hidden="true" />
                      </Link>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => onRequestDelete(product)}
                        title="Delete or Archive product"
                        className="rounded-control border border-sand bg-white p-1.5 text-red-700 hover:bg-red-50 disabled:opacity-50"
                        aria-label={`Delete ${product.name_en}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col items-center justify-between gap-3 border-t border-sand bg-ivory/50 px-4 py-3 sm:flex-row">
        <p className="text-xs text-muted">
          Showing <span className="font-semibold text-charcoal">{startIdx}</span> to{' '}
          <span className="font-semibold text-charcoal">{endIdx}</span> of{' '}
          <span className="font-semibold text-charcoal">{totalCount}</span> products
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
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
            onClick={() => onPageChange(page + 1)}
            className="inline-flex items-center gap-1 rounded-control border border-sand bg-white px-3 py-1.5 text-xs font-medium text-charcoal hover:bg-ivory disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>Next</span>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
