/* =========================================================
   Heat District Productions — Global Navigation
   File path: js/nav.js

   This injects the same navbar and mobile menu on every page.
   To change the top menu globally later, edit this file only.
   ========================================================= */

(function () {
  const productCategories = [
    { label: 'Sound Systems', href: 'sound-system-rentals.html' },
    { label: 'Lighting', href: 'event-lighting-rentals.html' },
    { label: 'DJ Services', href: 'dj-services.html' },
    { label: 'DJ Equipment', href: 'dj-equipment-rentals.html' },
    { label: 'Photo Booth', href: 'photo-booth-rentals.html' },
    { label: 'Photography & Video', href: 'event-photography-videography.html' },
    { label: 'Special Effects', href: 'special-effects-rentals.html' },
    { label: 'LED Walls', href: 'led-wall-rentals.html' },
    { label: 'Tables & Chairs', href: 'table-chair-rentals.html' },
    { label: 'Staging & Trussing', href: 'staging-trussing-rentals.html' }
  ];

  const mainLinks = [
    { label: 'Packages', href: 'packages.html', match: 'packages.html' },
    { label: 'Gallery', href: 'gallery.html', match: 'gallery.html' },
    { label: 'Our Team', href: 'team.html', match: 'team.html' },
    { label: 'FAQ', href: 'faq.html', match: 'faq.html' },
    { label: 'Contact', href: 'contact.html', match: 'contact.html' }
  ];

  function getCurrentPage() {
    const path = window.location.pathname.split('/').pop();
    return path || 'index.html';
  }

  function isActive(match) {
    if (match === 'gallery.html' && getCurrentPage().indexOf('party-gallery-') === 0) {
      return 'active';
    }
    return getCurrentPage() === match ? 'active' : '';
  }

  function isProductsActive() {
    return ['services.html'].concat(productCategories.map(function (item) {
      return item.href;
    })).indexOf(getCurrentPage()) !== -1 ? 'active' : '';
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

    if (!document.getElementById('global-mobile-nav-fix')) {
      const mobileStyle = document.createElement('style');
      mobileStyle.id = 'global-mobile-nav-fix';
      mobileStyle.textContent = `
        @media (max-width: 900px) {
          #siteNav nav {
            min-height: 86px;
            padding: 10px 16px !important;
          }

          #siteNav .nav-links,
          #siteNav .nav-cta {
            display: none !important;
          }

          #siteNav .mobile-menu-btn {
            display: flex !important;
          }

          #siteNav > #mobileNav.mobile-nav {
            top: 90px !important;
            left: 12px !important;
            right: 12px !important;
            width: auto !important;
            max-width: none !important;
            max-height: calc(100dvh - 106px) !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            justify-content: flex-start !important;
            gap: 2px !important;
            padding: 12px !important;
            overflow-x: hidden !important;
            overflow-y: auto !important;
            border-radius: 14px !important;
          }

          #siteNav > #mobileNav.mobile-nav > a {
            display: block !important;
            width: 100% !important;
            padding: 13px 12px !important;
            text-align: left !important;
            white-space: normal !important;
            line-height: 1.25 !important;
          }

          #siteNav > #mobileNav.mobile-nav > .mobile-nav-sub {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
            width: 100% !important;
            margin: -2px 0 8px !important;
            padding: 4px 0 8px 12px !important;
            border-left: 1px solid rgba(0,240,255,0.14) !important;
          }

          #siteNav > #mobileNav.mobile-nav > .mobile-nav-sub a {
            display: block !important;
            min-width: 0 !important;
            padding: 9px 10px !important;
            font-size: 0.64rem !important;
            letter-spacing: 1.35px !important;
            line-height: 1.3 !important;
            white-space: normal !important;
            overflow-wrap: anywhere !important;
          }

          #siteNav > #mobileNav.mobile-nav > .mobile-nav-book {
            margin-top: 8px !important;
            text-align: center !important;
          }
        }

        @media (max-width: 430px) {
          #siteNav .nav-logo img {
            height: 58px !important;
          }

          #siteNav > #mobileNav.mobile-nav {
            top: 82px !important;
            max-height: calc(100dvh - 96px) !important;
          }

          body > #mobileNav.mobile-nav > .mobile-nav-sub {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }
      `;
      document.head.appendChild(mobileStyle);
    }

    mount.innerHTML = `
      <nav>
        <a href="index.html" class="nav-logo">
          <img src="images/optimized/logo-nav.webp" alt="Heat District Productions" width="280" height="207" />
        </a>

        <ul class="nav-links">
          <li class="nav-item-dropdown">
            <a href="services.html" class="nav-link-with-dropdown ${isProductsActive()}">Rentals &amp; Builds</a>

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
        <a href="services.html" class="${isProductsActive()}">Rentals &amp; Builds</a>

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
