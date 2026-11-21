export interface Category { slug: string; imageKey: string; name: { en: string; ta: string } }
// Proposed categories (project.md 3.1). Later: load from the database.
export const categories: Category[] = [
  { slug: 'pooja-items', imageKey: 'cat-pooja', name: { en: 'Pooja Items', ta: 'பூஜைப் பொருட்கள்' } },
  { slug: 'brassware', imageKey: 'cat-brassware', name: { en: 'Brassware', ta: 'பித்தளைப் பொருட்கள்' } },
  { slug: 'silverware', imageKey: 'cat-silverware', name: { en: 'Silverware', ta: 'வெள்ளிப் பொருட்கள்' } },
  { slug: 'cast-iron', imageKey: 'cat-cast-iron', name: { en: 'Cast Iron', ta: 'வார்ப்பிரும்பு பாத்திரங்கள்' } },
  { slug: 'aluminium', imageKey: 'cat-aluminium', name: { en: 'Aluminium Products', ta: 'அலுமினியப் பொருட்கள்' } },
  { slug: 'traditional-lamps', imageKey: 'cat-lamps', name: { en: 'Traditional Lamps', ta: 'பாரம்பரிய விளக்குகள்' } },
  { slug: 'kitchen-accessories', imageKey: 'cat-kitchen', name: { en: 'Kitchen Accessories', ta: 'சமையலறை உபகரணங்கள்' } },
  { slug: 'decor-gifts', imageKey: 'cat-decor', name: { en: 'Decor & Gifts', ta: 'அலங்காரப் பொருட்கள்' } },
]
