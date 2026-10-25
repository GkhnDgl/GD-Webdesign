# Master Template A — Trades, Gardening & Landscaping One-Pager

Master Template A is a single-page website template designed for local tradespeople, craftsmanship businesses, and gardening/landscaping services (Garten- und Landschaftsbau, Handwerk, Renovierung, Objektpflege). It is built on semantic HTML5, shared Vanilla CSS with Tailwind utility output, and Vanilla JavaScript with JSON-based i18n localization.

## Visual Identity & Sector Styling
- **Typography**: Uses locally hosted **Plus Jakarta Sans** (Variable `.woff2`), a modern geometric sans-serif offering a clean, confident, and professional craftsman feel.
- **Color Palette**: Craftsman emerald green (`#047857`), slate dark accents (`#0f172a`), and warm amber highlights (`#d97706`).
- **Icons & Graphics**: Embedded accessible inline SVG icons for craftsmanship tools, garden leaves, building outlines, and service badges.

## Assets & Font Licensing
All visual assets and fonts used in this template are locally hosted and licensed for free distribution and production use:

1. **Fonts**:
   - **Plus Jakarta Sans** (`assets/fonts/PlusJakartaSans-Variable.woff2`)
   - **Source**: Google Fonts / Tokio City / GDM Type Foundry (`https://github.com/google/fonts/tree/main/ofl/plusjakartasans`)
   - **License**: SIL Open Font License (OFL) 1.1 (documented in `assets/fonts/LICENSE.txt`). Permitted for free use, modification, and redistribution.

2. **Icons & SVGs**:
   - Scalable inline vector SVGs integrated into `index.html` and component styles with zero external dependencies.

## Localization (i18n)
- Localized copy lives in `locales/de.json` and `locales/en.json`.
- German copy uses sector-specific trades and gardening terminology (e.g. *Meisterbetrieb*, *Garten- & Landschaftsbau*, *Vor-Ort-Besichtigung*, *Kostenloses Angebot anfragen*).
- English copy provides an equivalent localized presentation for international or bilingual client inquiries.

## Quality Assurance & Verification
- **Build & Tests**: Run `npm run build` (which executes Tailwind CSS compilation and `node --test`).
- **Responsive Viewports**: Validate mobile-first behavior at `sm` (640px), `md` (768px), `lg` (1024px), and `xl` (1280px), checking horizontal overflow, clipped text, and control usability before release.
- **Accessibility**: Check keyboard focus rings, ARIA landmarks, text contrast, form labels, and reduced-motion behavior before release. Do not treat CSS support or a green CI run as proof of complete accessibility.
- **Evidence**: Record browser/viewport results and attach screenshots to the PR. Visual verification is not considered complete until that evidence is available.

## M1.2 Follow-Up Dependencies
This template fulfills milestone **M1.1**. Future configuration extraction into `config.json` and the sub-20-minute sample setup workflow will be introduced in milestone **M1.2** (scheduled 2026-11-11 to 2026-11-18).
