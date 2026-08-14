(function () {
  'use strict';

  function formatMoney(value) {
    var amount = Number(value || 0);

    return '$' + amount.toLocaleString(undefined, {
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    });
  }

  function calculateUnitPrice(rate, type, duration, extraHourRate, includedHours) {
    var cleanRate = Number(rate || 0);
    var cleanDuration = Number(duration || 1);
    var cleanExtraRate = Number(extraHourRate || 0);
    var cleanIncludedHours = Number(includedHours || 4);

    if (type === 'event') {
      return cleanRate + (Math.max(0, cleanDuration - cleanIncludedHours) * cleanExtraRate);
    }

    return cleanRate * cleanDuration;
  }

  function updatePrice(form) {
    var option = form.querySelector('select[name="option"] option:checked');
    var duration = form.querySelector('[name="duration"]');
    var quantity = form.querySelector('[name="quantity"]');
    var rate = Number(option ? option.dataset.rate : form.dataset.rate);
    var type = form.dataset.type || 'hourly';
    var extraHourRate = Number(form.dataset.extraRate || 0);
    var includedHours = Number(form.dataset.includedHours || 4);
    var cleanDuration = duration ? Number(duration.value || 1) : 1;
    var cleanQuantity = quantity ? Math.min(
      Number(quantity.max || 9999),
      Math.max(Number(quantity.min || 1), Math.round(Number(quantity.value || quantity.min || 1)))
    ) : 1;
    var unitPrice = calculateUnitPrice(rate, type, cleanDuration, extraHourRate, includedHours);
    var price = form.closest('.product-hero-grid').querySelector('.price-value');

    if (quantity) quantity.value = cleanQuantity;
    if (!price) return;

    price.textContent = cleanQuantity > 1
      ? formatMoney(unitPrice * cleanQuantity) + ' total · ' + formatMoney(unitPrice) + ' each'
      : formatMoney(unitPrice) + ' total';
  }

  document.querySelectorAll('.product-buy-form').forEach(function (form) {
    form.addEventListener('input', function () { updatePrice(form); });
    form.addEventListener('change', function () { updatePrice(form); });
    updatePrice(form);
  });
}());
