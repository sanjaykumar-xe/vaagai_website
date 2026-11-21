import { useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { MessageCircle } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { SITE } from '../../data/site'
import { useLang } from '../../i18n/LanguageContext'
import { useToast } from '../common/Toast'
import Button from '../common/Button'
import Reveal from '../common/Reveal'

function MagnetWrapper({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const shouldReduceMotion = useReducedMotion()

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !ref.current) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY)
    const range = 80
    if (dist < range) {
      const strength = 0.2
      setPos({
        x: (e.clientX - centerX) * strength,
        y: (e.clientY - centerY) * strength,
      })
    } else {
      setPos({ x: 0, y: 0 })
    }
  }

  const handleMouseLeave = () => {
    setPos({ x: 0, y: 0 })
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', damping: 20, stiffness: 200, mass: 0.5 }}
      className="inline-block"
    >
      {children}
    </motion.div>
  )
}

export default function ContactCTA() {
  const { t } = useLang()
  const notify = useToast()
  return (
    <section id="contact" aria-labelledby="cta-title" className="mx-auto max-w-site px-4 pb-14 sm:px-6 md:pb-20 lg:px-8">
      <Reveal distance={24} duration={0.8}>
        <div className="rounded-panel border border-champagne bg-champagne/30 px-6 py-12 text-center sm:px-12 sm:py-16">
          <h2 id="cta-title" className="section-title mx-auto max-w-2xl">{t('cta.title')}</h2>
          <p className="mx-auto mt-3 max-w-xl text-charcoal/85">{t('cta.desc')}</p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <MagnetWrapper>
              <Button href="#categories">{t('cta.explore')}</Button>
            </MagnetWrapper>
            <Button variant="secondary" onClick={() => notify(t('soon'))}>{t('cta.contact')}</Button>
            {SITE.whatsappUrl && (
              <Button variant="secondary" href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" aria-hidden="true" /> {t('cta.whatsapp')}
              </Button>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
