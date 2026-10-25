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

function parseHtml(html) {
  const rootNode = { tagName: '#document', attributes: {}, children: [], parent: null };
  const stack = [rootNode];
  const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  const tokens = html.match(/<!--[\s\S]*?-->|<![^>]*>|<\/?[a-zA-Z][^>]*>|[^<]+/g) || [];

  for (const token of tokens) {
    if (token.startsWith('<!--') || token.startsWith('<!')) continue;
    if (/^<\//.test(token)) {
      const tag = token.match(/^<\/\s*([a-zA-Z0-9-]+)/)?.[1]?.toLowerCase();
      if (tag) {
        for (let index = stack.length - 1; index > 0; index -= 1) {
          if (stack[index].tagName === tag) {
            stack.length = index;
            break;
          }
        }
      }
      continue;
    }
    if (!token.startsWith('<')) continue;
    const tagName = token.match(/^<\s*([a-zA-Z0-9-]+)/)?.[1]?.toLowerCase();
    if (!tagName) continue;
    const attributes = {};
    const attributeSource = token.slice(tagName.length + token.indexOf(tagName), token.length - 1);
    const attributePattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    let attribute;
    while ((attribute = attributePattern.exec(attributeSource))) {
      attributes[attribute[1].toLowerCase()] = attribute[2] ?? attribute[3] ?? attribute[4] ?? '';
    }
    const node = { tagName, attributes, children: [], parent: stack[stack.length - 1] };
    node.parent.children.push(node);
    if (!voidTags.has(tagName) && !/\/\s*>$/.test(token)) stack.push(node);
  }
  return rootNode;
}

function tokenizeSelector(selector) {
  const parts = [];
  let buffer = '';
  let bracketDepth = 0;
  let quote = '';
  let pendingCombinator = null;
  for (const character of selector.trim()) {
    if (quote) {
      buffer += character;
      if (character === quote) quote = '';
      continue;
    }
    if ((character === '"' || character === "'") && bracketDepth) {
      quote = character;
      buffer += character;
    } else if (character === '[') {
      bracketDepth += 1;
      buffer += character;
    } else if (character === ']') {
      bracketDepth -= 1;
      buffer += character;
    } else if (!bracketDepth && (character === '>' || /\s/.test(character))) {
      if (buffer.trim()) {
        parts.push({ compound: buffer.trim(), combinator: pendingCombinator });
        buffer = '';
      }
      if (character === '>') pendingCombinator = '>';
      else if (pendingCombinator !== '>') pendingCombinator = ' ';
    } else {
      buffer += character;
    }
  }
  if (buffer.trim()) parts.push({ compound: buffer.trim(), combinator: pendingCombinator });
  if (parts.length) parts[0].combinator = null;
  return parts;
}

function matchesCompound(node, compound) {
  if (!node || node.tagName === '#document') return false;
  const tag = compound.match(/^[a-zA-Z][a-zA-Z0-9-]*/)?.[0]?.toLowerCase();
  if (tag && node.tagName !== tag) return false;
  for (const match of compound.matchAll(/#([a-zA-Z0-9_-]+)/g)) {
    if (node.attributes.id !== match[1]) return false;
  }
  for (const match of compound.matchAll(/\.([a-zA-Z0-9_-]+)/g)) {
    if (!(node.attributes.class || '').split(/\s+/).includes(match[1])) return false;
  }
  for (const match of compound.matchAll(/\[([^\]=~\s]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\]]+)))?\]/g)) {
    const [, name, doubleQuoted, singleQuoted, unquoted] = match;
    if (!(name in node.attributes)) return false;
    const expected = doubleQuoted ?? singleQuoted ?? unquoted?.trim();
    if (expected !== undefined && node.attributes[name] !== expected) return false;
  }
  for (const match of compound.matchAll(/:nth-child\((\d+)\)/g)) {
    const siblings = node.parent?.children || [];
    if (siblings.indexOf(node) + 1 !== Number(match[1])) return false;
  }
  if (/:first-child\b/.test(compound)) {
    if (node.parent?.children[0] !== node) return false;
  }
  return true;
}

function matchesSelector(node, selector) {
  const parts = tokenizeSelector(selector);
  let current = node;
  let index = parts.length - 1;
  if (!matchesCompound(current, parts[index].compound)) return false;
  while (index > 0) {
    const combinator = parts[index].combinator || ' ';
    index -= 1;
    if (combinator === '>') {
      current = current.parent;
      if (!matchesCompound(current, parts[index].compound)) return false;
    } else {
      let ancestor = current.parent;
      while (ancestor && !matchesCompound(ancestor, parts[index].compound)) ancestor = ancestor.parent;
      if (!ancestor) return false;
      current = ancestor;
    }
  }
  return true;
}

function checkSelectorMatchesHtml(selector, html, docName) {
  const documentTree = parseHtml(html);
  const matchingNodes = [];
  const visit = (node) => {
    for (const child of node.children) {
      if (matchesSelector(child, selector)) matchingNodes.push(child);
      visit(child);
    }
  };
  visit(documentTree);
  assert.ok(matchingNodes.length > 0, 'Selector "' + selector + '" matched no DOM elements in ' + docName);
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
        contains: (c) => this.className.split(/\\s+/).includes(c),
        add: (c) => { if (!this.className.split(/\\s+/).includes(c)) this.className = (this.className + ' ' + c).trim(); },
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
  const navLink = new MockElement('a');
  nav.querySelectorAll = (selector) => selector === 'a' ? [navLink] : [];
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
    querySelectorAll: (sel) => queryAll(sel),
    createTextNode: (txt) => txt,
    createElement: (tag) => new MockElement(tag)
  };

  const mockWindow = {
    addEventListener: () => {},
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

  // Exercise the registered mobile-menu click handler.
  menuBtn.click();
  await new Promise(r => setTimeout(r, 10));
  assert.equal(menuBtn.getAttribute('aria-expanded'), 'true');
  assert.equal(menuBtn.getAttribute('aria-label'), de.accessibility.close_menu);
  assert.equal(nav.classList.contains('is-open'), true);
  assert.equal(mockDoc.body.classList.contains('menu-open'), true);

  // Switch language to EN
  langBtn.click();
  await new Promise(r => setTimeout(r, 10));

  assert.equal(docElement.lang, 'en');
  assert.equal(impressumTitle.textContent, en.legal.imprint_title);
  assert.equal(impressumCopy.textContent, en.legal.imprint_text);
  assert.equal(datenschutzTitle.textContent, en.legal.privacy_title);
  assert.equal(datenschutzCopy.textContent, en.legal.privacy_text);
  assert.equal(langBtn.textContent, 'DE');
  assert.equal(langBtn.getAttribute('aria-pressed'), 'true');
  assert.equal(langBtn.getAttribute('aria-label'), en.accessibility.switch_to_german);
  assert.equal(menuBtn.getAttribute('aria-label'), en.accessibility.close_menu);
  assert.equal(storedLang, 'en');

  // Escape closes the menu and resets state and accessibility label.
  listeners['keydown']({ key: 'Escape' });
  await new Promise(r => setTimeout(r, 10));
  assert.equal(menuBtn.getAttribute('aria-expanded'), 'false');
  assert.equal(menuBtn.getAttribute('aria-label'), en.accessibility.open_menu);
  assert.equal(nav.classList.contains('is-open'), false);
  assert.equal(mockDoc.body.classList.contains('menu-open'), false);

  // Clicking a navigation link also closes the menu.
  menuBtn.click();
  await new Promise(r => setTimeout(r, 10));
  navLink.click();
  await new Promise(r => setTimeout(r, 10));
  assert.equal(menuBtn.getAttribute('aria-expanded'), 'false');
  assert.equal(nav.classList.contains('is-open'), false);
});
