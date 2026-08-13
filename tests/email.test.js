import assert from 'node:assert/strict';
import test from 'node:test';

import { customerEmailHTML } from '../api/utils/email.js';
import { normalizeTrustedOrder } from '../shared/order.js';

function emailOrder(paymentMethod = 'tilopay') {
  return normalizeTrustedOrder({
    orderId: 'ORD-EMAIL-TEST',
    customer: {
      firstName: '<Ana>',
      lastName: 'Prueba',
      email: 'ana@example.com',
      phone: '88888888'
    },
    product: {
      size: 'M/L',
      quantity: 1
    },
    shipping: {
      province: 'San José',
      canton: 'San José',
      district: 'Carmen',
      address: '<b>100 metros norte</b>'
    },
    paymentMethod
  });
}

test('customer email uses the official logo and trusted total breakdown', () => {
  const html = customerEmailHTML(emailOrder());

  assert.match(html, /\/images\/forgecr-logo\.png/);
  assert.match(html, /PAGO CONFIRMADO/);
  assert.match(html, /Subtotal[\s\S]*₡14[.\s\u00a0]?900/);
  assert.match(html, /Envío[\s\S]*₡3[.\s\u00a0]?000/);
  assert.match(html, /Total[\s\S]*₡17[.\s\u00a0]?900/);
  assert.doesNotMatch(html, /garantía|2 años/i);
});

test('customer email distinguishes SINPE pending from paid Tilopay orders', () => {
  const pending = customerEmailHTML(emailOrder('sinpe'));
  const paid = customerEmailHTML(emailOrder('tilopay'));

  assert.match(pending, /PAGO PENDIENTE/);
  assert.doesNotMatch(pending, /PAGO CONFIRMADO/);
  assert.match(paid, /PAGO CONFIRMADO/);
});

test('customer email escapes customer-supplied HTML', () => {
  const html = customerEmailHTML(emailOrder());

  assert.match(html, /Hola &lt;Ana&gt;,/);
  assert.match(html, /&lt;b&gt;100 metros norte&lt;\/b&gt;/);
  assert.doesNotMatch(html, /<b>100 metros norte<\/b>/);
});
