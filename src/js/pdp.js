import { formatCRC } from '../../shared/catalog.js';
import { cart, catalog } from './lib/store.js';
import { openCart } from './core.js';
import { toast } from './lib/ui.js';

const root = document.querySelector('[data-pdp]');
if (root) {
  let selectedKey = '';
  const qtyInput = root.querySelector('[data-qty]');
  const hint = root.querySelector('[data-size-hint]');
  const sticky = document.querySelector('[data-sticky-buy]');
  const stickySize = document.querySelector('[data-sticky-size]');
  const addBtns = document.querySelectorAll('[data-add-cart]');
  const buyNowBtns = document.querySelectorAll('[data-buy-now]');

  function qty() {
    return Math.max(1, Math.min(10, Number.parseInt(qtyInput?.value || '1', 10) || 1));
  }

  function syncButtons() {
    const ready = Boolean(selectedKey) && !catalog.isSoldOut(selectedKey);
    const label = ready
      ? `Agregar al carrito · ${formatCRC(catalog.products[selectedKey].price * qty())}`
      : 'Elegí una talla';
    addBtns.forEach((btn) => {
      btn.disabled = !ready;
      btn.textContent = btn.closest('[data-sticky-buy]') ? formatCRC(catalog.products[selectedKey]?.price || 14900) : label;
    });
    buyNowBtns.forEach((btn) => {
      btn.disabled = !ready;
    });
    if (hint) hint.textContent = ready ? `Talla ${catalog.products[selectedKey].size}` : 'Elegí una talla para continuar';
    if (stickySize) stickySize.textContent = ready ? `Talla ${catalog.products[selectedKey].size}` : 'Elegí talla';
  }

  root.querySelectorAll('[data-size-key]').forEach((chip) => {
    chip.addEventListener('click', () => {
      if (chip.disabled) return;
      root.querySelectorAll('[data-size-key]').forEach((c) => c.setAttribute('aria-pressed', 'false'));
      chip.setAttribute('aria-pressed', 'true');
      selectedKey = chip.getAttribute('data-size-key');
      syncButtons();
    });
  });

  root.querySelector('[data-qty-minus]')?.addEventListener('click', () => {
    if (qtyInput) qtyInput.value = String(Math.max(1, qty() - 1));
    syncButtons();
  });
  root.querySelector('[data-qty-plus]')?.addEventListener('click', () => {
    if (qtyInput) qtyInput.value = String(Math.min(10, qty() + 1));
    syncButtons();
  });
  qtyInput?.addEventListener('change', syncButtons);

  function addSelected() {
    if (!selectedKey) return false;
    const ok = cart.add(selectedKey, qty());
    if (ok) toast('Agregado al carrito');
    return ok;
  }

  addBtns.forEach((btn) =>
    btn.addEventListener('click', () => {
      if (addSelected()) openCart();
    })
  );
  buyNowBtns.forEach((btn) =>
    btn.addEventListener('click', () => {
      if (addSelected()) window.location.href = '/checkout/';
    })
  );

  // Gallery
  const gallery = document.querySelector('[data-gallery]');
  if (gallery) {
    gallery.querySelectorAll('[data-gal-thumb]').forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const i = thumb.getAttribute('data-gal-thumb');
        gallery.querySelectorAll('[data-gal-thumb]').forEach((t) => t.classList.toggle('is-active', t === thumb));
        gallery.querySelectorAll('[data-gal-slide]').forEach((s) => s.classList.toggle('is-active', s.getAttribute('data-gal-slide') === i));
      });
    });
  }

  // Sticky bar
  const observerTarget = root.querySelector('.buy-actions');
  if (sticky && observerTarget && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      ([entry]) => {
        sticky.hidden = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(observerTarget);
  }

  syncButtons();
}
