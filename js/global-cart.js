/* =========================================================
   Heat District Productions — Universal Global Cart
   File path: js/global-cart.js
   Requires CSS from css/global.css

   Full replacement version:
   - Uses the current package names
   - Warns when an add-on is already included in a package
   - Warns when selected add-ons overlap with each other
   - Warns before increasing the exact same add-on again
   - Keeps the floating global cart working
   - Prevents an old product-build cart from replacing a package
   ========================================================= */

(function () {
  'use strict';

  const GLOBAL_CART_VERSION = '2026-07-16-4';
  window.HeatDistrictGlobalCartVersion = GLOBAL_CART_VERSION;

  const PRODUCT_CART_KEY = 'heatDistrictBuildCart';
  const PRODUCT_ORDER_KEY = 'heatDistrictProductOrder';
  const ESTIMATE_KEY = 'heatDistrictEstimate';
  const SELECTED_PACKAGE_KEY = 'heatDistrictSelectedPackage';

  const DISABLED_GLOBAL_CART_PAGES = ['services.html'];

  const RENTAL_CATEGORY_PAGES = [
    'sound-system-rentals.html',
    'event-lighting-rentals.html',
    'dj-equipment-rentals.html',
    'photo-booth-rentals.html',
    'event-photography-videography.html',
    'special-effects-rentals.html',
    'led-wall-rentals.html',
    'table-chair-rentals.html',
    'staging-trussing-rentals.html'
  ];

  // Some pages attach their own close-menu click handlers. Handle category
  // navigation first so a normal tap always reaches the dedicated page.
  document.addEventListener('click', function (event) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const link = event.target.closest(
      '.nav-dropdown a, .mobile-nav-sub a'
    );

    if (!link) {
      return;
    }

    const destination = new URL(link.href, window.location.href);
    const destinationPage = destination.pathname.split('/').pop();

    if (RENTAL_CATEGORY_PAGES.indexOf(destinationPage) === -1) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.assign(destination.href);
  }, true);

  const PACKAGE_ALIASES = {
    'The Spark': 'Essential Package',
    'The Blaze': 'Signature Package',
    'The Inferno': 'Premier Package',
    'The District': 'Elite Production Package'
  };

  const PACKAGE_DUPLICATE_MAP = {
    'Essential Package': {
      'pa-speaker-single':
        'The Essential Package already includes a sound system with top speakers.',

      'additional-speaker-single':
        'The Essential Package already includes a sound system with top speakers.',

      'additional-subwoofer-single':
        'The Essential Package already includes subwoofers.',

      'microphone-single':
        'The Essential Package already includes a microphone.',

      'glow-lighting-package':
        'The Essential Package already includes 5 uplights and an LED light bar.',

      'pulse-lighting-package':
        'The Essential Package already includes uplights and an LED light bar. This package would add more lighting and moving heads.',

      'district-lighting-package':
        'The Essential Package already includes uplights and an LED light bar. This package would add more lighting and effects.',

      'uplights-5-pack':
        'The Essential Package already includes 5 uplights.',

      'uplights-10-pack':
        'The Essential Package already includes 5 uplights.',

      'uplights-15-pack':
        'The Essential Package already includes 5 uplights.',

      'light-bar-single':
        'The Essential Package already includes an LED light bar.'
    },

    'Signature Package': {
      'pa-speaker-single':
        'The Signature Package already includes a sound system.',

      'additional-speaker-single':
        'The Signature Package already includes a sound system.',

      'additional-subwoofer-single':
        'The Signature Package already includes subwoofers.',

      'microphone-single':
        'The Signature Package already includes a microphone.',

      'glow-lighting-package':
        'The Signature Package already includes 10 uplights and an LED light bar.',

      'pulse-lighting-package':
        'The Signature Package already includes 10 uplights, an LED light bar, 2 moving heads, and 2 totems.',

      'district-lighting-package':
        'The Signature Package already includes uplights, an LED light bar, moving heads, fog machines, and totems.',

      'uplights-5-pack':
        'The Signature Package already includes 10 uplights.',

      'uplights-10-pack':
        'The Signature Package already includes 10 uplights.',

      'uplights-15-pack':
        'The Signature Package already includes 10 uplights.',

      'light-bar-single':
        'The Signature Package already includes an LED light bar.',

      'moving-heads-solo':
        'The Signature Package already includes 2 moving head lights.',

      'moving-heads-2-heads-2-totems':
        'The Signature Package already includes 2 moving heads and 2 totems.',

      'moving-heads-2-heads-goal-post':
        'The Signature Package already includes 2 moving heads and trussing.',

      'moving-heads-4-heads-4-totems':
        'The Signature Package already includes moving heads and trussing.',

      'moving-heads-4-heads-goal-post':
        'The Signature Package already includes moving heads and trussing.',

      'moving-heads-4-heads-2-totems-goal-post':
        'The Signature Package already includes moving heads and trussing.',

      'photo-booth-digital-only':
        'The Signature Package already includes a premium photo booth.',

      'photo-booth-digital-print':
        'The Signature Package already includes a premium photo booth.',

      'photo-booth-360':
        'The Signature Package already includes a premium photo booth. Add the 360 booth only if you want a second or different booth experience.',

      'red-carpet-10ft':
        'The Signature Package already includes a 10ft red carpet with stanchions and velvet ropes.',

      'red-carpet-20ft':
        'The Signature Package already includes a 10ft red carpet with stanchions and velvet ropes.',

      'fog-machines-2-units':
        'The Signature Package already includes 2 fog machines.',

      'trussing-2-totems':
        'The Signature Package already includes 2 totems.',

      'trussing-4-totems':
        'The Signature Package already includes trussing.',

      'trussing-goal-post-8x10':
        'The Signature Package already includes trussing.',

      'trussing-goal-post-8x16':
        'The Signature Package already includes trussing.'
    },

    'Premier Package': {
      'pa-speaker-single':
        'The Premier Package already includes a sound system.',

      'additional-speaker-single':
        'The Premier Package already includes a sound system.',

      'additional-subwoofer-single':
        'The Premier Package already includes subwoofers.',

      'microphone-single':
        'The Premier Package already includes a microphone.',

      'glow-lighting-package':
        'The Premier Package already includes uplighting and an LED light bar.',

      'pulse-lighting-package':
        'The Premier Package already includes uplighting, an LED light bar, moving heads, fog machines, and trussing.',

      'district-lighting-package':
        'The Premier Package already includes 15 uplights, an LED light bar, 4 moving heads, 2 fog machines, and trussing.',

      'uplights-5-pack':
        'The Premier Package already includes 15 uplights.',

      'uplights-10-pack':
        'The Premier Package already includes 15 uplights.',

      'uplights-15-pack':
        'The Premier Package already includes 15 uplights.',

      'light-bar-single':
        'The Premier Package already includes an LED light bar.',

      'moving-heads-solo':
        'The Premier Package already includes 4 moving head lights.',

      'moving-heads-2-heads-2-totems':
        'The Premier Package already includes 4 moving heads and trussing.',

      'moving-heads-2-heads-goal-post':
        'The Premier Package already includes 4 moving heads and trussing.',

      'moving-heads-4-heads-4-totems':
        'The Premier Package already includes 4 moving heads and a trussing option.',

      'moving-heads-4-heads-goal-post':
        'The Premier Package already includes 4 moving heads and a trussing option.',

      'moving-heads-4-heads-2-totems-goal-post':
        'The Premier Package already includes 4 moving heads and a trussing option.',

      'photo-booth-digital-only':
        'The Premier Package already includes a premium photo booth.',

      'photo-booth-digital-print':
        'The Premier Package already includes a premium photo booth.',

      'photo-booth-360':
        'The Premier Package already includes a premium photo booth. Add the 360 booth only if you want a second or different booth experience.',

      'red-carpet-10ft':
        'The Premier Package already includes a 10ft red carpet with stanchions and velvet ropes.',

      'red-carpet-20ft':
        'The Premier Package already includes a 10ft red carpet with stanchions and velvet ropes.',

      'led-glow-cocktail-table':
        'The Premier Package already includes LED glow cocktail tables.',

      'foam-glow-sticks-pack-25':
        'The Premier Package already includes foam glow sticks.',

      'cold-sparks-2-units':
        'The Premier Package already includes 2 cold spark machines.',

      'cold-sparks-4-units':
        'The Premier Package already includes 2 cold spark machines.',

      'co2-led-gun-1-unit':
        'The Premier Package already includes a CO2 LED gun.',

      'fog-machines-2-units':
        'The Premier Package already includes 2 fog machines.',

      'trussing-2-totems':
        'The Premier Package already includes a trussing option.',

      'trussing-4-totems':
        'The Premier Package already includes a trussing option.',

      'trussing-goal-post-8x10':
        'The Premier Package already includes a trussing option.',

      'trussing-goal-post-8x16':
        'The Premier Package already includes a trussing option.'
    },

    'Elite Production Package': {
      'pa-speaker-single':
        'The Elite Production Package already includes a sound system.',

      'additional-speaker-single':
        'The Elite Production Package already includes a sound system.',

      'additional-subwoofer-single':
        'The Elite Production Package already includes subwoofers.',

      'microphone-single':
        'The Elite Production Package already includes a microphone.',

      'glow-lighting-package':
        'The Elite Production Package already includes uplighting and an LED light bar.',

      'pulse-lighting-package':
        'The Elite Production Package already includes uplighting, an LED light bar, moving heads, fog machines, and trussing.',

      'district-lighting-package':
        'The Elite Production Package already includes 15 uplights, an LED light bar, 4 moving heads, 2 fog machines, and trussing.',

      'uplights-5-pack':
        'The Elite Production Package already includes 15 uplights.',

      'uplights-10-pack':
        'The Elite Production Package already includes 15 uplights.',

      'uplights-15-pack':
        'The Elite Production Package already includes 15 uplights.',

      'light-bar-single':
        'The Elite Production Package already includes an LED light bar.',

      'moving-heads-solo':
        'The Elite Production Package already includes 4 moving head lights.',

      'moving-heads-2-heads-2-totems':
        'The Elite Production Package already includes 4 moving heads and trussing.',

      'moving-heads-2-heads-goal-post':
        'The Elite Production Package already includes 4 moving heads and trussing.',

      'moving-heads-4-heads-4-totems':
        'The Elite Production Package already includes 4 moving heads and a trussing option.',

      'moving-heads-4-heads-goal-post':
        'The Elite Production Package already includes 4 moving heads and a trussing option.',

      'moving-heads-4-heads-2-totems-goal-post':
        'The Elite Production Package already includes 4 moving heads and a trussing option.',

      'led-wall-floor':
        'The Elite Production Package already includes an LED screen / wall.',

      'led-wall-2-totems':
        'The Elite Production Package already includes an LED screen / wall and trussing.',

      'led-screen-wall':
        'The Elite Production Package already includes an LED screen / wall.',

      'photo-booth-digital-only':
        'The Elite Production Package already includes a premium photo booth.',

      'photo-booth-digital-print':
        'The Elite Production Package already includes a premium photo booth.',

      'photo-booth-360':
        'The Elite Production Package already includes a premium photo booth. Add the 360 booth only if you want a second or different booth experience.',

      'red-carpet-10ft':
        'The Elite Production Package already includes a 20ft red carpet with stanchions and velvet ropes.',

      'red-carpet-20ft':
        'The Elite Production Package already includes a 20ft red carpet with stanchions and velvet ropes.',

      'led-glow-cocktail-table':
        'The Elite Production Package already includes LED glow cocktail tables.',

      'foam-glow-sticks-pack-25':
        'The Elite Production Package already includes foam glow sticks.',

      'photography-50':
        'The Elite Production Package already includes photography.',

      'photography-100':
        'The Elite Production Package already includes photography.',

      'photography-150':
        'The Elite Production Package already includes photography.',

      'photography-250':
        'The Elite Production Package already includes photography.',

      'cold-sparks-2-units':
        'The Elite Production Package already includes 4 cold spark machines.',

      'cold-sparks-4-units':
        'The Elite Production Package already includes 4 cold spark machines.',

      'co2-led-gun-1-unit':
        'The Elite Production Package already includes a CO2 LED gun.',

      'co2-cannons-2-units':
        'The Elite Production Package already includes 2 CO2 cannons.',

      'fog-machines-2-units':
        'The Elite Production Package already includes 2 fog machines.',

      'trussing-2-totems':
        'The Elite Production Package already includes a trussing option.',

      'trussing-4-totems':
        'The Elite Production Package already includes a trussing option.',

      'trussing-goal-post-8x10':
        'The Elite Production Package already includes a trussing option.',

      'trussing-goal-post-8x16':
        'The Elite Production Package already includes a trussing option.'
    }
  };

  const ADDON_FEATURES = {
    'pa-speaker-single': ['sound', 'top-speaker'],
    'additional-speaker-single': ['sound', 'top-speaker'],
    'additional-subwoofer-single': ['sound', 'subwoofer'],
    'microphone-single': ['microphone'],

    'photography-50': ['photography'],
    'photography-100': ['photography'],
    'photography-150': ['photography'],
    'photography-250': ['photography'],

    'videography-15': ['videography'],
    'videography-30': ['videography'],
    'videography-45': ['videography'],
    'videography-60': ['videography'],

    'photo-booth-digital-only': ['photo-booth'],
    'photo-booth-digital-print': ['photo-booth'],
    'photo-booth-360': ['photo-booth'],

    'red-carpet-10ft': ['red-carpet'],
    'red-carpet-20ft': ['red-carpet'],

    'foam-glow-sticks-pack-25': ['glow-sticks'],
    'led-glow-cocktail-table': ['cocktail-tables'],

    'glow-lighting-package': [
      'uplights',
      'light-bar'
    ],

    'pulse-lighting-package': [
      'uplights',
      'light-bar',
      'moving-heads',
      'totems'
    ],

    'district-lighting-package': [
      'uplights',
      'light-bar',
      'moving-heads',
      'wash-lights',
      'fog'
    ],

    'uplights-5-pack': ['uplights'],
    'uplights-10-pack': ['uplights'],
    'uplights-15-pack': ['uplights'],
    'light-bar-single': ['light-bar'],

    'moving-heads-solo': [
      'moving-heads'
    ],

    'moving-heads-2-heads-2-totems': [
      'moving-heads',
      'totems'
    ],

    'moving-heads-2-heads-goal-post': [
      'moving-heads',
      'goal-post'
    ],

    'moving-heads-4-heads-4-totems': [
      'moving-heads',
      'totems'
    ],

    'moving-heads-4-heads-goal-post': [
      'moving-heads',
      'goal-post'
    ],

    'moving-heads-4-heads-2-totems-goal-post': [
      'moving-heads',
      'totems',
      'goal-post'
    ],

    'beam-140sr-solo': [
      'beam-moving-heads'
    ],

    'beam-140sr-2-heads-2-totems': [
      'beam-moving-heads',
      'totems'
    ],

    'beam-140sr-2-heads-goal-post': [
      'beam-moving-heads',
      'goal-post'
    ],

    'beam-140sr-4-heads-4-totems': [
      'beam-moving-heads',
      'totems'
    ],

    'beam-140sr-4-heads-goal-post': [
      'beam-moving-heads',
      'goal-post'
    ],

    'beam-140sr-4-heads-2-totems-goal-post': [
      'beam-moving-heads',
      'totems',
      'goal-post'
    ],

    'wash-lights-2-units': ['wash-lights'],

    'cold-sparks-2-units': ['cold-sparks'],
    'cold-sparks-4-units': ['cold-sparks'],

    'co2-cannons-2-units': ['co2-cannons'],
    'co2-led-gun-1-unit': ['co2-gun'],

    'fog-machines-2-units': ['fog'],
    'adj-disco-ball-20in': ['disco-ball'],

    'led-wall-floor': [
      'led-wall'
    ],

    'led-wall-2-totems': [
      'led-wall',
      'totems'
    ],

    'led-screen-wall': [
      'led-wall',
      'goal-post'
    ],

    'premium-club-mixer-cdj-package': [
      'cdj',
      'mixer'
    ],

    'cdj-3000-single': ['cdj'],
    'djm-900nxs2': ['mixer'],
    'xdj-xz': ['all-in-one-dj'],
    'rmx-1000': ['dj-effects'],

    'trussing-2-totems': ['totems'],
    'trussing-4-totems': ['totems'],
    'trussing-goal-post-8x10': ['goal-post'],
    'trussing-goal-post-8x16': ['goal-post']
  };

  const FEATURE_LABELS = {
    sound: 'sound equipment',
    'top-speaker': 'top speakers',
    subwoofer: 'subwoofers',
    microphone: 'a microphone',
    photography: 'photography',
    videography: 'videography',
    'photo-booth': 'a photo booth',
    'red-carpet': 'a red carpet setup',
    'glow-sticks': 'foam glow sticks',
    'cocktail-tables': 'LED glow cocktail tables',
    uplights: 'uplights',
    'light-bar': 'an LED light bar',
    'moving-heads': 'moving head lights',
    'beam-moving-heads': 'beam moving head lights',
    'wash-lights': 'wash lights',
    totems: 'truss totems',
    'goal-post': 'a truss goal post',
    fog: 'fog machines',
    'cold-sparks': 'cold spark machines',
    'co2-cannons': 'CO2 cannons',
    'co2-gun': 'a CO2 LED gun',
    'disco-ball': 'a disco ball',
    'led-wall': 'an LED wall',
    cdj: 'CDJ players',
    mixer: 'a DJ mixer',
    'all-in-one-dj': 'an all-in-one DJ system',
    'dj-effects': 'a DJ effects unit'
  };

  let lastSnapshot = '';
  let duplicateBypass = false;
  let originalGetDuplicateWarning = null;

  function safeJsonParse(value) {
    try {
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  }

  function escapeHTML(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatMoney(value) {
    return '$' + Number(value || 0).toLocaleString();
  }

  function normalizePackageName(name) {
    const cleanName = String(name || '').trim();

    return PACKAGE_ALIASES[cleanName] || cleanName;
  }

  function getCurrentPageName() {
    const path = window.location.pathname || '';
    const page = path.split('/').pop();

    return page ? page.toLowerCase() : 'index.html';
  }

  function isGlobalCartDisabledOnThisPage() {
    return DISABLED_GLOBAL_CART_PAGES.includes(
      getCurrentPageName()
    );
  }

  function getProductCart() {
    const cart = safeJsonParse(
      sessionStorage.getItem(PRODUCT_CART_KEY)
    );

    return Array.isArray(cart) ? cart : [];
  }

  function saveProductCart(cart) {
    sessionStorage.setItem(
      PRODUCT_CART_KEY,
      JSON.stringify(cart)
    );
  }

  function getEstimate() {
    const estimate = safeJsonParse(
      sessionStorage.getItem(ESTIMATE_KEY)
    );

    return estimate && typeof estimate === 'object'
      ? estimate
      : null;
  }

  function saveEstimate(estimate) {
    sessionStorage.setItem(
      ESTIMATE_KEY,
      JSON.stringify(estimate)
    );
  }

  function getSelectedPackageName() {
    const estimate = getEstimate();

    if (estimate && estimate.package) {
      return normalizePackageName(estimate.package);
    }

    const selectedPackage = safeJsonParse(
      sessionStorage.getItem(SELECTED_PACKAGE_KEY)
    );

    return normalizePackageName(
      selectedPackage && selectedPackage.name
        ? selectedPackage.name
        : ''
    );
  }

  function getPackageWarning(optionId) {
    const packageName = getSelectedPackageName();
    const warnings = PACKAGE_DUPLICATE_MAP[packageName];

    return warnings
      ? warnings[optionId] || ''
      : '';
  }

  function getFeatures(optionId) {
    return Array.isArray(ADDON_FEATURES[optionId])
      ? ADDON_FEATURES[optionId]
      : [];
  }

  function getSharedFeatures(
    firstOptionId,
    secondOptionId
  ) {
    const firstFeatures = getFeatures(firstOptionId);
    const secondFeatures = getFeatures(secondOptionId);

    return firstFeatures.filter(function (feature) {
      return secondFeatures.includes(feature);
    });
  }

  function joinNaturalLanguage(items) {
    const cleanItems = items.filter(Boolean);

    if (!cleanItems.length) {
      return '';
    }

    if (cleanItems.length === 1) {
      return cleanItems[0];
    }

    if (cleanItems.length === 2) {
      return cleanItems[0] + ' and ' + cleanItems[1];
    }

    return (
      cleanItems.slice(0, -1).join(', ') +
      ', and ' +
      cleanItems[cleanItems.length - 1]
    );
  }

  function getSelectedAddonOverlapWarning(option) {
    const estimate = getEstimate();

    const selectedAddons =
      estimate && Array.isArray(estimate.addons)
        ? estimate.addons
        : [];

    const conflicts = [];

    selectedAddons.forEach(function (selectedAddon) {
      if (
        !selectedAddon ||
        selectedAddon.id === option.id
      ) {
        return;
      }

      const sharedFeatures = getSharedFeatures(
        option.id,
        selectedAddon.id
      );

      if (!sharedFeatures.length) {
        return;
      }

      const featureNames = sharedFeatures.map(
        function (feature) {
          return (
            FEATURE_LABELS[feature] ||
            feature.replace(/-/g, ' ')
          );
        }
      );

      conflicts.push(
        (selectedAddon.name ||
          'Another selected add-on') +
          ' already includes ' +
          joinNaturalLanguage(featureNames)
      );
    });

    if (!conflicts.length) {
      return '';
    }

    return joinNaturalLanguage(conflicts) + '.';
  }

  function getCombinedDuplicateWarning(option) {
    if (!option || !option.id) {
      return '';
    }

    const messages = [];
    const packageWarning = getPackageWarning(option.id);

    const addonWarning =
      getSelectedAddonOverlapWarning(option);

    if (packageWarning) {
      messages.push(packageWarning);
    }

    if (addonWarning) {
      messages.push(addonWarning);
    }

    return messages.join('\n\n');
  }

  function patchNativeDuplicateSystem() {
    try {
      if (
        typeof PACKAGE_DUPLICATE_WARNINGS !==
        'undefined'
      ) {
        Object.keys(PACKAGE_DUPLICATE_MAP).forEach(
          function (packageName) {
            PACKAGE_DUPLICATE_WARNINGS[
              packageName
            ] = Object.assign(
              {},
              PACKAGE_DUPLICATE_WARNINGS[
                packageName
              ] || {},
              PACKAGE_DUPLICATE_MAP[packageName]
            );
          }
        );
      }
    } catch (error) {
      console.warn(
        'Could not patch package duplicate warnings.',
        error
      );
    }

    try {
      if (
        typeof PACKAGE_NAMES_WITH_LIGHTING !==
        'undefined'
      ) {
        [
          'Essential Package',
          'Signature Package',
          'Premier Package',
          'Elite Production Package'
        ].forEach(function (packageName) {
          if (
            !PACKAGE_NAMES_WITH_LIGHTING.includes(
              packageName
            )
          ) {
            PACKAGE_NAMES_WITH_LIGHTING.push(
              packageName
            );
          }
        });
      }
    } catch (error) {
      console.warn(
        'Could not patch lighting package names.',
        error
      );
    }

    try {
      if (
        typeof getDuplicateWarning === 'function'
      ) {
        if (!originalGetDuplicateWarning) {
          originalGetDuplicateWarning =
            getDuplicateWarning;
        }

        getDuplicateWarning = function (option) {
          const newWarning =
            getCombinedDuplicateWarning(option);

          if (newWarning) {
            return newWarning;
          }

          return originalGetDuplicateWarning
            ? originalGetDuplicateWarning(option)
            : '';
        };
      }
    } catch (error) {
      console.warn(
        'Could not replace the duplicate warning function.',
        error
      );
    }
  }

  function getPageSelectedOption(
    addonId,
    cardId
  ) {
    try {
      if (
        typeof getSelectedOption === 'function'
      ) {
        return getSelectedOption(
          addonId,
          cardId
        );
      }
    } catch (error) {
      // Continue to fallback.
    }

    try {
      if (
        typeof ADDONS !== 'undefined' &&
        ADDONS[addonId]
      ) {
        const addon = ADDONS[addonId];

        const options = Array.isArray(
          addon.options
        )
          ? addon.options
          : [];

        if (!options.length) {
          return null;
        }

        const select = document.getElementById(
          'option-' + cardId
        );

        const selectedId = select
          ? select.value
          : options[0].id;

        return (
          options.find(function (option) {
            return option.id === selectedId;
          }) || options[0]
        );
      }
    } catch (error) {
      return null;
    }

    return null;
  }

  function showWarningModal(message) {
    try {
      if (
        typeof showDuplicateWarningModal ===
        'function'
      ) {
        return showDuplicateWarningModal(
          message
        );
      }
    } catch (error) {
      // Use browser confirmation below.
    }

    return Promise.resolve(
      window.confirm(
        message + '\n\nAdd anyway?'
      )
    );
  }

  function replayAddonIncrease(
    button,
    addonId,
    cardId
  ) {
    duplicateBypass = true;

    try {
      if (
        button.classList.contains('add-btn') &&
        typeof addOneAddon === 'function'
      ) {
        addOneAddon(addonId, cardId);
      } else if (
        button.classList.contains('qty-btn') &&
        typeof changeAddonQty === 'function'
      ) {
        changeAddonQty(
          addonId,
          cardId,
          1
        );
      }
    } catch (error) {
      console.error(
        'Could not add the item after confirmation.',
        error
      );
    }

    window.setTimeout(function () {
      duplicateBypass = false;
    }, 0);
  }

  function bindExactDuplicateGuard() {
    if (
      getCurrentPageName() !== 'addons.html'
    ) {
      return;
    }

    document.addEventListener(
      'click',
      async function (event) {
        if (duplicateBypass) {
          return;
        }

        const button = event.target.closest(
          '.add-btn, .qty-btn'
        );

        if (!button) {
          return;
        }

        if (
          button.classList.contains('qty-btn') &&
          String(
            button.textContent || ''
          ).trim() !== '+'
        ) {
          return;
        }

        const card = button.closest(
          '[data-addon-card][data-card-id]'
        );

        if (!card) {
          return;
        }

        const addonId =
          card.dataset.addonCard || '';

        const cardId =
          card.dataset.cardId || '';

        const option = getPageSelectedOption(
          addonId,
          cardId
        );

        if (!option || !option.id) {
          return;
        }

        const estimate = getEstimate();

        const selectedAddons =
          estimate &&
          Array.isArray(estimate.addons)
            ? estimate.addons
            : [];

        const existingItem =
          selectedAddons.find(
            function (item) {
              return (
                item &&
                item.id === option.id &&
                Number(item.qty || 0) > 0
              );
            }
          );

        if (!existingItem) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        const currentQty = Number(
          existingItem.qty || 0
        );

        const message =
          (option.name ||
            'This add-on') +
          ' is already in the cart with a quantity of ' +
          currentQty +
          '. Add another only if you intentionally want one more.';

        const shouldContinue =
          await showWarningModal(message);

        if (shouldContinue) {
          replayAddonIncrease(
            button,
            addonId,
            cardId
          );
        }
      },
      true
    );
  }

  function hasValidPackageEstimate(estimate) {
    if (!estimate) {
      return false;
    }

    const packageName =
      normalizePackageName(
        estimate.package || ''
      );

    const packagePrice = Number(
      estimate.packagePrice || 0
    );

    return Boolean(
      packageName &&
      packageName !==
        'No Package Selected' &&
      packageName !==
        'Custom Product Build' &&
      packagePrice > 0
    );
  }

  function reconcileCartModes() {
    const estimate = getEstimate();

    if (
      hasValidPackageEstimate(estimate) &&
      getProductCart().length
    ) {
      sessionStorage.removeItem(
        PRODUCT_CART_KEY
      );

      sessionStorage.removeItem(
        PRODUCT_ORDER_KEY
      );
    }
  }

  function getDurationLabel(
    type,
    duration
  ) {
    const cleanDuration = Number(
      duration || 1
    );

    if (type === 'daily') {
      return (
        cleanDuration +
        ' ' +
        (cleanDuration === 1
          ? 'day'
          : 'days')
      );
    }

    return cleanDuration + ' hrs';
  }

  function getProductTotals(productCart) {
    let totalItems = 0;
    let estimatedTotal = 0;

    productCart.forEach(function (item) {
      const quantity = Number(
        item.quantity || 0
      );

      const unitPrice = Number(
        item.unitPrice || 0
      );

      totalItems += quantity;

      estimatedTotal +=
        unitPrice * quantity;
    });

    return {
      totalItems: totalItems,
      estimatedTotal: estimatedTotal,
      depositDue: estimatedTotal * 0.5,
      remainingBalance:
        estimatedTotal * 0.5
    };
  }

  function buildEstimateFromProductCart(
    productCart
  ) {
    const totals =
      getProductTotals(productCart);

    const productAddons =
      productCart.map(function (item) {
        return {
          id: item.key,
          name: item.name,

          category:
            item.type === 'daily'
              ? 'Daily Rental'
              : 'Product / Service',

          price: Number(
            item.unitPrice || 0
          ),

          unit:
            item.durationLabel ||
            getDurationLabel(
              item.type,
              item.duration
            ),

          qty: Number(
            item.quantity || 1
          )
        };
      });

    return {
      type: 'products',
      package: 'Custom Product Build',
      packagePrice: 0,
      packageHours: 0,
      addons: productAddons,
      addonsTotal:
        totals.estimatedTotal,
      total:
        totals.estimatedTotal,
      depositDue:
        totals.depositDue,
      remainingBalance:
        totals.remainingBalance
    };
  }

  function normalizeEstimateAfterAddonChange(
    estimate
  ) {
    if (!estimate) {
      return null;
    }

    const packagePrice = Number(
      estimate.packagePrice || 0
    );

    const addons = Array.isArray(
      estimate.addons
    )
      ? estimate.addons
      : [];

    const addonsTotal =
      addons.reduce(function (
        sum,
        addon
      ) {
        return (
          sum +
          Number(addon.price || 0) *
            Number(addon.qty || 1)
        );
      }, 0);

    estimate.package =
      normalizePackageName(
        estimate.package || ''
      );

    estimate.addons = addons;
    estimate.addonsTotal = addonsTotal;

    estimate.total =
      packagePrice + addonsTotal;

    estimate.depositDue =
      estimate.total * 0.5;

    estimate.remainingBalance =
      estimate.total * 0.5;

    return estimate;
  }

  function auditEstimate(estimate) {
    if (
      !estimate ||
      !Array.isArray(estimate.addons)
    ) {
      return [];
    }

    const messages = [];

    const packageName =
      normalizePackageName(
        estimate.package || ''
      );

    const packageWarnings =
      PACKAGE_DUPLICATE_MAP[
        packageName
      ] || {};

    estimate.addons.forEach(
      function (addon, index) {
        if (
          addon &&
          addon.id &&
          packageWarnings[addon.id]
        ) {
          messages.push(
            packageWarnings[addon.id]
          );
        }

        for (
          let otherIndex = index + 1;
          otherIndex <
          estimate.addons.length;
          otherIndex += 1
        ) {
          const otherAddon =
            estimate.addons[otherIndex];

          if (
            !addon ||
            !otherAddon ||
            !addon.id ||
            !otherAddon.id
          ) {
            continue;
          }

          const sharedFeatures =
            getSharedFeatures(
              addon.id,
              otherAddon.id
            );

          if (!sharedFeatures.length) {
            continue;
          }

          const labels =
            sharedFeatures.map(
              function (feature) {
                return (
                  FEATURE_LABELS[
                    feature
                  ] ||
                  feature.replace(
                    /-/g,
                    ' '
                  )
                );
              }
            );

          messages.push(
            (addon.name ||
              'One selected add-on') +
              ' and ' +
              (otherAddon.name ||
                'another selected add-on') +
              ' both include ' +
              joinNaturalLanguage(labels) +
              '.'
          );
        }
      }
    );

    return messages.filter(
      function (message, index) {
        return (
          messages.indexOf(message) ===
          index
        );
      }
    );
  }

  function getDisplayState() {
    const productCart =
      getProductCart();

    const estimate = getEstimate();

    if (
      productCart.length &&
      !hasValidPackageEstimate(estimate)
    ) {
      const totals =
        getProductTotals(productCart);

      return {
        mode: 'products',

        items: productCart.map(
          function (item) {
            const quantity = Number(
              item.quantity || 1
            );

            const unitPrice = Number(
              item.unitPrice || 0
            );

            return {
              mode: 'products',
              key: item.key,
              name: item.name,

              meta:
                (item.durationLabel ||
                  getDurationLabel(
                    item.type,
                    item.duration
                  )) +
                ' · ' +
                formatMoney(unitPrice) +
                ' each · Qty ' +
                quantity,

              total:
                unitPrice * quantity,

              removable: true
            };
          }
        ),

        conflicts: [],

        totalItems:
          totals.totalItems,

        estimatedTotal:
          totals.estimatedTotal,

        depositDue:
          totals.depositDue,

        remainingBalance:
          totals.remainingBalance
      };
    }

    if (estimate) {
      const normalizedEstimate =
        normalizeEstimateAfterAddonChange(
          estimate
        );

      const items = [];

      const addons =
        normalizedEstimate.addons;

      const packageName =
        normalizedEstimate.package || '';

      const packagePrice = Number(
        normalizedEstimate.packagePrice ||
          0
      );

      const packageHours = Number(
        normalizedEstimate.packageHours ||
          0
      );

      if (
        hasValidPackageEstimate(
          normalizedEstimate
        )
      ) {
        items.push({
          mode: 'estimate',
          key: '__package__',
          name: packageName,

          meta: packageHours
            ? packageHours +
              ' hrs · Base package'
            : 'Base package',

          total: packagePrice,
          removable: false
        });
      }

      addons.forEach(
        function (addon, index) {
          const qty = Number(
            addon.qty || 1
          );

          const price = Number(
            addon.price || 0
          );

          const unit = addon.unit || '';

          const category =
            addon.category || 'Add-on';

          items.push({
            mode: 'estimate',

            key:
              addon.id ||
              addon.name ||
              String(index),

            name:
              addon.name ||
              'Selected Add-on',

            meta:
              category +
              (unit
                ? ' · ' + unit
                : '') +
              ' · Qty ' +
              qty,

            total: price * qty,
            removable: true
          });
        }
      );

      return {
        mode: 'estimate',
        items: items,

        conflicts: auditEstimate(
          normalizedEstimate
        ),

        totalItems: items.length,

        estimatedTotal: Number(
          normalizedEstimate.total || 0
        ),

        depositDue: Number(
          normalizedEstimate.depositDue ||
            0
        ),

        remainingBalance: Number(
          normalizedEstimate
            .remainingBalance || 0
        )
      };
    }

    return {
      mode: 'empty',
      items: [],
      conflicts: [],
      totalItems: 0,
      estimatedTotal: 0,
      depositDue: 0,
      remainingBalance: 0
    };
  }

  function injectExtraCartStyles() {
    if (
      document.getElementById(
        'globalCartDuplicateStyles'
      )
    ) {
      return;
    }

    const style =
      document.createElement('style');

    style.id =
      'globalCartDuplicateStyles';

    style.textContent = `
      .global-cart-overlap-warning {
        margin: 0 0 14px;
        padding: 13px 14px;
        border: 1px solid rgba(255,45,120,0.24);
        border-radius: 11px;
        background: rgba(255,45,120,0.055);
        color: rgba(232,232,240,0.72);
        font-size: 0.74rem;
        line-height: 1.6;
      }

      .global-cart-overlap-warning strong {
        display: block;
        margin-bottom: 5px;
        color: #ff2d78;
        font-size: 0.62rem;
        letter-spacing: 1.8px;
        text-transform: uppercase;
      }

      .global-cart-overlap-warning span {
        display: block;
      }
    `;

    document.head.appendChild(style);
  }

  function injectCartMarkup() {
    if (
      isGlobalCartDisabledOnThisPage()
    ) {
      return;
    }

    if (
      document.getElementById(
        'globalCartButton'
      )
    ) {
      return;
    }

    injectExtraCartStyles();

    const markup = `
      <div
        class="global-cart-backdrop"
        id="globalCartBackdrop">
      </div>

      <aside
        class="global-cart-drawer"
        id="globalCartDrawer"
        aria-label="Universal cart">

        <button
          class="global-cart-close"
          type="button"
          id="globalCartClose"
          aria-label="Close cart">
          ×
        </button>

        <div class="global-cart-kicker">
          Current Estimate
        </div>

        <div class="global-cart-title">
          Your Cart
        </div>

        <div class="global-cart-copy">
          Review your selected package, add-ons, or custom product build before continuing to checkout.
        </div>

        <div
          class="global-cart-overlap-warning"
          id="globalCartOverlapWarning"
          hidden>
        </div>

        <div
          class="global-cart-items"
          id="globalCartItems">
        </div>

        <div class="global-cart-summary">

          <div class="global-cart-row">
            <span>Items</span>
            <span id="globalCartCount">
              0
            </span>
          </div>

          <div class="global-cart-row">
            <span>Estimated Total</span>
            <span id="globalCartTotal">
              $0
            </span>
          </div>

          <div class="global-cart-total-row">
            <span>50% Deposit Due</span>
            <span id="globalCartDeposit">
              $0
            </span>
          </div>

          <div class="global-cart-row">
            <span>Remaining Balance</span>
            <span id="globalCartRemaining">
              $0
            </span>
          </div>

          <div class="global-cart-actions">

            <button
              class="global-cart-action primary"
              type="button"
              id="globalCartCheckout">
              Continue to Checkout
            </button>

            <button
              class="global-cart-action secondary"
              type="button"
              id="globalCartClear">
              Clear Cart
            </button>

          </div>
        </div>
      </aside>

      <button
        class="global-cart-button"
        id="globalCartButton"
        type="button"
        aria-controls="globalCartDrawer"
        aria-expanded="false">

        <span class="global-cart-button-main">

          <span class="global-cart-button-label">
            View Cart
          </span>

          <span
            class="global-cart-button-count"
            id="globalCartButtonCount">
            0
          </span>

        </span>

        <span
          class="global-cart-button-total"
          id="globalCartButtonTotal">
          $0
        </span>

      </button>
    `;

    document.body.insertAdjacentHTML(
      'beforeend',
      markup
    );

    bindCartEvents();
  }

  function bindCartEvents() {
    const button =
      document.getElementById(
        'globalCartButton'
      );

    const close =
      document.getElementById(
        'globalCartClose'
      );

    const backdrop =
      document.getElementById(
        'globalCartBackdrop'
      );

    const checkout =
      document.getElementById(
        'globalCartCheckout'
      );

    const clear =
      document.getElementById(
        'globalCartClear'
      );

    const drawer =
      document.getElementById(
        'globalCartDrawer'
      );

    if (button) {
      button.addEventListener(
        'click',
        openCart
      );
    }

    if (close) {
      close.addEventListener(
        'click',
        closeCart
      );
    }

    if (backdrop) {
      backdrop.addEventListener(
        'click',
        closeCart
      );
    }

    if (checkout) {
      checkout.addEventListener(
        'click',
        proceedToCheckout
      );
    }

    if (clear) {
      clear.addEventListener(
        'click',
        clearCart
      );
    }

    if (drawer) {
      drawer.addEventListener(
        'click',
        function (event) {
          const removeButton =
            event.target.closest(
              '.global-cart-item-remove'
            );

          if (!removeButton) {
            return;
          }

          removeCartItem(
            removeButton.dataset.mode,
            removeButton.dataset.key
          );
        }
      );
    }

    document.addEventListener(
      'keydown',
      function (event) {
        if (event.key === 'Escape') {
          closeCart();
        }
      }
    );
  }

  function openCart() {
    if (
      isGlobalCartDisabledOnThisPage()
    ) {
      return;
    }

    const drawer =
      document.getElementById(
        'globalCartDrawer'
      );

    const backdrop =
      document.getElementById(
        'globalCartBackdrop'
      );

    const button =
      document.getElementById(
        'globalCartButton'
      );

    if (
      !drawer ||
      !backdrop ||
      !button
    ) {
      return;
    }

    drawer.classList.add('open');
    backdrop.classList.add('open');

    button.setAttribute(
      'aria-expanded',
      'true'
    );

    document.body.classList.add(
      'global-cart-open'
    );
  }

  function closeCart() {
    const drawer =
      document.getElementById(
        'globalCartDrawer'
      );

    const backdrop =
      document.getElementById(
        'globalCartBackdrop'
      );

    const button =
      document.getElementById(
        'globalCartButton'
      );

    if (
      !drawer ||
      !backdrop ||
      !button
    ) {
      return;
    }

    drawer.classList.remove('open');
    backdrop.classList.remove('open');

    button.setAttribute(
      'aria-expanded',
      'false'
    );

    document.body.classList.remove(
      'global-cart-open'
    );
  }

  function renderConflictWarning(
    conflicts
  ) {
    const warning =
      document.getElementById(
        'globalCartOverlapWarning'
      );

    if (!warning) {
      return;
    }

    if (
      !Array.isArray(conflicts) ||
      !conflicts.length
    ) {
      warning.hidden = true;
      warning.innerHTML = '';
      return;
    }

    const visibleConflicts =
      conflicts.slice(0, 3);

    const remainingCount = Math.max(
      0,
      conflicts.length -
        visibleConflicts.length
    );

    warning.hidden = false;

    warning.innerHTML =
      '<strong>Possible duplicate selections</strong>' +

      visibleConflicts
        .map(function (message) {
          return (
            '<span>• ' +
            escapeHTML(message) +
            '</span>'
          );
        })
        .join('') +

      (remainingCount
        ? '<span>• Plus ' +
          remainingCount +
          ' more overlap' +
          (remainingCount === 1
            ? ''
            : 's') +
          '.</span>'
        : '') +

      '<span style="margin-top:6px; color:rgba(232,232,240,0.5);">These may be intentional upgrades. Review the quantities before checkout.</span>';
  }

  function renderCart() {
    if (
      isGlobalCartDisabledOnThisPage()
    ) {
      return;
    }

    injectCartMarkup();

    const state = getDisplayState();

    const cartItems =
      document.getElementById(
        'globalCartItems'
      );

    const cartCount =
      document.getElementById(
        'globalCartCount'
      );

    const cartTotal =
      document.getElementById(
        'globalCartTotal'
      );

    const cartDeposit =
      document.getElementById(
        'globalCartDeposit'
      );

    const cartRemaining =
      document.getElementById(
        'globalCartRemaining'
      );

    const buttonCount =
      document.getElementById(
        'globalCartButtonCount'
      );

    const buttonTotal =
      document.getElementById(
        'globalCartButtonTotal'
      );

    if (
      !cartItems ||
      !cartCount ||
      !cartTotal ||
      !cartDeposit ||
      !cartRemaining ||
      !buttonCount ||
      !buttonTotal
    ) {
      return;
    }

    cartCount.textContent =
      state.totalItems;

    cartTotal.textContent =
      formatMoney(
        state.estimatedTotal
      );

    cartDeposit.textContent =
      formatMoney(
        state.depositDue
      );

    cartRemaining.textContent =
      formatMoney(
        state.remainingBalance
      );

    buttonCount.textContent =
      state.totalItems;

    buttonTotal.textContent =
      formatMoney(
        state.estimatedTotal
      );

    renderConflictWarning(
      state.conflicts
    );

    if (!state.items.length) {
      cartItems.innerHTML = `
        <div class="global-cart-empty">
          Your cart is empty. Choose a package, add-ons, or individual products to start building your event estimate.
        </div>
      `;

      return;
    }

    cartItems.innerHTML =
      state.items
        .map(function (item) {
          const removeButton =
            item.removable
              ? '<button class="global-cart-item-remove" type="button" data-mode="' +
                escapeHTML(item.mode) +
                '" data-key="' +
                escapeHTML(item.key) +
                '">Remove</button>'
              : '';

          return `
            <div class="global-cart-item">

              <div class="global-cart-item-top">

                <div class="global-cart-item-name">
                  ${escapeHTML(item.name)}
                </div>

                ${removeButton}

              </div>

              <div class="global-cart-item-meta">
                ${escapeHTML(item.meta)}
              </div>

              <div class="global-cart-item-total">
                ${formatMoney(item.total)}
              </div>

            </div>
          `;
        })
        .join('');
  }

  function removeCartItem(
    mode,
    key
  ) {
    if (mode === 'products') {
      const productCart =
        getProductCart().filter(
          function (item) {
            return item.key !== key;
          }
        );

      saveProductCart(productCart);

      if (productCart.length) {
        saveEstimate(
          buildEstimateFromProductCart(
            productCart
          )
        );
      } else {
        sessionStorage.removeItem(
          PRODUCT_ORDER_KEY
        );

        sessionStorage.removeItem(
          ESTIMATE_KEY
        );
      }

      renderCart();
      return;
    }

    if (mode === 'estimate') {
      const estimate = getEstimate();

      if (
        !estimate ||
        !Array.isArray(
          estimate.addons
        )
      ) {
        return;
      }

      estimate.addons =
        estimate.addons.filter(
          function (addon, index) {
            const addonKey =
              addon.id ||
              addon.name ||
              String(index);

            return addonKey !== key;
          }
        );

      saveEstimate(
        normalizeEstimateAfterAddonChange(
          estimate
        )
      );

      renderCart();
    }
  }

  function clearCart() {
    sessionStorage.removeItem(
      PRODUCT_CART_KEY
    );

    sessionStorage.removeItem(
      PRODUCT_ORDER_KEY
    );

    sessionStorage.removeItem(
      ESTIMATE_KEY
    );

    sessionStorage.removeItem(
      SELECTED_PACKAGE_KEY
    );

    renderCart();
  }

  function proceedToCheckout() {
    const productCart =
      getProductCart();

    const estimate = getEstimate();
    const state = getDisplayState();

    const useProductCart =
      productCart.length &&
      !hasValidPackageEstimate(
        estimate
      );

    if (
      !state.items.length ||
      state.estimatedTotal <= 0
    ) {
      alert(
        'Please add at least one item before continuing to checkout.'
      );

      return;
    }

    if (useProductCart) {
      const productEstimate =
        buildEstimateFromProductCart(
          productCart
        );

      const totals =
        getProductTotals(
          productCart
        );

      sessionStorage.setItem(
        ESTIMATE_KEY,
        JSON.stringify(
          productEstimate
        )
      );

      sessionStorage.setItem(
        PRODUCT_ORDER_KEY,
        JSON.stringify({
          type: 'products',
          cart: productCart,

          totalItems:
            totals.totalItems,

          estimatedTotal:
            totals.estimatedTotal,

          depositDue:
            totals.depositDue,

          remainingBalance:
            totals.remainingBalance
        })
      );
    } else if (estimate) {
      sessionStorage.removeItem(
        PRODUCT_CART_KEY
      );

      sessionStorage.removeItem(
        PRODUCT_ORDER_KEY
      );

      saveEstimate(
        normalizeEstimateAfterAddonChange(
          estimate
        )
      );
    }

    const checkoutPath =
      (window.location.pathname || '').includes('/rentals/')
        ? '../checkout.html'
        : 'checkout.html';

    window.location.href =
      checkoutPath;
  }

  function addProductItem(item) {
    sessionStorage.removeItem(
      SELECTED_PACKAGE_KEY
    );

    const cart = getProductCart();

    const productId =
      item.productId ||
      '';

    const name =
      item.name ||
      'Selected Product';

    const type =
      item.type ||
      'hourly';

    const duration = Number(
      item.duration || 1
    );

    const rate = Number(
      item.rate || 0
    );

    const quantity = Number(
      item.quantity || 1
    );

    const durationLabel =
      item.durationLabel ||
      getDurationLabel(
        type,
        duration
      );

    const unitPrice = Number(
      item.unitPrice ||
        rate * duration
    );

    const key =
      item.key ||
      name +
        '__' +
        type +
        '__' +
        duration;

    const existing =
      cart.find(function (cartItem) {
        return cartItem.key === key;
      });

    if (existing) {
      existing.quantity =
        Number(
          existing.quantity || 1
        ) + quantity;
    } else {
      cart.push({
        key: key,
        productId: productId,
        name: name,
        type: type,
        rate: rate,
        extraHourRate: Number(item.extraHourRate || 0),
        duration: duration,
        durationLabel:
          durationLabel,
        unitPrice: unitPrice,
        quantity: quantity
      });
    }

    saveProductCart(cart);

    saveEstimate(
      buildEstimateFromProductCart(
        cart
      )
    );

    renderCart();
  }

  function watchForCartChanges() {
    if (
      isGlobalCartDisabledOnThisPage()
    ) {
      return;
    }

    const snapshot =
      JSON.stringify({
        productCart:
          getProductCart(),

        estimate:
          getEstimate()
      });

    if (snapshot !== lastSnapshot) {
      lastSnapshot = snapshot;
      renderCart();
    }
  }

  window.HeatDistrictCart = {
    version:
      GLOBAL_CART_VERSION,

    render:
      renderCart,

    open:
      openCart,

    close:
      closeCart,

    clear:
      clearCart,

    remove:
      removeCartItem,

    proceedToCheckout:
      proceedToCheckout,

    addProductItem:
      addProductItem,

    getState:
      getDisplayState,

    isDisabledOnThisPage:
      isGlobalCartDisabledOnThisPage
  };

  patchNativeDuplicateSystem();

  document.addEventListener(
    'DOMContentLoaded',
    function () {
      patchNativeDuplicateSystem();
      reconcileCartModes();
      bindExactDuplicateGuard();

      if (
        !isGlobalCartDisabledOnThisPage()
      ) {
        renderCart();

        setInterval(
          watchForCartChanges,
          500
        );
      }
    }
  );

  window.addEventListener(
    'storage',
    function () {
      if (
        !isGlobalCartDisabledOnThisPage()
      ) {
        renderCart();
      }
    }
  );
})();
