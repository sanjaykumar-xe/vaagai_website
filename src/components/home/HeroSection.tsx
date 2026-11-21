import { motion, useReducedMotion } from 'motion/react'
import { useLang } from '../../i18n/LanguageContext'
import { EASING } from '../../lib/motion'
import Button from '../common/Button'

export default function HeroSection() {
  const { t } = useLang()
  const shouldReduceMotion = useReducedMotion()

  const titleText = t('hero.title')
  const words = titleText.split(' ')

  return (
    <section id="home" aria-labelledby="hero-title" className="overflow-hidden">
      <div className="mx-auto grid max-w-site items-center gap-10 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8 lg:py-20">
        <div className="max-w-xl">
          {/* Word-by-word BlurText entrance for headline */}
          <h1
            id="hero-title"
            className="hero-title"
            aria-label={titleText}
          >
            {words.map((word, i) => (
              <span
                key={`${word}-${i}`}
                className="inline-block py-[0.1em] mr-[0.28em] whitespace-nowrap"
                aria-hidden="true"
              >
                {shouldReduceMotion ? (
                  <span>{word}</span>
                ) : (
                  <motion.span
                    className="inline-block"
                    initial={{ opacity: 0, filter: 'blur(6px)', y: 12 }}
                    animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                    transition={{
                      duration: 0.55,
                      delay: i * 0.07,
                      ease: EASING.default,
                    }}
                  >
                    {word}
                  </motion.span>
                )}
              </span>
            ))}
          </h1>

          {/* Description fade-up */}
          {shouldReduceMotion ? (
            <p className="mt-5 max-w-lg text-[1.0625rem] text-charcoal/90">{t('hero.desc')}</p>
          ) : (
            <motion.p
              className="mt-5 max-w-lg text-[1.0625rem] text-charcoal/90"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: EASING.default }}
            >
              {t('hero.desc')}
            </motion.p>
          )}

          {/* CTAs */}
          {shouldReduceMotion ? (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="#categories">{t('hero.cta1')}</Button>
              <Button href="#about" variant="secondary">{t('hero.cta2')}</Button>
            </div>
          ) : (
            <motion.div
              className="mt-8 flex flex-col gap-3 sm:flex-row"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: EASING.default }}
            >
              <div className="relative overflow-hidden rounded-control">
                <Button href="#categories">{t('hero.cta1')}</Button>
                {/* ShinyText single sweep ~1.5s after load */}
                <motion.span
                  className="pointer-events-none absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  initial={{ x: '-150%' }}
                  animate={{ x: '150%' }}
                  transition={{ delay: 1.5, duration: 0.85, ease: 'easeInOut' }}
                  aria-hidden="true"
                />
              </div>
              <Button href="#about" variant="secondary">{t('hero.cta2')}</Button>
            </motion.div>
          )}
        </div>

        {/* Right hero column: Complete original composition preserving 802x718 ratio */}
        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          {shouldReduceMotion ? (
            <div className="w-full">
              <img
                src="/images/vaagai-hero-full-composition.png"
                alt="Traditional brass lamps and metalware"
                width={802}
                height={718}
                className="block h-auto w-full object-contain"
                loading="eager"
                decoding="async"
              />
            </div>
          ) : (
            <motion.div
              className="w-full"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: EASING.default }}
            >
              <img
                src="/images/vaagai-hero-full-composition.png"
                alt="Traditional brass lamps and metalware"
                width={802}
                height={718}
                className="block h-auto w-full object-contain"
                loading="eager"
                decoding="async"
              />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
