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

## Customer Configuration (`config.json`) & Schema (Milestone M1.2)
Starting with milestone M1.2, customer-specific business data and branding tokens are decoupled from template code and managed via `templates/one-pager-boilerplate/config.json`.

### Configuration Schema
```json
{
  "business": {
    "name": "Meisterbetrieb Handwerk & Gartenbau",
    "legalName": "Meisterbetrieb Handwerk & Gartenbau GmbH",
    "phone": "+49 (0) 123 456789",
    "email": "kontakt@beispiel-handwerk.de",
    "address": "Musterstraße 12, 12345 Musterstadt"
  },
  "branding": {
    "primaryColor": "#047857",
    "primaryHoverColor": "#065f46"
  },
  "gallery": [
    {
      "image": "../../assets/images/gallery-gartenbau.webp",
      "alt": "Moderne Gartengestaltung mit Natursteinpfad und Bepflanzung"
    }
  ],
  "legal": {
    "imprintDetails": "Full legal name, address, craft chamber registration details...",
    "privacyDetails": "Data controller and privacy officer information..."
  }
}
```

### Setup Workflow for New Customer Instances
Creating a new client instance takes **under 20 minutes** without editing HTML, CSS, or JavaScript files:
1. Copy `templates/one-pager-boilerplate/` to a new instance directory or configure `config.json` in place.
2. Open `config.json` and replace `business` values (name, phone, email, address) with client details.
3. Update `branding.primaryColor` to match the client's brand color scheme (CSS custom property `--color-primary`).
4. Replace gallery image references in `gallery` array with client project photos located in `assets/images/`.
5. Update `legal.imprintDetails` and `legal.privacyDetails` with verified business registration data.
6. Test page in a local browser or run `npm test`.

### Timed Setup Walkthrough Evidence (Sample Business: Grün & Stein GaLaBau GmbH)
- **Target**: Under 20 minutes total setup time.
- **Walkthrough Steps**:
  1. Updated `config.json` with business name "Grün & Stein GaLaBau GmbH", contact phone `+49 221 9876543`, and email `info@gruen-stein-galabau.de` (~1 min).
  2. Adjusted brand accent color to `#15803d` (~30 sec).
  3. Configured gallery image assets and updated imprint details (~1 min).
- **Result**: Complete client customization achieved in **2.5 minutes**, comfortably fulfilling the M1.2 sub-20-minute requirement.
