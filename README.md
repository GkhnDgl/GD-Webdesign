# GDesign

Welcome to the GD Webdesign repository. This repository houses the agency website and the reusable website template ecosystem for client projects.

## Project Purpose

GDesign creates refined, performant, accessible, and responsive websites for client businesses. This repository provides:
1. The baseline foundation and source for the GD Webdesign agency website.
2. Shared, client-neutral templates and boilerplates for standardized client site development.

The intended production architecture also includes a separate private internal dashboard and independent private source repositories/Netlify projects for customer websites. Those applications are not part of this repository. See [Architecture & Hosting Decisions](docs/architecture.md).

Detailed milestones and dates are documented in [docs/roadmap.md](docs/roadmap.md). Operational procedures, quality gates, and hosting migration rules are documented in [docs/WORKFLOW.md](docs/WORKFLOW.md).

## Tech Stack

- **HTML5**: Semantic, accessible markup.
- **CSS**: Mobile-first component styling plus build-time Tailwind CSS utilities.
- **JavaScript**: Lightweight Vanilla JS, added only where needed.
- **Localization (i18n)**: JSON-based key-value locale files.
- **Target hosting**: Netlify for the public agency website, with the source repository intended to become private before production launch.

## Directory Layout

```
├── .github/                       # GitHub workflows and template configuration
├── assets/                        # Static website assets
│   ├── css/
│   │   ├── style.css              # Shared responsive component styles
│   │   └── tailwind.input.css      # Tailwind source utilities
│   ├── js/                        # JavaScript scripts (add when needed)
│   └── images/                    # Static website assets
├── locales/                       # i18n JSON translation files
│   ├── de.json                    # German starter locale
│   └── en.json                    # English starter locale
├── templates/                     # Reusable template ecosystem
│   └── one-pager-boilerplate/     # Single-page client site starter template
│       └── index.html
├── docs/
│   ├── architecture.md            # Repository boundaries, hosting, dashboard and customer-site decisions
│   ├── roadmap.md                 # Project roadmap and milestone schedule
│   └── WORKFLOW.md                # Operating procedures, quality gates, & workflow rules
├── index.html                     # Main GD Webdesign landing page
├── netlify.toml                   # Netlify build, routing, caching, & security headers
└── README.md                      # Repository documentation
```

## Local Preview & Development

Install the Tailwind build dependency and generate the utility stylesheet before starting a local preview:

```bash
npm install
npm run build
python3 -m http.server 8000
```

Then visit `http://localhost:8000` in your web browser.

Alternatively, if using Node.js:

```bash
npx serve .
```

## i18n Conventions

- All visible copy, accessibility labels, form placeholders, and legal placeholder copy for the reusable boilerplate live in `locales/de.json` and `locales/en.json`.
- Keep both locale files structurally identical; `npm test` checks JSON validity, matching keys, and required template translation hooks.
- Locale JSON paths are resolved dynamically relative to `assets/js/main.js` via `document.currentScript.src`. This supports both a custom root domain and a GitHub Pages project subpath such as `/GD-Webdesign/`.
- Preview the boilerplate from the repository root using `python3 -m http.server 8000`, then open `http://localhost:8000/templates/one-pager-boilerplate/`.
- The language preference is stored in localStorage when available; the page remains usable when storage is blocked.

## Reusing the one-pager boilerplate

- Replace the generic business name, service descriptions, and contact details with verified client-approved content in the locale JSON files.
- Update the color tokens in `assets/css/style.css` and replace the initials in the brand mark in `templates/one-pager-boilerplate/index.html`.
- Replace legal placeholders with reviewed, business-specific legal content before publishing. The included text is not legal advice and is not ready for production.
- Configure form handling and confirm the deployed host supports the chosen form provider before accepting real enquiries.

## Template Ecosystem Usage

- Standardized templates reside under `templates/`.
- `templates/one-pager-boilerplate/` provides a clean starter scaffold for single-page client builds.
- Keep templates client-neutral. Do not hardcode client-specific credentials, private API tokens, personal data, or unmasked client email addresses in shared templates.
- Store secret values only in the hosting provider's server-side environment variables; never commit secrets to the repository.

## Hosting and Deployment

- **Current transition state:** GitHub Pages remains the existing published preview/hosting route. Netlify is the agreed production target; the migration has not been completed yet.
- **Target Netlify configuration:** publish root `.`; run `npm run build` to generate `assets/css/tailwind.generated.css` before publishing.
- The repository's `netlify.toml` defines Netlify-specific build, headers, redirects, and caching. GitHub Pages does not apply those Netlify settings.
- Verify actual deployed headers, forms, redirects, assets, localization, and runtime behavior on Netlify. A green CI job alone is not proof of a successful production migration.
- The GitHub source repository is intended to become private before production launch, after confirming Netlify's GitHub integration still has the required least-privilege access. The deployed agency website remains public.
- Do not disable GitHub Pages until the Netlify deployment, production domain, HTTPS, and critical user journeys have been verified and accepted.

## GDesign Bespoke Heritage Brand

The agency homepage uses the approved GDesign brand identity:
- Midnight Navy `#0E1726`
- Ivory Cream `#F4F1EA`
- Muted Champagne `#B89F7D`
- Deep Slate `#1E293B`
- Pure White `#FFFFFF`

The approved PDF monogram/wordmark is stored locally in `assets/images/gdesign-logo.png`; the isolated mark is used as the favicon in `assets/images/gdesign-monogram.png`. Display headings use the Cormorant Garamond / Playfair Display / Georgia serif stack; Plus Jakarta Sans remains the locally hosted UI and body font. The customer one-pager boilerplate keeps its independent customer-configurable design system.
