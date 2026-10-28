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

test('boilerplate config.json exists with required business, branding, gallery, and legal schema', () => {
  const configPath = path.join(root, 'templates/one-pager-boilerplate/config.json');
  assert.ok(fs.existsSync(configPath), 'templates/one-pager-boilerplate/config.json must exist');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  assert.ok(config.business && typeof config.business.name === 'string');
  assert.ok(config.business.phone && config.business.email && config.business.address);
  assert.ok(config.branding && typeof config.branding.primaryColor === 'string');
  assert.ok(Array.isArray(config.gallery) && config.gallery.length > 0);
  assert.ok(config.legal && config.legal.imprintDetails && config.legal.privacyDetails);

  // Ensure no unmasked sensitive credentials or private tokens are present
  const jsonStr = JSON.stringify(config);
  assert.doesNotMatch(jsonStr, /api[-_]?key|secret|token|password/i);
});

test('main.js resolves config.json relative to page base URL and handles errors gracefully', () => {
  assert.match(script, /new URL\('config\.json', pageBaseUrl\)/);
  assert.match(script, /applyConfig/);
});

test('mobile header grows with wrapped business names and anchors the menu to its actual height', () => {
  assert.match(templateStyles, /\.site-header\s*\{[^}]*min-height:\s*var\(--header-height\);[^}]*height:\s*auto;/s);
  assert.match(templateStyles, /\.brand\s*\{[^}]*flex:\s*1 1 0;[^}]*min-width:\s*0;/s);
  assert.match(templateStyles, /\.brand-text\s*\{[^}]*overflow-wrap:\s*normal;[^}]*word-break:\s*normal;/s);
  assert.match(templateStyles, /\.primary-navigation\s*\{[^}]*top:\s*100%;/s);
  assert.match(templateStyles, /@media \(min-width: 1280px\)\s*\{[^}]*\.brand\s*\{\s*flex:\s*0 1 18rem;/s);
  assert.match(templateStyles, /@media \(min-width: 1280px\)\s*\{[^}]*\.mobile-menu-toggle\s*\{\s*display:\s*none;/s);
  assert.doesNotMatch(templateStyles, /@media \(min-width: 640px\)\s*\{[^}]*\.mobile-menu-toggle\s*\{\s*display:\s*none;/s);
});
