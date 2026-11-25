import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Loader2, Send } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import { useQuoteCart } from '../context/QuoteCartContext'
import {
  revalidateQuoteCartItems,
  submitQuoteRequest,
  type RevalidatedQuoteLine,
} from '../services/storefront'
import { formatPaiseToINR } from '../utils/formatters'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Button from '../components/common/Button'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function QuoteRequestPage() {
  const { lang, t } = useLang()
  const navigate = useNavigate()
  const { items, clearCart } = useQuoteCart()

  const [validLines, setValidLines] = useState<RevalidatedQuoteLine[]>([])
  const [isLoadingCart, setIsLoadingCart] = useState(true)

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerLocation, setCustomerLocation] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [websiteHoneypot, setWebsiteHoneypot] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    if (items.length === 0) {
      setIsLoadingCart(false)
      setValidLines([])
      return
    }
    revalidateQuoteCartItems(items)
      .then((res) => {
        if (mounted) setValidLines(res.validLines)
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : t('quote.error'))
      })
      .finally(() => {
        if (mounted) setIsLoadingCart(false)
      })
    return () => {
      mounted = false
    }
  }, [items, t])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setError(null)

    const name = customerName.trim()
    const phone = customerPhone.trim()
    const email = customerEmail.trim()
    const location = customerLocation.trim()
    const notes = additionalNotes.trim()

    if (name.length < 2) {
      setError('Please enter your full name (at least 2 characters).')
      return
    }

    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10 || digits.length > 15 || !/^\+?[0-9\s\-()]{7,25}$/.test(phone)) {
      setError('Please enter a valid 10–15 digit phone number.')
      return
    }

    if (email && !EMAIL_REGEX.test(email)) {
      setError('Please enter a valid email address, or leave it blank.')
      return
    }

    if (location.length < 2) {
      setError('Please enter your city or delivery location.')
      return
    }

    if (validLines.length === 0) {
      setError('Your quote cart has no valid products. Please add items from the shop.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await submitQuoteRequest({
        customer_name: name,
        customer_phone: phone,
        customer_email: email || undefined,
        customer_location: location,
        additional_notes: notes || undefined,
        website: websiteHoneypot || undefined,
        items: validLines.map((l) => ({
          product_id: l.product.id,
          variant_id: l.variant?.id ?? null,
          quantity: l.cartItem.quantity,
        })),
      })

      const totalUnits = validLines.reduce((sum, l) => sum + l.cartItem.quantity, 0)
      const itemCount = validLines.length
      clearCart()

      navigate('/quote/success', {
        replace: true,
        state: {
          referenceNumber: response.reference_number,
          itemCount,
          totalUnits,
        },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quotation request.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-ivory/40">
      <Header />

      <main className="flex-1">
        <section className="border-b border-sand bg-white">
          <div className="mx-auto max-w-site px-4 py-8 sm:px-6 lg:px-8">
            <Link
              to="/quote"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-burgundy hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t('qreq.backToCart')}</span>
            </Link>
            <h1 className="mt-2 font-display text-3xl font-semibold text-burgundy">
              {t('qreq.title')}
            </h1>
            <p className="mt-1.5 text-sm sm:text-base text-muted">{t('qreq.desc')}</p>
          </div>
        </section>

        <section className="mx-auto max-w-site px-4 py-8 sm:px-6 lg:px-8">
          {isLoadingCart ? (
            <div className="h-64 rounded-panel border border-sand bg-white animate-pulse" />
          ) : validLines.length === 0 ? (
            <div className="rounded-panel border border-sand bg-white p-8 text-center">
              <h2 className="font-display text-xl font-semibold text-charcoal">
                {t('quote.emptyTitle')}
              </h2>
              <p className="mt-1.5 text-sm text-muted">{t('quote.emptyDesc')}</p>
              <Button onClick={() => navigate('/shop')} className="mt-5">
                {t('quote.continue')}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Form */}
              <form
                onSubmit={handleSubmit}
                noValidate
                className="rounded-panel border border-sand bg-white p-6 shadow-sm space-y-4 lg:col-span-2"
              >
                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-control border border-red-200 bg-red-50 p-3.5 text-sm text-red-800"
                  >
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
                    <p>{error}</p>
                  </div>
                )}

                {/* Hidden honeypot field for basic spam protection */}
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={websiteHoneypot}
                  onChange={(e) => setWebsiteHoneypot(e.target.value)}
                  className="hidden"
                  aria-hidden="true"
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="q-name"
                      className="block text-xs font-semibold uppercase tracking-wider text-charcoal"
                    >
                      {t('qreq.name')}
                    </label>
                    <input
                      id="q-name"
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="mt-1.5 min-h-[2.75rem] w-full rounded-control border border-sand bg-ivory/30 px-3 py-2 text-sm text-charcoal focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="q-phone"
                      className="block text-xs font-semibold uppercase tracking-wider text-charcoal"
                    >
                      {t('qreq.phone')}
                    </label>
                    <input
                      id="q-phone"
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="mt-1.5 min-h-[2.75rem] w-full rounded-control border border-sand bg-ivory/30 px-3 py-2 text-sm text-charcoal focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="q-email"
                      className="block text-xs font-semibold uppercase tracking-wider text-charcoal"
                    >
                      {t('qreq.email')}
                    </label>
                    <input
                      id="q-email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="mt-1.5 min-h-[2.75rem] w-full rounded-control border border-sand bg-ivory/30 px-3 py-2 text-sm text-charcoal focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="q-location"
                      className="block text-xs font-semibold uppercase tracking-wider text-charcoal"
                    >
                      {t('qreq.location')}
                    </label>
                    <input
                      id="q-location"
                      type="text"
                      required
                      placeholder="e.g. Madurai, Tamil Nadu"
                      value={customerLocation}
                      onChange={(e) => setCustomerLocation(e.target.value)}
                      className="mt-1.5 min-h-[2.75rem] w-full rounded-control border border-sand bg-ivory/30 px-3 py-2 text-sm text-charcoal focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="q-notes"
                    className="block text-xs font-semibold uppercase tracking-wider text-charcoal"
                  >
                    {t('qreq.notes')}
                  </label>
                  <textarea
                    id="q-notes"
                    rows={3}
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Bulk quantity requirements, engraving, or preferred delivery timeline..."
                    className="mt-1.5 w-full rounded-control border border-sand bg-ivory/30 px-3 py-2 text-sm text-charcoal focus:border-burgundy focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full justify-center sm:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        <span>{t('qreq.submitting')}</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" aria-hidden="true" />
                        <span>{t('qreq.submit')}</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {/* Right: Selected Items Snapshot */}
              <div className="rounded-panel border border-sand bg-white p-6 shadow-sm space-y-4 h-fit">
                <h2 className="font-display text-lg font-semibold text-charcoal border-b border-sand pb-3">
                  {t('quote.title')} ({validLines.length})
                </h2>

                <ul className="divide-y divide-sand/70 text-sm">
                  {validLines.map(({ cartItem, product, variant, unitPricePaise }) => {
                    const title =
                      lang === 'ta' && product.name_ta ? product.name_ta : product.name_en
                    return (
                      <li
                        key={`${cartItem.productId}-${cartItem.variantId ?? 'none'}`}
                        className="py-3 flex items-start justify-between gap-2"
                      >
                        <div>
                          <p className="font-medium text-charcoal">{title}</p>
                          <p className="text-xs text-muted">
                            Qty: {cartItem.quantity}
                            {variant && product.pricing_type === 'variant'
                              ? ` · ${variant.variant_name_en}`
                              : ''}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs font-semibold text-burgundy">
                          {unitPricePaise !== null
                            ? formatPaiseToINR(unitPricePaise)
                            : t('feat.enquiry')}
                        </span>
                      </li>
                    )
                  })}
                </ul>

                <p className="rounded-control bg-ivory/70 p-3 text-xs text-muted leading-relaxed">
                  {t('quote.estimateNote')}
                </p>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
