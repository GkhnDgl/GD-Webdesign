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

test('locally hosted UI font file and font-face declarations exist', () => {
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

test('GDesign agency brand tokens remain separate from customer template tokens', () => {
  assert.match(styles, /--color-primary:\s*var\(--brand-midnight\)/);
  assert.match(styles, /--brand-midnight:\s*#0E1726/);
  assert.doesNotMatch(styles, /--color-primary:\s*#047857/);
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

test('responsive styles include the desktop breakpoint and reduced-motion support', () => {
  assert.match(styles, /@media \(min-width: 1024px\)/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
});

test('privacy link styling is decoupled from shared localization JavaScript', () => {
  assert.doesNotMatch(script, /emerald/i, 'shared JavaScript should not contain hardcoded emerald brand colors');
  assert.match(script, /privacyLink\.className = 'form-privacy-link';/);
  assert.match(styles, /\.form-privacy-link\s*\{[^}]*color:\s*var\(--brand-midnight\)/);
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
  assert.equal(config.business.legalForm, 'GmbH');
  assert.equal(typeof config.business.address.street, 'string');
  assert.ok(config.branding && typeof config.branding.primaryColor === 'string');
  assert.ok(config.seo && config.content && Array.isArray(config.content.gallery.items));
  assert.ok(config.content.services.items.length >= 1);
  assert.ok(config.content.process.steps.length >= 1);
  assert.ok(config.content.about.features.length >= 1);
  assert.ok(config.ctas.length >= 1);
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
  assert.deepEqual(schema.required, ['$schema', 'business', 'branding', 'seo', 'content', 'ctas', 'legal']);
  assert.ok(schema.properties.content.properties.gallery.properties.items.minItems >= 1);
  assert.ok(config.content.gallery.items.length >= 1);
  assert.ok(new RegExp(schema.properties.business.properties.phone.pattern).test(config.business.phone));
  assert.ok(config.business.email.includes('@'));
  assert.match(config.branding.primaryColor, /^#[0-9a-fA-F]{6}$/);
  assert.match(config.branding.primaryHoverColor, /^#[0-9a-fA-F]{6}$/);
  assert.match(config.branding.primaryLightColor, /^#[0-9a-fA-F]{6}$/);
  assert.match(config.branding.accentColor, /^#[0-9a-fA-F]{6}$/);
  assert.ok(config.content.gallery.items.every((item) => item.image.startsWith('../../assets/images/') && item.alt.de.trim() && item.alt.en.trim()));
  const assetPattern = new RegExp(schema.properties.content.properties.gallery.properties.items.items.properties.image.pattern);
  assert.ok(config.content.gallery.items.every((item) => assetPattern.test(item.image)), 'Gallery paths must match the schema asset-root pattern');
  assert.equal(schema.properties.ctas.items.allOf.length, 5, 'CTA schema must validate all supported action types');
  assert.ok(config.content.services.items.every((item) => item.title.de && item.title.en && item.description.de && item.description.en));
  for (const key of ['imprintDetails', 'privacyDetails']) {
    assert.equal(typeof config.legal[key].de, 'string');
    assert.equal(typeof config.legal[key].en, 'string');
  }
});

test('template configuration is scoped to the template and contact values have render targets', () => {
  assert.ok(script.includes("document.body.classList.contains('template-master-a')"));
  assert.ok(script.includes('if (!isTemplatePage) return null'));
  assert.ok(script.includes('function validateConfig(config)'));
  assert.ok(script.includes('configError.textContent = locale.config.error'));
  assert.ok(script.includes("document.body.classList.add('config-invalid')"));
  assert.ok(templateStyles.includes('.config-invalid main'));
  assert.match(template, /id="config-error"[^>]*role="alert"/);
  assert.match(template, /class="contact-phone hidden/);
  assert.match(template, /class="contact-email hidden/);
  assert.match(template, /class="contact-address hidden/);
});

test('template locales include matching configuration error messages', () => {
  assert.equal(typeof boilerplateDe.config.error, 'string');
  assert.equal(typeof boilerplateEn.config.error, 'string');
});


test('template footer and SEO metadata use the configured business name in both languages', () => {
  for (const locale of [boilerplateDe, boilerplateEn]) {
    assert.match(locale.footer.rights, /\{businessName\}/);
    assert.match(locale.meta.title, /\{businessName\}/);
    assert.match(locale.meta.description, /\{businessName\}/);
  }
  assert.match(script, /config\.seo\.title/);
  assert.match(script, /config\.seo\.description/);
  assert.match(script, /locale\?\.footer\?\.rights/);
  assert.match(script, /replaceAll\('\{businessName\}'/);
});


test('GDesign agency homepage uses the approved Bespoke Heritage logo and color palette', () => {
  assert.match(agency, /assets\/images\/gdesign-logo\.png/);
  assert.match(agency, /assets\/images\/favicon-32x32\.png/);
  assert.match(agency, /assets\/images\/apple-touch-icon\.png/);
  assert.match(agency, /GDesign/);
  for (const color of ['#0E1726', '#F4F1EA', '#B89F7D', '#1E293B', '#FFFFFF']) {
    assert.ok(styles.includes(color), `Missing brand color ${color}`);
  }
  assert.match(styles, /--font-display:\s*"Cormorant Garamond"/);
  assert.match(de.nav.brand, /^GDesign$/);
  assert.match(en.nav.brand, /^GDesign$/);
});

test('GDesign homepage retains its responsive component layouts', () => {
  assert.match(styles, /\.hero-metrics\s*\{[^}]*display:\s*grid/);
  assert.match(styles, /\.bento-grid\s*\{[^}]*display:\s*grid/);
  assert.match(styles, /\.process-grid\s*\{[^}]*display:\s*grid/);
  assert.match(styles, /\.btn\s*\{[^}]*display:\s*inline-flex/);
  assert.match(styles, /\.form-row\s*\{[^}]*display:\s*grid/);
});

test('GDesign header remains fully visible and navigation switches at the correct breakpoint', () => {
  assert.match(styles, /\.site-header\s*\{[^}]*height:\s*auto;[^}]*min-height:\s*5\.5rem/s);
  assert.match(styles, /\.brand-wordmark\s*\{[^}]*height:\s*auto;[^}]*object-fit:\s*contain/s);
  assert.match(styles, /\.primary-navigation\s*\{[^}]*display:\s*none;[^}]*background:\s*var\(--brand-midnight\)/s);
  assert.match(styles, /\.primary-navigation\.is-open\s*\{\s*display:\s*flex;/);
  assert.match(styles, /@media\s*\(min-width:\s*1024px\)[\s\S]*?\.primary-navigation\s*\{[^}]*display:\s*flex;/);
  assert.match(styles, /@media\s*\(max-width:\s*1023px\)/);
  assert.match(styles, /\.nav-link\s*\{[^}]*color:\s*var\(--brand-ivory\);[^}]*background:\s*transparent;/s);
});

test('GDesign dark surfaces use explicit light text and light surfaces use readable dark text', () => {
  assert.match(styles, /\.services-section\s*\{[^}]*background:\s*var\(--brand-midnight\);[^}]*color:\s*var\(--brand-ivory\)/s);
  assert.match(styles, /\.bento-card p\s*\{[^}]*color:\s*#E0E3E8/);
  assert.match(styles, /\.about-card p\s*\{[^}]*color:\s*#E0E3E8/);
  assert.match(styles, /\.step-content p\s*\{[^}]*color:\s*#4B5563/);
  assert.match(styles, /\.contact-form input, \.contact-form textarea\s*\{[^}]*color:\s*var\(--brand-midnight\)/s);
  assert.match(styles, /\.site-footer a, \.site-footer \.footer-links a\s*\{\s*color:\s*#F4F1EA/);
});

test('Multi-page localization keys exist in both locales and tailwind config captures all root HTML files', () => {
  for (const locale of [de, en]) {
    assert.ok(locale.nav_pages, 'Missing nav_pages in locale');
    assert.equal(typeof locale.nav_pages.home, 'string');
    assert.equal(typeof locale.nav_pages.leistungen, 'string');
    assert.equal(typeof locale.nav_pages.projekte, 'string');
    assert.equal(typeof locale.nav_pages.ueber, 'string');
    assert.equal(typeof locale.nav_pages.kontakt, 'string');

    assert.ok(locale.leistungen, 'Missing leistungen in locale');
    assert.equal(typeof locale.leistungen.title, 'string');
    assert.equal(typeof locale.leistungen.meta_title, 'string');
    assert.equal(typeof locale.leistungen.meta_description, 'string');
    assert.equal(typeof locale.leistungen.package1_title, 'string');

    assert.ok(locale.projekte, 'Missing projekte in locale');
    assert.equal(typeof locale.projekte.title, 'string');
    assert.equal(typeof locale.projekte.meta_title, 'string');
    assert.equal(typeof locale.projekte.meta_description, 'string');
    assert.equal(typeof locale.projekte.study1_title, 'string');

    assert.ok(locale.ueber, 'Missing ueber in locale');
    assert.equal(typeof locale.ueber.title, 'string');
    assert.equal(typeof locale.ueber.meta_title, 'string');
    assert.equal(typeof locale.ueber.meta_description, 'string');
    assert.equal(typeof locale.ueber.philosophy_title, 'string');
    assert.equal(typeof locale.ueber.cta_title, 'string');

    assert.ok(locale.kontakt_page, 'Missing kontakt_page in locale');
    assert.equal(typeof locale.kontakt_page.title, 'string');
    assert.equal(typeof locale.kontakt_page.meta_title, 'string');
    assert.equal(typeof locale.kontakt_page.meta_description, 'string');
    assert.equal(typeof locale.kontakt_page.form_title, 'string');
    assert.equal(typeof locale.kontakt_page.faq1_q, 'string');

    assert.ok(locale.impressum_page, 'Missing impressum_page in locale');
    assert.equal(typeof locale.impressum_page.meta_title, 'string');
    assert.equal(typeof locale.impressum_page.meta_description, 'string');
    assert.equal(typeof locale.impressum_page.hero_lead, 'string');

    assert.ok(locale.datenschutz_page, 'Missing datenschutz_page in locale');
    assert.equal(typeof locale.datenschutz_page.meta_title, 'string');
    assert.equal(typeof locale.datenschutz_page.meta_description, 'string');
    assert.equal(typeof locale.datenschutz_page.hero_lead, 'string');
  }

  const tailwindConfig = fs.readFileSync(path.join(root, 'tailwind.config.js'), 'utf8');
  assert.match(tailwindConfig, /'\.\/\*\.html'/, 'tailwind.config.js must include ./*.html');
});

 
test('Master Template A runtime validator accepts the complete config and rejects unsafe or inconsistent customer data', () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'templates/one-pager-boilerplate/config.json'), 'utf8'));
  const match = script.match(/function validateConfig\(config\) \{[\s\S]*?\n  \}/);
  assert.ok(match, 'Runtime config validator must remain directly testable');
  const validate = new Function('pageBaseUrl', 'URL', 'return (' + match[0] + ')')(
    'https://example.github.io/GD-Webdesign/templates/one-pager-boilerplate/index.html',
    URL
  );
  assert.equal(validate(config), true, 'Sample configuration should pass runtime validation');

  const variableCollections = structuredClone(config);
  variableCollections.content.hero.metrics = variableCollections.content.hero.metrics.slice(0, 1);
  variableCollections.content.services.items = variableCollections.content.services.items.slice(0, 1);
  variableCollections.content.process.steps = variableCollections.content.process.steps.slice(0, 2);
  variableCollections.content.about.features = variableCollections.content.about.features.slice(0, 1);
  variableCollections.content.gallery.items = variableCollections.content.gallery.items.slice(0, 2);
  assert.equal(validate(variableCollections), true, 'Content collections must support variable lengths');

  for (const [type, value] of [
    ['tel', '+49 123 456789'],
    ['email', 'office@example.de'],
    ['url', 'https://example.com/contact'],
    ['anchor', '#about'],
    ['form', '#contact-form']
  ]) {
    const candidate = structuredClone(config);
    candidate.ctas = [{ ...candidate.ctas[0], type, value }];
    assert.equal(validate(candidate), true, 'Supported CTA type should validate: ' + type);
  }

  const configuredLogo = structuredClone(config);
  configuredLogo.branding.logo = {
    image: '../../assets/images/customer-logo.svg',
    alt: { de: 'Unternehmenslogo', en: 'Company logo' }
  };
  assert.equal(validate(configuredLogo), true, 'A valid optional customer logo should be accepted');

  const externalLogo = structuredClone(configuredLogo);
  externalLogo.branding.logo.image = 'https://evil.example/logo.svg';
  assert.equal(validate(externalLogo), false, 'External logo URLs must be rejected');

  const duplicateId = structuredClone(config);
  duplicateId.content.services.items[1].id = duplicateId.content.services.items[0].id;
  assert.equal(validate(duplicateId), false, 'Duplicate collection IDs must be rejected');

  const externalAsset = structuredClone(config);
  externalAsset.content.gallery.items[0].image = 'https://evil.example/assets/images/payload.svg';
  assert.equal(validate(externalAsset), false, 'External image URLs must be rejected');

  const traversingAsset = structuredClone(config);
  traversingAsset.content.gallery.items[0].image = '../../assets/images/../../../outside/assets/images/payload.svg';
  assert.equal(validate(traversingAsset), false, 'Asset paths escaping the site asset root must be rejected');

  for (const unsafe of [
    { type: 'url', value: 'http://example.com' },
    { type: 'url', value: 'javascript:alert(1)' },
    { type: 'url', value: 'https://user:password@example.com' },
    { type: 'anchor', value: '#unknown' },
    { type: 'form', value: '#other-form' }
  ]) {
    const candidate = structuredClone(config);
    candidate.ctas = [{ ...candidate.ctas[0], ...unsafe }];
    assert.equal(validate(candidate), false, 'Unsafe CTA destination must be rejected: ' + unsafe.type + ' ' + unsafe.value);
  }

  const missingTranslation = structuredClone(config);
  missingTranslation.content.hero.title.en = ' ';
  assert.equal(validate(missingTranslation), false, 'Empty localized content must be rejected');
});
