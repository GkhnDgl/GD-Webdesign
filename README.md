# GD Webdesign

Welcome to the GD Webdesign repository. This repository houses the main agency site and the reusable website template ecosystem for client projects.

## Project Purpose
GD Webdesign creates modern, performant, accessible, and responsive websites for client businesses. This repository provides:
1. The baseline foundation for the GD Webdesign agency landing site.
2. Shared templates and boilerplates for rapid, standardized client site development.

Detailed operational instructions, decision frameworks, quality gates, and hosting limitations are documented in [docs/WORKFLOW.md](docs/WORKFLOW.md).

## Tech Stack
- **HTML5**: Semantic, accessible markup.
- **CSS**: Mobile-first component styling plus build-time Tailwind CSS utilities.
- **JavaScript**: Lightweight Vanilla JS, added only where needed.
- **Localization (i18n)**: JSON-based key-value locale files.
- **Hosting & Deployment**: Netlify static hosting with security headers and revalidatable asset caching.

## Directory Layout
```
├── .github/                       # GitHub workflows and template configuration
├── assets/                        # Static website assets
│   ├── css/
│   │   ├── style.css              # Shared responsive component styles
│   │   └── tailwind.input.css      # Tailwind source utilities
│   ├── js/                        # JavaScript scripts (add when needed)
│   └── images/                    # Images, icons, and media
├── locales/                       # i18n JSON translation files
│   ├── de.json                    # German starter locale
│   └── en.json                    # English starter locale
├── templates/                     # Reusable template ecosystem
│   └── one-pager-boilerplate/     # Single-page client site starter template
│       └── index.html
├── index.html                     # Main GD Webdesign landing page
├── netlify.toml                   # Netlify build, routing, caching, & security headers
├── docs/
│   ├── roadmap.md                 # Project roadmap and milestone schedule
│   └── WORKFLOW.md                # Operating procedures, quality gates, & workflow rules
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
- Locale JSON paths are resolved dynamically relative to `assets/js/main.js` via `document.currentScript.src`. This ensures reliable fetch operations whether the site is deployed at a custom root domain (e.g. Netlify) or a GitHub Pages project subpath (e.g. `/GD-Webdesign/`).
- The boilerplate loads locale JSON over HTTP. Preview it from the repository root using `python3 -m http.server 8000`, then open `http://localhost:8000/templates/one-pager-boilerplate/`.
- The language preference is stored in localStorage when available; the page remains usable when storage is blocked.

## Reusing the one-pager boilerplate
- Replace the generic business name, service descriptions, and contact details with verified client-approved content in the locale JSON files.
- Update the color tokens in `assets/css/style.css` and replace the initials in the brand mark in `templates/one-pager-boilerplate/index.html`.
- Replace the legal placeholders with reviewed, business-specific legal content before publishing. The included text is not legal advice and is not ready for production.
- Configure form handling and confirm the deployed host supports the chosen form provider before accepting real enquiries.

## Template Ecosystem Usage
- Standardized templates reside under `templates/`.
- `templates/one-pager-boilerplate/` provides a clean starter scaffold for single-page client builds.
- **Guidelines**: Do not hardcode client-specific credentials, private API tokens, or unmasked client email addresses in shared templates. Configure secret values via Netlify environment variables.

## Netlify Deployment
- The site deploys statically with publish root set to `.`. Netlify runs `npm run build` to generate `assets/css/tailwind.generated.css` before publishing.
- Security headers include `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and a same-origin Content Security Policy.
- Assets under `/assets/*` use a one-hour cache lifetime with revalidation. Do not use `immutable` caching until asset filenames are fingerprinted/versioned.
- If a future integration needs third-party scripts, fonts, APIs, or embedded content, review and explicitly adjust the CSP directives rather than disabling CSP globally.
