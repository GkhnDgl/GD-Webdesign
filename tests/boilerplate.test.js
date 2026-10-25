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
const script = fs.readFileSync(path.join(root, 'assets/js/main.js'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'assets/css/style.css'), 'utf8');

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

test('locally hosted woff2 font file and font-face declarations exist', () => {
  assert.ok(fs.existsSync(path.join(root, 'assets/fonts/PlusJakartaSans-Variable.woff2')), 'woff2 font file missing in assets/fonts/');
  assert.ok(fs.existsSync(path.join(root, 'assets/fonts/LICENSE.txt')), 'Font license file missing in assets/fonts/');
  assert.match(styles, /@font-face\s*\{[^}]*PlusJakartaSans-Variable\.woff2/);
});

test('template links to locale files and script updates document language', () => {
  assert.match(template, /assets\/js\/main\.js/);
  assert.match(script, /new URL\(\`locales\/\$\{language\}\.json\`, document\.baseURI\)/);
  assert.equal(new URL('locales/de.json', 'https://example.test/').pathname, '/locales/de.json');
  assert.equal(new URL('locales/en.json', 'https://example.test/templates/one-pager-boilerplate/').pathname, '/templates/one-pager-boilerplate/locales/en.json');
  assert.notEqual(de.meta.title, boilerplateDe.meta.title, 'Root and template locale content must remain separate');
  assert.match(script, /document\.documentElement\.lang = language/);
  assert.match(script, /preferred_language/);
});

test('responsive styles include the xl breakpoint and reduced-motion support', () => {
  assert.match(styles, /@media \(min-width: 1280px\)/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
});
