/**
 * GD Webdesign interactions and JSON-based German/English localization.
 */
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.querySelector('.mobile-menu-toggle');
  const navMenu = document.querySelector('.primary-navigation');
  const languageToggle = document.querySelector('#language-toggle');
  const navLinks = document.querySelectorAll('.nav-link, .nav-cta');

  function closeMenu() {
    if (!toggleBtn || !navMenu) return;
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-label', document.documentElement.lang === 'en' ? 'Open menu' : 'Menü öffnen');
    navMenu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  }

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', String(!expanded));
      toggleBtn.setAttribute('aria-label', expanded
        ? (document.documentElement.lang === 'en' ? 'Open menu' : 'Menü öffnen')
        : (document.documentElement.lang === 'en' ? 'Close menu' : 'Menü schließen'));
      navMenu.classList.toggle('is-open', !expanded);
      document.body.classList.toggle('menu-open', !expanded);
    });
    navLinks.forEach((link) => link.addEventListener('click', closeMenu));
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 640) closeMenu();
    });
  }

  const translations = {
    'nav.services': ['.nav-list li:nth-child(1) .nav-link'],
    'nav.process': ['.nav-list li:nth-child(2) .nav-link'],
    'nav.about': ['.nav-list li:nth-child(3) .nav-link'],
    'nav.contact': ['.nav-list li:nth-child(4) .nav-link'],
    'nav.cta': ['.nav-cta'],
    'hero.badge': ['.hero-content > .badge'],
    'hero.title': ['#hero-title'],
    'hero.subtitle': ['.hero-description'],
    'hero.cta_primary': ['.hero-actions .btn-primary'],
    'hero.cta_secondary': ['.hero-actions .btn-secondary'],
    'hero.metrics.code': ['.metric-item:nth-child(1) .metric-label'],
    'hero.metrics.speed': ['.metric-item:nth-child(2) .metric-label'],
    'hero.metrics.a11y': ['.metric-item:nth-child(3) .metric-label'],
    'services.tag': ['#services .section-tag'],
    'services.title': ['#services-title'],
    'services.lead': ['#services .section-lead'],
    'services.webdesign.title': ['.bento-card-featured h3'],
    'services.webdesign.description': ['.bento-card-featured > p'],
    'services.seo.title': ['.bento-card:nth-child(2) h3'],
    'services.seo.description': ['.bento-card:nth-child(2) p'],
    'services.branding.title': ['.bento-card:nth-child(3) h3'],
    'services.branding.description': ['.bento-card:nth-child(3) p'],
    'services.architecture.title': ['.bento-card:nth-child(4) h3'],
    'services.architecture.description': ['.bento-card:nth-child(4) p'],
    'services.maintenance.title': ['.bento-card-wide h3'],
    'services.maintenance.description': ['.bento-card-wide p'],
    'process.tag': ['#process .section-tag'],
    'process.title': ['#process-title'],
    'process.lead': ['#process .section-lead'],
    'process.step1.title': ['.process-step:nth-child(1) h3'],
    'process.step1.description': ['.process-step:nth-child(1) p'],
    'process.step2.title': ['.process-step:nth-child(2) h3'],
    'process.step2.description': ['.process-step:nth-child(2) p'],
    'process.step3.title': ['.process-step:nth-child(3) h3'],
    'process.step3.description': ['.process-step:nth-child(3) p'],
    'about.tag': ['#about .section-tag'],
    'about.title': ['#about-title'],
    'about.description': ['.about-content > p'],
    'contact.tag': ['#contact .section-tag'],
    'contact.title': ['#contact-title'],
    'contact.lead': ['#contact .section-lead'],
    'contact.fields.name': ['label[for="name"]'],
    'contact.fields.email': ['label[for="email"]'],
    'contact.fields.subject': ['label[for="subject"]'],
    'contact.fields.message': ['label[for="message"]'],
    'contact.fields.submit': ['.btn-submit'],
    'footer.tagline': ['.footer-tagline'],
    'footer.rights': ['.footer-bottom p:first-child'],
    'footer.imprint': ['.footer-links li:nth-child(1) a'],
    'footer.privacy': ['.footer-links li:nth-child(2) a']
  };

  function getValue(object, path) {
    return path.split('.').reduce((value, key) => value && value[key], object);
  }

  async function setLanguage(language) {
    try {
      const response = await fetch(`locales/${language}.json`);
      if (!response.ok) throw new Error('Locale file could not be loaded');
      const locale = await response.json();
      Object.entries(translations).forEach(([key, selectors]) => {
        const value = getValue(locale, key);
        if (typeof value !== 'string') return;
        selectors.forEach((selector) => {
          document.querySelectorAll(selector).forEach((element) => {
            if (element.tagName === 'LABEL') {
              const required = element.querySelector('.required');
              element.textContent = value + ' ';
              if (required) element.append(required);
            } else {
              element.textContent = value;
            }
          });
        });
      });

      document.documentElement.lang = language;
      document.title = locale.meta.title;
      const description = document.querySelector('meta[name="description"]');
      if (description) description.content = locale.meta.description;
      if (languageToggle) {
        languageToggle.textContent = language === 'de' ? 'EN' : 'DE';
        languageToggle.setAttribute('aria-label', language === 'de' ? 'Switch language to English' : 'Sprache auf Deutsch umstellen');
        languageToggle.setAttribute('aria-pressed', String(language === 'en'));
      }
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-label', toggleBtn.getAttribute('aria-expanded') === 'true'
          ? (language === 'en' ? 'Close menu' : 'Menü schließen')
          : (language === 'en' ? 'Open menu' : 'Menü öffnen'));
      }
      document.querySelector('.form-privacy-note').innerHTML = language === 'de'
        ? 'Mit dem Absenden stimmen Sie zu, dass Ihre Angaben zur Kontaktaufnahme verwendet werden. Weitere Informationen finden Sie in der <a href="#datenschutz">Datenschutzerklärung</a>.'
        : 'By submitting this form, you agree that your details may be used to respond to your enquiry. See the <a href="#datenschutz">privacy notice</a> for more information.';
      const aboutFeatures = document.querySelectorAll('.feature-item');
      if (aboutFeatures.length >= 2) {
        aboutFeatures[0].querySelector('strong').textContent = language === 'de' ? 'Nutzerzentriert' : 'User-focused';
        aboutFeatures[0].querySelector('p').textContent = language === 'de'
          ? 'Optimale Bedienbarkeit auf Smartphones, Tablets und Desktops.'
          : 'Designed for usability across phones, tablets, and desktops.';
        aboutFeatures[1].querySelector('strong').textContent = language === 'de' ? 'Zukunftsorientiert' : 'Built for the future';
        aboutFeatures[1].querySelector('p').textContent = language === 'de'
          ? 'Mit Blick auf Bedienbarkeit, Sicherheit und Datenschutz entwickelt.'
          : 'Developed with usability, security, and privacy in mind.';
      }
      const legalImprint = document.querySelector('#impressum p');
      const legalPrivacy = document.querySelector('#datenschutz p');
      if (legalImprint) legalImprint.textContent = language === 'de'
        ? 'Angaben zum Betreiber fehlen noch. Bitte ergänzen Sie vor der Veröffentlichung den vollständigen rechtlichen Namen, die ladungsfähige Anschrift und die erforderlichen Kontakt- und Registerangaben. Keine Angaben auf dieser Seite sind als verifizierte Betreiberinformationen zu verstehen.'
        : 'Operator details are still missing. Before publication, add the full legal name, serviceable address, and all required contact and registration details. Nothing on this page should be treated as verified operator information.';
      if (legalPrivacy) legalPrivacy.textContent = language === 'de'
        ? 'Die Datenschutzerklärung ist noch nicht fertiggestellt. Vor der Veröffentlichung müssen insbesondere Verantwortlicher, Rechtsgrundlagen, Aufbewahrungsfristen, Empfänger und die Verarbeitung durch Netlify Forms anhand der tatsächlichen Konfiguration geprüft und ergänzt werden.'
        : 'The privacy notice is not complete yet. Before publication, verify and document the controller, legal bases, retention periods, recipients, and processing through Netlify Forms against the actual configuration.';
    } catch (error) {
      console.error('Unable to apply the selected language:', error);
    }
  }

  if (languageToggle) {
    languageToggle.addEventListener('click', () => {
      const nextLanguage = document.documentElement.lang === 'de' ? 'en' : 'de';
      setLanguage(nextLanguage);
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
});
