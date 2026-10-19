/**
 * Catalog + cart store (browser) for ForgeCR.
 * Cart keys are size variants: arnes-ml, arnes-xl, …
 */
import { buildCatalog, readConfig, MAX_QTY_PER_LINE } from '../../../shared/catalog.js';

export const catalog = buildCatalog(readConfig(import.meta.env));

const KEY = 'forge_cart_v1';
const listeners = new Set();
let lines = {};

function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode */
  }
}
export { safeGet as storageGet, safeSet as storageSet };

function sanitize(raw) {
  const clean = {};
  if (!raw || typeof raw !== 'object') return clean;
  for (const [key, qty] of Object.entries(raw)) {
    const n = Math.min(MAX_QTY_PER_LINE, Math.floor(Number(qty)));
    if (catalog.products[key] && !catalog.isSoldOut(key) && n > 0) clean[key] = n;
  }
  return clean;
}

function load() {
  try {
    lines = sanitize(JSON.parse(safeGet(KEY) || '{}'));
  } catch {
    lines = {};
  }
}

function persist() {
  safeSet(KEY, JSON.stringify(lines));
  listeners.forEach((fn) => fn(cart));
}

load();
window.addEventListener('storage', (e) => {
  if (e.key === KEY) {
    load();
    listeners.forEach((fn) => fn(cart));
  }
});

export const cart = {
  items: () => Object.entries(lines).map(([key, qty]) => ({ key, qty })),
  count: () => Object.values(lines).reduce((n, q) => n + q, 0),
  qty: (key) => lines[key] || 0,
  summary: () => catalog.priceOrder(cart.items()),
  add(key, qty = 1) {
    if (!catalog.products[key] || catalog.isSoldOut(key)) return false;
    lines[key] = Math.min(MAX_QTY_PER_LINE, (lines[key] || 0) + Math.max(1, Math.floor(qty)));
    persist();
    return true;
  },
  setQty(key, qty) {
    const n = Math.min(MAX_QTY_PER_LINE, Math.floor(qty));
    if (!(n > 0)) delete lines[key];
    else if (catalog.products[key]) lines[key] = n;
    persist();
  },
  remove(key) {
    delete lines[key];
    persist();
  },
  clear() {
    lines = {};
    persist();
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }
};

export function thumbOf(key) {
  return '/images/arnes-thumb.webp';
}
