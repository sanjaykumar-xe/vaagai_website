# Vaagai Metals Traders: landing page prototype

React + TypeScript + Vite + Tailwind CSS (v3). Landing page only; no backend.

    npm install
    npm run dev      # http://localhost:5173
    npm run build    # type-check + production build

## Before showing it
1. Logo: add `public/brand/vaagai-logo-header.png` (the original artwork, tightly cropped). Until then a labelled box appears.
2. Photos: set paths in `src/data/images.ts` (files in `public/images/`). Unset keys show a placeholder.
3. Contact: set `SITE.whatsappUrl`, `phone`, `address` in `src/data/site.ts` only when confirmed. Empty values are hidden.
4. Tamil copy in `src/data/translations.ts` is a working draft; have a fluent speaker review it.

Cart, wishlist, search, category/product/policy links show a "coming soon" message by design.
