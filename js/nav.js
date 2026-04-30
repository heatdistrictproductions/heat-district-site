/* =========================================================
   Heat District Productions — Global Navigation
   File path: js/nav.js

   This injects the same navbar and mobile menu on every page.
   To change the top menu globally later, edit this file only.
   ========================================================= */

(function () {
  const productCategories = [
    { label: 'Sound Systems', href: 'services.html#sound' },
    { label: 'Lighting', href: 'services.html#lighting' },
    { label: 'DJ Equipment', href: 'services.html#dj-equipment' },
    { label: 'Photo Booth', href: 'services.html#photo-booth' },
    { label: 'Photography & Video', href: 'services.html#photo-video' },
    { label: 'Special Effects', href: 'services.html#effects' },
    { label: 'LED Walls', href: 'services.html#led-walls' },
    { label: 'Staging & Trussing', href: 'services.html#staging-trussing' }
  ];

  const mainLinks = [
    { label: 'Packages', href: 'packages.html', match: 'packages.html' },
    { label: 'Gallery', href: 'gallery.html', match: 'gallery.html' },
    { label: 'Our Team', href: 'team.html', match: 'team.html' },
    { label: 'Contact', href: 'contact.html', match: 'contact.html' }
  ];

  function getCurrentPage() {
    const path = window.location.pathname.split('/').pop();
    return path || 'index.html';
  }

  function isActive(match) {
    return getCurrentPage() === match ? 'active' : '';
  }

  function isProductsActive() {
    return getCurrentPage() === 'services.html' ? 'active' : '';
  }

  function buildDropdownLinks() {
    return productCategories.map(function (item) {
      return '<a href="' + item.href + '">' + item.label + '</a>';
    }).join('');
  }

  function buildMainLinks() {
    return mainLinks.map(function (item) {
      return '<li><a href="' + item.href + '" class="' + isActive(item.match) + '">' + item.label + '</a></li>';
    }).join('');
  }

  function buildMobileMainLinks() {
    return mainLinks.map(function (item) {
      return '<a href="' + item.href + '" class="' + isActive(item.match) + '">' + item.label + '</a>';
    }).join('');
  }

  function renderNav() {
    const mount = document.getElementById('siteNav');

    if (!mount) {
      return;
    }

    mount.innerHTML = `
      <nav>
        <a href="index.html" class="nav-logo">
          <img src="logo.png" alt="Heat District Productions" />
        </a>

        <ul class="nav-links">
          <li class="nav-item-dropdown">
            <a href="services.html" class="nav-link-with-dropdown ${isProductsActive()}">Products</a>

            <div class="nav-dropdown">
              ${buildDropdownLinks()}
            </div>
          </li>

          ${buildMainLinks()}
        </ul>

        <a href="packages.html" class="nav-cta">Book Now</a>

        <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Open menu" aria-expanded="false" aria-controls="mobileNav" type="button">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      <div class="mobile-nav" id="mobileNav">
        <a href="services.html" class="${isProductsActive()}">Products</a>

        <div class="mobile-nav-sub">
          ${buildDropdownLinks()}
        </div>

        ${buildMobileMainLinks()}

        <a href="packages.html" class="mobile-nav-book">Book Now</a>
      </div>
    `;
  }

  function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');

    function closeMobileMenu() {
      if (!mobileMenuBtn || !mobileNav) return;

      mobileNav.classList.remove('open');
      mobileMenuBtn.classList.remove('active');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('mobile-menu-open');
    }

    function toggleMobileMenu() {
      if (!mobileMenuBtn || !mobileNav) return;

      const isOpen = mobileNav.classList.contains('open');

      if (isOpen) {
        closeMobileMenu();
      } else {
        mobileNav.classList.add('open');
        mobileMenuBtn.classList.add('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
        document.body.classList.add('mobile-menu-open');
      }
    }

    if (mobileMenuBtn && mobileNav) {
      mobileMenuBtn.addEventListener('click', toggleMobileMenu);

      mobileNav.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', closeMobileMenu);
      });

      window.addEventListener('resize', function () {
        if (window.innerWidth > 900) {
          closeMobileMenu();
        }
      });

      document.addEventListener('click', function (event) {
        const clickedInsideNav = mobileNav.contains(event.target);
        const clickedButton = mobileMenuBtn.contains(event.target);

        if (!clickedInsideNav && !clickedButton && mobileNav.classList.contains('open')) {
          closeMobileMenu();
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderNav();
    initMobileMenu();
  });
})();
