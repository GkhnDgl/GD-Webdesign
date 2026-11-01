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

test('locally hosted woff2 font file and font-face declarations exist', () => {
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

test('master template design tokens do not leak into the agency stylesheet', () => {
  assert.match(styles, /--color-primary:\s*#4f46e5/);
  assert.doesNotMatch(styles, /PlusJakartaSans-Variable\.woff2|--color-primary:\s*#047857/);
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

test('responsive styles include the xl breakpoint and reduced-motion support', () => {
  assert.match(styles, /@media \(min-width: 1280px\)/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
});

test('privacy link styling is decoupled from shared localization JavaScript', () => {
  assert.doesNotMatch(script, /emerald/i, 'shared JavaScript should not contain hardcoded emerald brand colors');
  assert.match(script, /privacyLink\.className = 'form-privacy-link';/);
  assert.match(styles, /\.form-privacy-link\s*\{[^}]*color:\s*var\(--color-primary\)/);
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
  assert.match(config.business.phone, /^[+0-9][0-9\\s()./-]{5,24}$/);
  assert.match(config.business.email, /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/);
  assert.match(config.branding.primaryColor, /^#[0-9a-f]{6}$/i);
  assert.match(config.branding.primaryHoverColor, /^#[0-9a-f]{6}$/i);
  assert.ok(config.gallery.every((item) => item.image.startsWith('../../assets/images/') && item.alt.trim()));
  for (const key of ['imprintDetails', 'privacyDetails']) {
    assert.equal(typeof config.legal[key].de, 'string');
    assert.equal(typeof config.legal[key].en, 'string');
  }
});

test('template configuration is scoped to the template and contact values have render targets', () => {
  assert.match(script, /document\\.body\\.classList\\.contains\\('template-master-a'\\)/);
  assert.match(script, /if \\(!isTemplatePage\\) return null/);
  assert.match(script, /function validateConfig\\(config\\)/);
  assert.match(script, /configError\\.textContent = locale\\.config\\.error/);
  assert.match(template, /id="config-error"[^>]*role="alert"/);
  assert.match(template, /class="contact-phone hidden/);
  assert.match(template, /class="contact-email hidden/);
  assert.match(template, /class="contact-address hidden/);
});

test('template locales include matching configuration error messages', () => {
  assert.equal(typeof boilerplateDe.config.error, 'string');
  assert.equal(typeof boilerplateEn.config.error, 'string');
});
