---
name: agency-redesign
description: Umgestaltung und Pflege der mehrseitigen GD Webdesign (GDesign) Agentur-Website auf High-End-Editorial-Niveau unter strikter Einhaltung der Bespoke-Heritage-Markenidentität, der Multi-Page-Architektur (7 Seiten), der gemeinsamen main.js-i18n-Selektoren, der CSP-Header und der automatisierten Build-/Test-Suite. Immer aktivieren, wenn index.html, leistungen.html, projekte.html, ueber-uns.html, kontakt.html, impressum.html, datenschutz.html, assets/css/style.css, assets/js/main.js oder locales/{de,en}.json bearbeitet werden.
---

# GDesign – Agency Website Redesign & Multi-Page Guidelines

## 1. Seitenarchitektur (Multi-Page Sitemap)
Die Website ist als modulare, mehrseitige Webpräsenz mit 7 Einzelseiten im Root strukturiert:
- `index.html`: Editorial-Hero, Flagship Boilerplate Showcase-Teaser, Bento-Grid der Kernkompetenzen, transparenter 3-Schritte-Ablauf, Über-GDesign-Intro, Kontakt-Snippet, Footer mit Navigation & rechtlichen Links sowie verborgenen Test-Stubs (`#impressum`, `#datenschutz`).
- `leistungen.html`: Detaillierte Darstellung der 5 Kernleistungen, 3-Schritte-Methodik sowie 3 produktisierte Website-Pakete (Starter, Business, Custom) für Geschäftskunden.
- `projekte.html`: Interaktiver Showcase des Kunden-Template-Systems (Desktop 1440px / Mobile 375px / JSON-Schema) und 3 detaillierte Referenz-Case-Studies mit messbaren Metriken (Lighthouse, WCAG, Conversion).
- `ueber-uns.html`: Agentur-Philosophie („Handwerk statt Baukasten“), Technologie-Stack (HTML5, Vanilla JS, Netlify, Tailwind-Build), Qualitäts-Benchmarks (100 Lighthouse, WCAG AA, <40ms TTFB) und DSGVO-by-Design-Prinzipien.
- `kontakt.html`: Umfassendes Projektanfrage-Formular mit Projekttyp, Budget und Zeitrahmen (`data-netlify="true"`, `netlify-honeypot="bot-field"`), Direktkontakt-Box und Kooperations-FAQ.
- `impressum.html`: Eigenständige Seite für Anbieterkennzeichnung gemäß § 5 TMG.
- `datenschutz.html`: Eigenständige Seite für DSGVO-Datenschutzerklärung.

**Wichtig für interne Verlinkungen:** Alle internen Links müssen streng relativ ohne führenden Slash (`/`) formatiert sein (z. B. `href="leistungen.html"` statt `href="/leistungen.html"`), damit GitHub-Pages-Subpaths (`/GD-Webdesign/`) und Netlify gleichermaßen fehlerfrei funktionieren.

## 2. Markenidentität („Bespoke Heritage“) & Ästhetik
- **Verbindliche Farb-Tokens in `assets/css/style.css`:**
  - Midnight Navy: `#0E1726` (`--brand-midnight`)
  - Ivory Cream: `#F4F1EA` (`--brand-ivory`)
  - Muted Champagne: `#B89F7D` (`--brand-champagne`) & `#725B3F` (`--brand-champagne-ink` für AA-Kontrast auf hellem Grund)
  - Deep Slate: `#1E293B` (`--brand-slate`)
  - Pure White: `#FFFFFF` (`--brand-white`)
- **Typografie:** Display-Headlines (`h1`–`h4`, `.metric-value`, `.step-number`, `.package-title`, `.study-metric-val`) in `"Cormorant Garamond", "Playfair Display", Georgia, serif` (`--font-display`), UI & Fließtext in lokal gehosteter `"Plus Jakarta Sans"` (`--font-ui`). Binde Schriften ausschließlich lokal über `assets/fonts/` ein. Überschriften dürfen kein `hyphens: auto;` enthalten, um unschöne Worttrennungen zu verhindern.
- **Gestaltungssprache & Rhythmus:** Harmonischer Wechsel zwischen Midnight Navy (`#0E1726`) und Ivory Cream (`#F4F1EA`) auf allen Seiten, sodass niemals zwei gleichfarbige Abschnitte ohne visuellen Bruch aneinandergrenzen. Der Startseiten-Hero (`index.html`) ist auf allen Viewports zentriert (`.hero-metrics` max 56rem).
- **Kontraste & Barrierefreiheit:** `.btn-secondary` auf dunklen Flächen nutzt Champagne-Border und helle Schrift (`var(--brand-ivory)`) im Normalzustand sowie Champagne-Hintergrund mit Midnight-Schrift im Hover-/Focus-Zustand (WCAG AA >= 4.5:1). Alle Buttons bieten mindestens 44px Touch-Höhe. Metriken (`.study-metrics`) stacken auf mobilen Geräten (< 480px) einspaltig.
- **Header & Navigation:** Einheitlicher Sticky-Header auf allen Seiten. `markActivePage()` in `main.js` setzt dynamisch `aria-current="page"` auf den aktiven Nav-Link.
- **Logos & Favicons:** Nutze ausschließlich `assets/images/gdesign-logo.png`, `assets/images/favicon-32x32.png` und `assets/images/apple-touch-icon.png`.

## 3. Kritische Architektur- & Test-Schutzregeln (`tests/runtime.test.js` & `tests/boilerplate.test.js`)
- **DOM-Hooks für `main.js` erhalten:** `assets/js/main.js` wird von `index.html` UND `templates/one-pager-boilerplate/index.html` genutzt. Entferne oder ändere NIEMALS bestehende Klassen, IDs oder `nth-child`-Strukturen, die in `const translations = { ... };` in `assets/js/main.js` referenziert werden (u. a. `.brand-text`, `.nav-list`, `.nav-cta`, `#hero-title`, `.hero-description`, `.hero-actions`, `.hero-metrics`, `.metric-item`, `.bento-card-featured`, `.bento-card`, `.bento-card-wide`, `.process-step`, `.about-card`, `.feature-item`, `#contact`, `.footer-nav-group`, `#impressum`, `#datenschutz`).
- **Verborgene Test-Stubs auf `index.html`:** Behalte die Abschnitte `<section id="impressum" ... hidden>` und `<section id="datenschutz" ... hidden>` in `index.html` bei, da die Test-Suite das Vorhandensein dieser Selektoren in `index.html` prüft.
- **Format von `translations` in `main.js`:** Verändere die Einrückung von `const translations = {\n  ...\n  };` nicht, da `tests/runtime.test.js` dieses Objekt per Regex parst.
- **Multi-Page-i18n-Sektionen:** Neue Unterseiten-Inhalte (`leistungen`, `projekte`, `ueber`, `kontakt_page`, `nav_pages`) werden in `setLanguage()` über Guard-Funktionen (`if (section && locale.section)`) aktualisiert. Sie dürfen NICHT in das globale `translations`-Objekt aufgenommen werden, da dieses für das Boilerplate geteilt wird.
- **i18n-Synchronität:** Halte `locales/de.json` und `locales/en.json` zu 100 % schlüsselidentisch.
- **CSS-Test-Signaturen bewahren:** Erhalte in `assets/css/style.css` die expliziten Farb- und Kontrastdefinitionen für `.services-section`, `.bento-card p`, `.about-card p`, `.step-content p`, `.contact-form input`, `.site-footer a`, `@media (min-width: 1024px)` sowie `@media (prefers-reduced-motion: reduce)`.
- **Kunden-Boilerplate unberührt lassen:** Ändere keine Dateien unter `templates/one-pager-boilerplate/`.

## 4. Strikte CSP-, DSGVO- & Hosting-Regeln (`netlify.toml`)
- **Keine Inline-Styles & Inline-Scripts:** Verwende NIEMALS `style="..."` oder `<script>...</script>` im HTML (`style-src 'self'`, `script-src 'self'`).
- **Kein externer Traffic:** Keine externen Font-, Icon- oder Script-CDNs einbinden.
- **Formulare & Netlify:** Formulare auf `index.html` und `kontakt.html` nutzen `data-netlify="true"`, `netlify-honeypot="bot-field"` und einen versteckten Absatz `<p class="hidden-field hidden">` für den Spamschutz.

## 5. Arbeitsweise & Abnahme-Check
- Führe nach jeder Änderung zwingend `npm run build` aus (kompiliert Tailwind und startet `node --test`).
- Eine Änderung gilt erst als abgeschlossen, wenn `npm run build` und alle Tests mit 0 Fehlern durchlaufen und die Seiten auf Desktop (1440px) sowie Mobile (375px) visuell einwandfrei dargestellt werden.