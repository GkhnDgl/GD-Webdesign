const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const de = JSON.parse(fs.readFileSync(path.join(root, 'locales/de.json'), 'utf8'));
const en = JSON.parse(fs.readFileSync(path.join(root, 'locales/en.json'), 'utf8'));
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
});

test('both locales include the template content and accessibility copy', () => {
  for (const locale of [de, en]) {
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

test('boilerplate is generic and does not contain agency branding', () => {
  assert.doesNotMatch(template.replace(/<!--[\s\S]*?-->/g, ''), /GD Webdesign|Digitalagentur|Jamstack|SEO-Optimierung/i);
  assert.match(de.nav.brand, /Ihr Firmenname/);
  assert.match(en.nav.brand, /Your Business Name/);
});

test('template links to locale files and script updates document language', () => {
  assert.match(template, /assets\/js\/main\.js/);
  assert.match(script, /\.\.\/\.\.\/locales\/\${language}\.json/);
  assert.match(script, /document\.documentElement\.lang = language/);
  assert.match(script, /preferred_language/);
});

test('responsive styles include the xl breakpoint and reduced-motion support', () => {
  assert.match(styles, /@media \(min-width: 1280px\)/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
});
