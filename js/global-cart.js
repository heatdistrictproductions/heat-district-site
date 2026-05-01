/* =========================================================
   Heat District Productions — Universal Global Cart
   File path: js/global-cart.js
   Requires CSS from css/global.css

   Important:
   - The global floating cart is disabled on services.html
     because services.html uses its own original built-in cart.
   ========================================================= */

(function () {
  const PRODUCT_CART_KEY = 'heatDistrictBuildCart';
  const PRODUCT_ORDER_KEY = 'heatDistrictProductOrder';
  const ESTIMATE_KEY = 'heatDistrictEstimate';
  const SELECTED_PACKAGE_KEY = 'heatDistrictSelectedPackage';

  const DISABLED_GLOBAL_CART_PAGES = [
    'services.html'
  ];

  let lastSnapshot = '';

  function getCurrentPageName() {
    const path = window.location.pathname || '';
    const page = path.split('/').pop();

    if (!page || page === '') {
      return 'index.html';
    }

    return page.toLowerCase();
  }

  function isGlobalCartDisabledOnThisPage() {
    const currentPage = getCurrentPageName();

    return DISABLED_GLOBAL_CART_PAGES.includes(currentPage);
  }

  function formatMoney(value) {
    return '$' + Number(value || 0).toLocaleString();
  }

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

  function getProductCart() {
    const cart = safeJsonParse(sessionStorage.getItem(PRODUCT_CART_KEY));
    return Array.isArray(cart) ? cart : [];
  }

  function saveProductCart(cart) {
    sessionStorage.setItem(PRODUCT_CART_KEY, JSON.stringify(cart));
  }

  function getEstimate() {
    return safeJsonParse(sessionStorage.getItem(ESTIMATE_KEY));
  }

  function saveEstimate(estimate) {
    sessionStorage.setItem(ESTIMATE_KEY, JSON.stringify(estimate));
  }

  function getDurationLabel(type, duration) {
    const cleanDuration = Number(duration || 1);

    if (type === 'daily') {
      return cleanDuration + ' ' + (cleanDuration === 1 ? 'day' : 'days');
    }

    return cleanDuration + ' hrs';
  }

  function getProductTotals(productCart) {
    let totalItems = 0;
    let estimatedTotal = 0;

    productCart.forEach(function (item) {
      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(item.unitPrice || 0);

      totalItems += quantity;
      estimatedTotal += unitPrice * quantity;
    });

    return {
      totalItems: totalItems,
      estimatedTotal: estimatedTotal,
      depositDue: estimatedTotal * 0.5,
      remainingBalance: estimatedTotal * 0.5
    };
  }

  function buildEstimateFromProductCart(productCart) {
    const totals = getProductTotals(productCart);

    const productAddons = productCart.map(function (item) {
      return {
        id: item.key,
        name: item.name,
        category: item.type === 'daily' ? 'Daily Rental' : 'Product / Service',
        price: Number(item.unitPrice || 0),
        unit: item.durationLabel || getDurationLabel(item.type, item.duration),
        qty: Number(item.quantity || 1)
      };
    });

    return {
      type: 'products',
      package: 'Custom Product Build',
      packagePrice: 0,
      packageHours: 0,
      addons: productAddons,
      addonsTotal: totals.estimatedTotal,
      total: totals.estimatedTotal,
      depositDue: totals.depositDue,
      remainingBalance: totals.remainingBalance
    };
  }

  function normalizeEstimateAfterAddonChange(estimate) {
    if (!estimate) return null;

    const packagePrice = Number(estimate.packagePrice || 0);
    const addons = Array.isArray(estimate.addons) ? estimate.addons : [];

    let addonsTotal = 0;

    addons.forEach(function (addon) {
      const price = Number(addon.price || 0);
      const qty = Number(addon.qty || 1);
      addonsTotal += price * qty;
    });

    estimate.addons = addons;
    estimate.addonsTotal = addonsTotal;
    estimate.total = packagePrice + addonsTotal;
    estimate.depositDue = estimate.total * 0.5;
    estimate.remainingBalance = estimate.total * 0.5;

    return estimate;
  }

  function getDisplayState() {
    const productCart = getProductCart();
    const estimate = getEstimate();

    if (productCart.length) {
      const totals = getProductTotals(productCart);

      const items = productCart.map(function (item) {
        const quantity = Number(item.quantity || 1);
        const unitPrice = Number(item.unitPrice || 0);

        return {
          mode: 'products',
          key: item.key,
          name: item.name,
          meta: (item.durationLabel || getDurationLabel(item.type, item.duration)) + ' · ' + formatMoney(unitPrice) + ' each · Qty ' + quantity,
          total: unitPrice * quantity,
          removable: true
        };
      });

      return {
        mode: 'products',
        items: items,
        totalItems: totals.totalItems,
        estimatedTotal: totals.estimatedTotal,
        depositDue: totals.depositDue,
        remainingBalance: totals.remainingBalance
      };
    }

    if (estimate) {
      const items = [];
      const addons = Array.isArray(estimate.addons) ? estimate.addons : [];
      const packageName = estimate.package || '';
      const packagePrice = Number(estimate.packagePrice || 0);
      const packageHours = Number(estimate.packageHours || 0);

      if (packageName && packageName !== 'Custom Product Build' && packagePrice > 0) {
        items.push({
          mode: 'estimate',
          key: '__package__',
          name: packageName + ' Package',
          meta: packageHours ? packageHours + ' hrs · Base package' : 'Base package',
          total: packagePrice,
          removable: false
        });
      }

      addons.forEach(function (addon, index) {
        const qty = Number(addon.qty || 1);
        const price = Number(addon.price || 0);
        const unit = addon.unit || '';
        const category = addon.category || 'Add-on';

        items.push({
          mode: 'estimate',
          key: addon.id || addon.name || String(index),
          name: addon.name || 'Selected Add-on',
          meta: category + (unit ? ' · ' + unit : '') + ' · Qty ' + qty,
          total: price * qty,
          removable: true
        });
      });

      const estimatedTotal = Number(estimate.total || 0);
      const totalItems = items.length
        ? items.reduce(function (sum) {
            return sum + 1;
          }, 0)
        : 0;

      return {
        mode: 'estimate',
        items: items,
        totalItems: totalItems,
        estimatedTotal: estimatedTotal,
        depositDue: Number(estimate.depositDue || estimatedTotal * 0.5),
        remainingBalance: Number(estimate.remainingBalance || estimatedTotal * 0.5)
      };
    }

    return {
      mode: 'empty',
      items: [],
      totalItems: 0,
      estimatedTotal: 0,
      depositDue: 0,
      remainingBalance: 0
    };
  }

  function injectCartMarkup() {
    if (isGlobalCartDisabledOnThisPage()) return;
    if (document.getElementById('globalCartButton')) return;

    const markup = `
      <div class="global-cart-backdrop" id="globalCartBackdrop"></div>

      <aside class="global-cart-drawer" id="globalCartDrawer" aria-label="Universal cart">
        <button class="global-cart-close" type="button" id="globalCartClose" aria-label="Close cart">×</button>

        <div class="global-cart-kicker">Current Estimate</div>
        <div class="global-cart-title">Your Cart</div>
        <div class="global-cart-copy">
          Review your selected package, add-ons, or custom product build before continuing to checkout.
        </div>

        <div class="global-cart-items" id="globalCartItems"></div>

        <div class="global-cart-summary">
          <div class="global-cart-row">
            <span>Items</span>
            <span id="globalCartCount">0</span>
          </div>

          <div class="global-cart-row">
            <span>Estimated Total</span>
            <span id="globalCartTotal">$0</span>
          </div>

          <div class="global-cart-total-row">
            <span>50% Deposit Due</span>
            <span id="globalCartDeposit">$0</span>
          </div>

          <div class="global-cart-row">
            <span>Remaining Balance</span>
            <span id="globalCartRemaining">$0</span>
          </div>

          <div class="global-cart-actions">
            <button class="global-cart-action primary" type="button" id="globalCartCheckout">Continue to Checkout</button>
            <button class="global-cart-action secondary" type="button" id="globalCartClear">Clear Cart</button>
          </div>
        </div>
      </aside>

      <button class="global-cart-button" id="globalCartButton" type="button" aria-controls="globalCartDrawer" aria-expanded="false">
        <span class="global-cart-button-main">
          <span class="global-cart-button-label">View Cart</span>
          <span class="global-cart-button-count" id="globalCartButtonCount">0</span>
        </span>
        <span class="global-cart-button-total" id="globalCartButtonTotal">$0</span>
      </button>
    `;

    document.body.insertAdjacentHTML('beforeend', markup);
    bindCartEvents();
  }

  function bindCartEvents() {
    const button = document.getElementById('globalCartButton');
    const close = document.getElementById('globalCartClose');
    const backdrop = document.getElementById('globalCartBackdrop');
    const checkout = document.getElementById('globalCartCheckout');
    const clear = document.getElementById('globalCartClear');
    const drawer = document.getElementById('globalCartDrawer');

    if (button) {
      button.addEventListener('click', openCart);
    }

    if (close) {
      close.addEventListener('click', closeCart);
    }

    if (backdrop) {
      backdrop.addEventListener('click', closeCart);
    }

    if (checkout) {
      checkout.addEventListener('click', proceedToCheckout);
    }

    if (clear) {
      clear.addEventListener('click', clearCart);
    }

    if (drawer) {
      drawer.addEventListener('click', function (event) {
        const removeButton = event.target.closest('.global-cart-item-remove');

        if (!removeButton) return;

        const key = removeButton.dataset.key;
        const mode = removeButton.dataset.mode;

        removeCartItem(mode, key);
      });
    }

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeCart();
      }
    });
  }

  function openCart() {
    if (isGlobalCartDisabledOnThisPage()) return;

    const drawer = document.getElementById('globalCartDrawer');
    const backdrop = document.getElementById('globalCartBackdrop');
    const button = document.getElementById('globalCartButton');

    if (!drawer || !backdrop || !button) return;

    drawer.classList.add('open');
    backdrop.classList.add('open');
    button.setAttribute('aria-expanded', 'true');
    document.body.classList.add('global-cart-open');
  }

  function closeCart() {
    const drawer = document.getElementById('globalCartDrawer');
    const backdrop = document.getElementById('globalCartBackdrop');
    const button = document.getElementById('globalCartButton');

    if (!drawer || !backdrop || !button) return;

    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('global-cart-open');
  }

  function renderCart() {
    if (isGlobalCartDisabledOnThisPage()) return;

    injectCartMarkup();

    const state = getDisplayState();

    const cartItems = document.getElementById('globalCartItems');
    const cartCount = document.getElementById('globalCartCount');
    const cartTotal = document.getElementById('globalCartTotal');
    const cartDeposit = document.getElementById('globalCartDeposit');
    const cartRemaining = document.getElementById('globalCartRemaining');
    const buttonCount = document.getElementById('globalCartButtonCount');
    const buttonTotal = document.getElementById('globalCartButtonTotal');

    if (!cartItems || !cartCount || !cartTotal || !cartDeposit || !cartRemaining || !buttonCount || !buttonTotal) return;

    cartCount.textContent = state.totalItems;
    cartTotal.textContent = formatMoney(state.estimatedTotal);
    cartDeposit.textContent = formatMoney(state.depositDue);
    cartRemaining.textContent = formatMoney(state.remainingBalance);
    buttonCount.textContent = state.totalItems;
    buttonTotal.textContent = formatMoney(state.estimatedTotal);

    if (!state.items.length) {
      cartItems.innerHTML = `
        <div class="global-cart-empty">
          Your cart is empty. Choose a package, add-ons, or individual products to start building your event estimate.
        </div>
      `;
      return;
    }

    cartItems.innerHTML = state.items.map(function (item) {
      const removeButton = item.removable
        ? `<button class="global-cart-item-remove" type="button" data-mode="${escapeHTML(item.mode)}" data-key="${escapeHTML(item.key)}">Remove</button>`
        : '';

      return `
        <div class="global-cart-item">
          <div class="global-cart-item-top">
            <div class="global-cart-item-name">${escapeHTML(item.name)}</div>
            ${removeButton}
          </div>
          <div class="global-cart-item-meta">${escapeHTML(item.meta)}</div>
          <div class="global-cart-item-total">${formatMoney(item.total)}</div>
        </div>
      `;
    }).join('');
  }

  function removeCartItem(mode, key) {
    if (mode === 'products') {
      const productCart = getProductCart().filter(function (item) {
        return item.key !== key;
      });

      saveProductCart(productCart);

      if (productCart.length) {
        saveEstimate(buildEstimateFromProductCart(productCart));
      } else {
        sessionStorage.removeItem(PRODUCT_ORDER_KEY);
        sessionStorage.removeItem(ESTIMATE_KEY);
      }

      renderCart();
      return;
    }

    if (mode === 'estimate') {
      const estimate = getEstimate();

      if (!estimate || !Array.isArray(estimate.addons)) return;

      estimate.addons = estimate.addons.filter(function (addon, index) {
        const addonKey = addon.id || addon.name || String(index);
        return addonKey !== key;
      });

      saveEstimate(normalizeEstimateAfterAddonChange(estimate));
      renderCart();
    }
  }

  function clearCart() {
    sessionStorage.removeItem(PRODUCT_CART_KEY);
    sessionStorage.removeItem(PRODUCT_ORDER_KEY);
    sessionStorage.removeItem(ESTIMATE_KEY);
    sessionStorage.removeItem(SELECTED_PACKAGE_KEY);

    renderCart();
  }

  function proceedToCheckout() {
    const productCart = getProductCart();
    const estimate = getEstimate();
    const state = getDisplayState();

    if (!state.items.length || state.estimatedTotal <= 0) {
      alert('Please add at least one item before continuing to checkout.');
      return;
    }

    if (productCart.length) {
      const productEstimate = buildEstimateFromProductCart(productCart);
      const totals = getProductTotals(productCart);

      sessionStorage.setItem(ESTIMATE_KEY, JSON.stringify(productEstimate));
      sessionStorage.setItem(PRODUCT_ORDER_KEY, JSON.stringify({
        type: 'products',
        cart: productCart,
        totalItems: totals.totalItems,
        estimatedTotal: totals.estimatedTotal,
        depositDue: totals.depositDue,
        remainingBalance: totals.remainingBalance
      }));
    } else if (estimate) {
      saveEstimate(normalizeEstimateAfterAddonChange(estimate));
    }

    window.location.href = 'checkout.html';
  }

  function addProductItem(item) {
    const cart = getProductCart();

    const name = item.name || 'Selected Product';
    const type = item.type || 'hourly';
    const duration = Number(item.duration || 1);
    const rate = Number(item.rate || 0);
    const quantity = Number(item.quantity || 1);
    const durationLabel = item.durationLabel || getDurationLabel(type, duration);
    const unitPrice = Number(item.unitPrice || rate * duration);
    const key = item.key || name + '__' + type + '__' + duration;

    const existing = cart.find(function (cartItem) {
      return cartItem.key === key;
    });

    if (existing) {
      existing.quantity = Number(existing.quantity || 1) + quantity;
    } else {
      cart.push({
        key: key,
        name: name,
        type: type,
        rate: rate,
        duration: duration,
        durationLabel: durationLabel,
        unitPrice: unitPrice,
        quantity: quantity
      });
    }

    saveProductCart(cart);
    saveEstimate(buildEstimateFromProductCart(cart));
    renderCart();
  }

  function watchForCartChanges() {
    if (isGlobalCartDisabledOnThisPage()) return;

    const snapshot = JSON.stringify({
      productCart: getProductCart(),
      estimate: getEstimate()
    });

    if (snapshot !== lastSnapshot) {
      lastSnapshot = snapshot;
      renderCart();
    }
  }

  window.HeatDistrictCart = {
    render: renderCart,
    open: openCart,
    close: closeCart,
    clear: clearCart,
    remove: removeCartItem,
    proceedToCheckout: proceedToCheckout,
    addProductItem: addProductItem,
    getState: getDisplayState,
    isDisabledOnThisPage: isGlobalCartDisabledOnThisPage
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (!isGlobalCartDisabledOnThisPage()) {
      renderCart();
      setInterval(watchForCartChanges, 500);
    }
  });

  window.addEventListener('storage', function () {
    if (!isGlobalCartDisabledOnThisPage()) {
      renderCart();
    }
  });
})();