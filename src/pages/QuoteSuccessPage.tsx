import { Link, useLocation } from 'react-router-dom'
import { CheckCircle2, MessageCircle, PhoneCall, ShoppingBag } from 'lucide-react'
import { SITE } from '../data/site'
import { useLang } from '../i18n/LanguageContext'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Button from '../components/common/Button'

interface SuccessLocationState {
  referenceNumber?: string
  itemCount?: number
  totalUnits?: number
}

export default function QuoteSuccessPage() {
  const { t } = useLang()
  const location = useLocation()
  const state = (location.state as SuccessLocationState | null) || null
  const referenceNumber = state?.referenceNumber

  const buildWhatsappFollowupUrl = () => {
    if (!SITE.whatsappUrl || !referenceNumber) return null
    const msg = `Hello Vaagai Metals Traders, I have submitted a quotation request (Reference: ${referenceNumber}).`
    const sep = SITE.whatsappUrl.includes('?') ? '&' : '?'
    return `${SITE.whatsappUrl}${sep}text=${encodeURIComponent(msg)}`
  }

  const whatsappFollowupUrl = buildWhatsappFollowupUrl()

  return (
    <div className="flex min-h-screen flex-col bg-ivory/40">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-14">
        <div className="w-full max-w-lg rounded-panel border border-sand bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-burgundy">
            {t('qsucc.title')}
          </h1>

          {referenceNumber ? (
            <div className="mt-5 rounded-card border border-champagne bg-champagne/25 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                {t('qsucc.ref')}
              </p>
              <p className="mt-1 font-mono text-xl font-bold text-charcoal">
                {referenceNumber}
              </p>
            </div>
          ) : null}

          <p className="mt-4 text-sm text-charcoal/85 leading-relaxed">
            {t('qsucc.desc')}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {whatsappFollowupUrl ? (
              <Button
                href={whatsappFollowupUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                <span>{t('qsucc.whatsapp')}</span>
              </Button>
            ) : (
              <Link
                to="/#contact"
                className="inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-control border border-burgundy/40 bg-white px-5 py-2.5 text-sm font-semibold text-burgundy hover:bg-champagne/30 transition-colors"
              >
                <PhoneCall className="h-4 w-4" aria-hidden="true" />
                <span>{t('cta.contact')}</span>
              </Link>
            )}

            <Link
              to="/shop"
              className="inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-control bg-burgundy px-5 py-2.5 text-sm font-semibold text-white hover:bg-wine transition-colors"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              <span>{t('qsucc.backShop')}</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
