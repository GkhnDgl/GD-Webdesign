/**
 * Accessible mobile navigation and JSON-driven German/English localization.
 * Keep all user-facing copy in locales/{de,en}.json.
 */
// Capture currentScript at top-level execution scope before event callbacks
const scriptBaseUrl = document.currentScript && document.currentScript.src
  ? document.currentScript.src
  : (typeof location !== 'undefined' ? location.href : '');

document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('.mobile-menu-toggle');
  const navigation = document.querySelector('.primary-navigation');
  const languageButton = document.querySelector('#language-toggle');

  const translations = {
    'nav.brand': ['.brand-text'],
    'nav.services': ['.nav-list li:nth-child(1) .nav-link', '.footer-nav-group:nth-child(2) li:nth-child(1) a'],
    'nav.process': ['.nav-list li:nth-child(2) .nav-link', '.footer-nav-group:nth-child(2) li:nth-child(2) a'],
    'nav.about': ['.nav-list li:nth-child(3) .nav-link', '.footer-nav-group:nth-child(2) li:nth-child(3) a'],
    'nav.contact': ['.nav-list li:nth-child(4) .nav-link', '.footer-nav-group:nth-child(2) li:nth-child(4) a'],
    'nav.cta': ['.nav-cta'],
    'hero.badge': ['.hero-content > .badge'],
    'hero.title': ['#hero-title'],
    'hero.subtitle': ['.hero-description'],
    'hero.primary': ['.hero-actions .btn-primary'],
    'hero.secondary': ['.hero-actions .btn-secondary'],
    'hero.metric_code': ['.metric-item:nth-child(1) .metric-label'],
    'hero.metric_speed': ['.metric-item:nth-child(2) .metric-value'],
    'hero.metric_speed_label': ['.metric-item:nth-child(2) .metric-label'],
    'hero.metric_accessibility': ['.metric-item:nth-child(3) .metric-value'],
    'hero.metric_accessibility_label': ['.metric-item:nth-child(3) .metric-label'],
    'services.tag': ['#services .section-tag'],
    'services.title': ['#services-title'],
    'services.lead': ['#services .section-lead'],
    'services.primary_badge': ['.bento-card-featured .bento-badge'],
    'services.primary_title': ['.bento-card-featured h3'],
    'services.primary_description': ['.bento-card-featured > p'],
    'services.list_one': ['.bento-list li:nth-child(1)'],
    'services.list_two': ['.bento-list li:nth-child(2)'],
    'services.list_three': ['.bento-list li:nth-child(3)'],
    'services.second_title': ['.bento-card:nth-child(2) h3'],
    'services.second_description': ['.bento-card:nth-child(2) p'],
    'services.third_title': ['.bento-card:nth-child(3) h3'],
    'services.third_description': ['.bento-card:nth-child(3) p'],
    'services.fourth_title': ['.bento-card:nth-child(4) h3'],
    'services.fourth_description': ['.bento-card:nth-child(4) p'],
    'services.fifth_title': ['.bento-card-wide h3'],
    'services.fifth_description': ['.bento-card-wide p'],
    'process.tag': ['#process .section-tag'],
    'process.title': ['#process-title'],
    'process.lead': ['#process .section-lead'],
    'process.one_title': ['.process-step:nth-child(1) h3'],
    'process.one_description': ['.process-step:nth-child(1) p'],
    'process.two_title': ['.process-step:nth-child(2) h3'],
    'process.two_description': ['.process-step:nth-child(2) p'],
    'process.three_title': ['.process-step:nth-child(3) h3'],
    'process.three_description': ['.process-step:nth-child(3) p'],
    'about.tag': ['#about .section-tag'],
    'about.title': ['#about-title'],
    'about.description': ['.about-content > p'],
    'about.feature_one_title': ['.feature-item:nth-child(1) strong'],
    'about.feature_one_description': ['.feature-item:nth-child(1) p'],
    'about.feature_two_title': ['.feature-item:nth-child(2) strong'],
    'about.feature_two_description': ['.feature-item:nth-child(2) p'],
    'contact.tag': ['#contact .section-tag'],
    'contact.title': ['#contact-title'],
    'contact.lead': ['#contact .section-lead'],
    'contact.name': ['label[for="name"]'],
    'contact.email': ['label[for="email"]'],
    'contact.subject': ['label[for="subject"]'],
    'contact.message': ['label[for="message"]'],
    'contact.submit': ['.btn-submit'],
    'footer.tagline': ['.footer-tagline'],
    'footer.navigation_heading': ['.footer-nav-group:nth-child(2) .footer-heading'],
    'footer.legal_heading': ['.footer-nav-group:nth-child(3) .footer-heading'],
    'footer.imprint': ['.footer-nav-group:nth-child(3) li:nth-child(1) a'],
    'footer.privacy': ['.footer-nav-group:nth-child(3) li:nth-child(2) a'],
    'footer.rights': ['.footer-bottom p:first-child'],
    'footer.notice': ['.legal-notice'],
    'legal.imprint_title': ['#impressum h2'],
    'legal.imprint_text': ['#impressum .legal-copy'],
    'legal.privacy_title': ['#datenschutz h2'],
    'legal.privacy_text': ['#datenschutz .legal-copy']
  };

  const getValue = (object, path) => path.split('.').reduce((value, key) => value?.[key], object);

  async function loadLocale(language) {
    // Resolve locale files relative to the current page, so the root homepage and
    // nested boilerplate each load their own locales/{de,en}.json files.
    const localeUrl = new URL(`locales/${language}.json`, document.baseURI).href;
    const response = await fetch(localeUrl);
    if (!response.ok) throw new Error(`Locale request failed: ${response.status}`);
    return response.json();
  }

  function setText(selector, value) {
    document.querySelectorAll(selector).forEach((element) => {
      if (element.matches('label')) {
        const requiredMark = element.querySelector('.required');
        element.textContent = value;
        if (requiredMark) element.append(' ', requiredMark);
      } else {
        element.textContent = value;
      }
    });
  }

  async function setLanguage(language) {
    if (!['de', 'en'].includes(language)) return;
    try {
      const locale = await loadLocale(language);
      Object.entries(translations).forEach(([key, selectors]) => {
        const value = getValue(locale, key);
        if (typeof value === 'string') selectors.forEach((selector) => setText(selector, value));
      });

      document.documentElement.lang = language;
      document.title = locale.meta.title;
      const description = document.querySelector('meta[name="description"]');
      if (description) description.content = locale.meta.description;

      const brandLabel = getValue(locale, 'nav.brand_label');
      document.querySelectorAll('.brand').forEach((brand) => brand.setAttribute('aria-label', brandLabel));
      if (navigation) navigation.setAttribute('aria-label', locale.nav.label);
      if (menuButton) {
        const expanded = menuButton.getAttribute('aria-expanded') === 'true';
        menuButton.setAttribute('aria-label', expanded ? locale.accessibility.close_menu : locale.accessibility.open_menu);
      }
      if (languageButton) {
        languageButton.textContent = language === 'de' ? 'EN' : 'DE';
        languageButton.setAttribute('aria-label', language === 'de' ? locale.accessibility.switch_to_english : locale.accessibility.switch_to_german);
        languageButton.setAttribute('aria-pressed', String(language === 'en'));
      }

      const placeholders = locale.contact.placeholders;
      Object.entries(placeholders).forEach(([field, value]) => {
        const input = document.querySelector(`#${field}`);
        if (input) input.placeholder = value;
      });
      const privacyNote = document.querySelector('.form-privacy-note');
      if (privacyNote) {
        privacyNote.replaceChildren(document.createTextNode(locale.contact.privacy_prefix + ' '));
        const privacyLink = document.createElement('a');
        privacyLink.href = '#datenschutz';
        privacyLink.className = 'underline text-emerald-700 hover:text-emerald-900';
        privacyLink.textContent = locale.contact.privacy_link;
        privacyNote.append(privacyLink, document.createTextNode(locale.contact.privacy_suffix || ''));
      }

      try { localStorage.setItem('preferred_language', language); } catch (_) { /* Storage may be unavailable. */ }
    } catch (error) {
      console.error('Unable to apply the selected language:', error);
    }
  }

  function closeMenu() {
    if (!menuButton || !navigation) return;
    menuButton.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    const language = document.documentElement.lang === 'en' ? 'en' : 'de';
    loadLocale(language).then((locale) => menuButton.setAttribute('aria-label', locale.accessibility.open_menu)).catch(() => {});
  }

  if (menuButton && navigation) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      navigation.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
      loadLocale(document.documentElement.lang === 'en' ? 'en' : 'de').then((locale) => {
        menuButton.setAttribute('aria-label', open ? locale.accessibility.close_menu : locale.accessibility.open_menu);
      }).catch(() => {});
    });
    navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    window.addEventListener('resize', () => { if (window.innerWidth >= 640) closeMenu(); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
  }

  if (languageButton) {
    languageButton.addEventListener('click', () => {
      setLanguage(document.documentElement.lang === 'de' ? 'en' : 'de');
    });
  }

  let preferredLanguage = 'de';
  try {
    const stored = localStorage.getItem('preferred_language');
    if (stored === 'de' || stored === 'en') preferredLanguage = stored;
  } catch (_) { /* Storage may be unavailable. */ }
  setLanguage(preferredLanguage);
});
