import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';

import {
  FORGE_PRODUCT,
  SHIPPING_COST,
  calculateOrderTotals,
  normalizeTrustedOrder
} from '../shared/order.js';

function sampleOrder(overrides = {}) {
  return {
    orderId: 'ORD-SHIPPING-TEST',
    customer: {
      firstName: 'Ana',
      lastName: 'Prueba',
      email: 'ana@example.com',
      phone: '88888888'
    },
    product: {
      name: 'Client supplied name',
      size: 'M/L',
      quantity: 1,
      unitPrice: 1
    },
    shipping: {
      province: 'San José',
      canton: 'San José',
      district: 'Carmen',
      address: '100 metros norte',
      cost: 0
    },
    subtotal: 1,
    total: 1,
    createdAt: '2026-08-13T12:00:00.000Z',
    ...overrides
  };
}

function mockResponse() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    end() {
      return this;
    }
  };
}

test('trusted totals add ₡3,000 shipping once per order', () => {
  assert.deepEqual(calculateOrderTotals(1), {
    subtotal: 14900,
    shippingCost: 3000,
    total: 17900
  });
  assert.deepEqual(calculateOrderTotals(2), {
    subtotal: 29800,
    shippingCost: 3000,
    total: 32800
  });
});

test('server normalization ignores client-supplied prices and totals', () => {
  const order = normalizeTrustedOrder(sampleOrder());

  assert.equal(order.product.name, FORGE_PRODUCT.name);
  assert.equal(order.product.unitPrice, FORGE_PRODUCT.unitPrice);
  assert.equal(order.shipping.cost, SHIPPING_COST);
  assert.equal(order.subtotal, 14900);
  assert.equal(order.total, 17900);
  assert.throws(() => normalizeTrustedOrder(sampleOrder({ product: { quantity: 0 } })), TypeError);
});

test('create-payment sends Tilopay the trusted ₡17,900 total', async () => {
  const originalFetch = globalThis.fetch;
  const requests = [];

  globalThis.fetch = async (url, options = {}) => {
    requests.push({ url: String(url), options });

    if (String(url).endsWith('/login')) {
      return { ok: true, json: async () => ({ access_token: 'test-token' }) };
    }

    return { ok: true, status: 200, json: async () => ({ url: 'https://pay.example.test' }) };
  };

  try {
    const { default: createPayment } = await import('../api/tilopay/create-payment.js');
    const res = mockResponse();
    await createPayment({ method: 'POST', body: sampleOrder() }, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.paymentUrl, 'https://pay.example.test');

    const paymentRequest = JSON.parse(requests[1].options.body);
    assert.equal(paymentRequest.amount, '17900.00');

    const returnedOrder = JSON.parse(Buffer.from(paymentRequest.returnData, 'base64').toString('utf8'));
    assert.equal(returnedOrder.subtotal, 14900);
    assert.equal(returnedOrder.shipping.cost, 3000);
    assert.equal(returnedOrder.total, 17900);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('approved redirect and webhook accept trusted return data', async () => {
  process.env.TILOPAY_WEBHOOK_SECRET = 'shipping-test-secret';
  const trustedOrder = normalizeTrustedOrder(sampleOrder());
  const returnData = Buffer.from(JSON.stringify(trustedOrder)).toString('base64');

  const { default: confirmPayment } = await import('../api/tilopay/confirm.js');
  const confirmRes = mockResponse();
  await confirmPayment({
    method: 'POST',
    body: { code: '1', transactionId: 'TX-TEST', returnData }
  }, confirmRes);

  assert.equal(confirmRes.statusCode, 200);
  assert.deepEqual(confirmRes.body, { success: true, orderId: trustedOrder.orderId });

  const webhookBody = { code: '1', transactionId: 'TX-TEST', returnData };
  const signature = createHmac('sha256', process.env.TILOPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(webhookBody))
    .digest('hex');
  const { default: webhook } = await import('../api/tilopay/webhook.js');
  const webhookRes = mockResponse();
  await webhook({
    method: 'POST',
    headers: { 'hash-tilopay': signature },
    body: webhookBody
  }, webhookRes);

  assert.equal(webhookRes.statusCode, 200);
  assert.deepEqual(webhookRes.body, { received: true, processed: true });
});
