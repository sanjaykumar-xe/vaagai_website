import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { fetchActiveCategories } from '../../services/storefront'
import type { StorefrontCategory } from '../../types/storefront'
import { useLang } from '../../i18n/LanguageContext'
import CategoryCard from '../common/CategoryCard'
import SectionHeading from '../common/SectionHeading'
import Reveal from '../common/Reveal'
import Button from '../common/Button'

function CategorySkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4" aria-busy="true" aria-label="Loading categories">
      {Array.from({ length: 8 }).map((_, idx) => (
        <div
          key={idx}
          className="flex h-full flex-col overflow-hidden rounded-card border border-sand bg-white animate-pulse"
        >
          <div className="aspect-[4/3] bg-ivory" />
          <div className="flex flex-1 flex-col gap-2 p-4">
            <div className="h-4 w-3/4 rounded bg-sand/70" />
            <div className="h-3 w-1/2 rounded bg-sand/50" />
            <div className="mt-3 h-4 w-1/3 rounded bg-sand/60" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function CategorySection() {
  const { t } = useLang()
  const navigate = useNavigate()
  const [categories, setCategories] = useState<StorefrontCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCategories = useCallback(async (isActiveRef?: { current: boolean }) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchActiveCategories()
      if (!isActiveRef || isActiveRef.current) {
        setCategories(data)
      }
    } catch (err) {
      if (!isActiveRef || isActiveRef.current) {
        setError(err instanceof Error ? err.message : t('cat.error'))
      }
    } finally {
      if (!isActiveRef || isActiveRef.current) {
        setIsLoading(false)
      }
    }
  }, [t])

  useEffect(() => {
    const isActiveRef = { current: true }
    loadCategories(isActiveRef)
    return () => {
      isActiveRef.current = false
    }
  }, [loadCategories])

  return (
    <section
      id="categories"
      aria-labelledby="cat-title"
      className="mx-auto max-w-site px-4 py-12 sm:px-6 md:py-16 lg:px-8 lg:py-20"
    >
      <Reveal>
        <SectionHeading id="cat-title" title={t('cat.title')} desc={t('cat.desc')} />
      </Reveal>

      {isLoading ? (
        <CategorySkeletonGrid />
      ) : error ? (
        <div
          role="alert"
          className="flex flex-col items-center justify-center rounded-card border border-sand bg-white px-6 py-10 text-center"
        >
          <AlertCircle className="mb-2 h-6 w-6 text-burgundy" aria-hidden="true" />
          <p className="text-sm text-charcoal">{t('cat.error')}</p>
          <Button variant="secondary" onClick={() => loadCategories()} className="mt-4">
            {t('retry')}
          </Button>
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-card border border-sand bg-white px-6 py-10 text-center">
          <p className="text-sm text-muted">{t('cat.empty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {categories.map((c, i) => (
            <Reveal key={c.id} delay={Math.min(i * 0.07, 0.5)}>
              <CategoryCard
                category={c}
                onSelect={() => navigate(`/shop?category=${encodeURIComponent(c.slug)}`)}
              />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  )
}
