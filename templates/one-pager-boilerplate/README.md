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
- **Responsive Viewports**: Verified mobile-first across `sm` (640px), `md` (768px), `lg` (1024px), and `xl` (1280px) breakpoints without horizontal overflow or clipped text.
- **Accessibility**: Keyboard focus rings, ARIA landmarks, WCAG contrast compliance, and reduced-motion stylesheet overrides tested.

## Customer Configuration and Schema (Milestone M1.2)

Customer-specific business data, SEO metadata, branding tokens, gallery assets, and legal text are configured in `config.json`. Its structure is documented and constrained by the separate JSON Schema in `config.schema.json`. The template runtime reads configuration relative to this template page, which supports the repository's GitHub Pages subpath.

### Configuration files
- `config.json`: values for one customer instance. Set both `de` and `en` values for `business.pageTitle` and `business.description`.
- `config.schema.json`: JSON Schema describing required fields and accepted types. Validate the instance with a JSON Schema Draft 2020-12 validator during development or CI.
- `locales/de.json` and `locales/en.json`: translated interface and sector copy. Keep translated UI strings in locale files rather than duplicating them in the customer config.

### Setup workflow for a new customer
1. Copy the template directory to the intended instance location, preserving the relative asset structure.
2. Update `business.name`, `legalName`, `phone`, `email`, and `address`.
3. Update `business.pageTitle` and `business.description` in both German and English.
4. Choose `branding.primaryColor` and `primaryHoverColor` as six-digit hex colors.
5. Replace `gallery` image paths and accessible alt text with approved customer assets.
6. Replace `legal.imprintDetails` and `legal.privacyDetails` in both languages with legally reviewed customer-specific text.
7. Run `npm test` and `npm run build`, then inspect the page on desktop and mobile and verify contact links, language switching, gallery images, and legal sections.

### Timing evidence
The steps above define the intended workflow, but the under-20-minute setup target has **not been independently timed or verified in this change**. Record a real timed walkthrough, the exact steps, and the resulting screenshots or commit before treating that target as accepted.
