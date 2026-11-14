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

## Customer Configuration (Milestone M1.2)

Master Template A reads customer-specific content from the existing `config.json`. The shared runtime loads this file only when the page uses the `template-master-a` body class. The agency homepage does not request or apply this customer configuration.

- Example configuration: `config.json`
- Machine-readable JSON Schema: `config.schema.json`
- Translated interface copy remains in `locales/de.json` and `locales/en.json`.

### Supported fields

| Path | Purpose | Validation |
|---|---|---|
| `business.name` | Public business name shown in the brand | Required non-empty string |
| `business.legalName` | Registered legal name used in legal text | Required non-empty string |
| `business.phone` | Public telephone number and `tel:` link | Required phone-like string |
| `business.email` | Public email address and `mailto:` link | Required email address |
| `business.address` | Public business address | Required non-empty string |
| `branding.primaryColor`, `primaryHoverColor` | Brand color tokens | Six-digit hexadecimal colors |
| `gallery` | Four gallery image paths and alternative texts | Exactly four same-origin relative paths with non-empty alt text |
| `legal.imprintDetails`, `privacyDetails` | Localized legal text | Required German and English strings |

### Setup workflow

1. Copy `templates/one-pager-boilerplate/` to the customer project.
2. Replace all sample values in `config.json` with customer-approved business details.
3. Add the four customer gallery images and update their relative paths and descriptive alt text.
4. Set the brand colors using six-digit hexadecimal values.
5. Replace both German and English legal text with details reviewed for the actual business and its data processing.
6. Serve the page over HTTP(S). Check the language switcher, contact links, gallery, legal sections, and browser console.

The runtime validates required values before applying them. Invalid, missing, or malformed configuration produces an accessible error message; incomplete sample data is not silently treated as customer configuration. Configuration image paths must resolve to the same origin as the template.

### Setup-time measurement

The previous claim that a sample business was configured in 2.5 minutes is withdrawn because the repository does not contain reproducible timing evidence. The under-20-minute target remains unverified. It must be demonstrated with a real timed walkthrough recording the start/end method, steps, elapsed time, and any manual edits. Automated tests do not prove the time target.
