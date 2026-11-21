import { useState, useRef, type MouseEvent } from 'react'
import { ArrowRight, Heart } from 'lucide-react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import type { Product } from '../../data/products'
import { useLang } from '../../i18n/LanguageContext'
import ImageSlot from './ImageSlot'
import Button from './Button'

interface Props { product: Product; onView: () => void }

const sparkAngles = [0, 60, 120, 180, 240, 300]

export default function ProductCard({ product, onView }: Props) {
  const { t, pick } = useLang()
  const [saved, setSaved] = useState(false)
  const [showSparks, setShowSparks] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLElement>(null)
  const shouldReduceMotion = useReducedMotion()

  const name = pick(product.name)

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (shouldReduceMotion || !cardRef.current) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    // Limit to +/-3 degrees
    const rotX = Math.max(-3, Math.min(3, (y / (rect.height / 2)) * -3))
    const rotY = Math.max(-3, Math.min(3, (x / (rect.width / 2)) * 3))
    setTilt({ x: rotX, y: rotY })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
  }

  const handleToggleWishlist = () => {
    const next = !saved
    setSaved(next)
    if (next) {
      setShowSparks(true)
      setTimeout(() => setShowSparks(false), 450)
    }
  }

  return (
    <motion.article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: tilt.x,
        rotateY: tilt.y,
      }}
      transition={{ type: 'spring', damping: 24, stiffness: 220 }}
      style={{ transformStyle: 'preserve-3d' }}
      className="group flex h-full flex-col overflow-hidden rounded-card border border-sand bg-white transition-all duration-300 hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-ivory">
        <div className="h-full w-full transition-transform duration-500 group-hover:scale-105">
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
              animate={saved ? { scale: [1, 1.25, 1] } : { scale: 1 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="grid place-items-center"
            >
              <Heart className="h-5 w-5 transition-colors duration-200" fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
            </motion.span>
            {/* ClickSpark effect on wishlist add */}
            <AnimatePresence>
              {showSparks && !shouldReduceMotion && (
                <span className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true">
                  {sparkAngles.map(angle => {
                    const rad = (angle * Math.PI) / 180
                    const tx = Math.cos(rad) * 16
                    const ty = Math.sin(rad) * 16
                    return (
                      <motion.span
                        key={angle}
                        initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                        animate={{ opacity: 0, x: tx, y: ty, scale: 0.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="absolute h-1 w-1 rounded-full bg-gold"
                      />
                    )
                  })}
                </span>
              )}
            </AnimatePresence>
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
    </motion.article>
  )
}
