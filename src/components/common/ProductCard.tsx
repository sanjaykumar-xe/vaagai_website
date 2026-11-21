import { useState } from 'react'
import { ArrowRight, Heart } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { Product } from '../../data/products'
import { useLang } from '../../i18n/LanguageContext'
import ImageSlot from './ImageSlot'
import Button from './Button'

interface Props { product: Product; onView: () => void }

export default function ProductCard({ product, onView }: Props) {
  const { t, pick } = useLang()
  const [saved, setSaved] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  const name = pick(product.name)

  const handleToggleWishlist = () => {
    setSaved(s => !s)
  }

  return (
    <article
      className="group flex h-full flex-col overflow-hidden rounded-card border border-sand bg-white transition-all duration-200 hover:-translate-y-[2px] hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-ivory">
        <div className="h-full w-full transition-transform duration-300 ease-out group-hover:scale-[1.02]">
          <ImageSlot imageKey={product.imageKey} alt={name} contain />
        </div>
        {product.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-burgundy px-2.5 py-0.5 text-xs font-medium text-white">{t('feat.badge')}</span>
        )}
        <div className="absolute right-3 top-3">
          <button
            type="button"
            aria-pressed={saved}
            aria-label={`${t('feat.save')}: ${name}`}
            onClick={handleToggleWishlist}
            className="relative grid h-10 w-10 place-items-center rounded-full bg-white/90 text-burgundy shadow-sm transition-colors hover:bg-white focus-visible:outline-gold"
          >
            <motion.span
              animate={saved && !shouldReduceMotion ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="grid place-items-center"
            >
              <Heart className="h-5 w-5 transition-colors duration-200" fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
            </motion.span>
          </button>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="text-[1.05rem]">{name}</h3>
        <p className="text-sm text-muted">{pick(product.material)}</p>
        {product.price !== undefined && (
          <p className="mt-1 font-semibold text-burgundy">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.price)}</p>
        )}
        <div className="mt-auto pt-3">
          <Button variant="secondary" onClick={onView} className="group/btn w-full !min-h-[2.5rem] text-sm">
            <span>{t('feat.view')}</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </article>
  )
}
