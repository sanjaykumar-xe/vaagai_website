# Vaagai Metals Traders — Project Specification

> **Document:** `project.md`  
> **Purpose:** Product, functional, technical, operational and delivery specification for the Vaagai Metals Traders e-commerce website.  
> **Status:** Planning baseline for implementation.  
> **Initial market:** Tamil Nadu, India.  
> **Languages:** English and Tamil.  
> **Initial budget target:** ₹0 for development and eligible free-tier infrastructure; payment processing, physical fulfilment and optional domain costs are separate.

---

## 1. Project overview

### 1.1 Business

**Business name:** Vaagai Metals Traders  
**Business type:** Single-vendor retail shop selling traditional metalware, pooja products, kitchenware and related products.  
**Existing presence:** Instagram profile `https://www.instagram.com/vaagai_metals_traders/`.  
**Official logo:** The supplied Vaagai logo featuring a traditional oil lamp inside a white oval, on a deep burgundy background, with the VAAGAI wordmark.

The website is a direct-to-customer online store for the shop. It is not a multi-vendor marketplace. The shop owns and manages its catalogue, stock, pricing, orders and customer service.

### 1.2 Product vision

Build a professional, bilingual, mobile-friendly e-commerce website that combines the convenience of a modern online shopping experience with the traditional identity of Vaagai Metals Traders.

Customers should be able to:

- Discover the brand and browse product categories.
- Search, filter and sort products.
- View detailed product information, images, sizes and variants.
- Add eligible products to a cart and submit an order.
- Select local delivery or courier delivery within Tamil Nadu, subject to serviceability.
- Choose available payment methods.
- View order confirmation and track order status.
- Contact the shop for product enquiries or products that require a quotation.
- Use the website in either English or Tamil.

The two business administrators should be able to manage the store without editing code or accessing the database directly.

### 1.3 Business constraints and confirmed decisions

| Area | Decision |
|---|---|
| Market | Tamil Nadu delivery |
| Catalogue size at launch | Approximately 50–200 products |
| Product pricing | Not finalised; support fixed price, variant-based price and enquiry-based pricing |
| Payment preferences | UPI, cards and Cash on Delivery (COD) are desired |
| Zero-cost requirement | Prefer free tools and free tiers; no paid subscription assumed for initial build |
| Delivery | Both local delivery and courier delivery |
| Shipping charge | Business can charge customers for delivery; rates must be configurable |
| Administrators | Two separate administrator accounts: owner/brother and developer/co-administrator; both have full admin permissions |
| Languages | English and Tamil |
| Platform approach | Custom-built website |
| Initial backend direction | Supabase |
| Frontend hosting direction | Cloudflare Pages |

**Important cost clarification:** A zero-cost development stack does not make card processing, courier fulfilment, COD collection, packaging, tax obligations or a custom domain free. The first release should support a zero-gateway-fee operational path using merchant UPI with manual verification and COD. Card payments should only be enabled after the business accepts and verifies the payment provider's actual charges and terms. Do not promise permanently free online card processing.

### 1.4 Goals

1. Establish a credible and premium digital presence for Vaagai Metals Traders.
2. Make 50–200 initial products easy to discover and purchase.
3. Support both Tamil- and English-speaking customers.
4. Let two administrators operate the store independently.
5. Maintain accurate prices, stock and order records.
6. Start with the lowest practical operating cost and avoid unnecessary infrastructure.
7. Build the frontend and data model so the store can expand without a full rewrite.

### 1.5 Out of scope for the initial release

Unless explicitly added later, do not include:

- Multi-vendor marketplace capabilities.
- Native Android or iOS applications.
- AI chatbot or AI product recommendations.
- Loyalty points or complex memberships.
- Automated marketing campaigns.
- Automated courier booking APIs.
- Automated WhatsApp messaging that requires a paid provider.
- Automatic live Instagram feed embedding.
- Complex warehouse or accounting integrations.
- Multi-currency or international fulfilment.

---

## 2. Users and permissions

### 2.1 Customer

Customers may browse published products without registering. Guest checkout is preferred to reduce purchase friction.

Customer capabilities:

- Browse public pages and published products.
- Search, filter and sort the catalogue.
- Add products to a local/session cart.
- Save a guest wishlist locally where practical.
- Submit an order with contact and delivery details.
- Select an available payment option.
- View an order confirmation and use a secure order-tracking link.
- Contact the business.

Customer accounts may be considered in a later release. Do not make registration mandatory for the first release.

### 2.2 Administrators

Create two separate administrator accounts. Both have the same full administrator permissions. Do not share one login between the two people.

Administrator capabilities:

- View dashboard metrics.
- Create, edit, publish, unpublish and archive products.
- Manage product categories and variants.
- Upload and manage product images.
- Adjust stock and review stock movement history.
- View, confirm, process, cancel and update orders.
- Verify manual UPI transactions against the merchant/bank account.
- Update shipment and tracking details.
- Configure delivery charges and PIN-code serviceability.
- Manage homepage banners and featured collections.
- Review customers and enquiries.
- Export catalogue, order and report data.
- Manage store settings and policy content.
- Review audit logs.

There must be no public administrator registration. Admin users are provisioned/invited securely. The system must verify admin privileges on the server/database, not merely hide admin links in the UI.

---

## 3. Catalogue and product model

### 3.1 Proposed product categories

These are proposed categories based on the business profile and supplied material. Confirm the actual catalogue with the shop before publishing them.

1. Pooja Items — பூஜைப் பொருட்கள்
2. Brassware — பித்தளைப் பொருட்கள்
3. Silverware — வெள்ளிப் பொருட்கள்
4. Cast Iron — வார்ப்பிரும்பு பாத்திரங்கள்
5. Aluminium Products — அலுமினியப் பொருட்கள்
6. Traditional Lamps — பாரம்பரிய விளக்குகள்
7. Kitchen Accessories — சமையலறை உபகரணங்கள்
8. Decor & Gifts — அலங்காரப் பொருட்கள்

The admin must be able to add, rename, reorder, translate, enable and disable categories.

### 3.2 Product pricing modes

The product model must support three pricing modes:

- **Fixed:** one active selling price; eligible for cart and checkout.
- **Variant:** customer selects a size, weight, finish or other option; each variant can have its own SKU, price and stock.
- **Enquiry:** customer cannot directly purchase through checkout; show a product enquiry/WhatsApp contact action when the official business number is configured.

Fixed pricing should be the default when the shop has confirmed a price. Do not fabricate prices.

### 3.3 Product fields

A product should support:

- Unique product ID.
- Unique SKU (or variant-level SKU where relevant).
- URL slug.
- Product name in English.
- Product name in Tamil.
- Short and full descriptions in English and Tamil.
- Category and optional subcategory.
- Material (e.g. brass, silver, cast iron, aluminium; actual values are admin-managed).
- Intended use (kitchen, pooja, décor, gift, etc.).
- Pricing mode.
- Selling price in integer paise.
- Optional compare-at price, only for genuine discounts.
- Tax/HSN-related fields where confirmed by the business/accountant.
- Stock quantity and low-stock threshold.
- Product weight and packed weight where known.
- Length, width and height where relevant.
- Multiple images with alt text and display order.
- Variant definitions and variant-specific data.
- Featured flag and collection assignment.
- Draft/published/archived status.
- Created/updated timestamps and administrator attribution.

Product content must not make unsupported claims about purity, material composition, warranty, origin or certification. For example, distinguish solid silver from silver-plated items accurately.

### 3.4 Product images

- Prioritise original photographs supplied by the shop.
- Allow multiple images per product.
- Optimise image dimensions and file sizes before upload where practical.
- Use consistent aspect ratios in product cards.
- Provide meaningful alt text in the selected language where possible.
- Do not present generated or stock images as photographs of actual Vaagai inventory.
- Store images in Supabase Storage initially, subject to free-tier limits.

### 3.5 Inventory

- Track stock for products and variants.
- Prevent an order from exceeding available stock.
- Validate stock on the server when an order is submitted.
- Use a database transaction or equivalent atomic operation for order/stock updates.
- Record every stock adjustment with reason, administrator and timestamp.
- Restore reserved/deducted stock when an order is cancelled according to the order lifecycle.
- Restock a returned item only after an administrator confirms that it is suitable for resale.
- Provide low-stock and out-of-stock indicators.

---

## 4. Customer website information architecture

### 4.1 Main routes

| Route | Page | Purpose |
|---|---|---|
| `/` | Home | Brand landing page and product discovery |
| `/shop` | Shop all | Full catalogue with filters and sorting |
| `/category/:slug` | Category | Products within a selected category |
| `/search` | Search results | Search by English/Tamil name, SKU and supported metadata |
| `/product/:slug` | Product detail | Images, specifications, price, variants and purchase/enquiry action |
| `/wishlist` | Wishlist | Locally saved products or account-synchronised wishlist later |
| `/cart` | Cart | Review products, quantities and estimated total |
| `/checkout` | Checkout | Contact, address, delivery and payment selection |
| `/payment/pending` | Payment pending | Explain that manual payment verification is pending |
| `/payment/success` | Payment success | Used only after verified payment where applicable |
| `/payment/failed` | Payment failed | Explain failed/cancelled gateway payment where applicable |
| `/order-confirmation/:token` | Confirmation | Order summary and next steps using a secure token |
| `/track-order` | Track order | Secure order lookup/tracking flow |
| `/about` | About | Confirmed business story and shop information |
| `/contact` | Contact | Phone, WhatsApp, address, hours and enquiry details |
| `/faq` | FAQ | Common questions |
| `/privacy-policy` | Privacy | Privacy information |
| `/terms` | Terms | Terms and conditions |
| `/shipping-policy` | Shipping | Delivery areas, charges and expected dispatch information |
| `/returns-refunds` | Returns/refunds | Confirmed return, cancellation and refund rules |

### 4.2 Global header

Desktop header:

- Original Vaagai logo.
- Home, Shop, Categories, About and Contact navigation.
- Search control.
- Wishlist icon.
- Cart icon with item count.
- English/Tamil language switcher.
- Account link only if customer accounts are later implemented.

Mobile header:

- Compact logo.
- Search and cart access.
- Hamburger menu/drawer.
- Optional mobile bottom navigation for Home, Categories, Search, Wishlist and Cart.

The announcement bar may be used for real store announcements. Do not invent offers, shipping promises or promotions.

### 4.3 Homepage sections

The homepage should include:

1. Announcement bar.
2. Main responsive navigation.
3. Premium hero section with a clear value proposition and CTAs.
4. Shop by category.
5. Featured products.
6. Best sellers (only when supported by real sales data; otherwise use an admin-selected collection).
7. New arrivals.
8. Seasonal/festival collections.
9. Brand introduction.
10. Store benefits based on confirmed business practices.
11. Instagram showcase linking to the official profile; no fake live feed.
12. Contact/store CTA.
13. Footer with useful links, contact details and policies.

Suggested hero heading:

**Tradition in Every Detail. Quality in Every Product.**

Tamil:

**ஒவ்வொரு பொருளிலும் பாரம்பரியம். ஒவ்வொரு தேர்விலும் தரம்.**

Suggested supporting copy:

"Discover our collection of traditional brassware, pooja essentials, kitchen utensils and timeless metalware for your home."

The business should review and approve final public-facing copy.

### 4.4 Shop and category pages

Desktop layout:

- Product count and page heading.
- Search/sort controls.
- Left-side filter panel.
- Responsive product grid.

Mobile layout:

- Full-width product grid, normally two columns where readable.
- Filter button opens a drawer or bottom sheet.
- Sort control is easy to reach.

Filters should include:

- Category.
- Material.
- Price range.
- Availability.
- Intended use.
- Size/variant, where appropriate.

Sort options:

- Featured/admin-selected.
- Newest.
- Price low to high.
- Price high to low.
- Best-selling only when backed by real order data.

Search should support English and Tamil names, SKU and category/material fields where feasible. Tamil search behaviour must be tested with real product terms.

### 4.5 Product detail page

Display:

- Product image gallery with thumbnails and zoom/lightbox.
- English and Tamil product names.
- SKU.
- Current price and genuine compare-at price if configured.
- Variant selector.
- Stock status.
- Quantity selector.
- Add to Cart and Buy Now for purchasable products.
- Enquiry action for enquiry-only products.
- Wishlist action.
- Description.
- Material and specifications.
- Dimensions and weight.
- Care instructions.
- Delivery/serviceability checker.
- Shipping/return information.

Do not show fabricated ratings/reviews. Add reviews only after a genuine review workflow exists.

### 4.6 Cart

- Add, remove and update quantities.
- Display selected variant and unit price.
- Show subtotal.
- Show estimated/configured delivery charge when calculable.
- Show applicable tax transparently based on business/accountant configuration.
- Show grand total.
- Persist a guest cart locally or via a safe anonymous cart mechanism.
- Revalidate prices and stock on the server at checkout.
- Do not trust client-submitted prices, discounts or totals.

### 4.7 Checkout

Prefer guest checkout. Do not require customer registration.

Customer fields:

- Full name.
- Mobile number.
- Optional email.

Delivery address fields:

- Door/house number.
- Street.
- Area/locality.
- Town/city.
- District.
- State (default Tamil Nadu; validate allowed regions based on business policy).
- PIN code.
- Landmark.
- Optional delivery instruction.

Delivery choice:

- Local delivery when PIN code/area is serviceable.
- Courier delivery when enabled for the destination.

Payment options at initial launch:

- Merchant UPI with manual verification.
- COD where enabled for the destination/order.

Card payments:

- Keep architecture extensible for a gateway integration.
- Do not enable cards until a merchant account is approved and business accepts the published processing charges, settlement rules and terms.
- Never collect or store card numbers/CVV in the application.

Checkout must show the item subtotal, shipping, tax (if applicable), discount (if applicable) and final payable amount before order confirmation.

### 4.8 UPI manual payment workflow

1. Customer selects UPI and places an order.
2. Server creates an order with payment status `pending_verification` or equivalent.
3. Website displays the verified merchant UPI ID/QR and exact payable amount supplied by the business configuration.
4. Customer completes payment in their UPI app.
5. Customer may submit the UTR/reference number and optionally an image as supporting information.
6. Submission does not automatically make the payment successful.
7. An administrator checks the transaction in the merchant/bank account.
8. Administrator marks the payment as verified/paid or rejects the claim, recording who verified it and when.
9. Order processing proceeds according to business policy.

Never use an uploaded screenshot or customer-supplied UTR as automatic proof of payment. Do not expose private merchant credentials.

### 4.9 COD workflow

1. Customer selects COD if the selected address/order is eligible.
2. Server creates order with payment method `cod` and payment status `pending_collection`.
3. Administrator confirms the order and availability.
4. Order is packed and shipped/delivered.
5. Payment is marked collected only after the money is actually received.

COD eligibility should be configurable by PIN code, delivery zone, order value or product rules if the business needs it. Courier COD collection charges are separate operational costs.

### 4.10 Order confirmation and tracking

Order confirmation should show:

- Order reference.
- Order items and quantities.
- Final amount and charge breakdown.
- Payment method and payment status.
- Delivery address.
- Next steps and support contact.
- Secure track-order link.

Use an unpredictable, high-entropy tracking token. Do not expose order details using only a sequential order ID.

Initial order tracking can be manual:

- Order received.
- Confirmed.
- Processing.
- Packed.
- Shipped.
- Out for delivery (if known/used).
- Delivered.
- Cancelled/returned where relevant.

Administrators can enter courier name and tracking number. Automated courier APIs are not required for the initial release.

### 4.11 About, contact, FAQ and policies

About page:

- Confirmed business introduction.
- Real shop/product photographs.
- Product range.
- Quality approach as confirmed by the owner.
- No invented founding date, heritage story or certifications.

Contact page:

- Confirmed shop name and address.
- Official phone number.
- WhatsApp link only when the correct number is supplied.
- Business hours.
- Map/directions link after location is confirmed.
- Enquiry form with spam protection and clear submission status.

FAQ topics:

- Product details.
- Orders.
- Payments.
- Delivery.
- Returns/refunds.
- Product care.

Policy pages must contain business-approved policies, not placeholder claims. Legal and GST details must be confirmed with the business and an appropriate professional before launch.

---

## 5. Admin application specification

### 5.1 Admin routes

| Route | Page |
|---|---|
| `/admin/login` | Admin sign-in |
| `/admin` | Overview/dashboard |
| `/admin/products` | Product list |
| `/admin/products/new` | Add product |
| `/admin/products/:id` | Edit product |
| `/admin/categories` | Category management |
| `/admin/inventory` | Inventory and stock movements |
| `/admin/orders` | Order list |
| `/admin/orders/:id` | Order detail and actions |
| `/admin/payments` | Payment/UPI verification |
| `/admin/delivery` | Delivery zones and rates |
| `/admin/customers` | Customer list/history |
| `/admin/content` | Banners, collections and homepage content |
| `/admin/enquiries` | Customer enquiries |
| `/admin/reports` | Sales/order/inventory reports |
| `/admin/settings` | Store settings and admin management |
| `/admin/audit-logs` | Admin activity history |

### 5.2 Dashboard overview

Show:

- Orders today.
- Orders awaiting confirmation.
- UPI payments awaiting verification.
- Orders being processed.
- Orders shipped/delivered.
- Sales collected (clearly distinguish from order value and COD pending collection).
- Low-stock products.
- Recent orders.
- Trend charts when meaningful data exists.

Do not show fabricated analytics or pretend that an uncollected COD order is paid revenue.

### 5.3 Product administration

Product list capabilities:

- Search by name/SKU.
- Filter by category, status and stock.
- Sort and paginate.
- Add/edit/archive.
- Publish/unpublish.
- Bulk CSV import/export.

Add/edit form:

- English/Tamil product name and description.
- SKU.
- Category.
- Material and use.
- Pricing mode.
- Price and optional genuine compare-at price.
- Variants.
- Stock and low-stock threshold.
- Weight/dimensions.
- Multiple image uploads and ordering.
- Featured/collection options.
- Draft/published status.

Validate all values on the server as well as in the browser.

### 5.4 Category administration

- Create/edit/archive categories.
- English and Tamil names.
- Descriptions.
- Category image.
- Display order.
- Visibility.

### 5.5 Inventory administration

- Current stock per product/variant.
- Low-stock thresholds.
- Stock adjustment with mandatory reason.
- Damaged/returned stock handling.
- Movement history with administrator and timestamp.
- CSV export.

### 5.6 Order administration

Order list filters:

- All.
- New/unconfirmed.
- Awaiting UPI verification.
- Confirmed.
- Processing.
- Packed.
- Shipped.
- Delivered.
- Cancelled.
- Returned/refunded.

Order detail:

- Customer and delivery details.
- Immutable purchased-item snapshots.
- Subtotal, shipping, tax, discount and total.
- Payment method/status/reference.
- Shipment details.
- Status history.
- Internal notes if needed.
- Action history.

Actions:

- Confirm/reject order.
- Verify/reject manual UPI payment.
- Mark packed/shipped/delivered.
- Enter courier and tracking number.
- Cancel order with reason.
- Record refund/payment adjustment.
- Print order summary.

Order state and payment state are separate state machines. For example, an order can exist while its manual UPI payment is awaiting verification.

### 5.7 Delivery administration

- Configure local serviceable PIN codes/areas.
- Configure local delivery charges.
- Configure courier delivery rate rules.
- Configure weight/packed-weight bands if used.
- Configure heavy/fragile-item handling notes.
- Enable/disable COD by zone/order rule.
- Enter courier name, tracking URL and tracking number.

No live courier quote is required initially. Rates are entered and maintained by administrators.

### 5.8 Customer and enquiry administration

- Search customer by name/mobile.
- View customer order history.
- View contact details only for legitimate order/service purposes.
- View and manage enquiries.
- Mark enquiry as open/in progress/resolved.

### 5.9 Homepage content administration

The future admin should be able to manage:

- Hero title/subtitle/CTA/image.
- Announcement text.
- Featured products.
- Category display order.
- Promotional banners.
- Seasonal collections.
- Instagram link.
- Contact/store information.

Do not require a code deployment to change routine homepage content.

### 5.10 Administrator activity log

Record security-relevant changes:

- Product creation/edit/publish/archive.
- Price changes.
- Stock adjustments.
- Order status changes.
- Payment verification/rejection.
- Shipment changes.
- Delivery settings changes.
- Admin account changes.

Record actor, action, target, timestamp and relevant before/after values where appropriate. Do not log secrets or sensitive payment credentials.

---

## 6. Technical architecture

### 6.1 Agreed initial stack

| Layer | Technology | Responsibility |
|---|---|---|
| UI framework | React | Component-based UI |
| Language | TypeScript | Type safety |
| Build tool | Vite | Development/build |
| Styling | Tailwind CSS | Responsive styling |
| UI primitives | shadcn/ui where useful | Accessible reusable components |
| Icons | Lucide React | Consistent iconography |
| Routing | React Router | Customer/admin routes |
| Server data | TanStack Query | Fetch/cache/mutation state |
| Local UI/cart state | Zustand or React context; choose one where appropriate | Cart and transient state |
| Forms | React Hook Form + Zod | Form handling and validation |
| Localization | i18next/react-i18next or a small dictionary for prototype | English/Tamil content |
| Frontend hosting | Cloudflare Pages | Static frontend hosting |
| Backend platform | Supabase | Managed backend services |
| Database | Supabase PostgreSQL | Relational business data |
| Authentication | Supabase Auth | Admin authentication; customer auth if added later |
| File storage | Supabase Storage | Product and content images |
| Server-side logic | Supabase Edge Functions and PostgreSQL functions/RPC where appropriate | Trusted business operations |
| Source control | GitHub | Version control and collaboration |

Do not add Cloudflare Workers, D1 or R2 to the initial stack unless a documented requirement justifies the extra system. Cloudflare Pages is initially for hosting the frontend; Supabase is the backend.

### 6.2 High-level architecture

```text
Customer browser / Admin browser
             |
             v
React + TypeScript + Vite frontend
             |
             v
Cloudflare Pages (frontend hosting)
             |
             v
Supabase client / secure API calls
             |
     +-------+----------+----------------+
     |                  |                |
     v                  v                v
Supabase Auth     PostgreSQL        Supabase Storage
     |                  |                |
     +------------------+----------------+
                        |
                        v
              Edge Functions / DB RPC
                        |
                        v
          UPI verification / future gateway
          manual courier workflow / enquiries
```

### 6.3 Database entities

Use relational schema and foreign keys. Suggested tables (final names can be refined during migrations):

- `profiles` — user profile metadata.
- `admin_roles` or an equivalent secure role mapping — administrator role.
- `categories` — bilingual category information.
- `products` — core product data.
- `product_variants` — size/weight/etc. variant records.
- `product_images` — image paths, alt text and ordering.
- `inventory_movements` — stock movement history.
- `customers` — guest/customer contact information where needed.
- `addresses` — delivery address records.
- `carts` / `cart_items` — only if server-persisted carts are required; guest local cart is acceptable initially.
- `orders` — order header.
- `order_items` — immutable product/variant/price snapshots.
- `payments` — method, amount, status, UTR/provider reference and verification metadata.
- `shipments` — delivery/courier details.
- `order_status_history` — state timeline.
- `banners` — homepage content.
- `collections` / `collection_products` — curated groups.
- `coupons` — only if discounts are implemented.
- `enquiries` — product/general enquiries.
- `store_settings` — controlled settings such as merchant UPI details and contact information.
- `audit_logs` — admin activity records.

Use UUID primary keys where suitable. Store money as integer paise, never floating-point values. Store timestamps consistently (UTC in the database, localise display to Asia/Kolkata). Store order item snapshots so later product edits do not change historic orders.

### 6.4 Security and Row Level Security

Enable and test Row Level Security (RLS) on all tables exposed through Supabase APIs.

Rules must enforce:

- Public users can read only published product/category/content fields intended for public display.
- No public user can write product, inventory, price, order-state, payment-verification or admin data arbitrarily.
- Admin writes are permitted only to authenticated users with an authorised admin role.
- Both authorised admins have equivalent full permissions.
- Customer/order data is not publicly enumerable.
- Guest order tracking uses a separate high-entropy token, not sequential IDs.
- Sensitive settings are not exposed in public queries.
- Supabase service-role key and payment secrets exist only in secure server-side secrets, never in browser bundles.
- Edge Functions verify authentication/role and validate all input.
- Use rate limits/abuse controls for public order and enquiry endpoints.
- Apply server-side validation and parameterised database operations.

Do not rely on frontend route guards as the security boundary. RLS and server-side checks are mandatory.

### 6.5 Order and inventory integrity

- Server calculates product prices and order totals from current trusted records.
- Browser-supplied totals are never trusted.
- Verify that product/variant is published and purchasable.
- Validate stock and delivery eligibility at checkout.
- Create order, order items and stock reservation/deduction consistently in a transaction or atomic database operation.
- Define when stock is reserved for pending UPI verification and how long it remains reserved; make this a configurable, documented business rule.
- Prevent duplicate order creation from repeated checkout submissions using idempotency protection where practical.
- Cancellation/restock logic must avoid double-restocking.

### 6.6 Supabase free-tier caution

The free tier is appropriate for development and an early MVP, but it is not an unconditional production reliability guarantee. Free projects may be paused after inactivity; backups, storage, bandwidth and usage limits must be reviewed in the Supabase dashboard. Before the business depends on the site, create an independent database backup/export routine and test restoration. Keep an upgrade/migration path in the architecture.

Cloudflare Pages and Supabase free plan limits and terms can change. Check current provider documentation before deployment; do not hardcode assumptions about quotas or commercial eligibility into the application.

---

## 7. Payment, shipping and business operations

### 7.1 Payment strategy

Initial zero-gateway-fee path:

- Merchant UPI QR/UPI ID, after the shop confirms the business account details.
- Customer submits UTR/reference number.
- Administrator verifies in the merchant/bank account.
- COD where serviceable and accepted by the business/courier.

Later optional gateway path:

- Integrate an approved provider for UPI/card checkout only after merchant onboarding, pricing review and acceptance of processing charges/settlement terms.
- Use hosted/secure provider checkout or approved tokenised components.
- Verify payment status on the server using signed webhooks/provider APIs.
- Handle success, failure, pending, refund and duplicate webhook events.
- Never store raw card details/CVV.

Do not describe card acceptance as free. The website can be free to develop; payment networks/providers may charge processing or other fees.

### 7.2 Delivery model

Two delivery types:

1. **Local delivery:** serviceability and rates managed by the shop.
2. **Tamil Nadu courier:** shipping arranged by the shop with manual courier selection and tracking entry initially.

Delivery charge calculation should support:

- PIN-code/area serviceability.
- Local flat or zone-based delivery rates.
- Courier flat or weight-band rates.
- Product packed weight/dimensions where available.
- Heavy/fragile handling rule or manual review.
- COD eligibility and any additional COD charge if applicable.

Do not promise fixed delivery time or free delivery without business confirmation. Shipping prices must be configurable and transparently shown before order placement.

### 7.3 Store information required before public launch

Mark missing details as `TBD` until supplied:

- Exact legal/business name.
- Store address and PIN code.
- Official customer-support mobile number.
- Official WhatsApp number.
- Business operating hours.
- Confirmed product categories.
- Actual product catalogue, prices and stock.
- Merchant UPI ID/QR and account ownership verification.
- GST registration status and invoicing requirements.
- Tax classification/HSN and rates as confirmed by the accountant.
- Serviceable local PIN codes.
- Courier provider and negotiated/retail rate information.
- COD availability and limits.
- Cancellation, return, exchange and refund policy.
- Product warranty/guarantee terms, if any.
- Customer grievance contact/process.

### 7.4 Legal and tax readiness

Before launch, the business must review applicable Indian e-commerce, consumer protection, privacy, invoicing and tax requirements. Display accurate business identity/contact information, prices, charges, payment terms, delivery information and business-approved return/refund policies. GST applicability, registration, HSN classification, invoicing and tax treatment must be confirmed with a qualified professional. Do not invent legal text or imply that using a custom website removes legal obligations.

---

## 8. Internationalisation: English and Tamil

- Every customer-visible string must be localisable.
- Store product names and descriptions in separate English/Tamil fields or a clearly structured translation model.
- Use a translation library or central translation dictionaries; do not scatter conditional Tamil strings across components.
- Persist selected language in local storage/cookie.
- Use `lang="en"` or `lang="ta"` on the document root as appropriate.
- Use Noto Sans Tamil (or another tested Tamil font) for correct rendering.
- Check Tamil wrapping, line-height, buttons, navigation and mobile layout.
- Search must support both languages.
- Currency display is INR with locale-aware formatting.
- Default timezone display is Asia/Kolkata.

Do not machine-translate legal/business-critical copy without review. Tamil copy should be checked by a fluent speaker before launch.

---

## 9. Quality attributes and non-functional requirements

### 9.1 Responsive behaviour

Test at minimum:

- 360px mobile.
- 390px mobile.
- 768px tablet.
- 1024px laptop.
- 1440px desktop.
- 1920px desktop.

Requirements:

- No unintended horizontal overflow.
- No overlapping or clipped text/buttons.
- Touch targets are comfortable on mobile.
- Product images keep their aspect ratio.
- Filter drawer and mobile navigation are usable.
- Tamil text wraps correctly.

### 9.2 Accessibility

- Semantic HTML landmarks and heading order.
- Keyboard-accessible navigation and controls.
- Visible focus state.
- Accessible labels for icon-only buttons.
- Useful alt text for meaningful images.
- Sufficient text/background contrast.
- Error messages associated with form fields.
- Reduced-motion support.

### 9.3 Performance

- Optimise and lazy-load below-the-fold images.
- Use responsive image sizes.
- Avoid unnecessarily large dependencies.
- Cache public static assets appropriately.
- Paginate or limit product queries.
- Avoid loading the whole catalogue at once.
- Use appropriate loading, empty and error states.

### 9.4 SEO

- Unique page titles and descriptions.
- Semantic page structure.
- Canonical URLs where appropriate.
- Product metadata/structured data only when accurate and supported.
- Sitemap and robots configuration.
- Open Graph metadata.
- Descriptive slugs and image alt text.
- No fabricated ratings, prices, availability or reviews in structured data.

### 9.5 Reliability and data protection

- Independent backups and restore tests.
- Safe error handling that does not expose secrets.
- Payment/order idempotency where applicable.
- Audit logs for sensitive admin actions.
- Clear distinction between order state and payment state.
- Data minimisation for customer details.
- No secrets in source control or frontend environment variables.

---

## 10. Suggested source-code structure

This is a starting point; adapt to the repository while keeping separation of concerns.

```text
vaagai-metals-traders/
├── public/
│   ├── brand/
│   ├── favicon/
│   └── images/
├── src/
│   ├── app/
│   │   ├── router/
│   │   └── providers/
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   ├── products/
│   │   └── forms/
│   ├── features/
│   │   ├── catalog/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── orders/
│   │   ├── payments/
│   │   ├── wishlist/
│   │   └── admin/
│   ├── pages/
│   │   ├── public/
│   │   └── admin/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── validation/
│   │   └── formatting/
│   ├── i18n/
│   ├── data/
│   ├── hooks/
│   ├── types/
│   └── styles/
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── seed.sql
├── tests/
├── project.md
├── design.md
└── README.md
```

Keep mock/demo data separate from UI components. Do not mix database access directly into presentational components. Keep secrets out of the repository.

---

## 11. Development phases

### Phase 0 — Business preparation

- Confirm logo source files and brand assets.
- Collect actual product photos.
- Prepare product catalogue spreadsheet for 50–200 items.
- Confirm pricing mode per product.
- Confirm product variants, dimensions, weight and stock.
- Confirm shop address, official phone and WhatsApp details.
- Confirm local delivery areas and courier approach.
- Confirm UPI merchant setup, GST status and business policies.

### Phase 1 — Brand and frontend foundation

- Initialise React + TypeScript + Vite.
- Implement design tokens and responsive global styles.
- Implement logo/header/footer.
- Implement English/Tamil language structure.
- Build landing page.
- Validate mobile/desktop presentation.

### Phase 2 — Catalogue

- Set up Supabase project and migrations.
- Configure RLS.
- Implement categories/products/variants/images.
- Build shop, category, search and product-detail pages.
- Build filters, sorting and pagination.

### Phase 3 — Admin foundation

- Create two admin accounts securely.
- Implement role checks and protected routes.
- Build product/category/image management.
- Build inventory and audit history.

### Phase 4 — Cart and checkout

- Implement cart and guest checkout.
- Implement address and PIN-code validation.
- Implement delivery rules and charge calculation.
- Implement server-side order calculation and creation.
- Implement stock reservation/decrement rules.

### Phase 5 — Payment and order operations

- Implement manual UPI/UTR verification.
- Implement COD workflow.
- Implement payment and order status histories.
- Implement admin order management.
- Implement secure tracking page.

### Phase 6 — Store operations and launch readiness

- Implement reports, homepage content management and enquiries.
- Add business-approved policies and details.
- Perform security, accessibility and performance testing.
- Import actual product catalogue.
- Test the full order lifecycle.
- Configure independent backups.
- Deploy and verify production configuration.

### Phase 7 — Optional future improvements

- Payment gateway/card integration after fees are accepted.
- Customer accounts and order history.
- Automated courier integration.
- Transactional email/SMS/WhatsApp provider integration if budget allows.
- Reviews, coupons and loyalty features.
- Advanced analytics.

---

## 12. Acceptance criteria

### Customer storefront

- [ ] Homepage reflects the approved Vaagai brand identity.
- [ ] English/Tamil switch works across all customer-facing content.
- [ ] Shop, category, search and product pages work.
- [ ] Filters and sorting behave correctly.
- [ ] Product variants update SKU, price and availability correctly.
- [ ] Enquiry-only products cannot be purchased through normal checkout.
- [ ] Cart persists and quantities update correctly.
- [ ] Checkout validates customer/address data.
- [ ] Delivery fee and final total are transparent before order submission.
- [ ] Guest checkout works.
- [ ] UPI manual-verification workflow works.
- [ ] COD eligibility and order workflow work.
- [ ] Order confirmation and secure tracking work.

### Admin

- [ ] Two separate administrator accounts can sign in.
- [ ] Both accounts have equivalent full admin permissions.
- [ ] Non-admin users cannot access admin APIs or data.
- [ ] Products/categories can be created, edited and published.
- [ ] Product images can be uploaded and ordered.
- [ ] Inventory adjustments are recorded.
- [ ] Low-stock status is visible.
- [ ] Orders can be processed and tracked.
- [ ] UPI claims require manual verification.
- [ ] Delivery settings can be updated without code changes.
- [ ] Admin actions are auditable.

### Quality and security

- [ ] Responsive at required breakpoints.
- [ ] No horizontal overflow or major layout defects.
- [ ] No material browser console errors.
- [ ] Production build passes.
- [ ] RLS policies are tested.
- [ ] No service-role/payment secret in frontend bundle.
- [ ] Server validates price, stock, order total and permissions.
- [ ] Backup and restore process is documented/tested.
- [ ] Public business information and policies are confirmed before launch.

---

## 13. Known TBD items — do not invent

The following must remain clearly marked as `TBD` until the business supplies the information:

- Exact registered/legal business name.
- Shop's full postal address and PIN code.
- Official contact number and WhatsApp number.
- Business hours.
- Final product categories and catalogue.
- Product names, Tamil translations, prices, variants, SKU and stock.
- Material/purity descriptions and product guarantees.
- Merchant UPI ID/QR and bank-side verification process.
- GST registration status and applicable tax configuration.
- Local delivery PIN codes and charges.
- Courier provider and shipping rates.
- COD coverage, limits and extra collection charges.
- Cancellation/return/refund rules.
- Approved brand story and public claims.
- Final hero/product photographs.

Never fabricate these details for a demo or production website. Use clearly labelled sample data only in a development/demo environment.

---

## 14. Instructions to AI coding agents

When using Claude, Antigravity or another coding agent:

1. Read this entire file and `design.md` before implementation.
2. Treat confirmed requirements as constraints; mark unresolved details as TBD.
3. Build in phases and avoid implementing future phases prematurely.
4. Prefer small, reusable, typed components and clear data boundaries.
5. Do not invent business data, pricing, reviews, delivery promises or legal terms.
6. Do not expose secrets or trust client-supplied price/payment/stock values.
7. Do not introduce additional infrastructure without explaining why it is needed.
8. Test each phase and report files changed, commands run, test/build outcomes and remaining limitations.
9. For a landing-page-only task, implement only the customer-facing homepage and its visual interactions; do not introduce Supabase, checkout, payments, admin or order APIs unless explicitly requested.
10. Before a production launch, verify current provider plans/quotas/terms and business/legal details rather than assuming they are unchanged.

**End of project specification.**
