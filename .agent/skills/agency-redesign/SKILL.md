---
name: agency-redesign
description: Umgestaltung der GD Webdesign (GDesign) Agentur-Hauptseite auf High-End-Editorial-Niveau unter strikter Einhaltung der Bespoke-Heritage-Markenidentität, der gemeinsamen main.js-i18n-Selektoren, der CSP-Header und der automatisierten Build-/Test-Suite. Immer aktivieren, wenn index.html, assets/css/style.css, assets/js/main.js oder locales/{de,en}.json bearbeitet werden.
---

# GDesign – Agency Website Redesign Guidelines

## 1. Markenidentität („Bespoke Heritage“) & Ästhetik
- Gestalte `index.html` als luxuriöses, architektonisch präzises Editorial-Aushängeschild für **GDesign** – klar abgegrenzt vom grünen Handwerker-Look (`#047857`) des Kunden-Templates.
- **Verbindliche Farb-Tokens in `assets/css/style.css`:**
  - Midnight Navy: `#0E1726` (`--brand-midnight`)
  - Ivory Cream: `#F4F1EA` (`--brand-ivory`)
  - Muted Champagne: `#B89F7D` (`--brand-champagne`) & `#725B3F` (`--brand-champagne-ink` für AA-Kontrast auf hellem Grund)
  - Deep Slate: `#1E293B` (`--brand-slate`)
  - Pure White: `#FFFFFF` (`--brand-white`)
- **Typografie:** Display-Headlines (`h1`–`h4`, `.metric-value`, `.step-number`) in `"Cormorant Garamond", "Playfair Display", Georgia, serif` (`--font-display`), UI & Fließtext in `"Plus Jakarta Sans"` (`--font-ui`). Binde neue Schriften ausschließlich lokal über `assets/fonts/` ein.
- **Gestaltungssprache:** Reduzierte Eckradien (`2px–3px`), feine `1px`-Rahmen in Champagne (`rgb(184 159 125 / .35)`), asymmetrische Bento-Layouts, großzügiger Weißraum und interaktive Showcase-Elemente statt generischer KI-Cards.
- **Logos:** Nutze ausschließlich `assets/images/gdesign-logo.png`, `assets/images/favicon-32x32.png` und `assets/images/apple-touch-icon.png`.

## 2. Kritische Architektur- & Test-Schutzregeln (`tests/runtime.test.js` & `tests/boilerplate.test.js`)
- **DOM-Hooks für `main.js` erhalten:** `assets/js/main.js` wird von `index.html` UND `templates/one-pager-boilerplate/index.html` genutzt. Entferne oder ändere NIEMALS bestehende Klassen, IDs oder `nth-child`-Strukturen, die in `const translations = { ... };` in `assets/js/main.js` referenziert werden (u. a. `.brand-text`, `.nav-list`, `.nav-cta`, `#hero-title`, `.hero-description`, `.hero-actions`, `.hero-metrics`, `.metric-item`, `.bento-card-featured`, `.bento-card`, `.bento-card-wide`, `.process-step`, `.about-card`, `.feature-item`, `#contact`, `.footer-nav-group`, `#impressum`, `#datenschutz`).
- **Format von `translations` in `main.js`:** Verändere die Einrückung von `const translations = {\n  ...\n  };` nicht, da `tests/runtime.test.js` dieses Objekt per Regex parst.
- **Agentur-spezifische i18n-Sektionen:** Neue Sektionen, die es nur auf `index.html` gibt (z. B. ein interaktiver Template-Showcase), dürfen NICHT in das gemeinsame `translations`-Objekt aufgenommen werden, sondern müssen in `setLanguage()` analog zum `#gallery`-Block über eine `if (section)`-Abfrage befüllt werden.
- **i18n-Synchronität:** Halte `locales/de.json` und `locales/en.json` zu 100 % schlüsselidentisch. Keine harten deutschen Texte im HTML belassen.
- **CSS-Test-Signaturen bewahren:** Erhalte in `assets/css/style.css` die expliziten Farb- und Kontrastdefinitionen für `.services-section`, `.bento-card p`, `.about-card p`, `.step-content p`, `.contact-form input`, `.site-footer a`, `@media (min-width: 1024px)` sowie `@media (prefers-reduced-motion: reduce)`.
- **Kunden-Boilerplate unberührt lassen:** Ändere keine Dateien unter `templates/one-pager-boilerplate/`.

## 3. Strikte CSP-, DSGVO- & Hosting-Regeln (`netlify.toml`)
- **Keine Inline-Styles & Inline-Scripts:** Verwende NIEMALS `style="..."` oder `<script>...</script>` im HTML (`style-src 'self'`, `script-src 'self'`).
- **Kein externer Traffic:** Keine Google Fonts CDNs, Icon-CDNs oder externe Bilder einbinden.
- **Formular & Deployment:** Behalte `name="contact"`, `data-netlify="true"`, `netlify-honeypot="bot-field"` und die relative Pfadauflösung (`pageBaseUrl`) für GitHub Pages (`/GD-Webdesign/`) und Netlify bei.

## 4. Arbeitsweise & Abnahme-Check
- Arbeite Sektion für Sektion – schreibe niemals ungefragt die gesamte Seite auf einmal neu.
- Fixe bei der ersten CSS-Bearbeitung den fehlenden Kommentar-Anfang `/*` in Zeile 1 von `assets/css/style.css`.
- Führe nach jeder Änderung zwingend `npm run build` aus (kompiliert Tailwind und startet `node --test`). Eine Änderung gilt erst als abgeschlossen, wenn Build und alle Tests mit 0 Fehlern durchlaufen.