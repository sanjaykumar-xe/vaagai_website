import { Link } from 'react-router-dom'
import { Instagram } from 'lucide-react'
import { motion } from 'motion/react'
import { NAV, POLICY_LINKS, SITE } from '../../data/site'
import { categories } from '../../data/categories'
import { useLang } from '../../i18n/LanguageContext'
import { useToast } from '../common/Toast'
import { EASING, VIEWPORT_CONFIG } from '../../lib/motion'
import LogoImage from '../common/LogoImage'
import LanguageSwitcher from '../common/LanguageSwitcher'
import Reveal from '../common/Reveal'

export default function Footer() {
  const { t, pick } = useLang()
  const notify = useToast()
  const soon = () => notify(t('soon'))

  // Link with underline growing from left over 180ms
  const link = 'relative inline-block text-white/80 hover:text-white after:content-[""] after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-full after:bg-champagne after:origin-left after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-180'
  const btnLink = `${link} text-left`
  const head = 'mb-4 text-base font-semibold text-champagne'

  return (
    <footer className="bg-wine text-white">
      <div className="mx-auto grid max-w-site gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_1.2fr] lg:px-8">
        {/* Column 1 */}
        <Reveal delay={0}>
          <div className="max-w-xs">
            <LogoImage className="h-14" />
            <p className="mt-4 text-sm text-white/80">{t('footer.desc')}</p>
            <div className="mt-5"><LanguageSwitcher dark id="footer" /></div>
          </div>
        </Reveal>

        {/* Column 2 */}
        <Reveal delay={0.06}>
          <nav aria-label={t('footer.links')}>
            <h2 className={head}>{t('footer.links')}</h2>
            <ul className="space-y-2.5 text-sm">
              {NAV.map(n => (
                <li key={n.id}>
                  {n.id === 'shop' ? (
                    <Link to="/shop" className={link}>{t(n.key)}</Link>
                  ) : n.id === 'home' ? (
                    <Link to="/" className={link}>{t(n.key)}</Link>
                  ) : (
                    <a href={`/#${n.id}`} className={link}>{t(n.key)}</a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </Reveal>

        {/* Column 3 */}
        <Reveal delay={0.12}>
          <div>
            <h2 className={head}>{t('footer.cats')}</h2>
            <ul className="space-y-2.5 text-sm">
              {categories.map(c => (
                <li key={c.slug}>
                  <Link to={`/shop?category=${encodeURIComponent(c.slug)}`} className={link}>{pick(c.name)}</Link>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* Column 4 */}
        <Reveal delay={0.18}>
          <div>
            <h2 className={head}>{t('footer.contact')}</h2>
            <ul className="space-y-2.5 text-sm text-white/80">
              {SITE.phone && <li>{SITE.phone}</li>}
              {SITE.address && <li>{SITE.address}</li>}
              {!SITE.phone && !SITE.address && <li>{t('footer.tbd')}</li>}
              <li>
                <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" className={`${link} inline-flex items-center gap-2`}>
                  <Instagram className="h-4 w-4" aria-hidden="true" /> {t('footer.instagram')}
                </a>
              </li>
            </ul>
          </div>
        </Reveal>
      </div>

      {/* Gold divider line drawing from left to right (scaleX 0 -> 1, 500ms) once */}
      <motion.div
        className="border-t border-gold/40"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={VIEWPORT_CONFIG}
        transition={{ duration: 0.5, ease: EASING.default }}
        style={{ transformOrigin: '0% 50%' }}
        aria-hidden="true"
      />

      <div className="mx-auto flex max-w-site flex-col gap-4 px-4 py-6 text-sm text-white/70 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p>© {new Date().getFullYear()} {SITE.name}. {t('footer.copy')}</p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {POLICY_LINKS.map(k => (
            <li key={k}>
              <button type="button" onClick={soon} className={btnLink}>{t(k)}</button>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
