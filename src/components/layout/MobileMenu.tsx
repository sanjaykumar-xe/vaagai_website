import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { NAV } from '../../data/site'
import { useLang } from '../../i18n/LanguageContext'
import { EASING } from '../../lib/motion'
import LanguageSwitcher from '../common/LanguageSwitcher'
import LogoImage from '../common/LogoImage'

const containerVariants = {
  open: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  closed: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
}

const itemVariants = {
  open: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.22, ease: EASING.default },
  },
  closed: {
    opacity: 0,
    x: 10,
    transition: { duration: 0.15, ease: 'easeIn' as const },
  },
}

export default function MobileMenu({ open, onClose, active }: { open: boolean; onClose: () => void; active: string }) {
  const { t } = useLang()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop with 250ms fade */}
          <motion.div
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-wine/50"
            aria-hidden="true"
          />

          {/* Drawer with damped spring (no bounce), closing in 200ms */}
          <motion.nav
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%', transition: { duration: 0.2, ease: [0.32, 0, 0.67, 0] as const } }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-sand p-4">
              <LogoImage className="h-10" />
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label={t('a11y.close')}
                className="grid h-11 w-11 place-items-center rounded-control hover:bg-champagne/30"
              >
                <X className="h-6 w-6" aria-hidden />
              </button>
            </div>

            <motion.ul
              className="flex-1 overflow-y-auto p-2"
              variants={containerVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              {NAV.map(n => (
                <motion.li key={n.id} variants={itemVariants}>
                  <a
                    href={`#${n.id}`}
                    onClick={onClose}
                    aria-current={active === n.id ? 'true' : undefined}
                    className={`block rounded-control px-4 py-3.5 text-lg ${
                      active === n.id ? 'bg-burgundy text-white' : 'hover:bg-champagne/30'
                    }`}
                  >
                    {t(n.key)}
                  </a>
                </motion.li>
              ))}
            </motion.ul>

            <div className="border-t border-sand p-4">
              <LanguageSwitcher id="mobile" />
            </div>
          </motion.nav>
        </div>
      )}
    </AnimatePresence>
  )
}
