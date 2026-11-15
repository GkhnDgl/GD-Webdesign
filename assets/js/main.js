/**
 * Accessible mobile navigation and JSON-driven German/English localization.
 * Keep all user-facing copy in locales/{de,en}.json.
 */
// Capture currentScript at top-level execution scope before event callbacks
// Resolve locale files from the current document so root pages and nested templates work on GitHub Pages.
const pageBaseUrl = document.baseURI || (typeof location !== 'undefined' ? location.href : '');

document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('.mobile-menu-toggle');
  const navigation = document.querySelector('.primary-navigation');
  const languageButton = document.querySelector('#language-toggle');
  const isTemplatePage = document.body.classList.contains('template-master-a');
  const configError = document.querySelector('#config-error');

  const translations = {
    'nav.brand': ['.brand-text'],
    'nav.services': ['.nav-list a[href="#services"]', '.footer-nav-group a[href="#services"]'],
    'nav.gallery': ['.nav-list a[href="#gallery"]', '.footer-nav-group a[href="#gallery"]'],
    'nav.process': ['.nav-list a[href="#process"]', '.footer-nav-group a[href="#process"]'],
    'nav.about': ['.nav-list a[href="#about"]', '.footer-nav-group a[href="#about"]'],
    'nav.contact': ['.nav-list a[href="#contact"]', '.footer-nav-group a[href="#contact"]'],
    'nav.cta': ['.nav-cta'],
    'hero.badge': ['.hero-content > .badge'],
    'hero.title': ['#hero-title'],
    'hero.subtitle': ['.hero-description'],
    'hero.primary': ['.hero-actions .btn-primary'],
    'hero.secondary': ['.hero-actions .btn-secondary'],
    'hero.metric_code': ['.metric-item:nth-child(1) .metric-value'],
    'hero.metric_code_label': ['.metric-item:nth-child(1) .metric-label'],
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

  let cachedConfig = null;
  let configLoaded = false;

  function validateConfig(config) {
    const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
    const isText = (value) => typeof value === 'string' && value.trim().length > 0;
    const hasOnlyKeys = (value, keys) => Object.keys(value).every((key) => keys.includes(key));
    const isColor = (value) => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
    const isSafeImagePath = (value) => {
      if (!isText(value) || value.startsWith('/') || /^[a-z][a-z0-9+.-]*:/i.test(value)) return false;
      try {
        const resolved = new URL(value, pageBaseUrl);
        return ['http:', 'https:'].includes(resolved.protocol) && resolved.origin === new URL(pageBaseUrl).origin;
      } catch (_) {
        return false;
      }
    };

    if (!isRecord(config) || !hasOnlyKeys(config, ['$schema', 'business', 'branding', 'gallery', 'legal']) ||
        config.$schema !== './config.schema.json' || !isRecord(config.business) ||
        !hasOnlyKeys(config.business, ['name', 'legalName', 'phone', 'email', 'address']) ||
        !isRecord(config.branding) || !hasOnlyKeys(config.branding, ['primaryColor', 'primaryHoverColor']) ||
        !isRecord(config.legal) || !hasOnlyKeys(config.legal, ['imprintDetails', 'privacyDetails']) ||
        !isRecord(config.legal.imprintDetails) || !hasOnlyKeys(config.legal.imprintDetails, ['de', 'en']) ||
        !isRecord(config.legal.privacyDetails) || !hasOnlyKeys(config.legal.privacyDetails, ['de', 'en'])) return false;

    const { business, branding, legal } = config;
    if (!['name', 'legalName', 'phone', 'email', 'address'].every((key) => isText(business[key]))) return false;
    if (!/^[+0-9][0-9\s()./-]{5,24}$/.test(business.phone)) return false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(business.email)) return false;
    if (!isColor(branding.primaryColor) || !isColor(branding.primaryHoverColor)) return false;
    if (!Array.isArray(config.gallery) || config.gallery.length !== 4 ||
        !config.gallery.every((item) => isRecord(item) && hasOnlyKeys(item, ['image', 'alt']) && isSafeImagePath(item.image) && isText(item.alt))) return false;

    return ['imprintDetails', 'privacyDetails'].every((key) =>
      ['de', 'en'].every((language) => isText(legal[key][language])));
  }

  async function loadConfig() {
    if (!isTemplatePage) return null;
    if (configLoaded) return cachedConfig;
    configLoaded = true;
    try {
      const configUrl = new URL('config.json', pageBaseUrl).href;
      const response = await fetch(configUrl);
      if (!response.ok) throw new Error(`Configuration request failed: ${response.status}`);
      const config = await response.json();
      if (!validateConfig(config)) throw new Error('Configuration does not match the required schema.');
      cachedConfig = config;
    } catch (err) {
      console.error('Master Template A configuration is unavailable or invalid:', err);
      cachedConfig = null;
    }
    return cachedConfig;
  }

  function resolveLocalizedValue(val, language) {
    if (!val) return null;
    if (typeof val === 'string') return val;
    if (typeof val === 'object') return val[language] || val['de'] || val['en'] || null;
    return null;
  }

  function applyConfig(config, language = 'de', locale = null) {
    if (!config || typeof config !== 'object') return;

    if (config.branding) {
      if (config.branding.primaryColor) {
        document.documentElement.style.setProperty('--color-primary', config.branding.primaryColor);
      }
      if (config.branding.primaryHoverColor) {
        document.documentElement.style.setProperty('--color-primary-hover', config.branding.primaryHoverColor);
      }
    }

    if (config.business) {
      const businessName = config.business.name;
      if (businessName) {
        document.querySelectorAll('.brand-text').forEach((el) => {
          el.textContent = businessName;
        });

        // Keep customer identity consistent across visible branding, SEO metadata, and footer copy.
        if (locale?.meta?.title) {
          document.title = locale.meta.title.replaceAll('{businessName}', businessName);
        }
        const description = document.querySelector('meta[name="description"]');
        if (description && locale?.meta?.description) {
          description.content = locale.meta.description.replaceAll('{businessName}', businessName);
        }
        if (locale?.footer?.rights) {
          setText('.footer-bottom p:first-child', locale.footer.rights.replaceAll('{businessName}', businessName));
        }
      }

      const phoneEl = document.querySelector('.contact-phone');
      if (phoneEl && config.business.phone) {
        phoneEl.classList.remove('hidden');
        phoneEl.href = `tel:${config.business.phone.replace(/[^+\d]/g, '')}`;
        const span = phoneEl.querySelector('span') || phoneEl;
        span.textContent = config.business.phone;
      }

      const emailEl = document.querySelector('.contact-email');
      if (emailEl && config.business.email) {
        emailEl.classList.remove('hidden');
        emailEl.href = `mailto:${config.business.email}`;
        const span = emailEl.querySelector('span') || emailEl;
        span.textContent = config.business.email;
      }

      const addressEl = document.querySelector('.contact-address');
      if (addressEl && config.business.address) {
        addressEl.classList.remove('hidden');
        const span = addressEl.querySelector('span') || addressEl;
        span.textContent = config.business.address;
      }
    }

    if (Array.isArray(config.gallery)) {
      const gallery = document.querySelector('#gallery');
      if (gallery) {
        const cards = gallery.querySelectorAll('.gallery-grid .gallery-card');
        config.gallery.forEach((item, index) => {
          if (cards[index] && item && typeof item === 'object') {
            const img = cards[index].querySelector('img.gallery-image');
            if (img) {
              if (item.image) img.src = item.image;
              if (item.alt) img.alt = item.alt;
            }
          }
        });
      }
    }

    if (config.legal) {
      const imprintText = resolveLocalizedValue(config.legal.imprintDetails, language);
      if (imprintText) {
        const imprintEl = document.querySelector('#impressum .legal-copy');
        if (imprintEl) imprintEl.textContent = imprintText;
      }

      const privacyText = resolveLocalizedValue(config.legal.privacyDetails, language);
      if (privacyText) {
        const privacyEl = document.querySelector('#datenschutz .legal-copy');
        if (privacyEl) privacyEl.textContent = privacyText;
      }
    }
  }

  async function loadLocale(language) {
    const localeUrl = new URL(`locales/${language}.json`, pageBaseUrl).href;
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

      // Apply the template's gallery translations directly within its own section.
      // Explicit section scoping avoids collisions with other page layouts and ensures
      // the lead copy and all four card descriptions are updated consistently.
      const gallery = document.querySelector('#gallery');
      if (gallery) {
        const galleryTag = gallery.querySelector('.section-tag');
        const galleryTitle = gallery.querySelector('#gallery-title');
        const galleryLead = gallery.querySelector('.section-lead');
        if (galleryTag) galleryTag.textContent = locale.gallery.tag;
        if (galleryTitle) galleryTitle.textContent = locale.gallery.title;
        if (galleryLead) galleryLead.textContent = locale.gallery.lead;

        gallery.querySelectorAll('.gallery-grid .gallery-card').forEach((card, index) => {
          const item = locale.gallery[`item${index + 1}_title`];
          const description = locale.gallery[`item${index + 1}_description`];
          const heading = card.querySelector('h3');
          const paragraph = card.querySelector('.gallery-content p');
          if (heading && typeof item === 'string') heading.textContent = item;
          if (paragraph && typeof description === 'string') paragraph.textContent = description;
        });
      }

      const showcase = document.querySelector('#template-showcase');
      if (showcase && locale.template_showcase) {
        const ts = locale.template_showcase;
        const setEl = (sel, val) => {
          const el = showcase.querySelector(sel);
          if (el && typeof val === 'string') el.textContent = val;
        };
        setEl('.showcase-tag', ts.tag);
        setEl('#showcase-title', ts.title);
        setEl('.showcase-lead', ts.lead);
        setEl('#tab-desktop .tab-label', ts.tab_desktop);
        setEl('#tab-mobile .tab-label', ts.tab_mobile);
        setEl('#tab-architecture .tab-label', ts.tab_architecture);
        setEl('.browser-badge', ts.badge_performance);
        setEl('.mockup-hero-badge', ts.mockup_badge);
        setEl('.mockup-hero-title', ts.mockup_title);
        setEl('.mockup-hero-lead', ts.mockup_lead);
        setEl('.mockup-btn-primary', ts.mockup_cta_primary);
        setEl('.mockup-btn-secondary', ts.mockup_cta_secondary);
        setEl('.mockup-stat:nth-child(1) .mockup-stat-val', ts.mockup_stat1_val);
        setEl('.mockup-stat:nth-child(1) .mockup-stat-lbl', ts.mockup_stat1_lbl);
        setEl('.mockup-stat:nth-child(2) .mockup-stat-val', ts.mockup_stat2_val);
        setEl('.mockup-stat:nth-child(2) .mockup-stat-lbl', ts.mockup_stat2_lbl);
        setEl('.mockup-stat:nth-child(3) .mockup-stat-val', ts.mockup_stat3_val);
        setEl('.mockup-stat:nth-child(3) .mockup-stat-lbl', ts.mockup_stat3_lbl);
        setEl('.phone-brand', ts.phone_brand);
        setEl('.phone-badge', ts.phone_badge);
        setEl('.phone-title', ts.phone_title);
        setEl('.phone-text', ts.phone_text);
        setEl('.phone-cta', ts.phone_cta);
        setEl('.code-badge', ts.code_badge);
        setEl('.showcase-feature-card:nth-child(1) .showcase-feature-title', ts.feature1_title);
        setEl('.showcase-feature-card:nth-child(1) .showcase-feature-desc', ts.feature1_desc);
        setEl('.showcase-feature-card:nth-child(2) .showcase-feature-title', ts.feature2_title);
        setEl('.showcase-feature-card:nth-child(2) .showcase-feature-desc', ts.feature2_desc);
        setEl('.showcase-feature-card:nth-child(3) .showcase-feature-title', ts.feature3_title);
        setEl('.showcase-feature-card:nth-child(3) .showcase-feature-desc', ts.feature3_desc);
        setEl('.showcase-btn-demo span', ts.btn_demo);
        setEl('.showcase-btn-contact', ts.btn_contact);
      }

      // Multi-page navigation labels
      if (locale.nav_pages) {
        const pageFileMap = {
          'index.html': 'home', 'leistungen.html': 'leistungen',
          'projekte.html': 'projekte', 'ueber-uns.html': 'ueber', 'kontakt.html': 'kontakt'
        };
        document.querySelectorAll('.nav-list a[href]').forEach((link) => {
          const filename = (link.getAttribute('href') || '').split('/').pop() || 'index.html';
          const key = pageFileMap[filename];
          if (key && locale.nav_pages[key]) link.textContent = locale.nav_pages[key];
        });
        const navCtaEl = document.querySelector('.nav-cta');
        if (navCtaEl && locale.nav_pages.cta) navCtaEl.textContent = locale.nav_pages.cta;
        document.querySelectorAll('.footer-nav-group a[href]').forEach((link) => {
          const filename = (link.getAttribute('href') || '').split('/').pop() || 'index.html';
          const key = pageFileMap[filename];
          if (key && locale.nav_pages[key]) link.textContent = locale.nav_pages[key];
        });
      }
      // Subpage i18n: Leistungen page
      const leistungenSection = document.querySelector('#leistungen-hero');
      if (leistungenSection && locale.leistungen) {
        const setPageEl = (sel, val) => { const el = document.querySelector(sel); if (el && typeof val === 'string') el.textContent = val; };
        setPageEl('.leistungen-hero-eyebrow', locale.leistungen.hero_badge);
        setPageEl('#leistungen-title', locale.leistungen.title);
        setPageEl('.leistungen-hero-lead', locale.leistungen.lead);
        setPageEl('#packages .section-tag', locale.leistungen.packages_tag);
        setPageEl('#packages-title', locale.leistungen.packages_title);
        setPageEl('.packages-lead', locale.leistungen.packages_lead);
        document.querySelectorAll('.package-card').forEach((card, i) => {
          const k = ['package1', 'package2', 'package3'][i]; if (!k || !locale.leistungen[k + '_title']) return;
          const setC = (sel, val) => { const el = card.querySelector(sel); if (el && typeof val === 'string') el.textContent = val; };
          setC('.package-badge', locale.leistungen[k + '_badge']);
          setC('.package-title', locale.leistungen[k + '_title']);
          setC('.package-desc', locale.leistungen[k + '_desc']);
          setC('.package-cta', locale.leistungen[k + '_cta']);
          card.querySelectorAll('.package-feature').forEach((el, j) => { const fKey = k + '_feature' + (j + 1); if (locale.leistungen[fKey]) el.textContent = locale.leistungen[fKey]; });
        });
      }
      // Subpage i18n: Projekte page
      const projekteSection = document.querySelector('#projekte-hero');
      if (projekteSection && locale.projekte) {
        const setPageEl = (sel, val) => { const el = document.querySelector(sel); if (el && typeof val === 'string') el.textContent = val; };
        setPageEl('.projekte-hero-eyebrow', locale.projekte.hero_badge);
        setPageEl('#projekte-title', locale.projekte.title);
        setPageEl('.projekte-hero-lead', locale.projekte.lead);
        setPageEl('#studies .section-tag', locale.projekte.studies_tag);
        setPageEl('#studies-title', locale.projekte.studies_title);
        setPageEl('.studies-lead', locale.projekte.studies_lead);
        document.querySelectorAll('.case-study-card').forEach((card, i) => {
          const k = 'study' + (i + 1); if (!locale.projekte[k + '_title']) return;
          const setC = (sel, val) => { const el = card.querySelector(sel); if (el && typeof val === 'string') el.textContent = val; };
          setC('.study-tag', locale.projekte[k + '_tag']);
          setC('.study-title', locale.projekte[k + '_title']);
          card.querySelectorAll('.study-metric').forEach((m, j) => {
            const setM = (sel, val) => { const el = m.querySelector(sel); if (el && typeof val === 'string') el.textContent = val; };
            setM('.study-metric-val', locale.projekte[k + '_metric' + (j + 1) + '_val']);
            setM('.study-metric-lbl', locale.projekte[k + '_metric' + (j + 1) + '_lbl']);
          });
        });
      }
      // Subpage i18n: Über uns page
      const ueberSection = document.querySelector('#ueber-hero');
      if (ueberSection && locale.ueber) {
        const setPageEl = (sel, val) => { const el = document.querySelector(sel); if (el && typeof val === 'string') el.textContent = val; };
        setPageEl('.ueber-hero-eyebrow', locale.ueber.hero_badge);
        setPageEl('#ueber-title', locale.ueber.title);
        setPageEl('.ueber-hero-lead', locale.ueber.lead);
        setPageEl('#philosophy-title', locale.ueber.philosophy_title);
        setPageEl('.philosophy-desc', locale.ueber.philosophy_desc);
        setPageEl('#stack .section-tag', locale.ueber.stack_tag);
        setPageEl('#stack-title', locale.ueber.stack_title);
        setPageEl('.stack-lead', locale.ueber.stack_lead);
        document.querySelectorAll('.tech-item').forEach((item, i) => {
          const k = 'stack_item' + (i + 1);
          const setC = (sel, val) => { const el = item.querySelector(sel); if (el && typeof val === 'string') el.textContent = val; };
          setC('.tech-item-title', locale.ueber[k + '_title']);
          setC('.tech-item-desc', locale.ueber[k + '_desc']);
        });
        setPageEl('#benchmarks .section-tag', locale.ueber.benchmarks_tag);
        setPageEl('#benchmarks-title', locale.ueber.benchmarks_title);
        document.querySelectorAll('.benchmark-item').forEach((item, i) => {
          const k = 'benchmark' + (i + 1);
          const setC = (sel, val) => { const el = item.querySelector(sel); if (el && typeof val === 'string') el.textContent = val; };
          setC('.benchmark-val', locale.ueber[k + '_val']);
          setC('.benchmark-lbl', locale.ueber[k + '_lbl']);
        });
        setPageEl('#dsgvo .section-tag', locale.ueber.dsgvo_tag);
        setPageEl('#dsgvo-title', locale.ueber.dsgvo_title);
        setPageEl('.dsgvo-desc', locale.ueber.dsgvo_desc);
        document.querySelectorAll('.dsgvo-item').forEach((item, i) => { const val = locale.ueber['dsgvo_item' + (i + 1)]; if (val) item.textContent = val; });
      }
      // Subpage i18n: Kontakt page
      const kontaktSection = document.querySelector('#kontakt-hero');
      if (kontaktSection && locale.kontakt_page) {
        const setPageEl = (sel, val) => { const el = document.querySelector(sel); if (el && typeof val === 'string') el.textContent = val; };
        setPageEl('.kontakt-hero-eyebrow', locale.kontakt_page.hero_badge);
        setPageEl('#kontakt-title', locale.kontakt_page.title);
        setPageEl('.kontakt-hero-lead', locale.kontakt_page.lead);
        setPageEl('label[for="project-type"]', locale.kontakt_page.project_type_label);
        setPageEl('label[for="budget"]', locale.kontakt_page.budget_label);
        setPageEl('label[for="timeline"]', locale.kontakt_page.timeline_label);
        const ptInput = document.querySelector('#project-type'); if (ptInput) ptInput.placeholder = locale.kontakt_page.project_type_placeholder;
        const budgetInput = document.querySelector('#budget'); if (budgetInput) budgetInput.placeholder = locale.kontakt_page.budget_placeholder;
        const timelineInput = document.querySelector('#timeline'); if (timelineInput) timelineInput.placeholder = locale.kontakt_page.timeline_placeholder;
        setPageEl('#faq .section-tag', locale.kontakt_page.faq_tag);
        setPageEl('#faq-title', locale.kontakt_page.faq_title);
        document.querySelectorAll('.faq-item').forEach((item, i) => {
          const k = 'faq' + (i + 1);
          const setC = (sel, val) => { const el = item.querySelector(sel); if (el && typeof val === 'string') el.textContent = val; };
          setC('.faq-question', locale.kontakt_page[k + '_q']);
          setC('.faq-answer', locale.kontakt_page[k + '_a']);
        });
        setPageEl('.direct-contact-section .section-tag', locale.kontakt_page.direct_tag);
        setPageEl('.direct-contact-section h2', locale.kontakt_page.direct_title);
        setPageEl('.direct-contact-note', locale.kontakt_page.direct_response);
      }
      // Subpage i18n: Impressum page
      const impressumPage = document.querySelector('#impressum-page-title, #impressum-hero');
      if (impressumPage && locale.impressum_page) {
        const setPageEl = (sel, val) => { const el = document.querySelector(sel); if (el && typeof val === 'string') el.textContent = val; };
        setPageEl('.impressum-hero-eyebrow', locale.impressum_page.hero_badge);
        setPageEl('#impressum-page-title', locale.impressum_page.title);
        setPageEl('#impressum-hero h1', locale.impressum_page.title);
        setPageEl('.legal-notice-placeholder', locale.impressum_page.notice);
        setPageEl('.legal-back-link', locale.impressum_page.back_link);
      }
      // Subpage i18n: Datenschutz page
      const datenschutzPage = document.querySelector('#datenschutz-page-title, #datenschutz-hero');
      if (datenschutzPage && locale.datenschutz_page) {
        const setPageEl = (sel, val) => { const el = document.querySelector(sel); if (el && typeof val === 'string') el.textContent = val; };
        setPageEl('.datenschutz-hero-eyebrow', locale.datenschutz_page.hero_badge);
        setPageEl('#datenschutz-page-title', locale.datenschutz_page.title);
        setPageEl('#datenschutz-hero h1', locale.datenschutz_page.title);
        setPageEl('.legal-notice-placeholder', locale.datenschutz_page.notice);
        setPageEl('.legal-back-link', locale.datenschutz_page.back_link);
      }
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
        privacyLink.href = isTemplatePage ? '#datenschutz' : 'datenschutz.html';
        privacyLink.className = 'form-privacy-link';
        privacyLink.textContent = locale.contact.privacy_link;
        privacyNote.append(privacyLink, document.createTextNode(locale.contact.privacy_suffix || ''));
      }

      if (isTemplatePage) {
        const config = await loadConfig();
        if (config) {
          document.body.classList.remove('config-invalid');
          if (configError) configError.classList.add('hidden');
          applyConfig(config, language, locale);
        } else {
          document.body.classList.add('config-invalid');
          if (configError) {
            configError.textContent = locale.config.error;
            configError.classList.remove('hidden');
          }
        }
      }

      try { localStorage.setItem('preferred_language', language); } catch (_) { /* Storage may be unavailable. */ }
    } catch (error) {
      console.error('Unable to apply the selected language:', error);
    }
  }

  function markActivePage() {
    try {
      const currentFile = (typeof location !== 'undefined'
        ? location.pathname.split('/').pop()
        : '') || 'index.html';
      document.querySelectorAll('.nav-link[href]').forEach((link) => {
        const linkFile = (link.getAttribute('href') || '').split('/').pop() || 'index.html';
        if (linkFile === currentFile) {
          link.setAttribute('aria-current', 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    } catch (_) { /* location may be unavailable */ }
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
    window.addEventListener('resize', () => { if (window.innerWidth >= 1024) closeMenu(); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
  }

  const showcaseTabs = document.querySelectorAll('.showcase-tab');
  if (showcaseTabs.length > 0) {
    showcaseTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const targetId = tab.getAttribute('aria-controls');
        showcaseTabs.forEach((t) => {
          const isCurrent = t === tab;
          t.classList.toggle('is-active', isCurrent);
          t.setAttribute('aria-selected', String(isCurrent));
          t.setAttribute('tabindex', isCurrent ? '0' : '-1');
        });
        document.querySelectorAll('.showcase-panel').forEach((panel) => {
          const isTarget = panel.id === targetId;
          panel.classList.toggle('is-active', isTarget);
          panel.classList.toggle('hidden', !isTarget);
        });
      });
      tab.addEventListener('keydown', (e) => {
        const tabsArray = Array.from(showcaseTabs);
        const index = tabsArray.indexOf(tab);
        let nextTab = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          nextTab = tabsArray[(index + 1) % tabsArray.length];
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          nextTab = tabsArray[(index - 1 + tabsArray.length) % tabsArray.length];
        }
        if (nextTab) {
          e.preventDefault();
          nextTab.focus();
          nextTab.click();
        }
      });
    });
  }

  if (languageButton) {
    languageButton.addEventListener('click', () => {
      setLanguage(document.documentElement.lang === 'de' ? 'en' : 'de');
    });
  }

  markActivePage();
  let preferredLanguage = 'de';
  try {
    const stored = localStorage.getItem('preferred_language');
    if (stored === 'de' || stored === 'en') preferredLanguage = stored;
  } catch (_) { /* Storage may be unavailable. */ }
  setLanguage(preferredLanguage);
});
