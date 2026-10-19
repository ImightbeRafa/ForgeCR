import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCatalog, readConfig, PRICE, SHIPPING_COST, shippingFor, formatCRC } from '../shared/catalog.js';

const cat = buildCatalog(readConfig({}));

test('unit price is 14900 and shipping is free', () => {
  assert.equal(PRICE, 14900);
  assert.equal(SHIPPING_COST, 0);
  assert.equal(shippingFor(14900), 0);
  assert.equal(formatCRC(14900), '₡14.900');
});

test('size variants price correctly', () => {
  const one = cat.priceOrder([{ key: 'arnes-ml', qty: 1 }]);
  assert.equal(one.subtotal, 14900);
  assert.equal(one.shipping, 0);
  assert.equal(one.total, 14900);
  assert.equal(one.items[0].name.includes('M/L'), true);

  const two = cat.priceOrder([{ key: 'arnes-xl', qty: 2 }]);
  assert.equal(two.total, 29800);
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
