/* The specialized wedding option uses the existing package/estimate storage keys. */
(function () {
  'use strict';
  const wedding = window.HeatDistrictWedding;
  const section = document.getElementById('wedding-experience');
  if (!wedding || !section) return;
  const radios = section.querySelectorAll('input[name="wedding-finish"]');
  const preview = section.querySelector('.wedding-preview');
  const imagePreview = document.getElementById('wedding-preview-image');
  const photoPicker = section.querySelector('.wedding-photo-picker');
  const photoButtons = section.querySelectorAll('[data-wedding-photo]');
  const note = document.getElementById('wedding-finish-note');
  const status = document.getElementById('wedding-selection-status');
  const photoSets = {
    white: [
      {
        src: 'images/optimized/packages/wedding-experience-white-1-side-space-20260928.jpg',
        alt: 'Full White Wedding Experience setup with white RCF speakers, four moving heads, four cold sparks, fog machines and a center disco ball'
      },
      {
        src: 'images/optimized/packages/wedding-experience-white-goalpost-disco-20260928.jpg',
        alt: 'Full White Wedding Experience goal-post setup with white RCF speakers, four moving heads, CO2 cannons, four cold sparks, fog machines and a hanging disco ball'
      },
      {
        src: 'images/optimized/packages/wedding-experience-white-3-20260928.jpg',
        alt: 'Full White Wedding Experience setup with white RCF speakers, four white totems, four moving heads, four cold sparks, fog machines and a center disco ball'
      }
    ],
    black: [
      {
        src: 'images/optimized/packages/wedding-experience-black-qsc-tv-scrims-20260928.jpg',
        alt: 'Full Black Wedding Experience setup with black QSC speakers, four moving heads, four cold sparks, fog machines, two logo screens and a center disco ball'
      },
      {
        src: 'images/optimized/packages/wedding-experience-black-qsc-goalpost-disco-20260928.jpg',
        alt: 'Full Black Wedding Experience goal-post setup with black QSC speakers, moving heads, CO2 cannons, four cold sparks, fog machines and a hanging disco ball'
      },
      {
        src: 'images/optimized/packages/wedding-experience-black-qsc-3-20260928.jpg',
        alt: 'Full Black Wedding Experience setup with black QSC speakers, four black totems, four moving heads, four cold sparks, fog machines and a center disco ball'
      }
    ]
  };
  const activePhoto = { white: 0, black: 0 };
  function read(key) {
    try { return JSON.parse(sessionStorage.getItem(key)); } catch (_) { return null; }
  }
  function updateFinish(finish, persist) {
    const black = finish === 'Full Black';
    radios.forEach(function(radio) { radio.checked = radio.value === finish; });
    preview.dataset.finish = black ? 'black' : 'white';
    showPhoto(activePhoto[black ? 'black' : 'white'], black ? 'black' : 'white');
    note.textContent = black
      ? 'Black QSC speakers, black booth, black trussing and totem finishes, and black cold-spark housings. Moving heads, fog machines and CO₂ equipment remain black.'
      : 'White RCF speakers, white booth, white trussing and totem finishes, and white cold-spark housings. Moving heads, fog machines and CO₂ equipment remain black.';
    if (!persist) return;
    try {
      // Changing an existing wedding finish updates its option, retaining add-ons and totals.
      const estimate = read('heatDistrictEstimate');
      const selected = read('heatDistrictSelectedPackage');
      if (estimate && estimate.package === wedding.definition.name) {
        estimate.setupFinish = finish;
        sessionStorage.setItem('heatDistrictEstimate', JSON.stringify(estimate));
      }
      if (selected && selected.name === wedding.definition.name) {
        selected.setupFinish = finish;
        sessionStorage.setItem('heatDistrictSelectedPackage', JSON.stringify(selected));
      }
      if (window.HeatDistrictCart) window.HeatDistrictCart.render();
    } catch (_) { status.textContent = 'Your browser could not save the setup choice. Please enable site storage and try again.'; }
  }
  function showPhoto(index, finishKey) {
    const key = finishKey || preview.dataset.finish || 'white';
    const photos = photoSets[key];
    if (!imagePreview || !photos || !photos[index]) return;
    activePhoto[key] = index;
    imagePreview.src = photos[index].src;
    imagePreview.alt = photos[index].alt;
    if (photoPicker) photoPicker.setAttribute('aria-label', 'Choose a Full ' + (key === 'black' ? 'Black' : 'White') + ' Wedding Experience photo');
    photoButtons.forEach(function(button, buttonIndex) {
      const active = buttonIndex === index;
      const thumbnail = button.querySelector('img');
      if (thumbnail && photos[buttonIndex]) thumbnail.src = photos[buttonIndex].src;
      button.setAttribute('aria-label', 'Show Full ' + (key === 'black' ? 'Black' : 'White') + ' setup photo ' + (buttonIndex + 1));
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }
  const saved = read('heatDistrictEstimate') || read('heatDistrictSelectedPackage');
  updateFinish(saved && (saved.package || saved.name) === wedding.definition.name && saved.setupFinish === 'Full Black' ? 'Full Black' : 'Full White', false);
  radios.forEach(function(radio) {
    radio.addEventListener('change', function() { updateFinish(radio.value, true); });
  });
  photoButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      showPhoto(Number(button.dataset.weddingPhoto));
    });
  });
  document.getElementById('choose-wedding').addEventListener('click', function() {
    const definition = wedding.definition;
    const finish = section.querySelector('input[name="wedding-finish"]:checked').value;
    const previous = read('heatDistrictEstimate');
    const addons = previous && previous.package === definition.name && Array.isArray(previous.addons) ? previous.addons : [];
    const addonsTotal = addons.reduce(function(sum, item) { return sum + Number(item.price || 0) * Number(item.qty || 1); }, 0);
    const total = definition.basePrice + addonsTotal;
    const selected = {
      name: definition.name, basePrice: definition.basePrice, hours: definition.hours,
      total: definition.basePrice, setupFinish: finish, coverageLabel: definition.coverageLabel,
      includes: definition.includes, coverage: definition.coverage, includedFeatures: definition.coverage
    };
    const estimate = {
      type: 'package', cartMode: 'package', package: definition.name,
      packagePrice: definition.basePrice, basePrice: definition.basePrice, packageHours: definition.hours,
      setupFinish: finish, coverageLabel: definition.coverageLabel,
      packageIncludes: definition.includes, includedItems: definition.includes, packageCoverage: definition.coverage,
      addons: addons, addonsTotal: addonsTotal, total: total, depositDue: total / 2, remainingBalance: total / 2
    };
    try {
      sessionStorage.setItem('heatDistrictSelectedPackage', JSON.stringify(selected));
      sessionStorage.setItem('heatDistrictEstimate', JSON.stringify(estimate));
      sessionStorage.removeItem('heatDistrictBuildCart');
      sessionStorage.removeItem('heatDistrictProductOrder');
    } catch (_) {
      status.textContent = 'Your browser could not save this package. Please enable site storage and try again.';
      return;
    }
    if (window.HeatDistrictAnalytics) window.HeatDistrictAnalytics.send('select_item', {
      currency: 'USD', value: definition.basePrice,
      items: [{item_id:'wedding_experience',item_name:definition.name,item_variant:finish,item_category:'Event Package',price:definition.basePrice,quantity:1}]
    });
    window.location.href = 'addons.html';
  });
})();
