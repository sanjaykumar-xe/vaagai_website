# Vaagai Metals Traders — Official Website

> Modern Indian heritage retail experience for Vaagai Metals Traders, built with React, TypeScript, Vite, Tailwind CSS, and Motion for React.

---

## 🏛️ Project Overview

Vaagai Metals Traders is a single-vendor retail business in Tamil Nadu offering traditional metalware, pooja essentials, brassware, and cookware. This web application provides a responsive, bilingual (English & Tamil) storefront with a restrained luxury aesthetic.

- **Design Philosophy:** South Indian heritage meets modern e-commerce clarity.
- **Color Palette:** Warm Ivory (`#FAF7F1`), Vaagai Burgundy (`#450506`), Deep Wine (`#2B0305`), Antique Gold (`#B58A4A`).
- **Motion System:** Polished & Snappy (Modern Luxury) powered by `motion/react`.

---

## 📂 Project Structure

```text
vaagai/
├── docs/                      # Architectural & design documentation
│   ├── design-specification.md # Visual identity, tokens, and UX guidelines
│   └── project.md             # Business, functional, and product specification
├── public/                    # Static assets served directly
│   ├── brand/                 # Vaagai official logos, marks, and favicon
│   ├── images/                # Photography (Hero full composition, etc.)
│   └── videos/                # Showroom tour experience video
├── src/
│   ├── components/
│   │   ├── common/            # Shared reusable UI primitives (Buttons, Cards, Reveal, Toast)
│   │   ├── home/              # Homepage sections (Hero, Categories, Products, Video, etc.)
│   │   └── layout/            # Site frame (Header, Mobile Menu, Footer)
│   ├── data/                  # Store catalogs, categories, site metadata, translations
│   ├── i18n/                  # Language Context (English & Tamil bilingual support)
│   ├── lib/                   # Motion tokens, easing, and timing curves
│   ├── pages/                 # Page components (HomePage)
│   ├── styles/                # Global styles and Tailwind directives
│   ├── App.tsx                # Root application component
│   └── main.tsx               # Application entry point
├── index.html                 # HTML shell
├── tailwind.config.js         # Custom theme colors, radius tokens, fonts
├── tsconfig.json              # TypeScript configuration
└── vite.config.ts             # Vite build configuration
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm

### Development
```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
npm run build
```
Type checks via `tsc --noEmit` and bundles optimized production assets into `dist/`.

---

## 📖 Specifications

Detailed reference documentation is maintained in the `docs/` folder:
- [Design Specification](docs/design-specification.md)
- [Project Specification](docs/project.md)
