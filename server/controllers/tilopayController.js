import { createHmac } from 'crypto';
import { sendOrderEmails } from '../utils/email.js';
import { sendOrderToBetsyWithRetry } from '../utils/betsy.js';

const BASE_URL = process.env.TILOPAY_BASE_URL || 'https://app.tilopay.com/api/v1';
const SITE_URL = process.env.SITE_URL || 'http://localhost:5173';

async function authenticate() {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiuser: process.env.TILOPAY_USER,
      password: process.env.TILOPAY_PASSWORD
    })
  });
  if (!res.ok) throw new Error(`Auth failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

export async function createPayment(req, res) {
  try {
    const order = req.body;
    const token = await authenticate();

    const returnData = Buffer.from(JSON.stringify({
      orderId: order.orderId,
      customer: order.customer,
      product: order.product,
      shipping: order.shipping,
      total: order.total,
      paymentMethod: 'tilopay',
      comments: order.comments,
      createdAt: order.createdAt
    })).toString('base64');

    const payRes = await fetch(`${BASE_URL}/processPayment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        key: process.env.TILOPAY_API_KEY,
        amount: order.total,
        currency: 'CRC',
        orderNumber: order.orderId,
        capture: '1',
        hashVersion: 'V2',
        platform: 'Forge Costa Rica',
        redirect: `${SITE_URL}/success.html`,
        returnData,
        billToFirstName: order.customer.firstName,
        billToLastName: order.customer.lastName,
        billToAddress: order.shipping.address,
        billToCity: order.shipping.canton,
        billToCountry: 'CR'
      })
    });

    const payData = await payRes.json();

    if (!payData.url) {
      return res.status(400).json({ error: 'No payment URL', details: payData });
    }

    return res.json({ paymentUrl: payData.url });
  } catch (err) {
    console.error('[Tilopay Create]', err);
    return res.status(500).json({ error: 'Payment creation failed' });
  }
}

export async function confirmPayment(req, res) {
  // === DIAGNOSTIC LOGGING (remove after Tilopay flow is confirmed working) ===
  console.log('[Confirm] Received | body keys:', Object.keys(req.body || {}), '| code=', req.body?.code, '| txnId=', req.body?.transactionId, '| returnDataLength=', req.body?.returnData?.length || 0);
  // === END DIAGNOSTIC ===
  try {
    const { returnData, code, transactionId } = req.body;

    if (code !== '1' && code !== 1) {
      return res.status(400).json({ error: 'Payment not successful', code });
    }

    let order;
    try {
      order = JSON.parse(Buffer.from(returnData, 'base64').toString('utf-8'));
      console.log('[Confirm] Decoded order:', order.orderId, '| customer email:', order.customer?.email);
    } catch (e) {
      console.error('[Confirm] returnData decode failed:', e.message);
      return res.status(400).json({ error: 'Invalid returnData' });
    }

    order.transactionId = transactionId;
    order.paymentMethod = 'tilopay';

    sendOrderEmails(order).catch(e => console.error('[Email]', e.message));
    sendOrderToBetsyWithRetry(order).catch(e => console.error('[Betsy]', e.message));

    return res.json({ success: true, orderId: order.orderId });
  } catch (err) {
    console.error('[Tilopay Confirm]', err);
    return res.status(500).json({ error: 'Confirmation failed' });
  }
}

export async function handleWebhook(req, res) {
  try {
    const signature = req.headers['hash-tilopay'] || req.headers['x-tilopay-secret'];
    const secret = process.env.TILOPAY_WEBHOOK_SECRET;

    if (secret && signature) {
      const raw = JSON.stringify(req.body);
      const expected = createHmac('sha256', secret).update(raw).digest('hex');
      if (expected !== signature) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    const { code, returnData, transactionId } = req.body;
    if (code !== '1' && code !== 1) {
      return res.json({ received: true, processed: false });
    }

    const decoded = Buffer.from(returnData, 'base64').toString('utf-8');
    const order = JSON.parse(decoded);
    order.transactionId = transactionId;
    order.paymentMethod = 'tilopay';

    sendOrderEmails(order).catch(e => console.error('[Webhook Email]', e.message));
    sendOrderToBetsyWithRetry(order).catch(e => console.error('[Webhook Betsy]', e.message));

    return res.json({ received: true, processed: true });
  } catch (err) {
    console.error('[Webhook]', err);
    return res.status(500).json({ error: 'Webhook failed' });
  }
}
