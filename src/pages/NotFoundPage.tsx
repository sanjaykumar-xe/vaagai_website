import { Link } from 'react-router-dom'
import { ArrowLeft, Compass } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'

export default function NotFoundPage() {
  const { t } = useLang()

  return (
    <div className="flex min-h-screen flex-col bg-ivory/40">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-panel border border-sand bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-burgundy/10 text-burgundy">
            <Compass className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">404</p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-charcoal">
            {t('notFound.title')}
          </h1>
          <p className="mt-2 text-sm text-muted leading-relaxed">{t('notFound.desc')}</p>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <Link
              to="/"
              className="inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-control bg-burgundy px-5 py-2.5 text-sm font-semibold text-white hover:bg-wine transition-colors"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>{t('notFound.home')}</span>
            </Link>
            <Link
              to="/shop"
              className="inline-flex min-h-[2.75rem] items-center justify-center rounded-control border border-burgundy/40 bg-white px-5 py-2.5 text-sm font-semibold text-burgundy hover:bg-champagne/30 transition-colors"
            >
              {t('notFound.shop')}
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
