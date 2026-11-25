import { useState } from 'react'
import { ArrowRight, Heart, ImageIcon } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { StorefrontProduct } from '../../types/storefront'
import { useLang } from '../../i18n/LanguageContext'
import { formatPaiseToINR } from '../../utils/formatters'
import Button from './Button'

interface Props {
  product: StorefrontProduct
  onView: () => void
}

export default function ProductCard({ product, onView }: Props) {
  const { lang, t } = useLang()
  const [saved, setSaved] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  const name = lang === 'ta' && product.name_ta ? product.name_ta : product.name_en
  const subtitle =
    product.material ||
    (product.category
      ? lang === 'ta' && product.category.name_ta
        ? product.category.name_ta
        : product.category.name_en
      : '')

  const primaryImg = product.primary_image
  const imgAlt =
    (lang === 'ta' ? primaryImg?.alt_text_ta : primaryImg?.alt_text_en) ||
    primaryImg?.alt_text_en ||
    name

  const renderPrice = () => {
    if (product.pricing_type === 'enquiry') {
      return (
        <p className="mt-1 text-sm font-semibold text-burgundy">
          {t('feat.enquiry')}
        </p>
      )
    }

    if (product.pricing_type === 'variant') {
      const { min, max } = product.price_range_paise
      if (min === null) return null
      return (
        <p className="mt-1 font-semibold text-burgundy">
          {max !== null && max !== min
            ? `${formatPaiseToINR(min)} – ${formatPaiseToINR(max)}`
            : formatPaiseToINR(min)}
        </p>
      )
    }

    if (product.base_price_paise === null) return null

    const hasDiscount =
      product.compare_at_price_paise !== null &&
      product.compare_at_price_paise > product.base_price_paise

    return (
      <div className="mt-1 flex flex-wrap items-baseline gap-2">
        <span className="font-semibold text-burgundy">
          {formatPaiseToINR(product.base_price_paise)}
        </span>
        {hasDiscount && (
          <span className="text-xs text-muted line-through">
            {formatPaiseToINR(product.compare_at_price_paise)}
          </span>
        )}
      </div>
    )
  }

  return (
    <article
      className="group flex h-full flex-col overflow-hidden rounded-card border border-sand bg-white transition-all duration-200 hover:-translate-y-[2px] hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-ivory">
        <div className="h-full w-full transition-transform duration-300 ease-out group-hover:scale-[1.02]">
          {primaryImg?.public_url && !imgFailed ? (
            <img
              src={primaryImg.public_url}
              alt={imgAlt}
              loading="lazy"
              decoding="async"
              onError={() => setImgFailed(true)}
              className="h-full w-full object-contain"
            />
          ) : (
            <div
              role="img"
              aria-label={`${name} (${t('img.placeholder')})`}
              className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-champagne/50 to-sand text-burgundy/50"
            >
              <ImageIcon className="h-8 w-8" strokeWidth={1.25} aria-hidden />
            </div>
          )}
        </div>
        {product.is_featured && (
          <span className="absolute left-3 top-3 rounded-full bg-burgundy px-2.5 py-0.5 text-xs font-medium text-white">
            {t('feat.badge')}
          </span>
        )}
        <div className="absolute right-3 top-3">
          <button
            type="button"
            aria-pressed={saved}
            aria-label={`${t('feat.save')}: ${name}`}
            onClick={() => setSaved((s) => !s)}
            className="relative grid h-10 w-10 place-items-center rounded-full bg-white/90 text-burgundy shadow-sm transition-colors hover:bg-white focus-visible:outline-gold"
          >
            <motion.span
              animate={saved && !shouldReduceMotion ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="grid place-items-center"
            >
              <Heart
                className="h-5 w-5 transition-colors duration-200"
                fill={saved ? 'currentColor' : 'none'}
                aria-hidden="true"
              />
            </motion.span>
          </button>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="text-[1.05rem]">{name}</h3>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        {renderPrice()}
        <div className="mt-auto pt-3">
          <Button
            variant="secondary"
            onClick={onView}
            className="group/btn w-full !min-h-[2.5rem] text-sm"
          >
            <span>{t('feat.view')}</span>
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1"
              aria-hidden="true"
            />
          </Button>
        </div>
      </div>
    </article>
  )
}
