import { useEffect, useState } from 'react'
import { useLang } from '../i18n/LanguageContext'
import AnnouncementBar from '../components/layout/AnnouncementBar'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import HeroSection from '../components/home/HeroSection'
import CategorySection from '../components/home/CategorySection'
import FeaturedProducts from '../components/home/FeaturedProducts'
import BrandStory from '../components/home/BrandStory'
import WhyChooseUs from '../components/home/WhyChooseUs'
import CollectionsSection from '../components/home/CollectionsSection'
import InstagramSection from '../components/home/InstagramSection'
import ContactCTA from '../components/home/ContactCTA'
import BackToTop from '../components/common/BackToTop'

export default function HomePage() {
  const { lang } = useLang()
  const [fading, setFading] = useState(false)

  // 200ms crossfade on language change without layout shift or remounting
  useEffect(() => {
    setFading(true)
    const t = window.setTimeout(() => setFading(false), 200)
    return () => window.clearTimeout(t)
  }, [lang])

  return (
    <div className={`transition-opacity duration-200 ease-out ${fading ? 'opacity-40' : 'opacity-100'}`}>
      <AnnouncementBar />
      <Header />
      <main>
        <HeroSection />
        <CategorySection />
        <FeaturedProducts />
        <BrandStory />
        <WhyChooseUs />
        <CollectionsSection />
        <InstagramSection />
        <ContactCTA />
      </main>
      <Footer />
      <BackToTop />
    </div>
  )
}
