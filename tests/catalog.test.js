import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCatalog, readConfig, PRICE, BUNDLE, SHIPPING_COST, shippingFor, formatCRC } from '../shared/catalog.js';

const cat = buildCatalog(readConfig({}));

test('unit price is 14900 and shipping is free', () => {
  assert.equal(PRICE, 14900);
  assert.equal(BUNDLE.price, 26900);
  assert.equal(SHIPPING_COST, 0);
  assert.equal(shippingFor(14900), 0);
  assert.equal(formatCRC(14900), '₡14.900');
});

test('size variants price correctly with pair pack', () => {
  const one = cat.priceOrder([{ key: 'arnes-ml', qty: 1 }]);
  assert.equal(one.subtotal, 14900);
  assert.equal(one.shipping, 0);
  assert.equal(one.total, 14900);
  assert.equal(one.savings, 0);
  assert.equal(one.items[0].name.includes('M/L'), true);

  const two = cat.priceOrder([{ key: 'arnes-xl', qty: 2 }]);
  assert.equal(two.total, 26900);
  assert.equal(two.savings, 2900);

  const three = cat.priceOrder([{ key: 'arnes-xl', qty: 3 }]);
  assert.equal(three.total, 41800);
  assert.equal(three.savings, 2900);

  const four = cat.priceOrder([{ key: 'arnes-ml', qty: 2 }, { key: 'arnes-xl', qty: 2 }]);
  assert.equal(four.total, 53800);
  assert.equal(four.savings, 5800);
});

test('mixed sizes still get pair price', () => {
  const mixed = cat.priceOrder([
    { key: 'arnes-ml', qty: 1 },
    { key: 'arnes-xl', qty: 1 }
  ]);
  assert.equal(mixed.total, 26900);
  assert.equal(mixed.savings, 2900);
  assert.equal(mixed.items.length, 2);
});

test('bundle flag off uses list price', () => {
  const off = buildCatalog(readConfig({ VITE_BUNDLE_2: '0' }));
  const two = off.priceOrder([{ key: 'arnes-xl', qty: 2 }]);
  assert.equal(two.total, 29800);
  assert.equal(two.savings, 0);
  assert.equal(off.bundle.enabled, false);
});

test('sold-out size inside a pair is dropped then repriced', () => {
  const withSold = buildCatalog(readConfig({ VITE_SOLD_OUT: 'arnes-xl' }));
  const r = withSold.priceOrder([
    { key: 'arnes-ml', qty: 1 },
    { key: 'arnes-xl', qty: 1 }
  ]);
  assert.equal(r.items.length, 1);
  assert.equal(r.total, 14900);
  assert.equal(r.savings, 0);
});

test('unknown size keys are dropped', () => {
  const r = cat.priceOrder([{ key: 'arnes-s', qty: 1 }, { key: 'constructor', qty: 2 }]);
  assert.equal(r.items.length, 0);
  assert.equal(r.total, 0);
});

test('client cannot invent totals', () => {
  const priced = cat.priceOrder([{ key: 'arnes-2xl', qty: 1 }]);
  assert.notEqual(priced.total, 1);
  assert.equal(priced.total, 14900);
});
