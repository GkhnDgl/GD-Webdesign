const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const de = JSON.parse(fs.readFileSync(path.join(root, 'locales/de.json'), 'utf8'));
const en = JSON.parse(fs.readFileSync(path.join(root, 'locales/en.json'), 'utf8'));
const boilerplateDe = JSON.parse(fs.readFileSync(path.join(root, 'templates/one-pager-boilerplate/locales/de.json'), 'utf8'));
const boilerplateEn = JSON.parse(fs.readFileSync(path.join(root, 'templates/one-pager-boilerplate/locales/en.json'), 'utf8'));
const template = fs.readFileSync(path.join(root, 'templates/one-pager-boilerplate/index.html'), 'utf8');
const agency = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'assets/js/main.js'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'assets/css/style.css'), 'utf8');
const templateStyles = fs.readFileSync(path.join(root, 'templates/one-pager-boilerplate/style.css'), 'utf8');

function keyPaths(value, prefix = '') {
  return Object.entries(value).flatMap(([key, child]) => {
    const current = prefix ? `${prefix}.${key}` : key;
    return child && typeof child === 'object' && !Array.isArray(child)
      ? keyPaths(child, current)
      : [current];
  }).sort();
}

test('German and English locale files have identical key structures', () => {
  assert.deepEqual(keyPaths(de), keyPaths(en));
  assert.deepEqual(keyPaths(boilerplateDe), keyPaths(boilerplateEn));
});

test('both locales include the template content and accessibility copy', () => {
  for (const locale of [de, en, boilerplateDe, boilerplateEn]) {
    for (const key of [
      'meta.title', 'meta.description', 'nav.brand', 'nav.brand_label',
      'nav.label', 'hero.title', 'services.primary_title', 'process.one_title',
      'about.description', 'contact.placeholders.name', 'contact.privacy_link',
      'footer.notice', 'legal.imprint_text', 'legal.privacy_text',
      'accessibility.open_menu', 'accessibility.close_menu'
    ]) {
      assert.equal(typeof key.split('.').reduce((value, part) => value?.[part], locale), 'string', `Missing translation: ${key}`);
    }
  }
});

test('boilerplate targets trades and gardening sector with concrete copy and no generic technology language', () => {
  assert.doesNotMatch(template.replace(/<!--[\s\S]*?-->/g, ''), /GD Webdesign|Digitalagentur|Jamstack|SEO-Optimierung/i);
  assert.match(boilerplateDe.nav.brand, /Meisterbetrieb|Handwerk|Gartenbau/);
  assert.match(boilerplateEn.nav.brand, /Master Craftsman|Trades|Landscaping/);
  assert.match(boilerplateDe.hero.title, /Gartenbau|Handwerk/);
  assert.match(boilerplateEn.hero.title, /Gardening|Trades/);
});

test('boilerplate hero metrics localize correctly in German and English', () => {
  assert.equal(boilerplateDe.hero.metric_code_label, 'Qualifizierte Fachkräfte');
  assert.equal(boilerplateEn.hero.metric_code_label, 'Qualified Specialists');
});

test('locally hosted UI font file and font-face declarations exist', () => {
  assert.ok(fs.existsSync(path.join(root, 'assets/fonts/PlusJakartaSans-Variable.woff2')), 'woff2 font file missing in assets/fonts/');
  assert.ok(fs.existsSync(path.join(root, 'assets/fonts/LICENSE.txt')), 'Font license file missing in assets/fonts/');
  assert.match(templateStyles, /@font-face\s*\{[^}]*PlusJakartaSans-Variable\.woff2/);
});

test('template links to locale files and script updates document language', () => {
  assert.match(template, /assets\/js\/main\.js/);
  assert.match(script, /new URL\(`locales\/\$\{language\}\.json`, pageBaseUrl\)/);
  assert.match(script, /document\.documentElement\.lang = language/);
  assert.match(script, /preferred_language/);
});

test('GDesign agency brand tokens remain separate from customer template tokens', () => {
  assert.match(styles, /--color-primary:\s*var\(--brand-midnight\)/);
  assert.match(styles, /--brand-midnight:\s*#0E1726/);
  assert.doesNotMatch(styles, /--color-primary:\s*#047857/);
  assert.match(templateStyles, /--color-primary:\s*#047857/);
});

test('template uses its own stylesheet and does not inherit the agency stylesheet', () => {
  assert.match(template, /<body class="template-master-a">/);
  assert.match(template, /href="style\.css"/);
  assert.doesNotMatch(template, /href="\.\.\/\.\.\/assets\/css\/style\.css"/);
  assert.match(templateStyles, /:root\s*\{/);
  assert.match(templateStyles, /--color-primary:\s*#047857/);
});

test('locale URLs resolve from each page location, including GitHub Pages subpaths', () => {
  const agencyUrl = new URL('locales/de.json', 'https://example.github.io/GD-Webdesign/index.html');
  const templateUrl = new URL('locales/en.json', 'https://example.github.io/GD-Webdesign/templates/one-pager-boilerplate/index.html');
  assert.equal(agencyUrl.pathname, '/GD-Webdesign/locales/de.json');
  assert.equal(templateUrl.pathname, '/GD-Webdesign/templates/one-pager-boilerplate/locales/en.json');
});


test('Netlify honeypot fields are hidden without inline styles blocked by the Content Security Policy', () => {
  for (const page of [agency, template]) {
    assert.match(page, /netlify-honeypot="bot-field"/);
    assert.match(page, /<p class="hidden-field hidden">[\s\S]*name="bot-field"/);
    assert.doesNotMatch(page, /<p[^>]*style\s*=/i);
  }
});

test('responsive styles include the desktop breakpoint and reduced-motion support', () => {
  assert.match(styles, /@media \(min-width: 1024px\)/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
});

test('privacy link styling is decoupled from shared localization JavaScript', () => {
  assert.doesNotMatch(script, /emerald/i, 'shared JavaScript should not contain hardcoded emerald brand colors');
  assert.match(script, /privacyLink\.className = 'form-privacy-link';/);
  assert.match(styles, /\.form-privacy-link\s*\{[^}]*color:\s*var\(--brand-midnight\)/);
  assert.match(templateStyles, /\.form-privacy-link\s*\{[^}]*color:\s*var\(--color-primary\)/);
  assert.match(agency, /class="form-privacy-link"/);
  assert.match(template, /class="form-privacy-link"/);
});

test('boilerplate desktop navigation links enforce single-line wrapping and header CTA is visually proportionate', () => {
  assert.match(templateStyles, /\.nav-link\s*\{[^}]*white-space:\s*nowrap;/);
  assert.match(templateStyles, /\.nav-cta\s*\{[^}]*padding:\s*0\.5rem\s+1rem;/);
  assert.match(templateStyles, /\.nav-cta\s*\{[^}]*white-space:\s*nowrap;/);
  assert.match(templateStyles, /\.nav-cta\s*\{[^}]*flex-shrink:\s*0;/);
  assert.match(templateStyles, /\.brand-text\s*\{[^}]*word-break:\s*keep-all;/);
});

test('boilerplate switches from mobile menu to desktop navigation at 1024px to avoid header collisions', () => {
  const desktopBlock = [...templateStyles.matchAll(/@media \(min-width: 1024px\)\s*\{[\s\S]*?\n\}/g)].map((m) => m[0]).join('\n');
  assert.match(desktopBlock, /\.mobile-menu-toggle\s*\{[^}]*display:\s*none;/);
  assert.match(desktopBlock, /\.primary-navigation\s*\{[^}]*position:\s*static;/);
  assert.match(desktopBlock, /\.nav-list\s*\{[^}]*flex-direction:\s*row;/);
  const tabletBlock = [...templateStyles.matchAll(/@media \(min-width: 640px\)\s*\{[\s\S]*?\n\}/g)].map((m) => m[0]).join('\n');
  assert.doesNotMatch(tabletBlock, /\.mobile-menu-toggle|\.primary-navigation/);
  assert.match(script, /window\.innerWidth >= 1024\) closeMenu\(\)/);
  assert.match(templateStyles, /\.brand\s*\{[^}]*min-width:\s*0;/);
});

test('boilerplate config.json exists with required business, branding, gallery, and legal schema', () => {
  const configPath = path.join(root, 'templates/one-pager-boilerplate/config.json');
  assert.ok(fs.existsSync(configPath), 'templates/one-pager-boilerplate/config.json must exist');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  assert.ok(config.business && typeof config.business.name === 'string');
  assert.equal(config.business.name, 'Meisterbetrieb Handwerk & Gartenbau');
  assert.equal(config.business.legalName, 'Meisterbetrieb Handwerk & Gartenbau GmbH');
  assert.ok(config.business.phone && config.business.email && config.business.address);
  assert.ok(config.branding && typeof config.branding.primaryColor === 'string');
  assert.ok(Array.isArray(config.gallery) && config.gallery.length > 0);
  assert.ok(config.legal && config.legal.imprintDetails && config.legal.privacyDetails);
  assert.ok(config.legal.imprintDetails.en.includes(config.business.legalName));
  assert.ok(config.legal.privacyDetails.en.includes(config.business.legalName));

  // Ensure no unmasked sensitive credentials or private tokens are present
  const jsonStr = JSON.stringify(config);
  assert.doesNotMatch(jsonStr, /api[-_]?key|secret|token|password/i);
});

test('main.js resolves config.json relative to page base URL and handles errors gracefully', () => {
  assert.match(script, /new URL\('config\.json', pageBaseUrl\)/);
  assert.match(script, /applyConfig/);
});


test('Master Template A customer config matches its documented JSON Schema', () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'templates/one-pager-boilerplate/config.json'), 'utf8'));
  const schema = JSON.parse(fs.readFileSync(path.join(root, 'templates/one-pager-boilerplate/config.schema.json'), 'utf8'));

  assert.equal(config.$schema, './config.schema.json');
  assert.deepEqual(schema.required, ['$schema', 'business', 'branding', 'gallery', 'legal']);
  assert.equal(schema.properties.gallery.minItems, 4);
  assert.equal(schema.properties.gallery.maxItems, 4);
  assert.equal(config.gallery.length, 4);
  assert.ok(new RegExp(schema.properties.business.properties.phone.pattern).test(config.business.phone));
  assert.ok(config.business.email.includes('@'));
  assert.match(config.branding.primaryColor, /^#[0-9a-fA-F]{6}$/);
  assert.match(config.branding.primaryHoverColor, /^#[0-9a-fA-F]{6}$/);
  assert.ok(config.gallery.every((item) => item.image.startsWith('../../assets/images/') && item.alt.trim()));
  for (const key of ['imprintDetails', 'privacyDetails']) {
    assert.equal(typeof config.legal[key].de, 'string');
    assert.equal(typeof config.legal[key].en, 'string');
  }
});

test('template configuration is scoped to the template and contact values have render targets', () => {
  assert.ok(script.includes("document.body.classList.contains('template-master-a')"));
  assert.ok(script.includes('if (!isTemplatePage) return null'));
  assert.ok(script.includes('function validateConfig(config)'));
  assert.ok(script.includes('configError.textContent = locale.config.error'));
  assert.ok(script.includes("document.body.classList.add('config-invalid')"));
  assert.ok(templateStyles.includes('.config-invalid main'));
  assert.match(template, /id="config-error"[^>]*role="alert"/);
  assert.match(template, /class="contact-phone hidden/);
  assert.match(template, /class="contact-email hidden/);
  assert.match(template, /class="contact-address hidden/);
});

test('template locales include matching configuration error messages', () => {
  assert.equal(typeof boilerplateDe.config.error, 'string');
  assert.equal(typeof boilerplateEn.config.error, 'string');
});


test('template footer and SEO metadata use the configured business name in both languages', () => {
  for (const locale of [boilerplateDe, boilerplateEn]) {
    assert.match(locale.footer.rights, /\{businessName\}/);
    assert.match(locale.meta.title, /\{businessName\}/);
    assert.match(locale.meta.description, /\{businessName\}/);
  }
  assert.match(script, /locale\?\.meta\?\.title/);
  assert.match(script, /locale\?\.meta\?\.description/);
  assert.match(script, /locale\?\.footer\?\.rights/);
  assert.match(script, /replaceAll\('\{businessName\}'/);
});


test('GDesign agency homepage uses the approved Bespoke Heritage logo and color palette', () => {
  assert.match(agency, /assets\/images\/gdesign-logo\.png/);
  assert.match(agency, /assets\/images\/favicon-32x32\.png/);
  assert.match(agency, /assets\/images\/apple-touch-icon\.png/);
  assert.match(agency, /GDesign/);
  for (const color of ['#0E1726', '#F4F1EA', '#B89F7D', '#1E293B', '#FFFFFF']) {
    assert.ok(styles.includes(color), `Missing brand color ${color}`);
  }
  assert.match(styles, /--font-display:\s*"Cormorant Garamond"/);
  assert.match(de.nav.brand, /^GDesign$/);
  assert.match(en.nav.brand, /^GDesign$/);
});


test('GDesign header remains fully visible and navigation switches at the correct breakpoint', () => {
  assert.match(styles, /\.site-header\s*\{[^}]*height:\s*auto;[^}]*min-height:\s*5\.5rem/s);
  assert.match(styles, /\.brand-wordmark\s*\{[^}]*height:\s*auto;[^}]*object-fit:\s*contain/s);
  assert.match(styles, /\.primary-navigation\s*\{[^}]*display:\s*none;[^}]*background:\s*var\(--brand-midnight\)/s);
  assert.match(styles, /\.primary-navigation\.is-open\s*\{\s*display:\s*flex;/);
  assert.match(styles, /@media\s*\(min-width:\s*1024px\)[\s\S]*?\.primary-navigation\s*\{[^}]*display:\s*flex;/);
  assert.match(styles, /@media\s*\(max-width:\s*1023px\)/);
  assert.match(styles, /\.nav-link\s*\{[^}]*color:\s*var\(--brand-ivory\);[^}]*background:\s*transparent;/s);
});

test('GDesign dark surfaces use explicit light text and light surfaces use readable dark text', () => {
  assert.match(styles, /\.services-section\s*\{[^}]*background:\s*var\(--brand-midnight\);[^}]*color:\s*var\(--brand-ivory\)/s);
  assert.match(styles, /\.bento-card p\s*\{[^}]*color:\s*#E0E3E8/);
  assert.match(styles, /\.about-card p\s*\{[^}]*color:\s*#E0E3E8/);
  assert.match(styles, /\.step-content p\s*\{[^}]*color:\s*#4B5563/);
  assert.match(styles, /\.contact-form input, \.contact-form textarea\s*\{[^}]*color:\s*var\(--brand-midnight\)/s);
  assert.match(styles, /\.site-footer a, \.site-footer \.footer-links a\s*\{\s*color:\s*#F4F1EA/);
});
