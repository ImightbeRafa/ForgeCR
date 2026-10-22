/**
 * Pack + size selection for the PDP buy box.
 */
import { SITE, formatCRC, PRICE, BUNDLE } from '../../../shared/catalog.js';
import { cart, catalog } from './store.js';
import { toast } from './ui.js';

export function initBuybox(root = document.querySelector('[data-buybox]')) {
  if (!root) return null;

  let pack = 1;
  let keyA = '';
  let keyB = '';

  const totalEl = root.querySelector('[data-bb-total]');
  const saveEl = root.querySelector('[data-bb-save]');
  const hint = root.querySelector('[data-size-hint]');
  const second = root.querySelector('[data-size-second]');
  const sizeLabel = root.querySelector('[data-size-label]');
  const addBtns = document.querySelectorAll('[data-add-cart]');
  const buyBtns = document.querySelectorAll('[data-buy-now]');
  const wa = root.querySelector('[data-wa-order]');
  const sticky = document.querySelector('[data-sticky-buy]');
  const stickySize = document.querySelector('[data-sticky-size]');
  const stickyTotal = document.querySelector('[data-sticky-total]');

  function previewTotal() {
    const items = [];
    if (keyA) items.push({ key: keyA, qty: pack === 2 && (!keyB || keyA === keyB) ? 2 : 1 });
    if (pack === 2 && keyB && keyB !== keyA) items.push({ key: keyB, qty: 1 });
    const ready = pack === 1 ? Boolean(keyA) : Boolean(keyA && keyB);
    if (!items.length) {
      return { total: pack === 2 ? BUNDLE.price : PRICE, savings: pack === 2 ? PRICE * 2 - BUNDLE.price : 0, ready };
    }
    const priced = catalog.priceOrder(items);
    const display = pack === 2 && priced.units < 2
      ? { total: BUNDLE.price, savings: PRICE * 2 - BUNDLE.price }
      : priced;
    return { ...priced, ...display, ready };
  }

  function sync() {
    if (second) second.hidden = pack !== 2;
    if (sizeLabel) sizeLabel.textContent = pack === 2 ? 'Talla unidad 1' : 'Elegí tu talla';

    const { total, savings, ready } = previewTotal();
    if (totalEl) totalEl.textContent = formatCRC(total);
    if (saveEl) {
      saveEl.hidden = !(savings > 0);
      saveEl.textContent = savings > 0 ? `Ahorrás ${formatCRC(savings)}` : '';
    }

    const label = ready ? `Agregar al carrito · ${formatCRC(total)}` : pack === 2 ? 'Elegí ambas tallas' : 'Elegí una talla';
    addBtns.forEach((btn) => {
      btn.disabled = !ready;
      if (!btn.closest('[data-sticky-buy]')) btn.textContent = label;
    });
    buyBtns.forEach((btn) => {
      btn.disabled = !ready;
    });

    if (hint) {
      hint.textContent = ready
        ? pack === 2
          ? `Tallas ${catalog.products[keyA].size}${keyB !== keyA ? ` + ${catalog.products[keyB].size}` : ' × 2'}`
          : `Talla ${catalog.products[keyA].size}`
        : pack === 2
          ? 'Elegí la talla de cada unidad'
          : 'Elegí una talla para continuar';
    }
    if (stickySize) stickySize.textContent = ready ? hint.textContent : 'Elegí talla';
    if (stickyTotal) stickyTotal.textContent = formatCRC(total);

    if (wa) {
      const parts = ready
        ? pack === 2
          ? `Hola ForgeCR, quiero 2 Arnés (${catalog.products[keyA].size}${keyB !== keyA ? ` + ${catalog.products[keyB].size}` : ' × 2'}) · ${formatCRC(total)}`
          : `Hola ForgeCR, quiero el Arnés talla ${catalog.products[keyA].size} · ${formatCRC(total)}`
        : `Hola ForgeCR, quiero info del Arnés ForgeCR`;
      wa.href = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(parts)}`;
    }
  }

  root.querySelectorAll('[data-packs] input[type="radio"]').forEach((input) => {
    input.addEventListener('change', () => {
      pack = Number(input.value) === 2 ? 2 : 1;
      root.querySelectorAll('.bb-pack').forEach((el) => el.classList.toggle('on', el.contains(input)));
      if (pack === 1) keyB = '';
      sync();
    });
  });
  root.querySelector('.bb-pack[data-pack="1"]')?.classList.add('on');

  root.querySelectorAll('[data-size-key]').forEach((chip) => {
    chip.addEventListener('click', () => {
      if (chip.disabled) return;
      root.querySelectorAll('[data-size-key]').forEach((c) => c.setAttribute('aria-pressed', 'false'));
      chip.setAttribute('aria-pressed', 'true');
      keyA = chip.getAttribute('data-size-key');
      if (pack === 1) keyB = '';
      sync();
    });
  });

  root.querySelectorAll('[data-size-key-b]').forEach((chip) => {
    chip.addEventListener('click', () => {
      if (chip.disabled) return;
      root.querySelectorAll('[data-size-key-b]').forEach((c) => c.setAttribute('aria-pressed', 'false'));
      chip.setAttribute('aria-pressed', 'true');
      keyB = chip.getAttribute('data-size-key-b');
      sync();
    });
  });

  function addSelected() {
    const { ready } = previewTotal();
    if (!ready) return false;
    if (pack === 1) return cart.add(keyA, 1);
    if (keyA === keyB) return cart.add(keyA, 2);
    const a = cart.add(keyA, 1);
    const b = cart.add(keyB, 1);
    return a && b;
  }

  addBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!addSelected()) return;
      toast('Agregado al carrito');
      window.location.href = '/checkout/';
    });
  });
  buyBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!addSelected()) return;
      window.location.href = '/checkout/';
    });
  });

  sticky?.querySelector('[data-sticky-scroll]')?.addEventListener('click', () => {
    const { ready } = previewTotal();
    if (ready) {
      if (addSelected()) window.location.href = '/checkout/';
    } else {
      root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // Gallery thumbs
  const gallery = root.querySelector('[data-gallery]');
  const mainImg = gallery?.querySelector('[data-gal-main]');
  gallery?.querySelectorAll('.bb-thumb').forEach((thumb) => {
    thumb.addEventListener('click', () => {
      gallery.querySelectorAll('.bb-thumb').forEach((t) => t.classList.toggle('is-active', t === thumb));
      if (!mainImg) return;
      mainImg.src = thumb.getAttribute('data-gal-src');
      const ss = thumb.getAttribute('data-gal-srcset');
      if (ss) mainImg.srcset = ss;
    });
  });

  sync();
  return { sync, previewTotal };
}
