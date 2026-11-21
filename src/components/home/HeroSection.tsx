import { motion, useReducedMotion } from 'motion/react'
import { useLang } from '../../i18n/LanguageContext'
import { EASING } from '../../lib/motion'
import Button from '../common/Button'

export default function HeroSection() {
  const { t } = useLang()
  const shouldReduceMotion = useReducedMotion()

  const titleText = t('hero.title')

  return (
    <section id="home" aria-labelledby="hero-title" className="relative flex w-full overflow-hidden lg:min-h-[calc(100vh-4.5rem)] lg:items-center">
      <div className="grid w-full grid-cols-1 items-center gap-8 py-8 sm:py-12 lg:grid-cols-[45fr_55fr] lg:gap-0 lg:py-4">
        {/* Left Column: Heading, Description, CTAs (~15% from left on large desktop, max-w ~540px) */}
        <div className="flex w-full justify-start px-4 sm:px-6 md:px-8 lg:justify-end lg:pl-[6vw] xl:pl-[10vw] 2xl:pl-[14vw] lg:pr-8 xl:pr-12">
          <div className="w-full max-w-[540px]">
            {/* Line-by-line entrance for headline */}
            <h1
              id="hero-title"
              className="hero-title"
              aria-label={titleText}
            >
              {titleText.split(/(?<=\.)\s+/).filter(Boolean).map((line, i) => (
                <span
                  key={`${line}-${i}`}
                  className="block py-[0.05em]"
                  aria-hidden="true"
                >
                  {shouldReduceMotion ? (
                    <span>{line}</span>
                  ) : (
                    <motion.span
                      className="inline-block"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: i * 0.1,
                        ease: EASING.default,
                      }}
                    >
                      {line}
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.15, ease: EASING.default }}
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.22, ease: EASING.default }}
              >
                <div className="relative overflow-hidden rounded-control">
                  <Button href="#categories">{t('hero.cta1')}</Button>
                  {/* ShinyText single sweep ~1.1s after load */}
                  <motion.span
                    className="pointer-events-none absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    initial={{ x: '-150%' }}
                    animate={{ x: '150%' }}
                    transition={{ delay: 1.1, duration: 0.75, ease: 'easeInOut' }}
                    aria-hidden="true"
                  />
                </div>
                <Button href="#about" variant="secondary">{t('hero.cta2')}</Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Column: Hero image extending to the right viewport edge */}
        <div className="flex w-full items-center justify-end overflow-hidden pl-4 pr-0 sm:pl-6 lg:pl-0">
          <div className="w-full">
            {shouldReduceMotion ? (
              <div className="w-full">
                <img
                  src="/images/vaagai-hero-full-composition.png"
                  alt="Traditional brass lamps and metalware"
                  width={802}
                  height={718}
                  className="ml-auto block h-auto max-h-[520px] w-full object-contain object-right sm:max-h-[580px] lg:max-h-[min(680px,85vh)] xl:max-h-[min(720px,85vh)]"
                  loading="eager"
                  decoding="async"
                />
              </div>
            ) : (
              <motion.div
                className="w-full"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1, ease: EASING.default }}
              >
                <img
                  src="/images/vaagai-hero-full-composition.png"
                  alt="Traditional brass lamps and metalware"
                  width={802}
                  height={718}
                  className="ml-auto block h-auto max-h-[520px] w-full object-contain object-right sm:max-h-[580px] lg:max-h-[min(680px,85vh)] xl:max-h-[min(720px,85vh)]"
                  loading="eager"
                  decoding="async"
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
