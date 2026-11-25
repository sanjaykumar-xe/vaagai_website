import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, Search, ShoppingBag, User, X } from 'lucide-react'
import { motion, useScroll } from 'motion/react'
import { NAV } from '../../data/site'
import { useLang } from '../../i18n/LanguageContext'
import { EASING } from '../../lib/motion'
import { useToast } from '../common/Toast'
import LanguageSwitcher from '../common/LanguageSwitcher'
import LogoImage from '../common/LogoImage'
import MobileMenu from './MobileMenu'

function useActiveSection(isHome: boolean) {
  const [active, setActive] = useState('home')
  useEffect(() => {
    if (!isHome) return
    const els = NAV.map((n) => document.getElementById(n.id)).filter((e): e is HTMLElement => !!e)
    if (els.length === 0) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-35% 0px -55% 0px' },
    )
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [isHome])
  return active
}

const iconBtn = 'grid h-11 w-11 place-items-center rounded-control text-charcoal hover:bg-champagne/30'

export default function Header() {
  const { t } = useLang()
  const notify = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'
  const sectionActive = useActiveSection(isHome)
  const active = location.pathname === '/shop' ? 'shop' : isHome ? sectionActive : ''

  const [menu, setMenu] = useState(false)
  const [searching, setSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)

  const { scrollY, scrollYProgress } = useScroll()

  useEffect(() => {
    return scrollY.on('change', (y) => setScrolled(y > 40))
  }, [scrollY])

  const submitSearch = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = searchQuery.trim()
    setSearching(false)
    if (trimmed) {
      navigate(`/shop?q=${encodeURIComponent(trimmed)}`)
    } else {
      navigate('/shop')
    }
  }

  const handleNavClick = (id: string) => {
    if (id === 'shop') {
      navigate('/shop')
      return
    }
    if (id === 'home') {
      if (isHome) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        navigate('/')
      }
      return
    }
    if (isHome) {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      navigate(`/#${id}`)
    }
  }

  return (
    <header className={`sticky top-0 z-40 border-b border-sand bg-white/95 backdrop-blur transition-shadow duration-200 ${scrolled ? 'shadow-sm' : ''}`}>
      <div className={`mx-auto flex max-w-site items-center gap-4 px-4 sm:px-6 lg:px-8 transition-[height] duration-200 ease-out ${scrolled ? 'h-14 lg:h-[3.75rem]' : 'h-16 lg:h-[4.5rem]'}`}>
        <Link
          to="/"
          aria-label="Vaagai Metals Traders"
          className={`shrink-0 origin-left transition-transform duration-200 ease-out ${scrolled ? 'scale-90' : 'scale-100'}`}
        >
          <LogoImage className="h-10 lg:h-12" />
        </Link>

        <nav aria-label="Main" className="ml-6 hidden flex-1 lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => {
              const isCurrent = active === n.id
              const href = n.id === 'shop' ? '/shop' : n.id === 'home' ? '/' : `/#${n.id}`
              return (
                <li key={n.id} className="relative">
                  <a
                    href={href}
                    onClick={(e) => {
                      e.preventDefault()
                      handleNavClick(n.id)
                    }}
                    aria-current={isCurrent ? 'page' : undefined}
                    className={`relative block rounded-control px-3.5 py-2 text-[0.95rem] font-medium transition-colors ${
                      isCurrent ? 'text-burgundy' : 'text-charcoal hover:text-burgundy'
                    }`}
                  >
                    {t(n.key)}
                    {isCurrent && (
                      <motion.span
                        layoutId="active-nav-indicator"
                        className="absolute bottom-0 left-3.5 right-3.5 h-[2px] rounded-full bg-gold"
                        transition={{ duration: 0.25, ease: EASING.default }}
                      />
                    )}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-0.5 sm:gap-1 lg:ml-0">
          <div className="mr-0.5 sm:mr-1 lg:ml-2">
            <LanguageSwitcher id="header" />
          </div>
          <button
            type="button"
            className={iconBtn}
            aria-label={t('a11y.search')}
            aria-expanded={searching}
            onClick={() => setSearching((s) => !s)}
          >
            <Search className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            className={`${iconBtn} hidden sm:grid`}
            aria-label={t('a11y.account')}
            title={t('a11y.account')}
            onClick={() => notify(t('toast.accountSoon'))}
          >
            <User className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            className={iconBtn}
            aria-label={t('a11y.cart')}
            title={t('a11y.cart')}
            onClick={() => notify(t('toast.quoteCartSoon'))}
          >
            <ShoppingBag className="h-5 w-5" aria-hidden />
          </button>

          {/* Mobile Menu button */}
          <button
            type="button"
            className={`${iconBtn} lg:hidden`}
            aria-label={menu ? t('a11y.close') : t('a11y.menu')}
            aria-expanded={menu}
            onClick={() => setMenu((m) => !m)}
          >
            {menu ? (
              <X className="h-6 w-6 text-charcoal" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6 text-charcoal" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* 2px antique-gold scroll progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold"
        style={{ scaleX: scrollYProgress, transformOrigin: '0% 50%' }}
        aria-hidden="true"
      />

      {searching && (
        <form onSubmit={submitSearch} role="search" className="border-t border-sand bg-ivory">
          <div className="mx-auto flex max-w-site gap-2 px-4 py-3 sm:px-6 lg:px-8">
            <label className="sr-only" htmlFor="site-search">{t('a11y.search')}</label>
            <input
              id="site-search"
              type="search"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              className="min-h-[2.75rem] flex-1 rounded-control border border-sand bg-white px-4 text-base placeholder:text-muted focus:border-burgundy"
            />
            <button type="submit" className="rounded-control bg-burgundy px-5 font-semibold text-white hover:bg-wine">
              {t('search.go')}
            </button>
          </div>
        </form>
      )}

      <MobileMenu open={menu} onClose={() => setMenu(false)} active={active} onSelectNav={handleNavClick} />
    </header>
  )
}
