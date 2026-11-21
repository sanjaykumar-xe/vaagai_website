import { MessageCircle } from 'lucide-react'
import { SITE } from '../../data/site'
import { useLang } from '../../i18n/LanguageContext'
import { useToast } from '../common/Toast'
import Button from '../common/Button'
import Reveal from '../common/Reveal'

export default function ContactCTA() {
  const { t } = useLang()
  const notify = useToast()
  return (
    <section id="contact" aria-labelledby="cta-title" className="mx-auto max-w-site px-4 pb-14 sm:px-6 md:pb-20 lg:px-8">
      <Reveal>
        <div className="rounded-panel border border-champagne bg-champagne/30 px-6 py-12 text-center sm:px-12 sm:py-16">
          <h2 id="cta-title" className="section-title mx-auto max-w-2xl">{t('cta.title')}</h2>
          <p className="mx-auto mt-3 max-w-xl text-charcoal/85">{t('cta.desc')}</p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button href="#categories">{t('cta.explore')}</Button>
            <Button variant="secondary" onClick={() => notify(t('soon'))}>{t('cta.contact')}</Button>
            {SITE.whatsappUrl && (
              <Button variant="secondary" href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" aria-hidden="true" /> {t('cta.whatsapp')}
              </Button>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
