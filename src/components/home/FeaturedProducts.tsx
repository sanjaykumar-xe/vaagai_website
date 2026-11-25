import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { fetchFeaturedProducts } from '../../services/storefront'
import type { StorefrontProduct } from '../../types/storefront'
import { useLang } from '../../i18n/LanguageContext'
import ProductCard from '../common/ProductCard'
import SectionHeading from '../common/SectionHeading'
import Reveal from '../common/Reveal'
import Button from '../common/Button'

function ProductSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4" aria-busy="true" aria-label="Loading featured products">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div
          key={idx}
          className="flex h-full flex-col overflow-hidden rounded-card border border-sand bg-white animate-pulse"
        >
          <div className="aspect-square bg-ivory" />
          <div className="flex flex-1 flex-col gap-2 p-4">
            <div className="h-4 w-3/4 rounded bg-sand/70" />
            <div className="h-3 w-1/2 rounded bg-sand/50" />
            <div className="mt-2 h-4 w-1/3 rounded bg-sand/70" />
            <div className="mt-auto pt-3">
              <div className="h-10 w-full rounded-control bg-sand/50" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function FeaturedProducts() {
  const { t } = useLang()
  const navigate = useNavigate()
  const [products, setProducts] = useState<StorefrontProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadFeatured = useCallback(async (isActiveRef?: { current: boolean }) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchFeaturedProducts(8)
      if (!isActiveRef || isActiveRef.current) {
        setProducts(data)
      }
    } catch (err) {
      if (!isActiveRef || isActiveRef.current) {
        setError(err instanceof Error ? err.message : t('feat.error'))
      }
    } finally {
      if (!isActiveRef || isActiveRef.current) {
        setIsLoading(false)
      }
    }
  }, [t])

  useEffect(() => {
    const isActiveRef = { current: true }
    loadFeatured(isActiveRef)
    return () => {
      isActiveRef.current = false
    }
  }, [loadFeatured])

  return (
    <section id="shop" aria-labelledby="feat-title" className="border-y border-sand bg-white">
      <div className="mx-auto max-w-site px-4 py-12 sm:px-6 md:py-16 lg:px-8 lg:py-20">
        <Reveal>
          <SectionHeading id="feat-title" title={t('feat.title')} desc={t('feat.desc')} />
        </Reveal>

        {isLoading ? (
          <ProductSkeletonGrid />
        ) : error ? (
          <div
            role="alert"
            className="flex flex-col items-center justify-center rounded-card border border-sand bg-ivory/60 px-6 py-10 text-center"
          >
            <AlertCircle className="mb-2 h-6 w-6 text-burgundy" aria-hidden="true" />
            <p className="text-sm text-charcoal">{t('feat.error')}</p>
            <Button variant="secondary" onClick={() => loadFeatured()} className="mt-4">
              {t('retry')}
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-card border border-sand bg-ivory/40 px-6 py-10 text-center">
            <p className="text-sm text-muted">{t('feat.empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {products.map((p, i) => (
              <Reveal key={p.id} delay={Math.min(i * 0.07, 0.5)}>
                <ProductCard
                  product={p}
                  onView={() => navigate(`/products/${encodeURIComponent(p.slug)}`)}
                />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
