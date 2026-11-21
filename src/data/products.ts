export interface Product {
  slug: string; imageKey: string; featured?: boolean
  name: { en: string; ta: string }; material: { en: string; ta: string }
  price?: number // INR; omitted until real prices are supplied
}
// DEMO DATA ONLY: shows the card layout. Replace with database products later.
export const products: Product[] = [
  { slug: 'sample-kuthu-vilakku', imageKey: 'prod-1', featured: true, name: { en: 'Kuthu Vilakku', ta: 'குத்துவிளக்கு' }, material: { en: 'Brass', ta: 'பித்தளை' } },
  { slug: 'sample-pooja-thali', imageKey: 'prod-2', name: { en: 'Pooja Plate', ta: 'பூஜைத் தட்டு' }, material: { en: 'Brass', ta: 'பித்தளை' } },
  { slug: 'sample-dosa-tawa', imageKey: 'prod-3', featured: true, name: { en: 'Dosa Tawa', ta: 'தோசைக்கல்' }, material: { en: 'Cast iron', ta: 'வார்ப்பிரும்பு' } },
  { slug: 'sample-pooja-bowl', imageKey: 'prod-4', name: { en: 'Pooja Bowl', ta: 'பூஜைக் கிண்ணம்' }, material: { en: 'Silver', ta: 'வெள்ளி' } },
]
