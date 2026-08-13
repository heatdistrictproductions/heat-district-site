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
    const mount = document.getElementById('siteNav');
    if (!mount) return;
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
        <a href="contact.html" class="nav-cta">Request Quote</a>
        <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Open menu" aria-expanded="false" aria-controls="mobileNav" type="button"><span></span><span></span><span></span></button>
      </nav>
      <div class="mobile-nav" id="mobileNav" aria-hidden="true">
        <details class="mobile-products"${productActive ? ' open' : ''}>
          <summary>Rentals &amp; Builds</summary>
          <div class="mobile-nav-sub">${productLinks}</div>
        </details>
        <div class="mobile-nav-main">${mobileLinks}</div>
        <div class="mobile-nav-actions"><a href="packages.html">View Packages</a><a href="contact.html" class="mobile-nav-book">Request Quote</a></div>
      </div>`;
  }

  function init() {
    const button = document.getElementById('mobileMenuBtn');
    const menu = document.getElementById('mobileNav');
    if (!button || !menu) return;
    const close = () => {
      menu.classList.remove('open');button.classList.remove('active');button.setAttribute('aria-expanded','false');button.setAttribute('aria-label','Open menu');menu.setAttribute('aria-hidden','true');document.body.classList.remove('mobile-menu-open');
    };
    const open = () => {
      menu.classList.add('open');button.classList.add('active');button.setAttribute('aria-expanded','true');button.setAttribute('aria-label','Close menu');menu.setAttribute('aria-hidden','false');document.body.classList.add('mobile-menu-open');
      const first = menu.querySelector('summary');if(first) first.focus();
    };
    button.addEventListener('click',() => menu.classList.contains('open') ? close() : open());
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click',close));
    document.addEventListener('keydown',event => { if(event.key === 'Escape' && menu.classList.contains('open')) { close();button.focus(); } });
    document.addEventListener('click',event => { if(menu.classList.contains('open') && !menu.contains(event.target) && !button.contains(event.target)) close(); });
    window.addEventListener('resize',() => { if(window.innerWidth > 900) close(); });
  }
  document.addEventListener('DOMContentLoaded',() => { render();init(); });
})();
