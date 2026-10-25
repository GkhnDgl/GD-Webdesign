# One-Pager Boilerplate Template

A production-ready, reusable single-page website template designed for rapid, standardized client deployments at GD Webdesign.

## Features
- **Semantic HTML5 & Accessibility**: Fully accessible markup with ARIA landmarks, proper heading hierarchy, keyboard navigation, visible focus styles, and `prefers-reduced-motion` considerations.
- **Mobile-First Responsive Layout**: Built with a mobile-first approach utilizing Tailwind CSS breakpoints (`sm`, `md`, `lg`, `xl`).
- **Bento Grid Services & Structured Sections**: Includes a sticky header navigation with mobile drawer, hero section with key metrics, bento grid services overview, process step-by-step workflow, about card, Netlify-compatible contact form, and legal placeholders.
- **i18n Localization Support**: Pre-configured DE/EN language switcher that dynamically updates page text, `lang` attribute, meta tags, and aria labels using JSON translation files. Persists user preference via `localStorage`.
- **Client Neutrality & Security**: Contains generic placeholders only. No hardcoded credentials, secret keys, or personal contact details.

## File Structure
```
templates/one-pager-boilerplate/
├── index.html        # Semantic HTML5 single-page boilerplate structure
└── README.md         # Template usage & customization documentation
```

## How to Reuse & Customize

### 1. Copy Template Files
Copy `index.html` from `templates/one-pager-boilerplate/` into your new project's root directory:
```bash
cp templates/one-pager-boilerplate/index.html ./index.html
```

### 2. Update Metadata & Branding
1. Open `index.html` and customize the page `<title>` and `<meta name="description">`.
2. Update the brand name, logo text, section titles, and body content to match client requirements.
3. Replace legal placeholders (`#impressum`, `#datenschutz`) with verified client operator details before production launch.

### 3. Localization (i18n) Setup
1. Standard user-facing strings are stored in `locales/de.json` and `locales/en.json`.
2. Extend or modify JSON keys under `nav`, `hero`, `services`, `process`, `about`, `contact`, and `footer` as needed.
3. The included JavaScript (`assets/js/main.js`) handles language toggling and persists language preference in `localStorage`.

### 4. Build & Tailwind CSS Integration
1. Ensure `tailwind.config.js` scans your project HTML files:
   ```js
   module.exports = {
     content: [
       './index.html',
       './assets/js/**/*.js',
       './templates/**/*.html'
     ],
     // ...
   };
   ```
2. Build the CSS bundle using npm:
   ```bash
   npm run build
   ```
3. Test locally using an HTTP server (e.g. `npx serve .` or `python3 -m http.server 8000`).

### 5. Contact Form Deployment (Netlify)
The contact form is pre-configured for Netlify Forms with spam protection:
- `data-netlify="true"`
- `netlify-honeypot="bot-field"`
- Hidden `form-name` field

Configure notifications and custom redirect endpoints in the Netlify dashboard.
