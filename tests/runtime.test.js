const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const de = JSON.parse(fs.readFileSync(path.join(root, 'locales/de.json'), 'utf8'));
const en = JSON.parse(fs.readFileSync(path.join(root, 'locales/en.json'), 'utf8'));
const mainJs = fs.readFileSync(path.join(root, 'assets/js/main.js'), 'utf8');

function getTranslations() {
  const match = mainJs.match(/const translations = (\{[\s\S]*?\n  \});/);
  if (!match) throw new Error('Could not parse translations from main.js');
  return eval('(' + match[1] + ')');
}

function getValue(object, pathStr) {
  return pathStr.split('.').reduce((value, key) => value?.[key], object);
}

test('Locale URL path resolution works for GitHub Pages subpath and Netlify root', () => {
  const testCases = [
    {
      scriptUrl: 'https://gkhndgl.github.io/GD-Webdesign/assets/js/main.js',
      expectedDe: 'https://gkhndgl.github.io/GD-Webdesign/locales/de.json',
      expectedEn: 'https://gkhndgl.github.io/GD-Webdesign/locales/en.json'
    },
    {
      scriptUrl: 'https://agency.netlify.app/assets/js/main.js',
      expectedDe: 'https://agency.netlify.app/locales/de.json',
      expectedEn: 'https://agency.netlify.app/locales/en.json'
    },
    {
      scriptUrl: 'http://localhost:8000/assets/js/main.js',
      expectedDe: 'http://localhost:8000/locales/de.json',
      expectedEn: 'http://localhost:8000/locales/en.json'
    },
    {
      scriptUrl: 'http://localhost:8000/templates/one-pager-boilerplate/../../assets/js/main.js',
      expectedDe: 'http://localhost:8000/locales/de.json',
      expectedEn: 'http://localhost:8000/locales/en.json'
    }
  ];

  for (const { scriptUrl, expectedDe, expectedEn } of testCases) {
    const resolvedDe = new URL(`../../locales/de.json`, scriptUrl).href;
    const resolvedEn = new URL(`../../locales/en.json`, scriptUrl).href;
    assert.equal(resolvedDe, expectedDe);
    assert.equal(resolvedEn, expectedEn);
  }
});

test('Every translation map key exists in both locales with string values', () => {
  const translations = getTranslations();
  for (const key of Object.keys(translations)) {
    const valDe = getValue(de, key);
    const valEn = getValue(en, key);
    assert.equal(typeof valDe, 'string', `Missing or non-string key in de.json: ${key}`);
    assert.equal(typeof valEn, 'string', `Missing or non-string key in en.json: ${key}`);
  }
});

test('Contact form placeholders exist in both locales', () => {
  for (const locale of [de, en]) {
    assert.ok(locale.contact && locale.contact.placeholders, 'Missing contact placeholders object');
    for (const field of ['name', 'email', 'subject', 'message']) {
      assert.equal(typeof locale.contact.placeholders[field], 'string', `Missing placeholder: ${field}`);
    }
    assert.equal(typeof locale.contact.privacy_prefix, 'string');
    assert.equal(typeof locale.contact.privacy_link, 'string');
  }
});
