# Vaagai Metals Traders — Design System & UX Specification

> **Document:** `design.md`  
> **Purpose:** Visual identity, design tokens, layout system, component behaviour, responsive rules and page-by-page design guidance.  
> **Brand source:** User-supplied Vaagai logo (traditional oil lamp emblem, white oval, burgundy background and white VAAGAI wordmark).  
> **Design direction:** Premium South Indian heritage retail, expressed through a modern, clean e-commerce interface.

---

## 1. Design vision

### 1.1 Brand idea

**VAAGAI METALS TRADERS** should feel like a trusted traditional metalware retailer presented through a refined modern shopping experience.

The visual identity should communicate:

- South Indian tradition and heritage.
- Familiarity and trust.
- Metal craftsmanship and product quality.
- A premium but approachable retail experience.
- Clear, effortless online shopping.

### 1.2 Design concept

**Modern Heritage:** traditional brand cues, warm materials and restrained ornamentation combined with contemporary e-commerce layouts, readable typography, generous whitespace and intuitive interactions.

Avoid both extremes:

- Do not make the site look like an old-fashioned catalogue or wedding invitation.
- Do not make it look like a generic technology startup or generic marketplace template.

The products—not decoration—must remain the visual focus.

### 1.3 Design principles

1. **Brand first:** use the supplied logo faithfully.
2. **Product first:** large, clear, accurate product photography.
3. **Warm and restrained:** ivory, burgundy and antique gold in a balanced ratio.
4. **Commerce clarity:** price, stock, variant and CTA must be easy to understand.
5. **Mobile first:** shopping must be comfortable on a phone.
6. **Accessible:** readable contrast, keyboard access and visible focus states.
7. **Consistent:** a shared design language across storefront and admin.
8. **Honest:** no invented reviews, discounts, product claims or shipping promises.
9. **Bilingual by design:** English and Tamil must both fit naturally into the layouts.

---

## 2. Logo usage

### 2.1 Supplied logo

Use the original user-supplied Vaagai logo. Its key features are:

- Deep burgundy rectangular background.
- White oval containing a line-art traditional oil lamp.
- White uppercase `VAAGAI` wordmark.

### 2.2 Rules

- Never redraw, approximate or replace the lamp emblem.
- Never typeset `VAAGAI` as a substitute for the supplied logo artwork when the artwork is available.
- Preserve the original aspect ratio.
- Never stretch, skew or recolour the artwork.
- Keep enough clear space around it.
- On light header backgrounds, use a suitable original logo asset or a carefully sized container that preserves the actual artwork.
- If the supplied image has excess whitespace, prepare a cropped web asset while retaining the entire logo; do not crop off the logo border or emblem.
- Use the logo in the main header, footer and appropriate brand touchpoints.
- Use a simplified favicon only if an official/cropped lamp mark is prepared from the supplied logo without distorting it.

### 2.3 Asset handling

Recommended asset variants to prepare when source quality permits:

- `vaagai-logo-original` — untouched source file.
- `vaagai-logo-header` — tightly cropped version retaining full artwork.
- `vaagai-logo-footer` — same brand artwork at appropriate resolution.
- `vaagai-lamp-mark` — optional icon crop for favicon only if it remains legible.

Do not distribute or claim a vector version unless a genuine vector source is supplied or recreated with explicit approval.

---

## 3. Colour system

The logo's burgundy is the primary visual anchor. The approximate sampled background colour is `#450506`. The palette below is the approved starting point; visual contrast must still be tested in actual UI states.

### 3.1 Brand palette

| Token | Hex | Role |
|---|---|---|
| `vaagai-burgundy` | `#450506` | Primary brand colour, primary buttons, selected navigation states |
| `deep-wine` | `#2B0305` | Footer, deep brand surfaces, strong hover states |
| `antique-gold` | `#B58A4A` | Restrained accent, fine details, decorative highlights |
| `champagne` | `#E5D0A7` | Secondary decorative tint, warm highlight surface |

### 3.2 Neutral palette

| Token | Hex | Role |
|---|---|---|
| `warm-ivory` | `#FAF7F1` | Main page background |
| `white` | `#FFFFFF` | Product cards, inputs, clean surfaces |
| `charcoal` | `#302724` | Main text and icons |
| `warm-grey` | `#E9E1D7` | Borders, dividers and subtle surfaces |
| `muted-text` | `#756B64` | Secondary labels and supporting text; verify contrast per background |

### 3.3 Semantic colours

Use semantic colours only where they communicate status; do not replace brand colours with them.

- Success: accessible green for payment verified, delivered and successful actions.
- Warning: amber/orange for pending verification, low stock and attention states.
- Error: accessible red for failed payment, validation errors and destructive actions.
- Information: restrained blue for neutral notices.

Test text contrast for all foreground/background combinations. Antique gold is an accent and should not be used for small body text on white/ivory unless contrast is verified.

### 3.4 Colour balance

As a visual guideline:

- Approximately 75% warm ivory/white surfaces.
- Approximately 20% burgundy/deep-wine brand surfaces and accents.
- Approximately 5% antique-gold/champagne accents.

This is a directional guideline, not a hard CSS rule.

### 3.5 Usage matrix

| Element | Treatment |
|---|---|
| Main site background | Warm ivory |
| Main content cards | White |
| Header | White or warm ivory |
| Announcement bar | Burgundy with white text |
| Primary CTA | Burgundy with white text |
| Primary CTA hover | Deep wine |
| Secondary CTA | White/ivory with burgundy border/text |
| Selected category/filter | Burgundy treatment with accessible contrast |
| Prices | Deep wine or burgundy |
| Small premium accents | Antique gold |
| Footer | Deep wine or burgundy |
| Main text | Charcoal |
| Borders/dividers | Warm grey |

Do not fill every section with burgundy. Avoid excessive gold outlines, gold gradients and gold body copy.

---

## 4. Typography

### 4.1 Font pairing

Preferred starting pairing:

- **English display/headings:** Lora for selected editorial headings, or DM Sans if a more modern consistent system is preferred.
- **English UI/body:** DM Sans.
- **Tamil:** Noto Sans Tamil.

Use fonts that are available and licensed for web use. If the chosen font files are not supplied, use a reliable web font source or system fallbacks and document the source. Do not bundle unlicensed fonts.

### 4.2 Typography hierarchy

| Role | Desktop guidance | Mobile guidance | Weight |
|---|---:|---:|---|
| Hero heading | 48–64px | 34–42px | 600–700 |
| Page heading | 36–44px | 28–34px | 600–700 |
| Section heading | 28–36px | 24–30px | 600–700 |
| Card heading | 18–22px | 16–19px | 600 |
| Body | 16–18px | 15–16px | 400 |
| Secondary text | 14–15px | 13–14px | 400 |
| Small label | 12–13px | 12–13px | 500–600 |

These are starting ranges. Tune line lengths and scale with actual content. Avoid oversized headings that crowd the viewport.

### 4.3 Tamil typography rules

- Use Noto Sans Tamil or a tested Tamil-capable font.
- Set comfortable line height for Tamil glyphs.
- Never clip Tamil text vertically.
- Avoid forced uppercase transformations on Tamil.
- Test button width and navigation wrapping in both languages.
- Test actual Tamil product names; do not validate only with short sample words.

---

## 5. Layout, spacing and shape system

### 5.1 Container widths

Use a centred content container with responsive gutters.

Suggested maximum widths:

- Standard content: 1200–1280px.
- Wide hero/editorial sections: up to 1360px where justified.
- Text-heavy content: 680–760px for comfortable reading.

### 5.2 Spacing scale

Use a consistent spacing scale, for example:

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px`.

Section spacing should be generous but not excessively tall. Typical desktop section padding can begin around 64–88px vertically, reducing to 40–56px on mobile depending on content.

### 5.3 Border radius

- Small controls: 6–8px.
- Inputs/buttons/cards: 8–12px.
- Larger image panels: 12–18px.
- Pills/badges: fully rounded only when appropriate.

Avoid excessive rounded-card styling that makes the store look like a generic SaaS dashboard.

### 5.4 Borders and shadows

- Prefer subtle warm-grey borders.
- Use soft, low-elevation shadows sparingly for overlays, drawers and floating surfaces.
- Avoid thick gold borders and heavy black shadows.
- Product cards may use a subtle border with a gentle hover lift or image zoom.

---

## 6. Imagery and art direction

### 6.1 Desired photography

Use actual Vaagai product photography as the primary source wherever available.

Photo subjects may include:

- Brass lamps and kuthu vilakku.
- Pooja accessories.
- Brass and other metal utensils.
- Cast iron cookware.
- Aluminium products.
- Traditional kitchen accessories.
- Real shop/showroom photography.

### 6.2 Photography style

- Warm, natural, soft directional lighting.
- Neutral ivory, beige, wood or subtle dark backgrounds.
- Accurate metal colour and finish.
- Clear product silhouettes and detail.
- Multiple angles for product detail pages.
- Consistent framing for catalogue cards.

Avoid oversaturated yellow/gold treatments that misrepresent the actual metal colour. Avoid watermarks and unrelated products.

### 6.3 Placeholder rules

During prototype development, temporary sample images are permitted if no real product images are supplied. They must be centralised and easy to replace. Do not imply temporary images are actual Vaagai stock. Never create fake customer photos, reviews or claims.

### 6.4 Image ratios

Suggested defaults:

- Hero/editorial banner: 16:9 or art-directed wide crop.
- Category cards: 4:3 or 1:1.
- Product cards: 1:1 or 4:5, consistent within a listing.
- Product detail gallery: large 1:1 or 4:5 area.
- Instagram showcase: consistent square crops unless original content calls for a varied grid.

Use `object-fit: contain` for isolated product images where the complete item needs to remain visible. Use `cover` for lifestyle/editorial photography where cropping is intentional.

---

## 7. Global navigation design

### 7.1 Announcement bar

- Slim height.
- Burgundy background.
- White, readable small text.
- Optional small icon only if useful.
- Content controlled by store settings in the full application.
- No fake promotion, discount or delivery guarantee.

### 7.2 Desktop header

- White/ivory surface.
- Logo aligned clearly on the left.
- Navigation links with ample spacing.
- Search field or search trigger.
- Wishlist and cart icons with accessible labels.
- Language switcher visible and easy to use.
- Sticky behaviour may be used if it does not consume too much viewport height.

### 7.3 Mobile header

- Compact logo and primary action icons.
- Hamburger menu opens an accessible drawer.
- Drawer includes all key navigation and language control.
- Do not let the drawer obscure the close action or create scroll traps.
- Optional bottom nav: Home, Categories, Search, Wishlist, Cart.

### 7.4 Active and interactive states

- Clear hover state.
- Clear keyboard focus state.
- Active section/page indicator.
- Proper disabled/loading state where applicable.
- Icons must have accessible names when not accompanied by text.

---

## 8. Component design specification

### 8.1 Buttons

**Primary button**

- Burgundy fill.
- White text.
- Medium/semibold weight.
- Comfortable height (roughly 44–48px for primary actions).
- Hover: deep wine.
- Visible focus ring.
- Disabled/loading state.

**Secondary button**

- White or ivory surface.
- Burgundy text and subtle border.
- Hover with restrained warm-tint background.

**Text/link button**

- Charcoal/burgundy.
- Underline or clear hover treatment when appropriate.

Do not use multiple competing primary buttons in one visual group.

### 8.2 Product card

Required visual elements:

- Consistent product image frame.
- Wishlist icon in a non-obstructive position.
- Product name.
- Optional material/variant summary.
- Price and genuine compare-at price if applicable.
- Stock/enquiry label where relevant.
- Add to Cart or View/Enquire action depending on product mode.

Behaviour:

- Image/title navigate to product details.
- Wishlist action has accessible feedback.
- Add to Cart updates cart count and shows concise confirmation.
- Avoid showing ratings unless real review data exists.
- Avoid fake discount badges.

### 8.3 Category card

- Strong category photograph.
- English and Tamil category names where space permits.
- Clear Explore affordance.
- Subtle image hover scale or overlay.
- Consistent aspect ratio.

### 8.4 Inputs

- White surface with warm-grey border.
- Clear label above or appropriately associated.
- Placeholder is not a replacement for a label.
- Visible focus border/ring.
- Inline validation message.
- Comfortable mobile tap size.

### 8.5 Badges and status labels

Use restrained small badges for:

- New.
- Featured.
- In stock.
- Low stock (admin).
- Out of stock.
- Enquiry only.
- Payment pending/verified.

Use semantic status colours only where needed. Do not turn every product label into a colourful sticker.

### 8.6 Toasts and feedback

- Brief success toast for add-to-cart or saved wishlist.
- Clear error toast for failed action.
- Do not rely solely on colour; include text/icon and accessible announcement.

### 8.7 Drawers and dialogs

- Filter drawer on mobile.
- Mobile navigation drawer.
- Confirmation dialog for destructive admin actions.
- Clear close button and keyboard behaviour.
- Avoid nested modal complexity.

---

## 9. Page-by-page visual specification

## 9.1 Homepage `/`

### Goal

Communicate brand quality quickly, introduce the product categories and guide customers into shopping.

### Section order

1. Announcement bar.
2. Main header/navigation.
3. Hero.
4. Shop by category.
5. Featured products.
6. New arrivals or admin-selected collection.
7. Brand story.
8. Why choose Vaagai.
9. Seasonal/special collections.
10. Instagram showcase.
11. Contact CTA.
12. Footer.

### Hero direction

Suggested headline:

**Tradition in Every Detail. Quality in Every Product.**

Tamil:

**ஒவ்வொரு பொருளிலும் பாரம்பரியம். ஒவ்வொரு தேர்விலும் தரம்.**

Supporting text:

"Discover our collection of traditional brassware, pooja essentials, kitchen utensils and timeless metalware for your home."

Primary CTA: `Explore Collection`  
Secondary CTA: `Discover Vaagai`

Design:

- Large premium lifestyle/product image featuring authentic metalware.
- Clear headline and concise supporting text.
- Burgundy primary CTA.
- Gold used only for minor emphasis.
- Keep mobile hero uncluttered; stack image/text or use a deliberate art-directed crop.
- No carousel required for the initial version; one strong hero is preferred.

### Category section

Use a balanced grid. On desktop show 4 columns where the card remains legible; on small screens use 2 columns. Cards contain image, English title, Tamil title and explore link.

### Featured products

Use a 4-column desktop grid where space allows, 2 columns on mobile. Show a manageable number of products, such as 4–8. Product content must come from real or clearly labelled demo data.

### Brand story

Use an editorial split layout: image on one side, text and CTA on the other. Use genuine shop photography if supplied. Do not invent the business history.

### Why choose Vaagai

A simple row/grid of 3–4 benefits, for example traditional collections, kitchen and pooja essentials, carefully selected products and customer-friendly shopping. Keep claims factual and business-approved.

### Special collections

Use 2–4 visual collection panels. Collection titles can include Festival Essentials, Traditional Pooja Collection, Kitchen Essentials and Brass Lamp Collection, subject to actual product availability.

### Instagram section

Link to `https://www.instagram.com/vaagai_metals_traders/`. Do not display an imitation live feed. Use supplied Instagram/shop photos or a clearly labelled static showcase.

### Contact CTA

Use a burgundy or warm ivory feature panel with heading, short copy and links to Shop/Contact. Add a WhatsApp CTA only when the real official number is configured.

### Footer

Deep-wine/burgundy background, white readable text, restrained gold separators/accents. Include logo, brief description, navigation, categories, contact details when confirmed, Instagram and policy links.

## 9.2 Shop all `/shop`

- Page title and brief description.
- Product count.
- Search/filter/sort toolbar.
- Desktop sidebar filters.
- Responsive product grid.
- Pagination or load more; do not load all products at once.
- Empty state with clear reset filters action.
- Loading skeletons that match product-card geometry.

Filters: category, material, price, availability, use and size where applicable. Mobile filters open in a bottom drawer/sheet with Apply and Clear actions.

## 9.3 Category `/category/:slug`

- Category title in selected language.
- Optional category banner/image.
- Brief description.
- Product count.
- Reuse Shop listing/filter components with category preselected.
- Related categories near the bottom where useful.

## 9.4 Search `/search`

- Search query visible in page title/input.
- Suggestions while typing only if data volume/performance supports it.
- Search by English/Tamil product names and supported metadata.
- Empty state with helpful categories or reset search.
- Recent searches may be stored locally; include clear-history action.

## 9.5 Product detail `/product/:slug`

Desktop:

- Gallery on left.
- Product information and purchase controls on right.
- Clear price/variant/stock hierarchy.

Mobile:

- Gallery first.
- Product title and price clearly visible.
- Variant/quantity controls with adequate tap area.
- Primary action easy to reach.
- Sticky add-to-cart bar may be used if it does not obscure content.

Below purchase details:

- Description.
- Specifications.
- Material.
- Weight/dimensions.
- Care.
- Delivery details.
- Return policy summary.
- Related products.

Never show fabricated ratings, review count or discount percentage.

## 9.6 Wishlist `/wishlist`

- Simple product grid.
- Remove action.
- Add-to-cart where purchasable.
- Empty state explaining how to save products.
- For guest users, local persistence is acceptable initially.

## 9.7 Cart `/cart`

Desktop: item list and order summary side-by-side.  
Mobile: item list followed by a clear total/checkout area.

Show:

- Thumbnail, product name, variant.
- Quantity control.
- Unit price and line total.
- Remove action.
- Subtotal and configured charges.
- Prominent checkout action.

Show an empty-cart state with a Shop CTA.

## 9.8 Checkout `/checkout`

Use a focused, distraction-reduced layout. Keep the Vaagai identity but do not include unnecessary homepage sections.

Suggested progression:

1. Contact information.
2. Delivery address.
3. Delivery method.
4. Payment method.
5. Review and place order.

Desktop can use a form column and order summary column. Mobile should use a clear vertical flow. Show all charges before final order submission.

## 9.9 Payment states

- Pending verification: warm amber information panel; explain that the UPI transaction is awaiting manual confirmation.
- Success: clear success state only after verified success.
- Failed: concise explanation and retry/support action.

Do not label an unverified UPI submission as a successful payment.

## 9.10 Order confirmation and tracking

- Prominent order reference.
- Status timeline.
- Order items/amount.
- Delivery address.
- Payment status.
- Courier/tracking details if entered.
- Contact support link.

Use privacy-conscious secure links and avoid exposing records by sequential order number.

## 9.11 About `/about`

- Editorial image/text layout.
- Brand story supplied/approved by owner.
- Product categories and store photographs.
- No invented founding date, awards or unsupported claims.

## 9.12 Contact `/contact`

- Clear contact methods.
- Confirmed address and hours.
- Map/directions link only after address is verified.
- Enquiry form with accessible labels and success/error states.

## 9.13 FAQ `/faq`

- Group questions by Orders, Payment, Delivery, Products and Returns.
- Accordion interactions should be keyboard accessible.
- Content must be approved by the business.

## 9.14 Policy pages

- Simple reading layout with narrow text width.
- Clear headings and update date where maintained.
- No fabricated return windows, shipping SLAs or legal claims.

---

## 10. Admin design language

The admin should be visually consistent with the brand but optimised for operational clarity rather than promotional storytelling.

### 10.1 Admin shell

Desktop:

- Left sidebar with logo/brand name and navigation.
- Top bar with page title, language/user menu and notifications if implemented.
- Main content area with a consistent max width.

Mobile:

- Collapsible navigation drawer.
- Compact top bar.
- Tables should become responsive cards or allow deliberate horizontal scrolling with clear affordance.

### 10.2 Dashboard

- KPI cards for orders, pending UPI verification, stock alerts and collected sales.
- Recent orders table.
- Low-stock list.
- Charts only when there is sufficient real data.
- Distinguish order value from money actually collected.

### 10.3 Admin tables and forms

- High readability and compact but comfortable row height.
- Search and filter controls near the table.
- Clear empty/loading/error states.
- Destructive actions require confirmation.
- Forms grouped into logical sections.
- Clear Save Draft / Publish actions.
- Show validation errors inline.
- Record who changed stock/payment/order details.

### 10.4 Admin status colours

- Pending: amber.
- Verified/paid/delivered: green.
- Failed/cancelled/overdue: red where appropriate.
- Processing/information: neutral or blue.

Always pair colour with text.

---

## 11. Responsive breakpoints and behaviour

Use the project's Tailwind breakpoints or a documented equivalent. Test at:

- 360px.
- 390px.
- 768px.
- 1024px.
- 1440px.
- 1920px.

Rules:

- Avoid horizontal overflow.
- Prioritise readable body text and controls over squeezing desktop layouts.
- Two-column product grid on most phones if cards remain usable.
- Filter drawer on mobile.
- Stack hero content deliberately.
- Keep buttons large enough for touch.
- Avoid sticky elements covering content or browser controls.
- Check both English and Tamil at every key breakpoint.

---

## 12. Motion and interaction

Use restrained motion:

- Gentle image scale on hover.
- Short button hover transitions.
- Smooth opening/closing of menus and drawers.
- Optional subtle hero entrance.
- Limited section reveal animations, not on every element.

Avoid:

- Aggressive parallax.
- Large scroll-jacking effects.
- Constant floating decorations.
- Excessive bouncing or glowing effects.
- Animations that delay shopping interactions.

Respect `prefers-reduced-motion`. All essential functionality must work without animation.

---

## 13. Accessibility and states

Every interactive component should include:

- Keyboard access.
- Visible focus treatment.
- Accessible names/labels.
- Disabled/loading state.
- Useful error and success feedback.

Each page should account for:

- Loading state.
- Empty state.
- Error state.
- Success state.
- Disabled/unavailable state where relevant.

Do not rely only on colour to communicate status. Ensure contrast for text, buttons, badges and controls.

---

## 14. Suggested CSS design tokens

The implementation may use CSS variables and Tailwind theme extensions. Suggested token names:

```css
:root {
  --color-vaagai-burgundy: #450506;
  --color-deep-wine: #2B0305;
  --color-antique-gold: #B58A4A;
  --color-champagne: #E5D0A7;
  --color-warm-ivory: #FAF7F1;
  --color-white: #FFFFFF;
  --color-charcoal: #302724;
  --color-warm-grey: #E9E1D7;
  --color-muted-text: #756B64;

  --font-display: "Lora", "DM Sans", serif;
  --font-body: "DM Sans", sans-serif;
  --font-tamil: "Noto Sans Tamil", sans-serif;

  --radius-control: 0.5rem;
  --radius-card: 0.75rem;
  --radius-panel: 1rem;

  --container-width: 80rem;
}
```

These are token suggestions; check contrast and actual font availability before production.

---

## 15. Landing-page prototype guidance

For the first visual milestone, implement only the homepage and its local interactions:

- Announcement bar.
- Responsive header/mobile menu.
- Hero.
- Category cards.
- Featured/sample product cards.
- Brand story.
- Why choose Vaagai.
- Special collections.
- Instagram showcase.
- Contact CTA.
- Footer.
- English/Tamil language switch.

Do not implement Supabase, authentication, checkout, real cart persistence, order management or admin pages during this prototype-only stage.

Use centralised mock data and clearly labelled temporary images. Make buttons/links either navigate to existing homepage sections, open a harmless demo interaction, or show a clear `Coming soon` state; do not link to broken routes.

Build reusable components so the approved homepage can become the foundation of the full store.

---

## 16. Design review checklist

- [ ] Original Vaagai logo is used without distortion.
- [ ] Burgundy is the primary brand colour, balanced with ivory and white.
- [ ] Antique gold is restrained and not used for low-contrast body text.
- [ ] Typography is consistent and Tamil renders correctly.
- [ ] Main navigation is clear on desktop and mobile.
- [ ] Hero is brand-specific and visually strong.
- [ ] Actual products are represented accurately; temporary imagery is not misrepresented.
- [ ] Product cards use consistent image ratios and information hierarchy.
- [ ] Product price, variant, stock and enquiry states are easy to understand.
- [ ] Forms and buttons have focus, error and disabled states.
- [ ] Mobile filter and menu drawers are usable.
- [ ] Footer includes the expected business/support/policy links.
- [ ] Layout works at all specified screen widths.
- [ ] No horizontal overflow or clipped Tamil text.
- [ ] Animations are restrained and respect reduced-motion settings.
- [ ] Colour contrast and accessibility have been checked.

---

## 17. Instructions to AI design and coding agents

1. Read this file and `project.md` fully before implementation.
2. Treat the supplied Vaagai logo as the authoritative brand asset.
3. Use the palette and design principles consistently.
4. Do not replace the brand identity with a generic template.
5. Do not invent product details, reviews, discounts, business claims or contact information.
6. Prioritise actual supplied product photography; mark demo assets clearly.
7. Build reusable, accessible components.
8. Test desktop, mobile, English and Tamil layouts.
9. For a landing-page-only task, build only the homepage and its local visual interactions.
10. Report design deviations and explain why they were necessary.

**End of design specification.**
