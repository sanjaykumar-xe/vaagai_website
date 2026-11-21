import { useState, type UIEvent } from 'react'
import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { collections } from '../../data/collections'
import { useLang } from '../../i18n/LanguageContext'
import { useToast } from '../common/Toast'
import ImageSlot from '../common/ImageSlot'
import SectionHeading from '../common/SectionHeading'
import Reveal from '../common/Reveal'

export default function CollectionsSection() {
  const { t, pick } = useLang()
  const notify = useToast()
  const [scrollRatio, setScrollRatio] = useState(0)

  const handleScroll = (e: UIEvent<HTMLUListElement>) => {
    const el = e.currentTarget
    const maxScroll = el.scrollWidth - el.clientWidth
    if (maxScroll > 0) {
      setScrollRatio(el.scrollLeft / maxScroll)
    }
  }

  return (
    <section id="collections" aria-labelledby="col-title" className="border-y border-sand bg-white">
      <div className="mx-auto max-w-site py-12 md:py-16 lg:py-20">
        <div className="px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading id="col-title" title={t('col.title')} />
          </Reveal>
        </div>

        <ul
          onScroll={handleScroll}
          className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:px-6 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-8"
        >
          {collections.map((c, i) => (
            <li key={c.slug} className="w-[72%] shrink-0 snap-start sm:w-[44%] lg:w-auto">
              <Reveal delay={Math.min(i * 0.06, 0.3)}>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.1 }}
                  onClick={() => notify(t('soon'))}
                  className="group relative block aspect-[3/4] w-full overflow-hidden rounded-card text-left focus-visible:outline-gold"
                >
                  <div className="h-full w-full transition-transform duration-300 ease-out group-hover:scale-[1.02]">
                    <ImageSlot imageKey={c.imageKey} alt={pick(c.name)} />
                  </div>

                  {/* Gradient overlay rising on hover */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-wine via-wine/85 to-transparent p-5 pt-16 text-white transition-all duration-200 ease-out group-hover:pt-18">
                    <h3 className="!text-white text-lg transition-transform duration-200 ease-out group-hover:-translate-y-[3px]">
                      {pick(c.name)}
                    </h3>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-champagne transition-all duration-200 ease-out group-hover:translate-x-1">
                      {t('col.explore')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>
                </motion.button>
              </Reveal>
            </li>
          ))}
        </ul>

        {/* Mobile 2px gold progress indicator */}
        <div className="mt-4 flex justify-center px-4 lg:hidden" aria-hidden="true">
          <div className="h-[2px] w-28 overflow-hidden rounded-full bg-sand">
            <div
              className="h-full rounded-full bg-gold transition-all duration-150 ease-out"
              style={{
                width: '35%',
                transform: `translateX(${scrollRatio * 185}%)`,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
