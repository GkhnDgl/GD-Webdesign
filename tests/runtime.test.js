const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const de = JSON.parse(fs.readFileSync(path.join(root, 'locales/de.json'), 'utf8'));
const en = JSON.parse(fs.readFileSync(path.join(root, 'locales/en.json'), 'utf8'));
const boilerplateDe = JSON.parse(fs.readFileSync(path.join(root, 'templates/one-pager-boilerplate/locales/de.json'), 'utf8'));
const boilerplateEn = JSON.parse(fs.readFileSync(path.join(root, 'templates/one-pager-boilerplate/locales/en.json'), 'utf8'));
const boilerplateConfig = JSON.parse(fs.readFileSync(path.join(root, 'templates/one-pager-boilerplate/config.json'), 'utf8'));
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const boilerplateHtml = fs.readFileSync(path.join(root, 'templates/one-pager-boilerplate/index.html'), 'utf8');
const mainJs = fs.readFileSync(path.join(root, 'assets/js/main.js'), 'utf8');

function getTranslations() {
  const match = mainJs.match(/const translations = (\{[\s\S]*?\n  \});/);
  if (!match) throw new Error('Could not parse translations from main.js');
  return eval('(' + match[1] + ')');
}

function getValue(object, pathStr) {
  return pathStr.split('.').reduce((value, key) => value?.[key], object);
}

test('Homepage template previews do not trigger outer-page fragment scrolling', () => {
  const previewSources = [...indexHtml.matchAll(/<iframe\b[^>]*class="(?:desktop-preview-frame|phone-preview-frame)"[^>]*src="([^"]+)"/g)]
    .map((match) => match[1]);

  assert.equal(previewSources.length, 2, 'Expected desktop and mobile preview iframes');
  for (const source of previewSources) {
    assert.equal(source, 'templates/one-pager-boilerplate/index.html');
    assert.equal(new URL(source, 'https://gkhndgl.github.io/GD-Webdesign/').hash, '');
  }

  assert.match(indexHtml, /<section id="hero"/, 'Agency homepage must retain its own hero section');
});

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

test('Root locale files contain agency-specific content and no generic business placeholders', () => {
  const genericPlaceholders = [
    'Ihr Firmenname',
    'Your Business Name',
    'Gute Arbeit. Klare Lösungen. Für Sie.',
    'Quality Work. Clear Solutions. For You.',
    'Unsere Hauptleistung',
    'Our Main Service'
  ];

  const deStr = JSON.stringify(de);
  const enStr = JSON.stringify(en);

  for (const placeholder of genericPlaceholders) {
    assert.ok(!deStr.includes(placeholder), `de.json still contains generic placeholder: "${placeholder}"`);
    assert.ok(!enStr.includes(placeholder), `en.json still contains generic placeholder: "${placeholder}"`);
  }

  assert.equal(de.nav.brand, 'GDesign');
  assert.equal(en.nav.brand, 'GDesign');
  assert.match(de.hero.title, /Digitale Erlebnisse/);
  assert.match(en.hero.title, /Digital experiences/);
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

function checkSelectorMatchesHtml(selector, html, docName) {
  if (selector.startsWith('#') && selector.includes(' ')) {
    const [idPart, childPart] = selector.split(/\s+/);
    const id = idPart.replace('#', '');
    const tagMatch = html.match(new RegExp('<(section|article|div|header|main|footer)\\b[^>]*id=["\']' + id + '["\'][^>]*>[\\s\\S]*?<\\/\\1>'));
    assert.ok(tagMatch, `Container #${id} not found in ${docName}`);
    const containerHtml = tagMatch[0];
    if (childPart.startsWith('.')) {
      const cls = childPart.replace('.', '');
      assert.match(containerHtml, new RegExp(`class=["'][^"']*\\b${cls}\\b[^"']*["']`), `Selector "${selector}" failed in ${docName}`);
    } else {
      assert.match(containerHtml, new RegExp(`<${childPart}\\b`), `Selector "${selector}" failed in ${docName}`);
    }
  } else if (selector.startsWith('#')) {
    const id = selector.replace('#', '');
    assert.match(html, new RegExp(`id=["']${id}["']`), `Selector "${selector}" failed in ${docName}`);
  } else if (selector.startsWith('.')) {
    const cls = selector.replace('.', '').split(/\s+|>|:|\./)[0];
    assert.match(html, new RegExp(`class=["'][^"']*\\b${cls}\\b[^"']*["']`), `Selector "${selector}" failed in ${docName}`);
  } else if (selector.startsWith('label[')) {
    const forAttr = selector.match(/for="([^"]+)"/)[1];
    assert.match(html, new RegExp(`for=["']${forAttr}["']`), `Selector "${selector}" failed in ${docName}`);
  }
}

test('All translation map selectors match elements in both index.html and boilerplate index.html', () => {
  const translations = getTranslations();
  for (const [key, selectors] of Object.entries(translations)) {
    for (const selector of selectors) {
      checkSelectorMatchesHtml(selector, indexHtml, 'index.html');
      checkSelectorMatchesHtml(selector, boilerplateHtml, 'templates/one-pager-boilerplate/index.html');
    }
  }
});

test('DOM translation and accessibility updates function correctly during language switch', async () => {
  class MockElement {
    constructor(tagName, id = '', className = '', attrs = {}) {
      this.tagName = tagName.toUpperCase();
      this.id = id;
      this.className = className;
      this.attributes = { ...attrs };
      this.children = [];
      this.textContent = '';
      this.content = '';
      this.placeholder = '';
      this.href = '';
      this.listeners = {};
      this.classList = {
        add: (c) => { if (!this.className.includes(c)) this.className += ' ' + c; },
        remove: (c) => { this.className = this.className.replace(new RegExp('\\b' + c + '\\b', 'g'), '').trim(); },
        contains: (c) => this.className.split(' ').includes(c),
        toggle: (c, force) => {
          const has = this.className.includes(c);
          if (force === true || (force === undefined && !has)) this.classList.add(c);
          else if (force === false || (force === undefined && has)) this.classList.remove(c);
        }
      };
    }
    addEventListener(evt, fn) {
      if (!this.listeners[evt]) this.listeners[evt] = [];
      this.listeners[evt].push(fn);
    }
    click() {
      if (this.listeners['click']) {
        this.listeners['click'].forEach(fn => fn());
      }
    }
    setAttribute(k, v) { this.attributes[k] = String(v); }
    getAttribute(k) { return this.attributes[k] || null; }
    matches(sel) {
      if (sel === 'label') return this.tagName === 'LABEL';
      return false;
    }
    append(...nodes) {
      for (const n of nodes) {
        if (typeof n === 'string') this.textContent += n;
        else this.children.push(n);
      }
    }
    replaceChildren(...nodes) {
      this.children = [];
      this.textContent = '';
      this.append(...nodes);
    }
    querySelector(sel) { return null; }
    querySelectorAll(sel) { return []; }
  }

  const docElement = new MockElement('html');
  docElement.lang = 'de';
  docElement.style = { setProperty: () => {} };

  const menuBtn = new MockElement('button', '', 'mobile-menu-toggle', { 'aria-expanded': 'false', 'aria-label': 'Menü öffnen' });
  const nav = new MockElement('nav', 'primary-navigation', 'primary-navigation', { 'aria-label': 'Hauptnavigation' });
  const langBtn = new MockElement('button', 'language-toggle', 'language-toggle', { 'aria-label': 'Switch language to English', 'aria-pressed': 'false' });
  langBtn.textContent = 'EN';

  const heroTitle = new MockElement('h1', 'hero-title');
  const brandText = new MockElement('span', '', 'brand-text');
  const metricLabel1 = new MockElement('span', '', 'metric-label');
  const impressumTitle = new MockElement('h2', 'impressum-title');
  const impressumCopy = new MockElement('p', '', 'legal-copy');

  const datenschutzTitle = new MockElement('h2', 'datenschutz-title');
  const datenschutzCopy = new MockElement('p', '', 'legal-copy');

  const metaDesc = new MockElement('meta', '', '', { name: 'description', content: '' });
  const nameInput = new MockElement('input', 'name');
  const privacyNote = new MockElement('p', '', 'form-privacy-note');
  const brandEl = new MockElement('a', '', 'brand');

  const queryAll = (sel) => {
    if (sel === '#hero-title') return [heroTitle];
    if (sel === '.brand-text') return [brandText];
    if (sel === '#impressum h2') return [impressumTitle];
    if (sel === '#impressum .legal-copy') return [impressumCopy];
    if (sel === '#datenschutz h2') return [datenschutzTitle];
    if (sel === '#datenschutz .legal-copy') return [datenschutzCopy];
    if (sel === '.brand') return [brandEl];
    return [];
  };

  const listeners = {};
  const mockDoc = {
    documentElement: docElement,
    body: new MockElement('body', '', 'template-master-a'),
    baseURI: 'https://gkhndgl.github.io/GD-Webdesign/templates/one-pager-boilerplate/index.html',
    title: '',
    currentScript: { src: 'https://gkhndgl.github.io/GD-Webdesign/assets/js/main.js' },
    addEventListener: (evt, fn) => { listeners[evt] = fn; },
    querySelector: (sel) => {
      if (sel === '.mobile-menu-toggle') return menuBtn;
      if (sel === '.primary-navigation') return nav;
      if (sel === '#language-toggle') return langBtn;
      if (sel === 'meta[name="description"]') return metaDesc;
      if (sel === '#name') return nameInput;
      if (sel === '.form-privacy-note') return privacyNote;
      return queryAll(sel)[0] || null;
    },
    querySelectorAll: (sel) => {
      if (sel === '.metric-item:nth-child(1) .metric-label') return [metricLabel1];
      return queryAll(sel);
    },
    createTextNode: (txt) => txt,
    createElement: (tag) => new MockElement(tag)
  };

  const mockWindow = {
    addEventListener: () => {},
    innerWidth: 1024
  };

  const mockFetch = async (url) => {
    if (url.endsWith('config.json')) {
      return {
        ok: true,
        json: async () => boilerplateConfig
      };
    }
    assert.ok(url.includes('https://gkhndgl.github.io/GD-Webdesign/templates/one-pager-boilerplate/locales/'));
    const isEn = url.includes('en.json');
    const data = isEn ? en : de;
    return {
      ok: true,
      json: async () => data
    };
  };

  let storedLang = 'de';
  const mockStorage = {
    getItem: () => storedLang,
    setItem: (k, v) => { storedLang = v; }
  };

  const fn = new Function('document', 'window', 'fetch', 'localStorage', 'location', mainJs);
  // Execute top-level mainJs script execution
  fn(mockDoc, mockWindow, mockFetch, mockStorage, { href: 'https://gkhndgl.github.io/GD-Webdesign/' });

  // Simulate document.currentScript becoming null during DOMContentLoaded event dispatch per W3C HTML spec
  mockDoc.currentScript = null;

  assert.ok(listeners['DOMContentLoaded']);
  await listeners['DOMContentLoaded']();

  // Wait tick for initial setLanguage
  await new Promise(r => setTimeout(r, 10));

  // Initially German
  assert.equal(docElement.lang, 'de');
  assert.equal(brandText.textContent, boilerplateConfig.business.name);
  assert.equal(heroTitle.textContent, boilerplateConfig.content.hero.title.de);
  assert.equal(impressumTitle.textContent, de.legal.imprint_title);
  assert.equal(impressumCopy.textContent, boilerplateConfig.legal.imprintDetails.de);
  assert.equal(datenschutzTitle.textContent, de.legal.privacy_title);
  assert.equal(datenschutzCopy.textContent, boilerplateConfig.legal.privacyDetails.de);
  assert.equal(langBtn.textContent, 'EN');
  assert.equal(langBtn.getAttribute('aria-pressed'), 'false');
  assert.equal(langBtn.getAttribute('aria-label'), de.accessibility.switch_to_english);

  // Simulate menu toggle expand to test accessibility label handling
  menuBtn.setAttribute('aria-expanded', 'true');
  menuBtn.setAttribute('aria-label', de.accessibility.close_menu);

  // Switch language to EN
  langBtn.click();
  for (let i = 0; i < 50; i++) {
    if (docElement.lang === 'en') break;
    await new Promise(r => setTimeout(r, 10));
  }

  assert.equal(docElement.lang, 'en');
  assert.equal(brandText.textContent, boilerplateConfig.business.name);
  assert.equal(heroTitle.textContent, boilerplateConfig.content.hero.title.en);
  assert.equal(metricLabel1.textContent, 'Adapted to your brand');
  assert.equal(impressumTitle.textContent, en.legal.imprint_title);
  assert.equal(impressumCopy.textContent, boilerplateConfig.legal.imprintDetails.en);
  assert.ok(impressumCopy.textContent.includes(boilerplateConfig.business.legalName));
  assert.equal(datenschutzTitle.textContent, en.legal.privacy_title);
  assert.equal(datenschutzCopy.textContent, boilerplateConfig.legal.privacyDetails.en);
  assert.ok(datenschutzCopy.textContent.includes(boilerplateConfig.business.legalName));
  assert.equal(langBtn.textContent, 'DE');
  assert.equal(langBtn.getAttribute('aria-pressed'), 'true');
  assert.equal(langBtn.getAttribute('aria-label'), en.accessibility.switch_to_german);
  assert.equal(menuBtn.getAttribute('aria-label'), en.accessibility.close_menu);
  assert.equal(storedLang, 'en');
});


test('Missing, malformed, and schema-invalid template config show a localized error and hide sample content', async () => {
  const vm = require('node:vm');
  const cases = [
    { name: 'missing config', configResponse: { ok: false, status: 404 } },
    { name: 'malformed JSON', configResponse: { ok: true, json: async () => { throw new SyntaxError('Unexpected token'); } } },
    { name: 'schema-invalid config', configResponse: { ok: true, json: async () => ({ business: {} }) } }
  ];

  for (const scenario of cases) {
    const classes = new Set(['template-master-a']);
    const errorClasses = new Set(['hidden']);
    const bodyClassList = {
      contains: (name) => classes.has(name),
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name)
    };
    const errorClassList = {
      add: (name) => errorClasses.add(name),
      remove: (name) => errorClasses.delete(name),
      contains: (name) => errorClasses.has(name)
    };
    const configError = { textContent: '', classList: errorClassList };
    const runtimeErrors = [];
    const docElement = { lang: 'de', style: { setProperty() {} } };
    const listeners = {};
    const mockDocument = {
      baseURI: 'https://example.test/GD-Webdesign/templates/one-pager-boilerplate/',
      documentElement: docElement,
      body: { classList: bodyClassList },
      title: '',
      addEventListener: (name, callback) => { listeners[name] = callback; },
      querySelector: (selector) => {
        if (selector === '#config-error') return configError;
        return null;
      },
      querySelectorAll: () => [],
      createTextNode: (value) => value,
      createElement: () => ({})
    };
    const mockFetch = async (url) => {
      if (url.endsWith('/config.json')) return scenario.configResponse;
      if (url.endsWith('/locales/de.json')) return { ok: true, json: async () => boilerplateDe };
      if (url.endsWith('/locales/en.json')) return { ok: true, json: async () => boilerplateEn };
      throw new Error('Unexpected request: ' + url);
    };
    const context = {
      document: mockDocument,
      window: { addEventListener() {}, innerWidth: 1280 },
      fetch: mockFetch,
      localStorage: { getItem: () => 'de', setItem() {} },
      console: { warn() {}, error(...args) { runtimeErrors.push(args.map(String).join(' ')); } },
      URL,
      Promise,
      Set
    };

    vm.runInNewContext(mainJs, context);
    await listeners.DOMContentLoaded();
    for (let attempt = 0; attempt < 20 && !configError.textContent; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 5));
    }

    if (!configError.textContent) assert.fail(`${scenario.name}: config error was not rendered. Runtime errors: ${runtimeErrors.join(' | ')}`);
    assert.equal(bodyClassList.contains('config-invalid'), true, scenario.name);
    assert.equal(errorClassList.contains('hidden'), false, scenario.name);
    assert.equal(configError.textContent, boilerplateDe.config.error, scenario.name);
    const templateStyles = fs.readFileSync(path.join(root, 'templates/one-pager-boilerplate/style.css'), 'utf8');
    assert.ok(templateStyles.includes('.config-invalid .site-header'), scenario.name);
    assert.ok(templateStyles.includes('.config-invalid main'), scenario.name);
  }
});

test('Multi-page architecture: all 7 agency pages exist with shared assets, relative links, and strict CSP compliance', () => {
  const pages = [
    'index.html',
    'leistungen.html',
    'projekte.html',
    'ueber-uns.html',
    'kontakt.html',
    'impressum.html',
    'datenschutz.html'
  ];

  for (const pageName of pages) {
    const filePath = path.join(root, pageName);
    assert.ok(fs.existsSync(filePath), `Page file missing: ${pageName}`);
    const content = fs.readFileSync(filePath, 'utf8');

    // Shared CSS & JS assets
    assert.match(content, /assets\/css\/tailwind\.generated\.css/, `${pageName} must link tailwind.generated.css`);
    assert.match(content, /assets\/css\/style\.css/, `${pageName} must link style.css`);
    assert.match(content, /assets\/js\/main\.js/, `${pageName} must link main.js`);

    // Strict CSP compliance: no inline styles, no inline script tags
    assert.doesNotMatch(content, /\sstyle\s*=/i, `${pageName} contains inline style attribute violating CSP`);
    assert.doesNotMatch(content, /<script(?![^>]*src=)[^>]*>[\s\S]*?<\/script>/i, `${pageName} contains inline script block violating CSP`);

    // All internal navigation links must use relative paths without leading slash
    const hrefMatches = [...content.matchAll(/href=["']([^"']+)["']/g)].map(m => m[1]);
    for (const href of hrefMatches) {
      if (!href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('#')) {
        assert.ok(!href.startsWith('/'), `Absolute path with leading slash found in ${pageName}: "${href}". Use relative paths.`);
      }
    }

    // Every agency page has language toggle button
    assert.match(content, /id=["']language-toggle["']/, `${pageName} must have language toggle button`);
  }

  // Kontakt page Netlify form checks
  const kontaktHtml = fs.readFileSync(path.join(root, 'kontakt.html'), 'utf8');
  assert.match(kontaktHtml, /data-netlify="true"/);
  assert.match(kontaktHtml, /netlify-honeypot="bot-field"/);
  assert.match(kontaktHtml, /<p class="hidden-field hidden">[\s\S]*name="bot-field"/);
});


test('Homepage About CTA is translated when switching between German and English', () => {
  assert.equal(typeof de.about?.cta_link, 'string', 'Missing German homepage About CTA translation');
  assert.equal(typeof en.about?.cta_link, 'string', 'Missing English homepage About CTA translation');
  assert.notEqual(de.about.cta_link, en.about.cta_link, 'Homepage About CTA must differ by locale');
  assert.ok(indexHtml.includes('class="btn btn-secondary">Mehr über GDesign erfahren</a>'));
  assert.match(mainJs, /\.section-cta-row-left \.btn-secondary/);
  assert.match(mainJs, /locale\.about\.cta_link/);
});


test('Master Template A renders configured customer content and typed CTAs in both languages', () => {
  const match = mainJs.match(/function applyConfig\(config, language = 'de', locale = null\) \{[\s\S]*?\n  \}\n\n  async function loadLocale/);
  assert.ok(match, 'Configured rendering function must remain testable');
  const applyConfigSource = match[0].replace(/\n\n  async function loadLocale[\s\S]*$/, '');
  const applyConfig = new Function('document', 'pageBaseUrl', 'resolveLocalizedValue', 'URL', 'return (' + applyConfigSource + ')')(
    null,
    'https://example.github.io/GD-Webdesign/templates/one-pager-boilerplate/index.html',
    (value, language) => typeof value === 'object' && value !== null ? value[language] : value,
    URL
  );

  class Element {
    constructor(tag = 'div', className = '') {
      this.tagName = tag.toUpperCase();
      this.className = className;
      this.textContent = '';
      this.children = [];
      this.attributes = {};
      this.style = { setProperty: () => {} };
      this.classList = {
        add: (name) => { if (!this.className.split(/\s+/).includes(name)) this.className = (this.className + ' ' + name).trim(); },
        remove: (...names) => { this.className = this.className.split(/\s+/).filter((name) => !names.includes(name)).join(' '); }
      };
    }
    append(...children) { this.children.push(...children); }
    replaceChildren(...children) { this.children = [...children]; this.textContent = ''; }
    setAttribute(name, value) { this.attributes[name] = String(value); }
    removeAttribute(name) { delete this.attributes[name]; }
    querySelector() { return null; }
  }

  const nodes = new Map();
  const getNode = (selector) => {
    if (!nodes.has(selector)) nodes.set(selector, new Element());
    return nodes.get(selector);
  };
  const ctas = Object.fromEntries(['nav-primary', 'hero-primary', 'hero-secondary'].map((placement) => [placement, new Element('a')]));
  const document = {
    title: '',
    documentElement: new Element('html'),
    querySelector(selector) {
      if (selector.startsWith('[data-cta-placement=')) {
        const placement = selector.match(/"([^"]+)"/)?.[1];
        return ctas[placement] || null;
      }
      return getNode(selector);
    },
    querySelectorAll(selector) {
      if (selector === '.brand-text') return [getNode('.brand-text')];
      if (selector === '.brand-logo') return [getNode('.brand-logo')];
      if (selector.startsWith('[data-cta-placement=')) {
        const placement = selector.match(/"([^"]+)"/)?.[1];
        return ctas[placement] ? [ctas[placement]] : [];
      }
      return [];
    },
    createElement(tag) { return new Element(tag); }
  };
  document.documentElement.style.setProperty = (key, value) => { document.documentElement.style[key] = value; };

  const config = structuredClone(boilerplateConfig);
  config.branding.logo = {
    image: '../../assets/images/customer-logo.svg',
    alt: { de: 'Kundenlogo', en: 'Customer logo' }
  };
  config.ctas[0] = { ...config.ctas[0], type: 'url', value: 'https://example.com/contact' };

  applyConfig(config, 'de', { footer: { rights: '© {businessName}' } });
  assert.equal(getNode('#hero-title').textContent, config.content.hero.title.de);
  assert.equal(getNode('#services .bento-grid').children.length, config.content.services.items.length);
  assert.equal(getNode('#process .process-grid').children.length, config.content.process.steps.length);
  assert.equal(getNode('#about .about-features').children.length, config.content.about.features.length);
  assert.equal(getNode('#gallery .gallery-grid').children.length, config.content.gallery.items.length);
  assert.equal(getNode('#gallery .gallery-grid').children[0].children[0].children[0].alt, config.content.gallery.items[0].alt.de);
  assert.equal(getNode('.contact-phone').href, 'tel:' + config.business.phone.replace(/[^+\\d]/g, ''));
  assert.equal(getNode('.contact-email').href, 'mailto:' + config.business.email);
  assert.equal(ctas['nav-primary'].href, 'https://example.com/contact');
  assert.equal(ctas['nav-primary'].target, '_blank');
  assert.equal(ctas['nav-primary'].rel, 'noopener noreferrer');
  assert.equal(document.title, config.seo.title.de);
  assert.equal(getNode('meta[name="description"]').content, config.seo.description.de);
  assert.equal(getNode('.brand-logo').children[0].alt, 'Kundenlogo');

  applyConfig(config, 'en', { footer: { rights: '© {businessName}' } });
  assert.equal(getNode('#hero-title').textContent, config.content.hero.title.en);
  assert.equal(getNode('#services .bento-grid').children[0].children[0].textContent, config.content.services.items[0].title.en);
  assert.equal(getNode('#gallery .gallery-grid').children[0].children[1].children[0].textContent, config.content.gallery.items[0].title.en);
  assert.equal(getNode('#impressum .legal-copy').textContent, config.legal.imprintDetails.en);
  assert.equal(getNode('#datenschutz .legal-copy').textContent, config.legal.privacyDetails.en);
  assert.equal(getNode('.brand-logo').children[0].alt, 'Customer logo');
  assert.equal(document.title, config.seo.title.en);
});
