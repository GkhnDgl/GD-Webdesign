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
- General interface copy (navigation labels, form labels, validation messages, and accessibility text) lives in `locales/de.json` and `locales/en.json`.
- Customer-specific presentation content, SEO metadata, section headings, metrics, service descriptions, process steps, company features, gallery copy, and CTA labels live in the existing `config.json` and provide both `de` and `en` values.
- The template locale files are not the per-customer content store; keep their German and English key hierarchies aligned.

## Quality Assurance & Verification
- **Build & Tests**: Run `npm run build` (which executes Tailwind CSS compilation and `node --test`).
- **Responsive Viewports**: The layout is designed mobile-first with responsive behavior for `sm` (640px), `md` (768px), `lg` (1024px), and `xl` (1280px) breakpoints. Verify overflow and clipping for each customer configuration before launch.
- **Accessibility**: The template includes keyboard focus styling, ARIA landmarks, and reduced-motion stylesheet overrides. Check contrast, keyboard operation, and assistive-technology behavior against each project's requirements before launch.

## Customer Configuration (Milestone M1.2)

Master Template A reads customer-specific content from the existing `config.json`. The shared runtime loads this file only when the page uses the `template-master-a` body class. The agency homepage does not request or apply this customer configuration.

- Example configuration: `config.json`
- Machine-readable JSON Schema: `config.schema.json`
- Translated interface copy remains in `locales/de.json` and `locales/en.json`.

### Configuration contract

The complete customer configuration is stored in this file. The machine-readable contract is defined in `config.schema.json`.

| Object | Fields and purpose |
|---|---|
| `business` | Public name, registered legal name, legal form, phone, email, structured address |
| `branding` | Optional logo path and localized alt text; primary, hover, light and accent HEX colors |
| `seo` | German and English page title and meta description |
| `content.hero` | Localized badge, title, subtitle and variable metrics list |
| `content.services` | Localized section heading/description and a variable list of services; optional localized highlights |
| `content.process` | Localized section heading/description and variable process steps |
| `content.about` | Localized company introduction and variable feature list |
| `content.gallery` | Localized section copy and variable project items with image, alt text, title and description |
| `content.contact` | Localized contact section copy |
| `content.footer` | Localized customer-specific footer tagline |
| `ctas` | Stable ID, placement, style, localized label, typed action and value |
| `legal` | Localized `imprintDetails` and `privacyDetails` |

Every customer-facing text value is supplied in both `de` and `en`. General interface text such as navigation labels, form labels, validation messages and accessibility copy remains in `locales/de.json` and `locales/en.json`.

### Validation and asset paths

- Business address fields are structured; `region` is optional.
- Brand colors must be six-digit HEX values.
- Logo and gallery images must resolve to same-origin files under the site's `assets/images/` directory. Use relative paths compatible with GitHub Pages project subpaths (the sample uses `../../assets/images/...`).
- Service, process, feature and gallery entries require unique stable IDs and localized text.
- CTA placements and styles are allowlisted. Supported action types are `tel`, `email`, `url` (HTTPS only), `anchor` (allowlisted section IDs), and `form` (the existing `#contact-form` target).
- Customer text is rendered as text, not interpreted as HTML.
- Legal text must be reviewed for the actual business and its data processing before publication.

### Setup workflow

1. Copy `templates/one-pager-boilerplate/` to the customer project.
2. Replace the sample business identity, legal form, contact details and structured address.
3. Add the customer's logo and project images under `assets/images/`; update their relative paths and localized alternative text. The logo is optional and the template retains its accessible generic mark when omitted.
4. Set the brand colors using six-digit hexadecimal values.
5. Replace all customer presentation content in `content`, including services, process steps, company features, gallery items, SEO metadata and footer tagline, in both German and English.
6. Configure each CTA with an allowed placement, style, action type and valid value.
7. Replace both German and English legal text with customer-approved details.
8. Serve the page over HTTP(S). Check both languages, contact links, variable content collections, image paths, legal sections, responsive layouts and the browser console.

The runtime validates the configuration before applying it. Invalid, missing, or malformed configuration produces an accessible localized error message; incomplete sample content is not silently accepted. The agency homepage does not load this template-specific configuration.

### Setup-time measurement

The previous claim that a sample business was configured in 2.5 minutes is withdrawn because the repository does not contain reproducible timing evidence. The under-20-minute target remains unverified. It must be demonstrated with a real timed walkthrough recording the start/end method, steps, elapsed time, and any manual edits. Automated tests do not prove the time target.
