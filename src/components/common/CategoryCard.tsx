import { useState } from 'react'
import { ArrowRight, ImageIcon } from 'lucide-react'
import { motion } from 'motion/react'
import type { StorefrontCategory } from '../../types/storefront'
import { useLang } from '../../i18n/LanguageContext'

export default function CategoryCard({
  category,
  onSelect,
}: {
  category: StorefrontCategory
  onSelect: () => void
}) {
  const { lang, t } = useLang()
  const [imgFailed, setImgFailed] = useState(false)

  const primaryName = lang === 'ta' && category.name_ta ? category.name_ta : category.name_en
  const secondaryName = lang === 'en' ? category.name_ta : category.name_en

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
      className="group flex h-full w-full flex-col overflow-hidden rounded-card border border-sand bg-white text-left transition-all duration-200 hover:-translate-y-[2px] hover:shadow-md focus-visible:outline-gold"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <div className="h-full w-full transition-transform duration-300 ease-out group-hover:scale-[1.02]">
          {category.image_url && !imgFailed ? (
            <img
              src={category.image_url}
              alt={primaryName}
              loading="lazy"
              decoding="async"
              onError={() => setImgFailed(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              role="img"
              aria-label={`${primaryName} (${t('img.placeholder')})`}
              className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-champagne/50 to-sand text-burgundy/50"
            >
              <ImageIcon className="h-8 w-8" strokeWidth={1.25} aria-hidden />
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-0.5 p-4">
        <h3 className="text-[1.05rem]">{primaryName}</h3>
        <p lang={lang === 'en' ? 'ta' : 'en'} className="text-sm text-muted">
          {secondaryName}
        </p>
        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-burgundy">
          {t('cat.explore')}{' '}
          <ArrowRight
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </span>
      </div>
    </motion.button>
  )
}
