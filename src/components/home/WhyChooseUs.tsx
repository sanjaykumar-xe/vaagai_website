import { useState } from 'react'
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
  const [hasEntered, setHasEntered] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      onViewportEnter={() => setHasEntered(true)}
      viewport={{ once: true, margin: '-12% 0px' }}
      className="relative h-full overflow-hidden rounded-card border border-sand bg-white p-6 transition-all duration-200 hover:-translate-y-[2px] hover:shadow-md"
    >
      {/* Lucide icon with 450ms draw-in stroke animation */}
      <div className="relative text-gold">
        <Icon
          className={`h-7 w-7 text-gold ${
            hasEntered && !shouldReduceMotion
              ? '[&_*]:[stroke-dasharray:120] [&_*]:[animation:strokeDraw_450ms_cubic-bezier(0.22,1,0.36,1)_forwards]'
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, idx) => (
          <Reveal key={it.t} delay={Math.min(idx * 0.06, 0.3)}>
            <WhyCard icon={it.icon} titleKey={it.t} descKey={it.d} />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
