const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const publicFiles = [
  'index.html', 'leistungen.html', 'ueber-uns.html', 'projekte.html',
  'impressum.html', 'datenschutz.html', 'kontakt.html',
  'locales/de.json', 'locales/en.json',
  'templates/one-pager-boilerplate/index.html',
  'templates/one-pager-boilerplate/locales/de.json',
  'templates/one-pager-boilerplate/locales/en.json',
  'templates/one-pager-boilerplate/README.md'
];
const unsupportedClaims = [
  /100\s*\/\s*100/i,
  /100\s*%\s*(?:performance|termintreu|on[- ]time)/i,
  /(?:unter|under|<)\s*40\s*ms/i,
  /lighthouse[^\n]{0,60}(?:95\+|100|guarantee|garantiert)/i,
  /(?:wcag\s*2\.1\s*aa|bitv)[^\n]{0,80}(?:konform|compliant|zertifiz|certif|barrierefrei)/i,
  /(?:dsgvo|gdpr)[- ](?:konform|compliant)/i,
  /99[,.]?99\s*%\s*(?:verfügbarkeit|uptime)/i,
  /(?:within|innerhalb)\s+(?:von\s+)?24\s*(?:hours?|stunden|h)\b/i,
  /(?:qualified|qualifiziert)[^\n]{0,30}(?:certified|zertifiziert)/i,
  /(?:garantieren|guarantee)[^\n]{0,100}(?:qualität|quality|performance|arbeit|work|konform|compliant)/i
];

test('Public website and template copy contains no unsupported absolute quality claims', () => {
  for (const file of publicFiles) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    for (const pattern of unsupportedClaims) {
      assert.doesNotMatch(source, pattern, `${file} contains an unsupported claim matching ${pattern}`);
    }
  }
});

test('German and English agency and template locales remain valid and structurally aligned', () => {
  const pairs = [
    ['locales/de.json', 'locales/en.json'],
    ['templates/one-pager-boilerplate/locales/de.json', 'templates/one-pager-boilerplate/locales/en.json']
  ];
  const shape = (value) => Array.isArray(value) ? value.map(shape)
    : value && typeof value === 'object'
      ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, shape(value[key])]))
      : typeof value;
  for (const [dePath, enPath] of pairs) {
    const de = JSON.parse(fs.readFileSync(path.join(root, dePath), 'utf8'));
    const en = JSON.parse(fs.readFileSync(path.join(root, enPath), 'utf8'));
    assert.deepEqual(shape(de), shape(en), `${dePath} and ${enPath} must keep matching keys`);
  }
});

test('Template demo content is identified as an example rather than a verified customer promise', () => {
  const de = JSON.parse(fs.readFileSync(path.join(root, 'templates/one-pager-boilerplate/locales/de.json'), 'utf8'));
  const en = JSON.parse(fs.readFileSync(path.join(root, 'templates/one-pager-boilerplate/locales/en.json'), 'utf8'));
  assert.match(de.hero.badge, /Beispielbetrieb/i);
  assert.match(en.hero.badge, /Example business/i);
  assert.match(de.meta.description, /Beispielhafte Website-Vorlage/i);
  assert.match(en.meta.description, /Example website template/i);
});
