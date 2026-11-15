const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const projects = fs.readFileSync(path.join(root, 'projekte.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'assets/css/style.css'), 'utf8');
const de = JSON.parse(fs.readFileSync(path.join(root, 'locales/de.json'), 'utf8'));
const en = JSON.parse(fs.readFileSync(path.join(root, 'locales/en.json'), 'utf8'));

test('Portfolio examples are clearly identified as concepts, not client references', () => {
  assert.match(projects, /Template-Konzepte/);
  assert.match(projects, /nicht um veröffentlichte Kundenprojekte/);
  assert.equal((projects.match(/class="case-study-card"/g) || []).length, 3);
  assert.equal((projects.match(/class="study-description"/g) || []).length, 3);
  assert.doesNotMatch(projects, /\+68%|\+42%|\+31%|Lighthouse Score|Performance Score|Anfragen\/Monat|Conversion Rate/);
});

test('Desktop preview header and mockup content adapt to narrow viewports', () => {
  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(css, /\.browser-header\s*\{[^}]*flex-wrap:\s*wrap/s);
  assert.match(css, /\.browser-address-bar\s*\{[^}]*min-width:\s*0/s);
  assert.match(css, /\.mockup-hero-stats\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/s);
});

test('German and English homepage positioning consistently describes reusable templates', () => {
  for (const locale of [de, en]) {
    assert.match(locale.hero.subtitle, /template/i);
    assert.match(locale.services.title, /template/i);
    assert.match(locale.about.description, /template/i);
    assert.match(locale.projekte.studies_lead, /concept|entwürfe|konzepte/i);
    for (let index = 1; index <= 3; index += 1) assert.match(locale.projekte[`study${index}_description`], /./);
  }
});
