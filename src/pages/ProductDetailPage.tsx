import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Compass,
  ImageIcon,
  MessageCircle,
  PhoneCall,
} from 'lucide-react'
import { SITE } from '../data/site'
import { useLang } from '../i18n/LanguageContext'
import { fetchPublicCatalog, fetchPublicProductBySlug } from '../services/storefront'
import type { StorefrontProduct, StorefrontVariant } from '../types/storefront'
import { LOW_STOCK_DEFAULT_THRESHOLD } from '../types/product'
import { formatPaiseToINR } from '../utils/formatters'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import BackToTop from '../components/common/BackToTop'
import ProductCard from '../components/common/ProductCard'
import Button from '../components/common/Button'

function buildWhatsAppEnquiryUrl(
  baseWhatsappUrl: string,
  product: StorefrontProduct,
  selectedVariant: StorefrontVariant | null,
): string {
  const sku = selectedVariant?.variant_sku || product.sku
  const variantLine =
    selectedVariant && product.pricing_type === 'variant'
      ? ` — Option: ${selectedVariant.variant_name_en}`
      : ''
  const message = `Hello Vaagai Metals Traders, I would like to enquire about "${product.name_en}" (SKU: ${sku}${variantLine}).`
  const separator = baseWhatsappUrl.includes('?') ? '&' : '?'
  return `${baseWhatsappUrl}${separator}text=${encodeURIComponent(message)}`
}

function DetailSkeleton() {
  return (
    <div
      className="mx-auto max-w-site px-4 py-8 sm:px-6 lg:px-8 animate-pulse"
      aria-busy="true"
      aria-label="Loading product details"
    >
      <div className="mb-6 h-4 w-48 rounded bg-sand/70" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-panel bg-sand/50" />
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 w-16 rounded-control bg-sand/50" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-6 w-28 rounded-full bg-sand/60" />
          <div className="h-9 w-3/4 rounded bg-sand/70" />
          <div className="h-5 w-1/2 rounded bg-sand/50" />
          <div className="h-8 w-1/3 rounded bg-sand/70 mt-4" />
          <div className="h-24 w-full rounded bg-sand/40 mt-4" />
          <div className="h-12 w-full rounded-control bg-sand/60 mt-6" />
        </div>
      </div>
    </div>
  )
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { lang, t } = useLang()
  const navigate = useNavigate()

  const [product, setProduct] = useState<StorefrontProduct | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<StorefrontProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedImageIdx, setSelectedImageIdx] = useState(0)
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(new Set())
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)

  const loadProduct = useCallback(
    async (isActiveRef?: { current: boolean }) => {
      if (!slug) {
        setProduct(null)
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      setError(null)
      setSelectedImageIdx(0)
      setFailedImageIds(new Set())
      setRelatedProducts([])

      try {
        const fetched = await fetchPublicProductBySlug(slug)
        if (isActiveRef && !isActiveRef.current) return

        setProduct(fetched)

        if (fetched) {
          // Default primary image index
          const primaryIdx = fetched.images.findIndex((img) => img.is_primary)
          setSelectedImageIdx(primaryIdx >= 0 ? primaryIdx : 0)

          // Default first in-stock active variant (or first active variant)
          if (fetched.variants.length > 0) {
            const firstInStock = fetched.variants.find((v) => v.stock_quantity > 0)
            setSelectedVariantId(firstInStock?.id || fetched.variants[0].id)
          } else {
            setSelectedVariantId(null)
          }

          // Load related products in the same category
          if (fetched.category?.slug) {
            fetchPublicCatalog({
              categorySlug: fetched.category.slug,
              pageSize: 5,
            })
              .then((catRes) => {
                if (isActiveRef && !isActiveRef.current) return
                setRelatedProducts(
                  catRes.items.filter((item) => item.id !== fetched.id).slice(0, 4),
                )
              })
              .catch(() => {
                // Non-critical related products failure should not block product detail
              })
          }
        }
      } catch (err) {
        if (!isActiveRef || isActiveRef.current) {
          setError(err instanceof Error ? err.message : t('prod.error'))
        }
      } finally {
        if (!isActiveRef || isActiveRef.current) {
          setIsLoading(false)
        }
      }
    },
    [slug, t],
  )

  useEffect(() => {
    const isActiveRef = { current: true }
    loadProduct(isActiveRef)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return () => {
      isActiveRef.current = false
    }
  }, [loadProduct])

  const selectedVariant = useMemo(() => {
    if (!product || product.variants.length === 0) return null
    return product.variants.find((v) => v.id === selectedVariantId) || product.variants[0]
  }, [product, selectedVariantId])

  const activeImage = product?.images[selectedImageIdx] || null

  const renderStockBadge = () => {
    if (!product) return null
    if (product.pricing_type === 'enquiry') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-sand bg-ivory px-3 py-1 text-xs font-semibold text-charcoal">
          <CheckCircle2 className="h-3.5 w-3.5 text-burgundy" aria-hidden="true" />
          {t('prod.enquiryStock')}
        </span>
      )
    }

    if (product.pricing_type === 'variant' && product.variants.length === 0) {
      return (
        <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
          {t('prod.outOfStock')}
        </span>
      )
    }

    const stockQty =
      product.pricing_type === 'variant'
        ? selectedVariant?.stock_quantity ?? 0
        : product.variants[0]?.stock_quantity ?? 0

    if (stockQty <= 0) {
      return (
        <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
          {t('prod.outOfStock')}
        </span>
      )
    }

    if (stockQty <= LOW_STOCK_DEFAULT_THRESHOLD) {
      return (
        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
          {t('prod.lowStock')} ({stockQty})
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
        {t('prod.inStock')} ({stockQty})
      </span>
    )
  }

  const renderPricing = () => {
    if (!product) return null

    if (product.pricing_type === 'enquiry') {
      return (
        <p className="font-display text-2xl font-semibold text-burgundy">
          {t('feat.enquiry')}
        </p>
      )
    }

    const sellingPaise =
      product.pricing_type === 'variant'
        ? selectedVariant?.price_paise ?? null
        : product.base_price_paise

    const mrpPaise =
      product.pricing_type === 'variant'
        ? selectedVariant?.compare_at_price_paise ?? null
        : product.compare_at_price_paise

    if (sellingPaise === null) return null

    const showMrp = mrpPaise !== null && mrpPaise > sellingPaise

    return (
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="font-display text-3xl font-semibold text-burgundy">
          {formatPaiseToINR(sellingPaise)}
        </span>
        {showMrp && (
          <span className="text-base text-muted line-through">
            {formatPaiseToINR(mrpPaise)}
          </span>
        )}
      </div>
    )
  }

  const primaryTitle = product
    ? lang === 'ta' && product.name_ta
      ? product.name_ta
      : product.name_en
    : ''
  const secondaryTitle = product
    ? lang === 'en'
      ? product.name_ta
      : product.name_en
    : ''
  const description = product
    ? lang === 'ta' && product.description_ta
      ? product.description_ta
      : product.description_en || product.description_ta
    : null

  const activeSku =
    product?.pricing_type === 'variant' && selectedVariant
      ? selectedVariant.variant_sku
      : product?.sku || ''

  return (
    <div className="flex min-h-screen flex-col bg-ivory/40">
      <Header />

      <main className="flex-1">
        {isLoading ? (
          <DetailSkeleton />
        ) : error ? (
          <div className="mx-auto max-w-site px-4 py-16 sm:px-6 lg:px-8">
            <div
              role="alert"
              className="mx-auto max-w-md rounded-panel border border-sand bg-white p-8 text-center shadow-sm"
            >
              <AlertCircle className="mx-auto mb-3 h-8 w-8 text-burgundy" aria-hidden="true" />
              <p className="text-sm font-medium text-charcoal">{t('prod.error')}</p>
              <Button variant="secondary" onClick={() => loadProduct()} className="mt-4">
                {t('retry')}
              </Button>
            </div>
          </div>
        ) : !product ? (
          <div className="mx-auto max-w-site px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-md rounded-panel border border-sand bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-burgundy/10 text-burgundy">
                <Compass className="h-6 w-6" aria-hidden="true" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gold">404</p>
              <h1 className="mt-2 font-display text-2xl font-semibold text-charcoal">
                {t('prod.notFoundTitle')}
              </h1>
              <p className="mt-2 text-sm text-muted leading-relaxed">
                {t('prod.notFoundDesc')}
              </p>
              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
                <Link
                  to="/shop"
                  className="inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-control bg-burgundy px-5 py-2.5 text-sm font-semibold text-white hover:bg-wine transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  <span>{t('notFound.shop')}</span>
                </Link>
                <Link
                  to="/"
                  className="inline-flex min-h-[2.75rem] items-center justify-center rounded-control border border-burgundy/40 bg-white px-5 py-2.5 text-sm font-semibold text-burgundy hover:bg-champagne/30 transition-colors"
                >
                  {t('notFound.home')}
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mx-auto max-w-site px-4 py-8 sm:px-6 lg:px-8">
              {/* Breadcrumb */}
              <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted">
                <Link to="/" className="hover:text-burgundy">
                  {t('nav.home')}
                </Link>
                <span aria-hidden="true">/</span>
                <Link to="/shop" className="hover:text-burgundy">
                  {t('nav.shop')}
                </Link>
                {product.category && (
                  <>
                    <span aria-hidden="true">/</span>
                    <Link
                      to={`/shop?category=${encodeURIComponent(product.category.slug)}`}
                      className="hover:text-burgundy"
                    >
                      {lang === 'ta' && product.category.name_ta
                        ? product.category.name_ta
                        : product.category.name_en}
                    </Link>
                  </>
                )}
                <span aria-hidden="true">/</span>
                <span className="font-medium text-charcoal">{primaryTitle}</span>
              </nav>

              {/* Main 2-column Product Layout */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
                {/* Left: Image Gallery */}
                <div className="space-y-4">
                  <div className="relative aspect-square w-full overflow-hidden rounded-panel border border-sand bg-white">
                    {activeImage && !failedImageIds.has(activeImage.id) ? (
                      <img
                        src={activeImage.public_url}
                        alt={
                          (lang === 'ta' ? activeImage.alt_text_ta : activeImage.alt_text_en) ||
                          activeImage.alt_text_en ||
                          primaryTitle
                        }
                        onError={() =>
                          setFailedImageIds((prev) => new Set(prev).add(activeImage.id))
                        }
                        className="h-full w-full object-contain p-4"
                      />
                    ) : (
                      <div
                        role="img"
                        aria-label={`${primaryTitle} (${t('img.placeholder')})`}
                        className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-champagne/50 to-sand text-burgundy/50"
                      >
                        <ImageIcon className="h-12 w-12" strokeWidth={1.25} aria-hidden />
                      </div>
                    )}

                    {product.is_featured && (
                      <span className="absolute left-4 top-4 rounded-full bg-burgundy px-3 py-1 text-xs font-medium text-white">
                        {t('feat.badge')}
                      </span>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {product.images.length > 1 && (
                    <div className="flex flex-wrap gap-3" role="list" aria-label="Product gallery thumbnails">
                      {product.images.map((img, idx) => {
                        const isSelected = idx === selectedImageIdx
                        const alt =
                          (lang === 'ta' ? img.alt_text_ta : img.alt_text_en) ||
                          img.alt_text_en ||
                          `${primaryTitle} ${idx + 1}`
                        return (
                          <button
                            key={img.id}
                            type="button"
                            onClick={() => setSelectedImageIdx(idx)}
                            aria-label={`View image ${idx + 1}: ${alt}`}
                            aria-current={isSelected ? 'true' : undefined}
                            className={`h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-control border bg-white p-1 transition-all ${
                              isSelected
                                ? 'border-burgundy ring-2 ring-burgundy/25'
                                : 'border-sand hover:border-burgundy/50'
                            }`}
                          >
                            {!failedImageIds.has(img.id) ? (
                              <img
                                src={img.public_url}
                                alt={alt}
                                onError={() =>
                                  setFailedImageIds((prev) => new Set(prev).add(img.id))
                                }
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-ivory text-muted">
                                <ImageIcon className="h-5 w-5" aria-hidden="true" />
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Right: Product Information & Enquiry */}
                <div className="flex flex-col space-y-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      {product.category && (
                        <Link
                          to={`/shop?category=${encodeURIComponent(product.category.slug)}`}
                          className="rounded-full border border-sand bg-white px-3 py-1 text-xs font-semibold text-burgundy hover:bg-champagne/30"
                        >
                          {lang === 'ta' && product.category.name_ta
                            ? product.category.name_ta
                            : product.category.name_en}
                        </Link>
                      )}
                      {renderStockBadge()}
                    </div>

                    <h1 className="mt-3 font-display text-2xl sm:text-3xl font-semibold text-charcoal">
                      {primaryTitle}
                    </h1>
                    {secondaryTitle && secondaryTitle !== primaryTitle && (
                      <p
                        lang={lang === 'en' ? 'ta' : 'en'}
                        className="mt-1 text-base text-muted"
                      >
                        {secondaryTitle}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="border-y border-sand py-4">{renderPricing()}</div>

                  {/* Variant Selector (for pricing_type === 'variant') */}
                  {product.pricing_type === 'variant' && (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-charcoal">
                        {t('prod.variants')}
                      </p>
                      {product.variants.length === 0 ? (
                        <p className="text-sm text-muted">{t('prod.noVariants')}</p>
                      ) : (
                        <div className="flex flex-wrap gap-2.5">
                          {product.variants.map((variant) => {
                            const isSelected = selectedVariant?.id === variant.id
                            const isUnavailable = variant.stock_quantity <= 0
                            const vLabel =
                              lang === 'ta' && variant.variant_name_ta
                                ? variant.variant_name_ta
                                : variant.variant_name_en

                            return (
                              <button
                                key={variant.id}
                                type="button"
                                disabled={isUnavailable}
                                onClick={() => setSelectedVariantId(variant.id)}
                                aria-pressed={isSelected}
                                className={`min-h-[2.75rem] rounded-control border px-4 py-2 text-sm font-medium transition-colors ${
                                  isSelected
                                    ? 'border-burgundy bg-burgundy text-white'
                                    : isUnavailable
                                    ? 'cursor-not-allowed border-sand bg-ivory text-muted/60 line-through'
                                    : 'border-sand bg-white text-charcoal hover:border-burgundy hover:bg-champagne/20'
                                }`}
                              >
                                {vLabel}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  {description && (
                    <div className="space-y-2">
                      <p className="text-sm leading-relaxed text-charcoal/90 whitespace-pre-line">
                        {description}
                      </p>
                      {lang === 'en' && product.description_ta && (
                        <p lang="ta" className="text-sm leading-relaxed text-muted whitespace-pre-line">
                          {product.description_ta}
                        </p>
                      )}
                      {lang === 'ta' && product.description_en && (
                        <p lang="en" className="text-sm leading-relaxed text-muted whitespace-pre-line">
                          {product.description_en}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Specifications */}
                  <div className="rounded-card border border-sand bg-white p-4 space-y-2.5 text-sm">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-charcoal">
                      {t('prod.specs')}
                    </h2>
                    <dl className="grid grid-cols-2 gap-y-2 text-xs sm:text-sm">
                      <dt className="text-muted">{t('prod.sku')}</dt>
                      <dd className="font-mono font-medium text-charcoal">{activeSku}</dd>

                      {product.material && (
                        <>
                          <dt className="text-muted">{t('prod.material')}</dt>
                          <dd className="font-medium text-charcoal">{product.material}</dd>
                        </>
                      )}

                      {product.category && (
                        <>
                          <dt className="text-muted">{t('prod.category')}</dt>
                          <dd className="font-medium text-charcoal">
                            {lang === 'ta' && product.category.name_ta
                              ? product.category.name_ta
                              : product.category.name_en}
                          </dd>
                        </>
                      )}

                      {selectedVariant?.weight_grams && (
                        <>
                          <dt className="text-muted">{t('prod.weight')}</dt>
                          <dd className="font-medium text-charcoal">
                            {selectedVariant.weight_grams} g
                          </dd>
                        </>
                      )}
                    </dl>
                  </div>

                  {/* Direct Quotation / WhatsApp Enquiry CTA */}
                  <div className="pt-2">
                    {SITE.whatsappUrl ? (
                      <Button
                        href={buildWhatsAppEnquiryUrl(SITE.whatsappUrl, product, selectedVariant)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full justify-center"
                      >
                        <MessageCircle className="h-5 w-5" aria-hidden="true" />
                        <span>{t('cta.whatsapp')}</span>
                      </Button>
                    ) : (
                      <Button
                        onClick={() => navigate('/#contact')}
                        className="w-full justify-center"
                      >
                        <PhoneCall className="h-4 w-4" aria-hidden="true" />
                        <span>{t('prod.enquireFallback')}</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <section
                aria-labelledby="related-title"
                className="border-t border-sand bg-white py-12 md:py-16"
              >
                <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-8">
                  <h2 id="related-title" className="section-title mb-6">
                    {t('prod.related')}
                  </h2>
                  <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
                    {relatedProducts.map((rel) => (
                      <ProductCard
                        key={rel.id}
                        product={rel}
                        onView={() => navigate(`/products/${encodeURIComponent(rel.slug)}`)}
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <Footer />
      <BackToTop />
    </div>
  )
}
