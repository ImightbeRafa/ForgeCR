/* ============================================
   FORGE COSTA RICA — Frontend Logic
   ============================================ */

const PRODUCT = {
  name: 'Arnés ForgeCR',
  price: 14900,
  currency: 'CRC',
  sizes: {
    L: 22,
    XL: 32,
    '2XL': 28,
    '3XL': 12,
    '4XL': 6
  }
};

const API_BASE = window.location.hostname === 'localhost' ? '' : '';

/* ---- State ---- */
let state = {
  selectedSize: null,
  quantity: 1
};

/* ---- Helpers ---- */
function formatCRC(amount) {
  return `₡${amount.toLocaleString('es-CR')}`;
}

function generateOrderId() {
  const ts = Date.now().toString(36);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${ts}-${rand}`.toUpperCase();
}

/* ---- Meta Pixel Helper ---- */
const viewedProducts = new Set();

function metaTrack(eventName, params = {}, options = {}) {
  if (typeof fbq !== 'function') return;
  const method = options.eventID ? 'track' : 'track';
  const fbqParams = { ...params };
  if (options.eventID) {
    fbq(method, eventName, fbqParams, { eventID: options.eventID });
  } else {
    fbq(method, eventName, fbqParams);
  }
}

/* ============================================
   HEADER — scroll behavior
   ============================================ */
const header = document.getElementById('header');

function handleHeaderScroll() {
  if (window.scrollY > 40) {
    header.classList.add('header--scrolled');
  } else {
    header.classList.remove('header--scrolled');
  }
}

window.addEventListener('scroll', handleHeaderScroll, { passive: true });
handleHeaderScroll();

/* ---- Mobile drawer ---- */
const hamburger = document.getElementById('hamburger');
const mobileOverlay = document.getElementById('mobileOverlay');
const mobileDrawer = document.getElementById('mobileDrawer');
const drawerClose = document.getElementById('drawerClose');

function openDrawer() {
  mobileOverlay.classList.add('active');
  mobileDrawer.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  mobileOverlay.classList.remove('active');
  mobileDrawer.classList.remove('active');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', openDrawer);
mobileOverlay.addEventListener('click', closeDrawer);
drawerClose.addEventListener('click', closeDrawer);

document.querySelectorAll('.mobile-drawer__link').forEach(link => {
  link.addEventListener('click', closeDrawer);
});

/* ============================================
   SCROLL REVEAL
   ============================================ */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-right');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || 0);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(el => observer.observe(el));
}

initScrollReveal();

/* ============================================
   PRODUCT — ViewContent tracking
   ============================================ */
const productSection = document.getElementById('producto');
if (productSection) {
  const vcObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !viewedProducts.has('arnes-forgecr')) {
        viewedProducts.add('arnes-forgecr');
        metaTrack('ViewContent', {
          content_name: PRODUCT.name,
          content_type: 'product',
          content_ids: ['arnes-forgecr'],
          value: PRODUCT.price,
          currency: PRODUCT.currency
        });
        vcObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  vcObserver.observe(productSection);
}

/* ============================================
   PRODUCT — Image gallery
   ============================================ */
const mainImage = document.getElementById('mainProductImage');
const thumbs = document.querySelectorAll('.product__thumb');

thumbs.forEach(thumb => {
  thumb.addEventListener('click', () => {
    thumbs.forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
    mainImage.src = thumb.dataset.img;
    mainImage.alt = thumb.querySelector('img').alt;
  });
});

/* ============================================
   PRODUCT — Size selection (showcase section)
   ============================================ */
const sizeChips = document.querySelectorAll('.size-chip');
const stockIndicator = document.getElementById('stockIndicator');
const addToCartBtn = document.getElementById('addToCartBtn');

sizeChips.forEach(chip => {
  const size = chip.dataset.size;
  const stock = parseInt(chip.dataset.stock);

  if (stock <= 0) {
    chip.classList.add('out-of-stock');
    chip.disabled = true;
  }

  chip.addEventListener('click', () => {
    if (stock <= 0) return;

    sizeChips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    selectSize(size, stock);

    if (addToCartBtn) addToCartBtn.disabled = false;
  });
});

/* ============================================
   CHECKOUT — Unified Size + Quantity + Summary
   ============================================ */
const orderSizeChips = document.querySelectorAll('.order__size-chip');
const orderStockIndicator = document.getElementById('orderStockIndicator');
const orderQtyMinus = document.getElementById('orderQtyMinus');
const orderQtyPlus = document.getElementById('orderQtyPlus');
const orderQtyValue = document.getElementById('orderQtyValue');

function selectSize(size, stock) {
  state.selectedSize = size;
  state.quantity = 1;

  // Sync product section chips
  sizeChips.forEach(c => c.classList.toggle('active', c.dataset.size === size));

  // Sync checkout section chips
  orderSizeChips.forEach(c => c.classList.toggle('active', c.dataset.size === size));

  // Update stock indicators
  const stockHTML = stock <= 10
    ? `<span class="low-stock">¡Solo quedan ${stock} unidades!</span>`
    : `${stock} unidades disponibles`;

  if (stockIndicator) stockIndicator.innerHTML = stockHTML;
  if (orderStockIndicator) orderStockIndicator.innerHTML = stockHTML;

  // Reset qty displays
  if (document.getElementById('qtyValue')) document.getElementById('qtyValue').textContent = '1';
  if (orderQtyValue) orderQtyValue.textContent = '1';

  updateLiveSummary();
  updateCheckoutSteps();

  metaTrack('AddToCart', {
    content_name: PRODUCT.name,
    content_ids: ['arnes-forgecr'],
    content_type: 'product',
    value: PRODUCT.price,
    currency: PRODUCT.currency
  });
}

orderSizeChips.forEach(chip => {
  const size = chip.dataset.size;
  const stock = parseInt(chip.dataset.stock);

  if (stock <= 0) {
    chip.classList.add('out-of-stock');
    chip.disabled = true;
  }

  chip.addEventListener('click', () => {
    if (stock <= 0) return;
    selectSize(size, stock);
  });
});

/* ---- Checkout Quantity ---- */
if (orderQtyMinus) {
  orderQtyMinus.addEventListener('click', () => {
    if (state.quantity > 1) {
      state.quantity--;
      orderQtyValue.textContent = state.quantity;
      if (document.getElementById('qtyValue')) document.getElementById('qtyValue').textContent = state.quantity;
      updateLiveSummary();
    }
  });
}

if (orderQtyPlus) {
  orderQtyPlus.addEventListener('click', () => {
    if (!state.selectedSize) return;
    const maxStock = PRODUCT.sizes[state.selectedSize];
    if (state.quantity < maxStock) {
      state.quantity++;
      orderQtyValue.textContent = state.quantity;
      if (document.getElementById('qtyValue')) document.getElementById('qtyValue').textContent = state.quantity;
      updateLiveSummary();
    }
  });
}

/* ---- Product section quantity (keep working) ---- */
const qtyMinus = document.getElementById('qtyMinus');
const qtyPlus = document.getElementById('qtyPlus');

if (qtyMinus) {
  qtyMinus.addEventListener('click', () => {
    if (state.quantity > 1) {
      state.quantity--;
      document.getElementById('qtyValue').textContent = state.quantity;
      if (orderQtyValue) orderQtyValue.textContent = state.quantity;
      updateLiveSummary();
    }
  });
}

if (qtyPlus) {
  qtyPlus.addEventListener('click', () => {
    if (!state.selectedSize) return;
    const maxStock = PRODUCT.sizes[state.selectedSize];
    if (state.quantity < maxStock) {
      state.quantity++;
      document.getElementById('qtyValue').textContent = state.quantity;
      if (orderQtyValue) orderQtyValue.textContent = state.quantity;
      updateLiveSummary();
    }
  });
}

/* ---- Add to Cart button (product section — scrolls to checkout) ---- */
if (addToCartBtn) {
  addToCartBtn.addEventListener('click', () => {
    if (!state.selectedSize) return;
    const pedido = document.getElementById('pedido');
    if (pedido) {
      const y = pedido.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  });
}

/* ============================================
   LIVE ORDER SUMMARY (checkout card)
   ============================================ */
function updateLiveSummary() {
  const subtotal = PRODUCT.price * state.quantity;
  const formatted = formatCRC(subtotal);

  const liveSubtotal = document.getElementById('liveSubtotal');
  const liveTotal = document.getElementById('liveTotal');
  const submitTotal = document.getElementById('submitTotal');

  if (liveSubtotal) liveSubtotal.textContent = formatted;
  if (liveTotal) liveTotal.textContent = formatted;
  if (submitTotal) submitTotal.textContent = subtotal.toLocaleString('es-CR');
}

/* ============================================
   CHECKOUT STEP INDICATORS
   ============================================ */
function updateCheckoutSteps() {
  const steps = document.querySelectorAll('.checkout-step');
  if (!steps.length) return;

  const hasSize = !!state.selectedSize;
  const hasShipping = !!(
    document.getElementById('firstName')?.value.trim() &&
    document.getElementById('provincia')?.value
  );

  steps.forEach(step => {
    const num = parseInt(step.dataset.step);
    step.classList.remove('checkout-step--active', 'checkout-step--done');

    if (num === 1 && hasSize) step.classList.add('checkout-step--done');
    else if (num === 1) step.classList.add('checkout-step--active');

    if (num === 2 && hasShipping) step.classList.add('checkout-step--done');
    else if (num === 2 && hasSize) step.classList.add('checkout-step--active');

    if (num === 3 && hasShipping) step.classList.add('checkout-step--active');
  });
}

// Update steps when form fields change
document.querySelectorAll('#orderForm input, #orderForm select, #orderForm textarea').forEach(el => {
  el.addEventListener('input', updateCheckoutSteps);
  el.addEventListener('change', updateCheckoutSteps);
});

/* ============================================
   FORM VALIDATION
   ============================================ */
function validateField(id, condition, errorMsg) {
  const input = document.getElementById(id);
  const error = document.getElementById(id + 'Error');
  if (!input) return true;

  const value = input.value.trim();
  const isValid = condition(value);

  if (!isValid) {
    input.classList.add('error');
    if (error) error.textContent = errorMsg;
  } else {
    input.classList.remove('error');
    if (error) error.textContent = '';
  }

  return isValid;
}

function validateForm() {
  let valid = true;

  valid = validateField('firstName', v => v.length >= 2, 'Ingresá tu nombre') && valid;
  valid = validateField('lastName', v => v.length >= 2, 'Ingresá tu apellido') && valid;
  valid = validateField('email', v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Correo inválido') && valid;
  valid = validateField('phone', v => v.replace(/\D/g, '').length >= 8, 'Teléfono inválido') && valid;
  valid = validateField('provincia', v => v !== '', 'Seleccioná una provincia') && valid;
  valid = validateField('canton', v => v.length >= 2, 'Ingresá tu cantón') && valid;
  valid = validateField('distrito', v => v.length >= 2, 'Ingresá tu distrito') && valid;
  valid = validateField('direccion', v => v.length >= 5, 'Ingresá tu dirección') && valid;

  return valid;
}

/* ============================================
   FORM SUBMISSION
   ============================================ */
const orderForm = document.getElementById('orderForm');
const loadingOverlay = document.getElementById('loadingOverlay');

orderForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!state.selectedSize) {
    alert('Por favor seleccioná una talla antes de continuar.');
    return;
  }

  if (!validateForm()) return;

  const orderId = generateOrderId();
  const paymentMethod = 'tilopay';
  const subtotal = PRODUCT.price * state.quantity;

  const orderData = {
    orderId,
    customer: {
      firstName: document.getElementById('firstName').value.trim(),
      lastName: document.getElementById('lastName').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim()
    },
    product: {
      name: PRODUCT.name,
      size: state.selectedSize,
      quantity: state.quantity,
      unitPrice: PRODUCT.price
    },
    shipping: {
      province: document.getElementById('provincia').value,
      canton: document.getElementById('canton').value.trim(),
      district: document.getElementById('distrito').value.trim(),
      address: document.getElementById('direccion').value.trim()
    },
    total: subtotal,
    paymentMethod,
    comments: document.getElementById('comments').value.trim(),
    createdAt: new Date().toISOString()
  };

  loadingOverlay.classList.add('active');

  try {
    await handleTilopayPayment(orderData);
  } catch (err) {
    loadingOverlay.classList.remove('active');
    alert('Error al procesar el pedido. Por favor intentá de nuevo.');
    console.error('Order error:', err);
  }
});

/* ---- Tilopay Payment ---- */
async function handleTilopayPayment(orderData) {
  const eventId = `ic_${orderData.orderId}`;

  metaTrack('InitiateCheckout', {
    content_name: PRODUCT.name,
    content_ids: ['arnes-forgecr'],
    content_type: 'product',
    num_items: orderData.product.quantity,
    value: orderData.total,
    currency: PRODUCT.currency
  }, { eventID: eventId });

  const res = await fetch(`${API_BASE}/api/tilopay/create-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });

  const data = await res.json();

  if (data.paymentUrl) {
    window.location.href = data.paymentUrl;
  } else {
    throw new Error(data.error || 'No payment URL returned');
  }
}

/* ============================================
   SMOOTH ANCHOR SCROLLING
   ============================================ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  });
});
