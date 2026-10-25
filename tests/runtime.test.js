const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const de = JSON.parse(fs.readFileSync(path.join(root, 'locales/de.json'), 'utf8'));
const en = JSON.parse(fs.readFileSync(path.join(root, 'locales/en.json'), 'utf8'));
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

function checkSelectorMatchesHtml(selector, html, docName) {
  const tokens = [...selector.matchAll(/[^\s>]+|>/g)];
  const compounds = tokens.filter((token) => token[0] !== '>').map((token) => token[0]);
  const combinators = [];
  for (let i = 1; i < tokens.length; i++) {
    if (tokens[i][0] === '>') combinators.push('>');
    else if (tokens[i - 1][0] !== '>') combinators.push(' ');
  }
  assert.ok(compounds.length > 0, \`Empty selector in \${docName}: \${selector}\`);

  const roots = [];
  const stack = [];
  const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  const markup = /<!--[\s\S]*?-->|<![^>]*>|<\/?([a-z][a-z0-9:-]*)\b([^>]*)>/gi;
  let match;
  while ((match = markup.exec(html))) {
    const token = match[0];
    if (token.startsWith('<!--') || token.startsWith('<!')) continue;
    const tag = match[1].toLowerCase();
    if (token.startsWith('</')) {
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].tag === tag) { stack.length = i; break; }
      }
      continue;
    }
    const attrs = {};
    for (const attr of match[2].matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
      attrs[attr[1].toLowerCase()] = attr[2] ?? attr[3] ?? attr[4] ?? '';
    }
    const node = { tag, attrs, parent: stack.at(-1) ?? null, children: [] };
    if (node.parent) node.parent.children.push(node);
    else roots.push(node);
    if (!voidTags.has(tag) && !/\/\s*>$/.test(token)) stack.push(node);
  }

  const matchesCompound = (node, compound) => {
    const tag = compound.match(/^[a-z][\w-]*/i)?.[0];
    if (tag && node.tag !== tag.toLowerCase()) return false;
    const id = compound.match(/#([\w-]+)/)?.[1];
    if (id && node.attrs.id !== id) return false;
    const classes = [...compound.matchAll(/\.([\w-]+)/g)].map((part) => part[1]);
    const nodeClasses = (node.attrs.class || '').split(/\s+/).filter(Boolean);
    if (classes.some((name) => !nodeClasses.includes(name))) return false;
    const nth = compound.match(/:nth-child\((\d+)\)/)?.[1];
    const index = (node.parent?.children ?? roots).indexOf(node) + 1;
    if (nth && index !== Number(nth)) return false;
    if (compound.includes(':first-child') && index !== 1) return false;
    for (const attr of compound.matchAll(/\[([\w:-]+)(?:=["']([^"']*)["'])?\]/g)) {
      if (!(attr[1] in node.attrs)) return false;
      if (attr[2] !== undefined && node.attrs[attr[1]] !== attr[2]) return false;
    }
    return true;
  };

  const allNodes = [];
  const collect = (node) => { allNodes.push(node); node.children.forEach(collect); };
  roots.forEach(collect);
  const found = allNodes.some((node) => {
    let current = node;
    let index = compounds.length - 1;
    if (!matchesCompound(current, compounds[index])) return false;
    while (index > 0) {
      const combinator = combinators[index - 1] ?? ' ';
      index--;
      if (combinator === '>') {
        current = current.parent;
        if (!current || !matchesCompound(current, compounds[index])) return false;
      } else {
        let ancestor = current.parent;
        while (ancestor && !matchesCompound(ancestor, compounds[index])) ancestor = ancestor.parent;
        if (!ancestor) return false;
        current = ancestor;
      }
    }
    return true;
  });
  assert.ok(found, \`Selector "\${selector}" did not match a complete element chain in \${docName}\`);
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

  const menuBtn = new MockElement('button', '', 'mobile-menu-toggle', { 'aria-expanded': 'false', 'aria-label': 'Menü öffnen' });
  const nav = new MockElement('nav', 'primary-navigation', 'primary-navigation', { 'aria-label': 'Hauptnavigation' });
  const langBtn = new MockElement('button', 'language-toggle', 'language-toggle', { 'aria-label': 'Switch language to English', 'aria-pressed': 'false' });
  langBtn.textContent = 'EN';

  const impressumTitle = new MockElement('h2', 'impressum-title');
  const impressumCopy = new MockElement('p', '', 'legal-copy');

  const datenschutzTitle = new MockElement('h2', 'datenschutz-title');
  const datenschutzCopy = new MockElement('p', '', 'legal-copy');

  const metaDesc = new MockElement('meta', '', '', { name: 'description', content: '' });
  const nameInput = new MockElement('input', 'name');
  const privacyNote = new MockElement('p', '', 'form-privacy-note');
  const brandEl = new MockElement('a', '', 'brand');

  const queryAll = (sel) => {
    if (sel === '#impressum h2') return [impressumTitle];
    if (sel === '#impressum .legal-copy') return [impressumCopy];
    if (sel === '#datenschutz h2') return [datenschutzTitle];
    if (sel === '#datenschutz .legal-copy') return [datenschutzCopy];
    if (sel === '.brand') return [brandEl];
    return [];
  };

  const listeners = {};
  const navLink = new MockElement('a');
  nav.querySelectorAll = (selector) => selector === 'a' ? [navLink] : [];
  const windowListeners = {};
  const mockDoc = {
    documentElement: docElement,
    body: new MockElement('body'),
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
    querySelectorAll: (sel) => sel === 'a' ? [navLink] : queryAll(sel),
    createTextNode: (txt) => txt,
    createElement: (tag) => new MockElement(tag)
  };

  const mockWindow = {
    addEventListener: (evt, fn) => { windowListeners[evt] = fn; },
    innerWidth: 1024
  };

  const mockFetch = async (url) => {
    assert.match(url, /https:\/\/gkhndgl\.github\.io\/GD-Webdesign\/locales\/(de|en)\.json/);
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
  assert.equal(impressumTitle.textContent, de.legal.imprint_title);
  assert.equal(impressumCopy.textContent, de.legal.imprint_text);
  assert.equal(datenschutzTitle.textContent, de.legal.privacy_title);
  assert.equal(datenschutzCopy.textContent, de.legal.privacy_text);
  assert.equal(langBtn.textContent, 'EN');
  assert.equal(langBtn.getAttribute('aria-pressed'), 'false');
  assert.equal(langBtn.getAttribute('aria-label'), de.accessibility.switch_to_english);

  // Exercise menu event handlers: open, Escape close, link close, and desktop resize.
  menuBtn.click();
  await new Promise(r => setTimeout(r, 0));
  assert.equal(menuBtn.getAttribute('aria-expanded'), 'true');
  assert.ok(nav.className.split(/\s+/).includes('is-open'));
  assert.ok(mockDoc.body.className.split(/\s+/).includes('menu-open'));
  assert.equal(menuBtn.getAttribute('aria-label'), de.accessibility.close_menu);

  listeners.keydown({ key: 'Escape' });
  await new Promise(r => setTimeout(r, 0));
  assert.equal(menuBtn.getAttribute('aria-expanded'), 'false');
  assert.ok(!nav.className.split(/\s+/).includes('is-open'));
  assert.ok(!mockDoc.body.className.split(/\s+/).includes('menu-open'));

  menuBtn.click();
  await new Promise(r => setTimeout(r, 0));
  navLink.click();
  await new Promise(r => setTimeout(r, 0));
  assert.equal(menuBtn.getAttribute('aria-expanded'), 'false');

  menuBtn.click();
  await new Promise(r => setTimeout(r, 0));
  windowListeners.resize();
  await new Promise(r => setTimeout(r, 0));
  assert.equal(menuBtn.getAttribute('aria-expanded'), 'false');

  // Switch language to EN
  langBtn.click();
  for (let i = 0; i < 50; i++) {
    if (docElement.lang === 'en') break;
    await new Promise(r => setTimeout(r, 10));
  }

  assert.equal(docElement.lang, 'en');
  assert.equal(impressumTitle.textContent, en.legal.imprint_title);
  assert.equal(impressumCopy.textContent, en.legal.imprint_text);
  assert.equal(datenschutzTitle.textContent, en.legal.privacy_title);
  assert.equal(datenschutzCopy.textContent, en.legal.privacy_text);
  assert.equal(langBtn.textContent, 'DE');
  assert.equal(langBtn.getAttribute('aria-pressed'), 'true');
  assert.equal(langBtn.getAttribute('aria-label'), en.accessibility.switch_to_german);
  assert.equal(menuBtn.getAttribute('aria-label'), en.accessibility.open_menu);
  assert.equal(storedLang, 'en');
});
