(function () {
  'use strict';

  let nextId = 0;
  const enhanced = new WeakSet();
  const enhancedNumbers = new WeakSet();

  function closeAll(except) {
    document.querySelectorAll('.theme-select.is-open').forEach(function (root) {
      if (root !== except) close(root);
    });
  }

  function close(root, restoreFocus) {
    if (!root) return;
    root.classList.remove('is-open');
    const button = root.querySelector('.theme-select-button');
    const list = root.querySelector('.theme-select-list');
    if (button) button.setAttribute('aria-expanded', 'false');
    if (list) list.hidden = true;
    const owner = root._themeLayerOwner;
    if (owner) owner.classList.remove('theme-dropdown-active');
    if (restoreFocus && button) button.focus();
  }

  function enhance(select) {
    if (!select || enhanced.has(select) || select.multiple || select.size > 1) return;
    enhanced.add(select);

    const id = 'theme-select-' + (++nextId);
    const root = document.createElement('div');
    root.className = 'theme-select';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'theme-select-button';
    button.setAttribute('aria-haspopup', 'listbox');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', id);

    const value = document.createElement('span');
    value.className = 'theme-select-value';
    button.appendChild(value);

    const list = document.createElement('ul');
    list.className = 'theme-select-list';
    list.id = id;
    list.role = 'listbox';
    list.hidden = true;

    select.parentNode.insertBefore(root, select);
    root.appendChild(select);
    root.appendChild(button);
    root.appendChild(list);
    select.classList.add('theme-select-native');
    select.tabIndex = -1;

    function rebuild() {
      list.replaceChildren();
      Array.from(select.options).forEach(function (option, index) {
        const item = document.createElement('li');
        item.className = 'theme-select-option';
        item.role = 'option';
        item.dataset.index = String(index);
        item.textContent = option.textContent;
        item.setAttribute('aria-selected', option.selected ? 'true' : 'false');
        if (option.disabled) {
          item.classList.add('is-disabled');
          item.setAttribute('aria-disabled', 'true');
        }
        list.appendChild(item);
      });
      sync();
    }

    function sync() {
      const selected = select.options[select.selectedIndex];
      renderValue(selected ? selected.textContent.trim() : 'Select an option');
      button.disabled = select.disabled;
      list.querySelectorAll('.theme-select-option').forEach(function (item) {
        const active = Number(item.dataset.index) === select.selectedIndex;
        item.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    }

    function renderValue(text) {
      value.replaceChildren();
      const match = text.match(/^([+$−-]?\d[\d,.]*(?:×\d+)?)(?:\s+)?(.*)$/);
      if (!match) {
        const plain = document.createElement('span');
        plain.className = 'theme-select-value-text';
        plain.textContent = text;
        value.appendChild(plain);
        return;
      }
      const number = document.createElement('span');
      number.className = 'theme-select-value-number';
      number.textContent = match[1];
      value.appendChild(number);
      if (match[2]) {
        const unit = document.createElement('span');
        unit.className = 'theme-select-value-text';
        unit.textContent = match[2];
        value.appendChild(unit);
      }
    }

    function open() {
      closeAll(root);
      sync();
      const owner = root.closest('.product-card, .addon-card, .pkg-card, .service-card, .package-card, article');
      root._themeLayerOwner = owner;
      if (owner) owner.classList.add('theme-dropdown-active');
      root.classList.add('is-open');
      button.setAttribute('aria-expanded', 'true');
      list.hidden = false;
      focusIndex(select.selectedIndex);
    }

    function focusIndex(index) {
      const items = Array.from(list.querySelectorAll('.theme-select-option:not(.is-disabled)'));
      items.forEach(function (item) { item.classList.remove('is-focused'); });
      const target = items.find(function (item) { return Number(item.dataset.index) === index; }) || items[0];
      if (target) {
        target.classList.add('is-focused');
        target.scrollIntoView({ block: 'nearest' });
      }
    }

    function move(direction) {
      const items = Array.from(list.querySelectorAll('.theme-select-option:not(.is-disabled)'));
      if (!items.length) return;
      let index = items.findIndex(function (item) { return item.classList.contains('is-focused'); });
      index = Math.max(0, Math.min(items.length - 1, index + direction));
      focusIndex(Number(items[index].dataset.index));
    }

    function choose(index) {
      const option = select.options[index];
      if (!option || option.disabled) return;
      select.selectedIndex = index;
      select.dispatchEvent(new Event('input', { bubbles: true }));
      select.dispatchEvent(new Event('change', { bubbles: true }));
      sync();
      close(root, true);
    }

    button.addEventListener('click', function (event) {
      event.stopPropagation();
      root.classList.contains('is-open') ? close(root) : open();
    });

    button.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (!root.classList.contains('is-open')) open();
        else move(event.key === 'ArrowDown' ? 1 : -1);
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (!root.classList.contains('is-open')) open();
        else {
          const focused = list.querySelector('.is-focused');
          if (focused) choose(Number(focused.dataset.index));
        }
      } else if (event.key === 'Escape') {
        event.preventDefault();
        close(root, true);
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        if (!root.classList.contains('is-open')) open();
        const items = list.querySelectorAll('.theme-select-option:not(.is-disabled)');
        const item = event.key === 'Home' ? items[0] : items[items.length - 1];
        if (item) focusIndex(Number(item.dataset.index));
      }
    });

    list.addEventListener('mousemove', function (event) {
      const item = event.target.closest('.theme-select-option:not(.is-disabled)');
      if (item) focusIndex(Number(item.dataset.index));
    });

    list.addEventListener('click', function (event) {
      event.stopPropagation();
      const item = event.target.closest('.theme-select-option:not(.is-disabled)');
      if (item) choose(Number(item.dataset.index));
    });

    select.addEventListener('change', sync);
    if (select.form) {
      select.form.addEventListener('reset', function () { setTimeout(sync, 0); });
    }
    new MutationObserver(rebuild).observe(select, { childList: true, subtree: true, attributes: true });
    rebuild();
  }

  function enhanceAll(root) {
    if (root.matches && root.matches('select')) enhance(root);
    if (root.querySelectorAll) root.querySelectorAll('select').forEach(enhance);
    if (root.matches && root.matches('input[type="number"]')) enhanceNumber(root);
    if (root.querySelectorAll) root.querySelectorAll('input[type="number"]').forEach(enhanceNumber);
  }

  function enhanceNumber(input) {
    if (!input || enhancedNumbers.has(input)) return;
    enhancedNumbers.add(input);

    const root = document.createElement('div');
    root.className = 'theme-number';
    const minus = document.createElement('button');
    const plus = document.createElement('button');
    minus.type = plus.type = 'button';
    minus.className = plus.className = 'theme-number-button';
    minus.textContent = '−';
    plus.textContent = '+';
    minus.setAttribute('aria-label', 'Decrease ' + (input.getAttribute('aria-label') || input.name || 'amount'));
    plus.setAttribute('aria-label', 'Increase ' + (input.getAttribute('aria-label') || input.name || 'amount'));

    input.parentNode.insertBefore(root, input);
    root.appendChild(minus);
    root.appendChild(input);
    root.appendChild(plus);

    function number(value, fallback) {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    }

    function limits() {
      return {
        min: input.min === '' ? -Infinity : number(input.min, -Infinity),
        max: input.max === '' ? Infinity : number(input.max, Infinity),
        step: input.step === '' || input.step === 'any' ? 1 : Math.abs(number(input.step, 1)) || 1
      };
    }

    function sync() {
      const range = limits();
      const current = number(input.value, range.min === -Infinity ? 0 : range.min);
      minus.disabled = input.disabled || current <= range.min;
      plus.disabled = input.disabled || current >= range.max;
    }

    function change(direction) {
      const range = limits();
      const fallback = range.min === -Infinity ? 0 : range.min;
      const current = number(input.value, fallback);
      const next = Math.max(range.min, Math.min(range.max, current + direction * range.step));
      input.value = String(Number(next.toFixed(10)));
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      sync();
    }

    minus.addEventListener('click', function () { change(-1); });
    plus.addEventListener('click', function () { change(1); });
    input.addEventListener('input', sync);
    input.addEventListener('change', sync);
    if (input.form) input.form.addEventListener('reset', function () { setTimeout(sync, 0); });
    new MutationObserver(sync).observe(input, { attributes: true });
    sync();
  }

  function enhanceHomeEventFinder() {
    const tabList = document.querySelector('.event-tabs');
    const panel = document.getElementById('eventPanel');
    const image = document.getElementById('eventImage');
    const number = document.getElementById('eventNumber');
    const eyebrow = document.getElementById('eventEyebrow');
    const heading = document.getElementById('eventHeading');
    const description = document.getElementById('eventDescription');
    const link = document.getElementById('eventLink');

    if (!tabList || !panel || !image || !number || !eyebrow || !heading || !description || !link) return;
    if (tabList.dataset.themeEventFinderReady === 'true') return;
    tabList.dataset.themeEventFinderReady = 'true';

    const events = {
      wedding: {
        n: '01',
        label: 'Weddings',
        eyebrow: 'Elegant, never expected',
        heading: 'A reception with a pulse.',
        description: 'Clean ceremony sound, a confident MC, intentional lighting and a dance floor that feels alive from the first entrance to the last song.',
        image: 'gallery/optimized/hero-feature.webp',
        alt: 'Elegant South Florida wedding celebration produced by Heat District',
        link: 'Explore wedding-ready packages'
      },
      quince: {
        n: '02',
        label: 'Quinces',
        eyebrow: 'A milestone in full color',
        heading: 'Her entrance. Her energy.',
        description: 'A polished production that moves from spotlight moments to a packed dance floor, with lighting and music shaped around the celebration.',
        image: 'gallery/optimized/event-photo-2.webp',
        alt: 'Colorful South Florida quince celebration produced by Heat District',
        link: 'Explore quince-ready packages'
      },
      party: {
        n: '03',
        label: 'Birthdays + Private Events',
        eyebrow: 'Your idea, fully produced',
        heading: 'A private celebration with presence.',
        description: 'From milestone birthdays to private parties, we build the sound, lighting and production around the venue, guest list and energy you want.',
        image: 'gallery/optimized/event-photo-4.webp',
        alt: 'Birthday and private event atmosphere with professional Heat District production',
        link: 'Explore party-ready packages'
      },
      school: {
        n: '04',
        label: 'Schools',
        eyebrow: 'School events, fully produced',
        heading: 'Make the school event feel bigger.',
        description: 'Graduations, proms, dances and school celebrations with professional sound, DJ, lighting, effects and production scaled to the venue and crowd.',
        image: 'gallery/party-galleries/2026%20Highschool%20Graduation/DSC02655.jpg',
        alt: '2026 South Florida high school graduation produced by Heat District Productions',
        link: 'Explore school-ready packages'
      }
    };

    const keys = ['wedding', 'quince', 'party', 'school'];
    const buttons = keys.map(function (key, index) {
      const button = document.createElement('button');
      button.className = 'event-tab';
      button.type = 'button';
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      button.dataset.event = key;
      button.textContent = events[key].label;
      return button;
    });

    tabList.replaceChildren.apply(tabList, buttons);

    function activate(button) {
      const item = events[button.dataset.event];
      if (!item) return;
      buttons.forEach(function (tab) { tab.setAttribute('aria-selected', 'false'); });
      button.setAttribute('aria-selected', 'true');
      image.src = item.image;
      image.alt = item.alt;
      number.textContent = item.n;
      eyebrow.textContent = item.eyebrow;
      heading.textContent = item.heading;
      description.textContent = item.description;
      link.textContent = item.link;
    }

    buttons.forEach(function (button, index) {
      button.addEventListener('click', function () { activate(button); });
      button.addEventListener('keydown', function (event) {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
        event.preventDefault();
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const next = (index + direction + buttons.length) % buttons.length;
        buttons[next].focus();
        activate(buttons[next]);
      });
    });

    activate(buttons[0]);
  }

  function enhanceGalleryViewerNavigation() {
    const viewer = document.getElementById('galleryViewer');
    if (!viewer || viewer.dataset.themeSideNavReady === 'true') return;

    const panel = viewer.querySelector('.gallery-viewer-panel');
    const controls = viewer.querySelector('.gallery-viewer-controls');
    const previous = viewer.querySelector('[data-viewer-prev]');
    const next = viewer.querySelector('[data-viewer-next]');
    if (!panel || !controls || !previous || !next) return;

    viewer.dataset.themeSideNavReady = 'true';
    controls.classList.add('gallery-viewer-count-only');

    previous.className = 'gallery-viewer-side-arrow gallery-viewer-side-arrow-prev';
    next.className = 'gallery-viewer-side-arrow gallery-viewer-side-arrow-next';
    previous.textContent = '‹';
    next.textContent = '›';
    previous.setAttribute('aria-label', 'Previous gallery item');
    next.setAttribute('aria-label', 'Next gallery item');

    panel.appendChild(previous);
    panel.appendChild(next);

    if (!document.getElementById('theme-gallery-side-nav-style')) {
      const style = document.createElement('style');
      style.id = 'theme-gallery-side-nav-style';
      style.textContent = [
        '.gallery-viewer-controls.gallery-viewer-count-only{justify-content:center;min-height:32px}',
        '.gallery-viewer-side-arrow{position:absolute;z-index:8;top:50%;display:grid;place-items:center;width:52px;height:72px;padding:0;border:1px solid rgba(0,240,255,.34);border-radius:999px;background:rgba(5,5,15,.82);backdrop-filter:blur(10px);color:#fff;font-size:2.35rem;font-weight:300;line-height:1;cursor:pointer;transform:translateY(-50%);transition:border-color .2s ease,color .2s ease,background .2s ease,box-shadow .2s ease}',
        '.gallery-viewer-side-arrow:hover,.gallery-viewer-side-arrow:focus-visible{border-color:#00f0ff;color:#00f0ff;background:rgba(5,5,15,.94);box-shadow:0 0 22px rgba(0,240,255,.16);outline:none}',
        '.gallery-viewer-side-arrow-prev{left:10px}',
        '.gallery-viewer-side-arrow-next{right:10px}',
        '@media(max-width:760px){.gallery-viewer-side-arrow{width:42px;height:58px;font-size:1.9rem}.gallery-viewer-side-arrow-prev{left:5px}.gallery-viewer-side-arrow-next{right:5px}}'
      ].join('');
      document.head.appendChild(style);
    }
  }

  document.addEventListener('click', function (event) {
    if (!event.target.closest('.theme-select')) closeAll();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeAll();
  });

  function start() {
    enhanceAll(document);
    enhanceHomeEventFinder();
    enhanceGalleryViewerNavigation();
    new MutationObserver(function (records) {
      records.forEach(function (record) {
        record.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) enhanceAll(node);
        });
      });
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
