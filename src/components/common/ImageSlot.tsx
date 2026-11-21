import { ImageIcon } from 'lucide-react'
import { images } from '../../data/images'
import { useLang } from '../../i18n/LanguageContext'

interface Props { imageKey: string; alt: string; className?: string; contain?: boolean; eager?: boolean; showLabel?: boolean }

// Shows the real image when set in data/images.ts, otherwise a clearly labelled placeholder.
export default function ImageSlot({ imageKey, alt, className = '', contain, eager, showLabel }: Props) {
  const { t } = useLang()
  const src = images[imageKey]
  if (src) {
    return (
      <img
        src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async"
        className={`h-full w-full ${contain ? 'object-contain' : 'object-cover'} ${className}`}
      />
    )
  }
  return (
    <div role="img" aria-label={`${alt} (${t('img.placeholder')})`}
      className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-champagne/50 to-sand text-burgundy/50 ${className}`}>
      <ImageIcon className="h-8 w-8" strokeWidth={1.25} aria-hidden />
      {showLabel && <span className="px-6 text-center text-xs text-burgundy/70">{t('img.heroNote')}</span>}
    </div>
  )
}
