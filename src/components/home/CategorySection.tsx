import { categories } from '../../data/categories'
import { useLang } from '../../i18n/LanguageContext'
import { useToast } from '../common/Toast'
import CategoryCard from '../common/CategoryCard'
import SectionHeading from '../common/SectionHeading'
import Reveal from '../common/Reveal'

export default function CategorySection() {
  const { t } = useLang()
  const notify = useToast()
  return (
    <section id="categories" aria-labelledby="cat-title" className="mx-auto max-w-site px-4 py-12 sm:px-6 md:py-16 lg:px-8 lg:py-20">
      <Reveal>
        <SectionHeading id="cat-title" title={t('cat.title')} desc={t('cat.desc')} />
      </Reveal>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {categories.map((c, i) => (
          <Reveal key={c.slug} delay={Math.min(i * 0.07, 0.5)}>
            <CategoryCard category={c} onSelect={() => notify(t('soon'))} />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
