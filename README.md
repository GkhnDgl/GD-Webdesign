# GD Webdesign

Welcome to the GD Webdesign repository. This repository houses the main agency site and the reusable website template ecosystem for client projects.

## Project Purpose
GD Webdesign creates modern, performant, accessible, and responsive websites for client businesses. This repository provides:
1. The baseline foundation for the GD Webdesign agency landing site.
2. Shared templates and boilerplates for rapid, standardized client site development.

## Tech Stack
- **HTML5**: Semantic, accessible markup.
- **CSS**: Mobile-first responsive styles, compatible with future Tailwind CSS workflows.
- **JavaScript**: Lightweight Vanilla JS, added only where needed.
- **Localization (i18n)**: JSON-based key-value locale files.
- **Hosting & Deployment**: Netlify static hosting with security headers and revalidatable asset caching.

## Directory Layout
```
├── .github/                       # GitHub workflows and template configuration
├── assets/                        # Static website assets
│   ├── css/
│   │   └── style.css              # Agency starter styles
│   ├── js/                        # JavaScript scripts (add when needed)
│   └── images/                    # Images, icons, and media
├── locales/                       # i18n JSON translation files
│   ├── de.json                    # German starter locale
│   └── en.json                    # English starter locale
├── templates/                     # Reusable template ecosystem
│   └── one-pager-boilerplate/     # Single-page client site starter template
│       ├── index.html
│       └── README.md
├── index.html                     # Main GD Webdesign landing page
├── netlify.toml                   # Netlify build, routing, caching, & security headers
└── README.md                      # Repository documentation
```

## Local Preview & Development
Since the project relies on standard static assets without heavy build dependencies, you can run a local preview using any static HTTP server.

For example, using Python's built-in HTTP server:
```bash
python3 -m http.server 8000
```
Then visit `http://localhost:8000` in your web browser.

Alternatively, if using Node.js:
```bash
npx serve .
```

## i18n Conventions
- Translations are maintained in `locales/{lang}.json`.
- Both `de.json` and `en.json` maintain synchronized key hierarchies (e.g. `meta`, `nav`, `hero`, `services`, `footer`).
- Keep key names descriptive and nested by section (e.g., `services.webdesign.title`).
- The locale files are currently a foundation only; the agency page does not yet load translations dynamically. Add the locale loader and language switcher in a dedicated follow-up change.

## Template Ecosystem Usage
- Standardized templates reside under `templates/`.
- `templates/one-pager-boilerplate/` provides a clean starter scaffold for single-page client builds.
- **Guidelines**: Do not hardcode client-specific credentials, private API tokens, or unmasked client email addresses in shared templates. Configure secret values via Netlify environment variables.

## Netlify Deployment
- The site deploys statically with publish root set to `.`.
- Security headers include `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and a same-origin Content Security Policy.
- Assets under `/assets/*` use a one-hour cache lifetime with revalidation. Do not use `immutable` caching until asset filenames are fingerprinted/versioned.
- If a future integration needs third-party scripts, fonts, APIs, or embedded content, review and explicitly adjust the CSP directives rather than disabling CSP globally.
