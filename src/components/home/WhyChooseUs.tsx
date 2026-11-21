import { useState, useRef, type MouseEvent } from 'react'
import { BadgeCheck, Flame, HeartHandshake, UtensilsCrossed } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useLang } from '../../i18n/LanguageContext'
import type { TKey } from '../../data/translations'
import SectionHeading from '../common/SectionHeading'
import Reveal from '../common/Reveal'

const items: { icon: typeof Flame; t: TKey; d: TKey }[] = [
  { icon: Flame, t: 'why.1.t', d: 'why.1.d' },
  { icon: BadgeCheck, t: 'why.2.t', d: 'why.2.d' },
  { icon: UtensilsCrossed, t: 'why.3.t', d: 'why.3.d' },
  { icon: HeartHandshake, t: 'why.4.t', d: 'why.4.d' },
]

function WhyCard({
  icon: Icon,
  titleKey,
  descKey,
}: {
  icon: typeof Flame
  titleKey: TKey
  descKey: TKey
}) {
  const { t } = useLang()
  const cardRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [hasEntered, setHasEntered] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !cardRef.current) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    const rect = cardRef.current.getBoundingClientRect()
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onViewportEnter={() => setHasEntered(true)}
      viewport={{ once: true, margin: '-12% 0px' }}
      className="relative h-full overflow-hidden rounded-card border border-sand bg-white p-6 transition-shadow duration-300 hover:shadow-md"
    >
      {/* SpotlightCard soft champagne radial glow on cursor hover */}
      {!shouldReduceMotion && (
        <div
          className="pointer-events-none absolute -inset-px rounded-card transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(280px circle at ${coords.x}px ${coords.y}px, rgba(229, 208, 167, 0.25), transparent 75%)`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Lucide icon with 700ms draw-in stroke animation */}
      <div className="relative text-gold">
        <Icon
          className={`h-7 w-7 text-gold ${
            hasEntered && !shouldReduceMotion
              ? '[&_*]:[stroke-dasharray:120] [&_*]:[animation:strokeDraw_700ms_cubic-bezier(0.22,1,0.36,1)_forwards]'
              : ''
          }`}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>

      <h3 className="relative mt-4 text-lg">{t(titleKey)}</h3>
      <p className="relative mt-2 text-sm text-muted">{t(descKey)}</p>

      <style>{`
        @keyframes strokeDraw {
          0% { stroke-dashoffset: 120; opacity: 0; }
          20% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
      `}</style>
    </motion.div>
  )
}

export default function WhyChooseUs() {
  const { t } = useLang()
  return (
    <section aria-labelledby="why-title" className="mx-auto max-w-site px-4 pb-12 sm:px-6 md:pb-16 lg:px-8 lg:pb-20">
      <Reveal>
        <SectionHeading id="why-title" title={t('why.title')} />
      </Reveal>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon, t: title, d }, i) => (
          <Reveal key={title} delay={Math.min(i * 0.08, 0.4)} as="li" className="h-full">
            <WhyCard icon={icon} titleKey={title} descKey={d} />
          </Reveal>
        ))}
      </ul>
    </section>
  )
}
