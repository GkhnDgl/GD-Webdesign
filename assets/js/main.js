/**
 * GD Webdesign Main JavaScript
 * Lightweight interactions for mobile navigation and accessibility.
 */

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.querySelector('.mobile-menu-toggle');
  const navMenu = document.querySelector('.primary-navigation');
  const navLinks = document.querySelectorAll('.nav-link, .nav-cta');

  if (!toggleBtn || !navMenu) return;

  function openMenu() {
    toggleBtn.setAttribute('aria-expanded', 'true');
    toggleBtn.setAttribute('aria-label', 'Menü schließen');
    navMenu.classList.add('is-open');
    document.body.classList.add('menu-open');
  }

  function closeMenu() {
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-label', 'Menü öffnen');
    navMenu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  }

  toggleBtn.addEventListener('click', () => {
    const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close menu on clicking navigation links
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close menu on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggleBtn.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      toggleBtn.focus();
    }
  });

  // Close menu on resize if window becomes larger than sm breakpoint (640px)
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 640 && toggleBtn.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    }
  });
});
