import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import { useLang } from '../../i18n/LanguageContext'
import Button from '../common/Button'
import ImageSlot from '../common/ImageSlot'
import Reveal from '../common/Reveal'

function ScrollWord({
  word,
  progress,
  range,
}: {
  word: string
  progress: ReturnType<typeof useScroll>['scrollYProgress']
  range: [number, number]
}) {
  const opacity = useTransform(progress, range, [0.3, 1])
  return (
    <span className="inline-block py-[0.1em] mr-[0.28em] whitespace-nowrap" aria-hidden="true">
      <motion.span style={{ opacity }} className="inline-block">
        {word}
      </motion.span>
    </span>
  )
}

export default function BrandStory() {
  const { t } = useLang()
  const shouldReduceMotion = useReducedMotion()
  const paragraphRef = useRef<HTMLParagraphElement>(null)
  const imageFrameRef = useRef<HTMLDivElement>(null)

  const descText = t('brand.desc')
  const words = descText.split(' ')

  const { scrollYProgress: pProgress } = useScroll({
    target: paragraphRef,
    offset: ['start 85%', 'end 55%'],
  })

  const { scrollYProgress: imgProgress } = useScroll({
    target: imageFrameRef,
    offset: ['start end', 'end start'],
  })

  const imageY = useTransform(imgProgress, [0, 1], ['-8%', '8%'])

  return (
    <section id="about" aria-labelledby="brand-title" className="mx-auto max-w-site px-4 py-12 sm:px-6 md:py-16 lg:px-8 lg:py-20">
      <Reveal distance={24} duration={0.8}>
        <div className="grid overflow-hidden rounded-panel bg-burgundy md:grid-cols-2">
          {/* Parallax Image Frame */}
          <div ref={imageFrameRef} className="relative aspect-[4/3] overflow-hidden md:aspect-auto md:min-h-[26rem]">
            {shouldReduceMotion ? (
              <div className="h-full w-full">
                <ImageSlot imageKey="brandStory" alt="Vaagai Metals Traders shop" />
              </div>
            ) : (
              <motion.div
                className="h-full w-full will-change-transform md:scale-110"
                style={{ y: typeof window !== 'undefined' && window.innerWidth >= 768 ? imageY : '0%' }}
              >
                <ImageSlot imageKey="brandStory" alt="Vaagai Metals Traders shop" />
              </motion.div>
            )}
          </div>

          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
            <h2 id="brand-title" className="section-title !text-white">{t('brand.title')}</h2>

            {/* ScrollReveal Paragraph */}
            {shouldReduceMotion ? (
              <p className="mt-4 max-w-md text-white/85">{descText}</p>
            ) : (
              <p ref={paragraphRef} className="mt-4 max-w-md text-white/85" aria-label={descText}>
                {words.map((word, i) => {
                  const start = i / words.length
                  const end = Math.min(start + 1.5 / words.length, 1)
                  return (
                    <ScrollWord
                      key={`${word}-${i}`}
                      word={word}
                      progress={pProgress}
                      range={[start, end]}
                    />
                  )
                })}
              </p>
            )}

            <div className="mt-8">
              <Button variant="light" href="#contact">{t('brand.cta')}</Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
