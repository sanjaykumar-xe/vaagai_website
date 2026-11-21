import { Instagram } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { SITE } from '../../data/site'
import { useLang } from '../../i18n/LanguageContext'
import { EASING, VIEWPORT_CONFIG } from '../../lib/motion'
import Button from '../common/Button'
import ImageSlot from '../common/ImageSlot'
import Reveal from '../common/Reveal'

const tiles = [1, 2, 3, 4, 5, 6]

export default function InstagramSection() {
  const { t } = useLang()
  const shouldReduceMotion = useReducedMotion()

  return (
    <section id="instagram" aria-labelledby="ig-title" className="mx-auto max-w-site px-4 py-12 sm:px-6 md:py-16 lg:px-8 lg:py-20">
      <Reveal>
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <Instagram className="mb-3 h-7 w-7 text-burgundy" strokeWidth={1.5} aria-hidden="true" />
            <h2 id="ig-title" className="section-title">{t('ig.title')}</h2>
            <p className="mt-2 text-muted">{t('ig.desc')}</p>
          </div>
          <Button variant="secondary" href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer">
            {t('ig.cta')}
          </Button>
        </div>
      </Reveal>

      <ul className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
        {tiles.map((n, idx) => (
          <li key={n}>
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
              whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              viewport={VIEWPORT_CONFIG}
              transition={{
                duration: 0.45,
                delay: idx * 0.05,
                ease: EASING.default,
              }}
            >
              <a
                href={SITE.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t('ig.cta')} (${n})`}
                className="group relative block aspect-square overflow-hidden rounded-card focus-visible:outline-gold"
              >
                <div className="h-full w-full transition-transform duration-300 ease-out group-hover:scale-[1.03]">
                  <ImageSlot imageKey={`insta-${n}`} alt={`Vaagai ${n}`} />
                </div>

                {/* Burgundy 40% overlay with centered Instagram icon */}
                <div
                  className="pointer-events-none absolute inset-0 flex items-center justify-center bg-burgundy/40 opacity-0 transition-opacity duration-180 group-hover:opacity-100"
                  aria-hidden="true"
                >
                  <Instagram className="h-6 w-6 text-white transition-transform duration-180 group-hover:scale-105" aria-hidden="true" />
                </div>
              </a>
            </motion.div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-muted">{t('ig.note')}</p>
    </section>
  )
}
