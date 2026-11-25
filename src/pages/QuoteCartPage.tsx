import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ImageIcon,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import { useQuoteCart } from '../context/QuoteCartContext'
import {
  revalidateQuoteCartItems,
  type QuoteCartRevalidationResult,
} from '../services/storefront'
import { formatPaiseToINR } from '../utils/formatters'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import BackToTop from '../components/common/BackToTop'
import Button from '../components/common/Button'

export default function QuoteCartPage() {
  const { lang, t } = useLang()
  const navigate = useNavigate()
  const { items, updateQuantity, removeItem, clearCart } = useQuoteCart()

  const [revalidated, setRevalidated] = useState<QuoteCartRevalidationResult>({
    validLines: [],
    unavailableItems: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const verifyCart = useCallback(
    async (isActiveRef?: { current: boolean }) => {
      if (items.length === 0) {
        setRevalidated({ validLines: [], unavailableItems: [] })
        setIsLoading(false)
        setError(null)
        return
      }
      setIsLoading(true)
      setError(null)
      try {
        const res = await revalidateQuoteCartItems(items)
        if (!isActiveRef || isActiveRef.current) {
          setRevalidated(res)
        }
      } catch (err) {
        if (!isActiveRef || isActiveRef.current) {
          setError(err instanceof Error ? err.message : t('quote.error'))
        }
      } finally {
        if (!isActiveRef || isActiveRef.current) {
          setIsLoading(false)
        }
      }
    },
    [items, t],
  )

  useEffect(() => {
    const isActiveRef = { current: true }
    verifyCart(isActiveRef)
    return () => {
      isActiveRef.current = false
    }
  }, [verifyCart])

  const handleRemoveUnavailable = () => {
    for (const unavail of revalidated.unavailableItems) {
      removeItem(unavail.productId, unavail.variantId)
    }
  }

  const validUnits = revalidated.validLines.reduce((sum, l) => sum + l.cartItem.quantity, 0)

  return (
    <div className="flex min-h-screen flex-col bg-ivory/40">
      <Header />

      <main className="flex-1">
        <section className="border-b border-sand bg-white">
          <div className="mx-auto max-w-site px-4 py-8 sm:px-6 md:py-10 lg:px-8">
            <h1 className="font-display text-3xl font-semibold text-burgundy">
              {t('quote.title')}
            </h1>
            <p className="mt-1.5 text-sm sm:text-base text-muted">{t('quote.desc')}</p>
          </div>
        </section>

        <section className="mx-auto max-w-site px-4 py-8 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="space-y-4 animate-pulse" aria-busy="true">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-28 rounded-card border border-sand bg-white" />
              ))}
            </div>
          ) : error ? (
            <div
              role="alert"
              className="rounded-panel border border-sand bg-white p-8 text-center"
            >
              <AlertCircle className="mx-auto mb-2 h-8 w-8 text-burgundy" aria-hidden="true" />
              <p className="text-sm text-charcoal">{error}</p>
              <Button variant="secondary" onClick={() => verifyCart()} className="mt-4">
                {t('retry')}
              </Button>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-panel border border-sand bg-white px-6 py-14 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ivory text-burgundy">
                <ShoppingBag className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="font-display text-xl font-semibold text-charcoal">
                {t('quote.emptyTitle')}
              </h2>
              <p className="mt-1.5 mx-auto max-w-md text-sm text-muted">
                {t('quote.emptyDesc')}
              </p>
              <div className="mt-6">
                <Button onClick={() => navigate('/shop')}>{t('quote.continue')}</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {revalidated.unavailableItems.length > 0 && (
                <div
                  role="alert"
                  className="flex flex-col gap-3 rounded-card border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
                    <p>{t('quote.unavailableBanner')}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveUnavailable}
                    className="shrink-0 rounded-control border border-amber-400 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100"
                  >
                    {t('quote.removeUnavailable')}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Left: Cart Lines */}
                <div className="space-y-4 lg:col-span-2">
                  {revalidated.validLines.map(({ cartItem, product, variant, unitPricePaise }) => {
                    const title =
                      lang === 'ta' && product.name_ta ? product.name_ta : product.name_en
                    const secondary = lang === 'en' ? product.name_ta : product.name_en
                    const sku = variant?.variant_sku || product.sku
                    const variantLabel =
                      variant && product.pricing_type === 'variant'
                        ? lang === 'ta' && variant.variant_name_ta
                          ? variant.variant_name_ta
                          : variant.variant_name_en
                        : null

                    return (
                      <div
                        key={`${cartItem.productId}-${cartItem.variantId ?? 'none'}`}
                        className="flex flex-col gap-4 rounded-card border border-sand bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                      >
                        <Link
                          to={`/products/${encodeURIComponent(product.slug)}`}
                          className="h-20 w-20 shrink-0 overflow-hidden rounded-control border border-sand bg-ivory flex items-center justify-center"
                        >
                          {product.primary_image?.public_url ? (
                            <img
                              src={product.primary_image.public_url}
                              alt={title}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-burgundy/40" aria-hidden="true" />
                          )}
                        </Link>

                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/products/${encodeURIComponent(product.slug)}`}
                            className="font-display text-base font-semibold text-charcoal hover:text-burgundy"
                          >
                            {title}
                          </Link>
                          {secondary && secondary !== title && (
                            <p lang={lang === 'en' ? 'ta' : 'en'} className="text-xs text-muted">
                              {secondary}
                            </p>
                          )}
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                            <span className="font-mono">SKU: {sku}</span>
                            {variantLabel && (
                              <span className="rounded bg-ivory px-2 py-0.5 font-medium text-charcoal">
                                {variantLabel}
                              </span>
                            )}
                          </div>
                          <p className="mt-1.5 text-sm font-semibold text-burgundy">
                            {unitPricePaise !== null
                              ? formatPaiseToINR(unitPricePaise)
                              : t('feat.enquiry')}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-3 sm:justify-end">
                          <div className="inline-flex items-center rounded-control border border-sand bg-ivory/40">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  cartItem.productId,
                                  cartItem.variantId,
                                  cartItem.quantity - 1,
                                )
                              }
                              aria-label={`Decrease quantity of ${title}`}
                              className="grid h-9 w-9 place-items-center text-charcoal hover:bg-ivory"
                            >
                              <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold text-charcoal">
                              {cartItem.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  cartItem.productId,
                                  cartItem.variantId,
                                  cartItem.quantity + 1,
                                )
                              }
                              aria-label={`Increase quantity of ${title}`}
                              className="grid h-9 w-9 place-items-center text-charcoal hover:bg-ivory"
                            >
                              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(cartItem.productId, cartItem.variantId)}
                            aria-label={`${t('quote.remove')} ${title}`}
                            className="rounded-control border border-sand p-2 text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    )
                  })}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <Link
                      to="/shop"
                      className="text-sm font-semibold text-burgundy hover:underline"
                    >
                      ← {t('quote.continue')}
                    </Link>

                    <button
                      type="button"
                      onClick={clearCart}
                      className="text-xs font-semibold text-red-700 hover:underline"
                    >
                      {t('quote.clear')}
                    </button>
                  </div>
                </div>

                {/* Right: Summary Card */}
                <div>
                  <div className="rounded-panel border border-sand bg-white p-6 shadow-sm space-y-4">
                    <h2 className="font-display text-lg font-semibold text-charcoal border-b border-sand pb-3">
                      {t('quote.title')}
                    </h2>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted">{t('quote.lines')}</span>
                        <span className="font-semibold text-charcoal">
                          {revalidated.validLines.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">{t('quote.units')}</span>
                        <span className="font-semibold text-charcoal">{validUnits}</span>
                      </div>
                    </div>

                    <p className="rounded-control bg-ivory/70 p-3 text-xs text-muted leading-relaxed">
                      {t('quote.estimateNote')}
                    </p>

                    <Button
                      disabled={revalidated.validLines.length === 0}
                      onClick={() => navigate('/quote/request')}
                      className="w-full justify-center disabled:opacity-50"
                    >
                      <span>{t('quote.proceed')}</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  )
}
