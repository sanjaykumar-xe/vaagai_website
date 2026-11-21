export interface Collection { slug: string; imageKey: string; name: { en: string; ta: string } }
export const collections: Collection[] = [
  { slug: 'festival-essentials', imageKey: 'col-festival', name: { en: 'Festival Essentials', ta: 'பண்டிகை அத்தியாவசியங்கள்' } },
  { slug: 'traditional-pooja', imageKey: 'col-pooja', name: { en: 'Traditional Pooja Collection', ta: 'பாரம்பரிய பூஜைத் தொகுப்பு' } },
  { slug: 'kitchen-essentials', imageKey: 'col-kitchen', name: { en: 'Kitchen Essentials', ta: 'சமையலறை அத்தியாவசியங்கள்' } },
  { slug: 'brass-lamps', imageKey: 'col-lamps', name: { en: 'Brass Lamp Collection', ta: 'பித்தளை விளக்குத் தொகுப்பு' } },
]
