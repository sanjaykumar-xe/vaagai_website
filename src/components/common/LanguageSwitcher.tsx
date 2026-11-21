import { motion } from 'motion/react'
import { useLang } from '../../i18n/LanguageContext'
import type { Lang } from '../../data/translations'

const options: { code: Lang; label: string }[] = [{ code: 'en', label: 'English' }, { code: 'ta', label: 'தமிழ்' }]

export default function LanguageSwitcher({ dark, id = 'header' }: { dark?: boolean; id?: string }) {
  const { lang, setLang, t } = useLang()
  return (
    <div role="group" aria-label={t('a11y.language')} className={`relative inline-flex rounded-control border p-0.5 text-xs sm:text-sm ${dark ? 'border-white/30' : 'border-sand'}`}>
      {options.map(o => {
        const active = lang === o.code
        return (
          <button
            key={o.code}
            type="button"
            lang={o.code}
            aria-pressed={active}
            onClick={() => setLang(o.code)}
            className={`relative min-h-[2rem] sm:min-h-[2.25rem] rounded-[0.35rem] px-2 sm:px-3 font-medium transition-colors ${
              active ? 'text-white' : dark ? 'text-white/80 hover:bg-white/10' : 'text-charcoal hover:bg-champagne/30'
            }`}
          >
            {active && (
              <motion.span
                layoutId={`active-lang-pill-${id}`}
                className="absolute inset-0 rounded-[0.35rem] bg-burgundy"
                transition={{ type: 'spring', damping: 26, stiffness: 280 }}
                style={{ zIndex: 0 }}
              />
            )}
            <span className="relative z-10">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}
