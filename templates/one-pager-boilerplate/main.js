/**
 * Template-specific localization for Master Template A.
 * Uses the template's own locales so its content cannot drift from the agency homepage.
 */
document.addEventListener('DOMContentLoaded', () => {
  const languageButton = document.querySelector('#language-toggle');
  const menuButton = document.querySelector('.mobile-menu-toggle');
  const navigation = document.querySelector('#primary-navigation');

  const bindings = {
    'nav.brand': ['.brand-text'],
    'nav.services': ['.nav-list li:nth-child(1) .nav-link', '.footer-nav-group:nth-of-type(2) li:nth-child(1) a'],
    'nav.gallery': ['.nav-list li:nth-child(2) .nav-link', '.footer-nav-group:nth-of-type(2) li:nth-child(2) a'],
    'nav.process': ['.nav-list li:nth-child(3) .nav-link', '.footer-nav-group:nth-of-type(2) li:nth-child(3) a'],
    'nav.about': ['.nav-list li:nth-child(4) .nav-link', '.footer-nav-group:nth-of-type(2) li:nth-child(4) a'],
    'nav.contact': ['.nav-list li:nth-child(5) .nav-link', '.footer-nav-group:nth-of-type(2) li:nth-child(5) a'],
    'nav.cta': ['.nav-cta'],
    'hero.badge': ['.hero-content > .badge'],
    'hero.title': ['#hero-title'],
    'hero.subtitle': ['.hero-description'],
    'hero.primary': ['.hero-actions .btn-primary'],
    'hero.secondary': ['.hero-actions .btn-secondary'],
    'hero.metric_code': ['.hero-metrics .metric-item:nth-child(1) .metric-value'],
    'hero.metric_speed': ['.hero-metrics .metric-item:nth-child(2) .metric-value'],
    'hero.metric_speed_label': ['.hero-metrics .metric-item:nth-child(2) .metric-label'],
    'hero.metric_accessibility': ['.hero-metrics .metric-item:nth-child(3) .metric-value'],
    'hero.metric_accessibility_label': ['.hero-metrics .metric-item:nth-child(3) .metric-label'],
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
    'gallery.tag': ['#gallery .section-tag'],
    'gallery.title': ['#gallery-title'],
    'gallery.lead': ['#gallery > .section-header > .section-lead'],
    'gallery.item1_title': ['.gallery-grid .gallery-card:nth-child(1) h3'],
    'gallery.item1_description': ['.gallery-grid .gallery-card:nth-child(1) .gallery-content p'],
    'gallery.item2_title': ['.gallery-grid .gallery-card:nth-child(2) h3'],
    'gallery.item2_description': ['.gallery-grid .gallery-card:nth-child(2) .gallery-content p'],
    'gallery.item3_title': ['.gallery-grid .gallery-card:nth-child(3) h3'],
    'gallery.item3_description': ['.gallery-grid .gallery-card:nth-child(3) .gallery-content p'],
    'gallery.item4_title': ['.gallery-grid .gallery-card:nth-child(4) h3'],
    'gallery.item4_description': ['.gallery-grid .gallery-card:nth-child(4) .gallery-content p'],
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
    'footer.navigation_heading': ['.footer-nav-group:nth-of-type(2) .footer-heading'],
    'footer.legal_heading': ['.footer-nav-group:nth-of-type(3) .footer-heading'],
    'footer.imprint': ['.footer-nav-group:nth-of-type(3) li:nth-child(1) a'],
    'footer.privacy': ['.footer-nav-group:nth-of-type(3) li:nth-child(2) a'],
    'footer.rights': ['.footer-bottom p:first-child'],
    'footer.notice': ['.legal-notice'],
    'legal.imprint_title': ['#impressum h2'],
    'legal.imprint_text': ['#impressum .legal-copy'],
    'legal.privacy_title': ['#datenschutz h2'],
    'legal.privacy_text': ['#datenschutz .legal-copy']
  };

  const valueAt = (object, path) => path.split('.').reduce((value, key) => value?.[key], object);

  async function loadLocale(language) {
    const response = await fetch(new URL(`locales/${language}.json?v=20261028-2`, document.baseURI), { cache: 'no-store' });
    if (!response.ok) throw new Error(`Locale request failed: ${response.status}`);
    return response.json();
  }

  function applyText(selector, value) {
    document.querySelectorAll(selector).forEach((element) => {
      const required = element.querySelector('.required');
      element.textContent = value;
      if (required) element.append(' ', required);
    });
  }

  async function setLanguage(language) {
    if (!['de', 'en'].includes(language)) return;
    const locale = await loadLocale(language);
    Object.entries(bindings).forEach(([key, selectors]) => {
      const value = valueAt(locale, key);
      if (typeof value === 'string') selectors.forEach((selector) => applyText(selector, value));
    });

    document.documentElement.lang = language;
    document.title = locale.meta.title;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = locale.meta.description;

    document.querySelectorAll('.brand').forEach((brand) => brand.setAttribute('aria-label', locale.nav.brand_label));
    if (navigation) navigation.setAttribute('aria-label', locale.nav.label);
    if (menuButton) {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-label', isOpen ? locale.accessibility.close_menu : locale.accessibility.open_menu);
    }
    if (languageButton) {
      languageButton.textContent = language === 'de' ? 'EN' : 'DE';
      languageButton.setAttribute('aria-label', language === 'de' ? locale.accessibility.switch_to_english : locale.accessibility.switch_to_german);
      languageButton.setAttribute('aria-pressed', String(language === 'en'));
    }

    Object.entries(locale.contact.placeholders).forEach(([field, placeholder]) => {
      const input = document.getElementById(field);
      if (input) input.placeholder = placeholder;
    });
    const privacyNote = document.querySelector('.form-privacy-note');
    if (privacyNote) {
      privacyNote.replaceChildren(document.createTextNode(locale.contact.privacy_prefix + ' '));
      const link = document.createElement('a');
      link.href = '#datenschutz';
      link.className = 'form-privacy-link';
      link.textContent = locale.contact.privacy_link;
      privacyNote.append(link, document.createTextNode(locale.contact.privacy_suffix || ''));
    }
    try { localStorage.setItem('preferred_language', language); } catch (_) {}
  }

  if (languageButton) languageButton.addEventListener('click', () => {
    setLanguage(document.documentElement.lang === 'de' ? 'en' : 'de').catch(console.error);
  });

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
    navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      menuButton.setAttribute('aria-expanded', 'false');
      navigation.classList.remove('is-open');
      document.body.classList.remove('menu-open');
    }));
  }

  let preferredLanguage = 'de';
  try {
    const saved = localStorage.getItem('preferred_language');
    if (saved === 'de' || saved === 'en') preferredLanguage = saved;
  } catch (_) {}
  setLanguage(preferredLanguage).catch((error) => console.error('Template localization failed:', error));
});
