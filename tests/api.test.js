import test from 'node:test';
import assert from 'node:assert/strict';

process.env.ORDER_DRY_RUN = 'true';
process.env.ORDER_SIGNING_SECRET = 'test-secret';
process.env.SINPE_PHONE = '8888-7777';
process.env.SINPE_HOLDER = 'ForgeCR Test';
process.env.TILOPAY_API_KEY = 'k';
process.env.TILOPAY_USER = 'u';
process.env.TILOPAY_PASSWORD = 'p';
delete process.env.VITE_SOLD_OUT;
delete process.env.SOLD_OUT;

const { signOrder, verifyOrderToken } = await import('../api/_lib/sign.js');
const { default: sinpe } = await import('../api/sinpe/create-order.js');
const { default: card } = await import('../api/tilopay/create-payment.js');
const { default: confirm } = await import('../api/tilopay/confirm.js');
const { default: config } = await import('../api/config.js');

function call(handler, { method = 'POST', body = {}, headers = {} } = {}) {
  return new Promise((resolve) => {
    const res = {
      statusCode: 200,
      headers: {},
      setHeader(k, v) {
        this.headers[k] = v;
      },
      status(c) {
        this.statusCode = c;
        return this;
      },
      json(d) {
        resolve({ status: this.statusCode, body: d, headers: this.headers });
        return this;
      }
    };
    handler({ method, body, headers: { host: 'localhost:3000', ...headers } }, res);
  });
}

const customer = {
  nombre: 'Maria Fernandez',
  telefono: '8888-1234',
  email: 'maria@example.com',
  provincia: 'Heredia',
  canton: 'Heredia',
  distrito: 'San Rafael',
  direccion: '200 m norte de la iglesia, casa blanca'
};

test('SINPE: creates a pending order, re-prices server-side and returns payment instructions', async () => {
  const r = await call(sinpe, {
    body: { ...customer, items: [{ key: 'arnes-ml', qty: 2 }], total: 1, clientOrderId: 'ORD-1791071433000-2906' }
  });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.equal(r.body.total, 26900); // pack-2 + free shipping
  assert.equal(r.body.orderId, 'ORD-1791071433000-2906');
  assert.deepEqual(r.body.sinpe, {
    phone: '88887777',
    holder: 'ForgeCR Test',
    amount: 26900,
    reference: 'ORD-1791071433000-2906'
  });
});

test('SINPE: rejects invalid fields with per-field errors', async () => {
  const r = await call(sinpe, { body: { ...customer, telefono: '12', items: [{ key: 'arnes-ml', qty: 1 }] } });
  assert.equal(r.status, 400);
  assert.ok(r.body.errors.telefono);
});

test('SINPE: rejects empty or unknown carts and honeypot spam', async () => {
  assert.equal((await call(sinpe, { body: { ...customer, items: [{ key: 'bogus', qty: 1 }] } })).status, 400);
  assert.equal(
    (await call(sinpe, { body: { ...customer, items: [{ key: 'arnes-ml', qty: 1 }], website: 'http://spam' } })).status,
    400
  );
});

test('SINPE: unavailable in production when SINPE_PHONE/HOLDER are not configured', async () => {
  const phone = process.env.SINPE_PHONE;
  process.env.SINPE_PHONE = '';
  process.env.VERCEL_ENV = 'production';
  const { sinpeConfig } = await import('../api/_lib/http.js');
  const prodConfig = sinpeConfig();
  delete process.env.VERCEL_ENV;
  process.env.ORDER_DRY_RUN = 'false';
  const r = await call(sinpe, { body: { ...customer, items: [{ key: 'arnes-ml', qty: 1 }] } });
  process.env.ORDER_DRY_RUN = 'true';
  process.env.SINPE_PHONE = phone;
  assert.equal(prodConfig.enabled, false);
  assert.equal(r.status, 503);
  assert.equal(r.body.error, 'sinpe_unavailable');
});

test('SINPE: the local sandbox uses a sample number when none is configured', async () => {
  const phone = process.env.SINPE_PHONE;
  process.env.SINPE_PHONE = '';
  const r = await call(sinpe, { body: { ...customer, items: [{ key: 'arnes-ml', qty: 1 }] } });
  process.env.SINPE_PHONE = phone;
  assert.equal(r.status, 200);
  assert.equal(r.body.sinpe.phone, '88880000');
});

test('Paid orders keep sizes that sold out after payment', async () => {
  const { normalizeTrustedOrder, catalog } = await import('../api/_lib/order.js');
  catalog.config.soldOut.push('arnes-4xl');
  const open = normalizeTrustedOrder({ items: [{ key: 'arnes-4xl', qty: 1 }] });
  const paid = normalizeTrustedOrder({ items: [{ key: 'arnes-4xl', qty: 1 }] }, { paid: true });
  catalog.config.soldOut.pop();
  assert.equal(open.items.length, 0);
  assert.equal(paid.items.length, 1);
  assert.equal(paid.total, 14900);
});

test('API only accepts same-origin POST', async () => {
  assert.equal((await call(sinpe, { method: 'GET' })).status, 405);
  assert.equal((await call(sinpe, { headers: { origin: 'https://evil.example' }, body: {} })).status, 403);
});

test('config exposes payment availability, no secrets', async () => {
  const r = await call(config, { method: 'GET' });
  assert.deepEqual(r.body, { sinpe: { enabled: true }, card: { enabled: true } });
});

test('signed order tokens verify and reject tampering', () => {
  const token = signOrder({ orderId: 'ORD-1', items: [{ key: 'arnes-ml', qty: 1 }] });
  assert.equal(verifyOrderToken(token).orderId, 'ORD-1');
  const [payload, sig] = token.split('.');
  const forged = Buffer.from(
    JSON.stringify({ orderId: 'ORD-1', items: [{ key: 'arnes-ml', qty: 9 }] })
  ).toString('base64url');
  assert.throws(() => verifyOrderToken(`${forged}.${sig}`));
  assert.throws(() => verifyOrderToken(payload));
  assert.throws(() => verifyOrderToken(''));
});

test('card: create-payment (sandbox) returns a signed redirect that confirm accepts', async () => {
  const created = await call(card, { body: { ...customer, items: [{ key: 'arnes-xl', qty: 1 }] } });
  assert.equal(created.status, 200, JSON.stringify(created.body));
  const url = new URL(created.body.paymentUrl);
  assert.equal(url.pathname, '/success.html');
  const confirmed = await call(confirm, {
    body: {
      orderId: url.searchParams.get('orderId'),
      transactionId: 'T1',
      code: '1',
      returnData: url.searchParams.get('returnData')
    }
  });
  assert.equal(confirmed.status, 200, JSON.stringify(confirmed.body));
  assert.equal(confirmed.body.total, 14900);
});

test('card: confirm refuses forged redirects (no signature, tampered data, declined code)', async () => {
  const legacy = Buffer.from(
    JSON.stringify({ orderId: 'ORD-1791071433000-1111', items: [{ key: 'arnes-ml', qty: 1 }], ...customer })
  ).toString('base64');
  assert.equal((await call(confirm, { body: { orderId: 'ORD-1', code: '1', returnData: legacy } })).status, 400);
  assert.equal((await call(confirm, { body: { orderId: 'ORD-1', code: '1' } })).status, 400);
  assert.equal((await call(confirm, { body: { orderId: 'ORD-1', code: '0', returnData: signOrder({}) } })).status, 400);
});
