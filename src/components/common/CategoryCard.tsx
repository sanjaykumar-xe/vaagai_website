import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import type { Category } from '../../data/categories'
import { useLang } from '../../i18n/LanguageContext'
import ImageSlot from './ImageSlot'

export default function CategoryCard({ category, onSelect }: { category: Category; onSelect: () => void }) {
  const { lang, t, pick } = useLang()
  const other = category.name[lang === 'en' ? 'ta' : 'en']
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
      className="group flex h-full w-full flex-col overflow-hidden rounded-card border border-sand bg-white text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-md focus-visible:outline-gold"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <div className="h-full w-full transition-transform duration-500 group-hover:scale-105">
          <ImageSlot imageKey={category.imageKey} alt={pick(category.name)} />
        </div>
        {/* Subtle GlareHover sheen sweeping across on hover like light on polished brass */}
        <div
          className="pointer-events-none absolute inset-0 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-all duration-700 ease-out group-hover:translate-x-full group-hover:opacity-100"
          aria-hidden="true"
        />
      </div>
      <div className="flex flex-1 flex-col gap-0.5 p-4">
        <h3 className="text-[1.05rem]">{pick(category.name)}</h3>
        <p lang={lang === 'en' ? 'ta' : 'en'} className="text-sm text-muted">{other}</p>
        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-burgundy">
          {t('cat.explore')} <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </div>
    </motion.button>
  )
}
