// Central, editable store settings. Replace TBD values only with business-confirmed details.
export const SITE = {
  name: 'Vaagai Metals Traders',
  instagramUrl: 'https://www.instagram.com/vaagai_metals_traders/',
  whatsappUrl: null as string | null, // TBD: set to the official https://wa.me/<number> link
  phone: null as string | null, // TBD
  address: null as string | null, // TBD
  logoSrc: '/brand/vaagai-logo-header.png', // place the cropped original logo here
}

export const NAV = [
  { id: 'home', key: 'nav.home' },
  { id: 'shop', key: 'nav.shop' },
  { id: 'categories', key: 'nav.categories' },
  { id: 'about', key: 'nav.about' },
  { id: 'contact', key: 'nav.contact' },
] as const

export const POLICY_LINKS = ['footer.privacy', 'footer.terms', 'footer.shipping', 'footer.returns'] as const
