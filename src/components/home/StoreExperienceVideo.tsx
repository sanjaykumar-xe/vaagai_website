import { useEffect, useRef, useState } from 'react'
import { Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useLang } from '../../i18n/LanguageContext'
import Reveal from '../common/Reveal'

export default function StoreExperienceVideo() {
  const { t } = useLang()
  const shouldReduceMotion = useReducedMotion()

  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [manualPaused, setManualPaused] = useState(false)
  const [hasError, setHasError] = useState(false)

  // IntersectionObserver: automatically start playback when ~45% visible; pause when scrolled away
  useEffect(() => {
    const video = videoRef.current
    const container = containerRef.current
    if (!video || !container) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const isVisible = entry.intersectionRatio >= 0.45

          if (isVisible) {
            // Autoplay only if visitor hasn't manually paused during this visit and reduced motion is off
            if (!manualPaused && !shouldReduceMotion) {
              const playPromise = video.play()
              if (playPromise !== undefined) {
                playPromise
                  .then(() => setIsPlaying(true))
                  .catch(() => {
                    // Browser autoplay policy caught; keep muted & paused
                    setIsPlaying(false)
                  })
              }
            }
          } else {
            // Visitor scrolled away: pause playback
            if (!video.paused) {
              video.pause()
              setIsPlaying(false)
            }
            // Reset manualPaused so returning to section resumes playback
            setManualPaused(false)
          }
        })
      },
      {
        threshold: [0, 0.45],
      },
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [manualPaused, shouldReduceMotion])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
      setIsPlaying(false)
      setManualPaused(true)
    } else {
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true)
            setManualPaused(false)
          })
          .catch(() => setIsPlaying(false))
      }
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    const nextMuted = !video.muted
    video.muted = nextMuted
    setIsMuted(nextMuted)
  }

  return (
    <section
      id="about"
      aria-labelledby="video-title"
      className="mx-auto max-w-site px-4 py-12 sm:px-6 md:py-16 lg:px-8 lg:py-20"
    >
      {/* Centered Heading & Description */}
      <Reveal>
        <div className="mb-8 text-center sm:mb-10">
          <h2 id="video-title" className="section-title">
            {t('video.title')}
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-muted">
            {t('video.desc')}
          </p>
        </div>
      </Reveal>

      {/* Cinematic Video Showcase */}
      <Reveal distance={24} duration={0.8}>
        <div
          ref={containerRef}
          className="group relative mx-auto max-w-5xl overflow-hidden rounded-panel border border-sand bg-charcoal shadow-xl"
        >
          {hasError ? (
            <div className="flex aspect-video w-full flex-col items-center justify-center p-8 text-center text-white/80">
              <p className="text-sm">Showroom experience video will be available shortly.</p>
            </div>
          ) : (
            <div className="relative aspect-video w-full overflow-hidden bg-black/40">
              <video
                ref={videoRef}
                src="/videos/vaagai-store-tour.mp4"
                poster="/images/vaagai-store-poster.webp"
                muted={isMuted}
                playsInline
                loop
                preload="metadata"
                onError={() => setHasError(true)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="h-full w-full object-cover md:object-contain"
                aria-label="Vaagai Metals Traders showroom walkthrough video"
              />

              {/* Big Center Play Overlay (when paused) */}
              {!isPlaying && (
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={t('video.play')}
                  className="absolute inset-0 z-10 flex items-center justify-center bg-black/25 transition-opacity hover:bg-black/35 focus-visible:outline-gold"
                >
                  <motion.span
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className="grid h-16 w-16 place-items-center rounded-full border border-champagne/60 bg-burgundy/90 text-white shadow-xl backdrop-blur-sm sm:h-20 sm:w-20"
                  >
                    <Play className="ml-1 h-7 w-7 text-champagne sm:h-9 sm:w-9" fill="currentColor" aria-hidden="true" />
                  </motion.span>
                </button>
              )}

              {/* Subtle Integrated Controls Bar (Bottom) */}
              <div
                className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between bg-gradient-to-t from-wine/90 via-wine/50 to-transparent p-4 transition-opacity sm:p-5"
              >
                <div className="flex items-center gap-3">
                  {/* Play / Pause Toggle */}
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={isPlaying ? t('video.pause') : t('video.play')}
                    className="grid h-10 w-10 place-items-center rounded-control bg-white/15 text-white backdrop-blur transition-colors hover:bg-burgundy focus-visible:outline-gold sm:h-11 sm:w-11"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Play className="ml-0.5 h-5 w-5" fill="currentColor" aria-hidden="true" />
                    )}
                  </button>

                  {/* Audio Mute / Unmute Toggle */}
                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={isMuted ? t('video.unmute') : t('video.mute')}
                    className="grid h-10 w-10 place-items-center rounded-control bg-white/15 text-white backdrop-blur transition-colors hover:bg-burgundy focus-visible:outline-gold sm:h-11 sm:w-11"
                  >
                    {isMuted ? (
                      <VolumeX className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Volume2 className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>

                {/* Showroom Badge */}
                <div className="hidden items-center gap-2 rounded-full border border-gold/40 bg-wine/80 px-3.5 py-1 text-xs font-medium text-champagne sm:flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" aria-hidden="true" />
                  <span>Vaagai Showroom Tour</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Reveal>
    </section>
  )
}
