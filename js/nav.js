/* Heat District Productions — accessible shared navigation */
(function () {
  const products = [
    ['Sound Systems','sound-system-rentals.html'],['Event Lighting','event-lighting-rentals.html'],
    ['DJ Services','dj-services.html'],['DJ Equipment','dj-equipment-rentals.html'],
    ['Photo Booths','photo-booth-rentals.html'],['Photography & Video','event-photography-videography.html'],
    ['Special Effects','special-effects-rentals.html'],['LED Walls','led-wall-rentals.html'],
    ['Tables & Chairs','table-chair-rentals.html'],['Staging & Trussing','staging-trussing-rentals.html']
  ];
  const links = [['Packages','packages.html'],['Gallery','gallery.html'],['Our Team','team.html'],['FAQ','faq.html'],['Contact','contact.html']];
  const current = window.location.pathname.split('/').pop() || 'index.html';
  const productActive = current === 'services.html' || products.some(item => item[1] === current);
  const active = href => current === href || (href === 'gallery.html' && current.indexOf('party-') === 0) ? ' active' : '';
  const productLinks = products.map(item => `<a href="${item[1]}">${item[0]}</a>`).join('');
  const mainLinks = links.map(item => `<li><a href="${item[1]}" class="${active(item[1])}">${item[0]}</a></li>`).join('');
  const mobileLinks = links.map(item => `<a href="${item[1]}" class="${active(item[1])}">${item[0]}</a>`).join('');

  function render() {
    let mount = document.getElementById('siteNav');
    if (!mount) {
      const oldNav = document.querySelector('body > nav');
      const oldMenu = document.getElementById('mobileNav');
      if (!oldNav || !oldMenu) return;
      mount = document.createElement('header');
      mount.id = 'siteNav';
      oldNav.replaceWith(mount);
      oldMenu.remove();
    }
    mount.innerHTML = `
      <nav class="site-nav" aria-label="Primary navigation">
        <a href="index.html" class="nav-logo" aria-label="Heat District Productions home">
          <img src="images/optimized/logo-nav.webp" alt="" width="280" height="207">
        </a>
        <ul class="nav-links">
          <li class="nav-item-dropdown">
            <a href="services.html" class="nav-link-with-dropdown${productActive ? ' active' : ''}">Rentals &amp; Builds</a>
            <div class="nav-dropdown">${productLinks}</div>
          </li>${mainLinks}
        </ul>
        <a href="packages.html" class="nav-cta">Book Now</a>
        <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Open menu" aria-expanded="false" aria-controls="mobileNav" type="button"><span></span><span></span><span></span></button>
      </nav>
      <div class="mobile-nav" id="mobileNav" aria-hidden="true">
        <div class="mobile-products">
          <a href="services.html" class="mobile-products-link${productActive ? ' active' : ''}">Rentals &amp; Builds</a>
          <div class="mobile-nav-sub">${productLinks}</div>
        </div>
        <div class="mobile-nav-main">${mobileLinks}</div>
        <div class="mobile-nav-actions"><a href="packages.html" class="mobile-nav-book">Book Now</a></div>
      </div>`;
  }

  function init() {
    const button = document.getElementById('mobileMenuBtn');
    const menu = document.getElementById('mobileNav');
    if (!button || !menu) return;
    const close = () => {
      menu.classList.remove('open');button.classList.remove('active');button.setAttribute('aria-expanded','false');button.setAttribute('aria-label','Open menu');menu.setAttribute('aria-hidden','true');menu.setAttribute('inert','');document.body.classList.remove('mobile-menu-open');
    };
    const open = () => {
      menu.classList.add('open');button.classList.add('active');button.setAttribute('aria-expanded','true');button.setAttribute('aria-label','Close menu');menu.setAttribute('aria-hidden','false');menu.removeAttribute('inert');document.body.classList.add('mobile-menu-open');
      const first = menu.querySelector('a');if(first) first.focus();
    };
    menu.setAttribute('inert','');
    button.addEventListener('click',() => menu.classList.contains('open') ? close() : open());
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click',close));
    document.addEventListener('keydown',event => { if(event.key === 'Escape' && menu.classList.contains('open')) { close();button.focus(); } });
    document.addEventListener('click',event => { if(menu.classList.contains('open') && !menu.contains(event.target) && !button.contains(event.target)) close(); });
    window.addEventListener('resize',() => { if(window.innerWidth > 1120) close(); });
  }
  document.addEventListener('DOMContentLoaded',() => { render();init(); });
  if (!document.querySelector('script[src="js/section-intros.js"]')) {
    const sectionIntroScript = document.createElement('script');
    sectionIntroScript.src = 'js/section-intros.js';
    sectionIntroScript.defer = true;
    document.head.appendChild(sectionIntroScript);
  }
})();
