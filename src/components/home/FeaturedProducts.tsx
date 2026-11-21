import { products } from '../../data/products'
import { useLang } from '../../i18n/LanguageContext'
import { useToast } from '../common/Toast'
import ProductCard from '../common/ProductCard'
import SectionHeading from '../common/SectionHeading'
import Reveal from '../common/Reveal'

export default function FeaturedProducts() {
  const { t } = useLang()
  const notify = useToast()
  return (
    <section id="shop" aria-labelledby="feat-title" className="border-y border-sand bg-white">
      <div className="mx-auto max-w-site px-4 py-12 sm:px-6 md:py-16 lg:px-8 lg:py-20">
        <Reveal>
          <SectionHeading id="feat-title" title={t('feat.title')} desc={t('feat.desc')} />
        </Reveal>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {products.map((p, i) => (
            <Reveal key={p.slug} delay={Math.min(i * 0.07, 0.5)}>
              <ProductCard product={p} onView={() => notify(t('soon'))} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
