/* Heat District shared section-intro pattern assignments. */
(function () {
  'use strict';

  function decorate(host, eyebrow, title, copy, pattern, wrap) {
    if (!host || !eyebrow || !title || host.dataset.hdIntroReady === 'true') return false;

    var intro = host;

    if (wrap) {
      intro = document.createElement('div');
      host.insertBefore(intro, eyebrow);
      intro.appendChild(eyebrow);
      intro.appendChild(title);
      if (copy) intro.appendChild(copy);
    }

    intro.classList.add('hd-section-intro', 'hd-pattern-' + pattern);
    intro.dataset.hdPattern = pattern.toUpperCase();
    eyebrow.classList.add('hd-intro-eyebrow');
    title.classList.add('hd-intro-title');
    if (copy) copy.classList.add('hd-intro-copy');
    host.dataset.hdIntroReady = 'true';
    return true;
  }

  function decorateExisting(host, pattern, selectors) {
    if (!host) return false;
    return decorate(
      host,
      host.querySelector(selectors.eyebrow),
      host.querySelector(selectors.title),
      host.querySelector(selectors.copy),
      pattern,
      false
    );
  }

  function wrapLeading(host, pattern, selectors) {
    if (!host) return false;
    return decorate(
      host,
      host.querySelector(':scope > ' + selectors.eyebrow),
      host.querySelector(':scope > ' + selectors.title),
      host.querySelector(':scope > ' + selectors.copy),
      pattern,
      true
    );
  }

  function applySequence(nodes, patterns, action) {
    Array.prototype.forEach.call(nodes, function (node, index) {
      action(node, patterns[index % patterns.length]);
    });
  }

  function init() {
    var page = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    var standard = {
      eyebrow: '.section-label',
      title: '.section-title',
      copy: '.section-sub'
    };

    if (page === 'index.html' || page === '') {
      applySequence(document.querySelectorAll('.section-head'), ['b', 'a', 'c', 'b', 'a'], function (node, pattern) {
        decorateExisting(node, pattern, { eyebrow: '.eyebrow', title: 'h2', copy: ':scope > p' });
      });
    }

    if (page === 'services.html' || page === 'addons.html') {
      applySequence(document.querySelectorAll('.section-block'), ['b', 'a', 'c'], function (node, pattern) {
        wrapLeading(node, pattern, standard);
      });

      if (page === 'addons.html') {
        wrapLeading(document.querySelector('main > section:first-of-type'), 'b', standard);
      }
    }

    if (page === 'team.html') {
      applySequence(document.querySelectorAll('.section-block'), ['a', 'b', 'c', 'a', 'c'], function (node, pattern) {
        wrapLeading(node, pattern, standard);
      });
    }

    if (page === 'packages.html') {
      [
        ['.packages-section', 'b', { eyebrow: '.packages-label', title: '.packages-title', copy: '.packages-sub' }],
        ['.comparison-wrap', 'a', { eyebrow: '.comparison-label', title: '.comparison-title', copy: '.comparison-sub' }],
        ['.funnel-section', 'c', { eyebrow: '.funnel-label', title: '.funnel-title', copy: '.funnel-sub' }]
      ].forEach(function (item) { wrapLeading(document.querySelector(item[0]), item[1], item[2]); });
    }

    if (page === 'gallery.html') {
      document.querySelector('.featured-work-intro')?.setAttribute('data-hd-pattern', 'A');
      document.querySelector('.party-directory-header')?.setAttribute('data-hd-pattern', 'B');
      var galleryCta = document.querySelector('.cta-section');
      if (galleryCta) {
        var galleryEyebrow = document.createElement('span');
        galleryCta.insertBefore(galleryEyebrow, galleryCta.querySelector(':scope > h2'));
        decorate(galleryCta, galleryEyebrow, galleryCta.querySelector(':scope > h2'), galleryCta.querySelector(':scope > p'), 'c', true);
      }
    }

    if (page === 'faq.html') {
      decorateExisting(document.querySelector('.faq-intro .intro-card:first-child'), 'b', { eyebrow: '.intro-kicker', title: '.intro-title', copy: '.intro-copy' });
      applySequence(document.querySelectorAll('.faq-section'), ['c', 'a', 'c', 'b', 'c', 'a'], function (node, pattern) {
        var head = node.querySelector(':scope > .section-head');
        if (!head) return;
        head.classList.add('hd-faq-intro', 'hd-faq-pattern-' + pattern);
        head.dataset.hdPattern = pattern.toUpperCase();
      });
    }

    if (page === 'contact.html') {
      [
        ['.contact-panel', 'a'],
        ['.path-panel', 'c'],
        ['.form-panel', 'b']
      ].forEach(function (item) {
        wrapLeading(document.querySelector(item[0]), item[1], { eyebrow: '.panel-kicker', title: '.panel-title', copy: '.panel-copy' });
      });
    }

    if (document.querySelector('.category-hero')) {
      decorateExisting(document.querySelector('.intro-grid > div:first-child'), 'a', { eyebrow: '.section-label', title: 'h2', copy: ':scope > p' });
      wrapLeading(document.querySelector('.options-section'), 'b', { eyebrow: '.section-label', title: 'h2', copy: 'p' });
      wrapLeading(document.querySelector('.seo-detail'), 'c', { eyebrow: '.section-label', title: 'h2', copy: 'p' });
      wrapLeading(document.querySelector('.faq'), 'a', { eyebrow: '.section-label', title: 'h2', copy: 'p' });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
