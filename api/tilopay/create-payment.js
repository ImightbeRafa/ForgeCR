/* Tilopay — Create Payment */
import { buildUserData, generateEventId, sendMetaEvent } from '../utils/meta.js';

const BASE_URL = process.env.TILOPAY_BASE_URL || 'https://app.tilopay.com/api/v1';
const SITE_URL = process.env.SITE_URL || 'https://forge.shopping';

async function authenticate() {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiuser: process.env.TILOPAY_USER,
      password: process.env.TILOPAY_PASSWORD
    })
  });

  if (!res.ok) throw new Error(`Tilopay auth failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

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

    const paymentBody = {
      key: process.env.TILOPAY_API_KEY,
      amount: Number(order.total).toFixed(2),
      currency: 'CRC',
      orderNumber: order.orderId,
      capture: '1',
      hashVersion: 'V2',
      platform: 'Forge Costa Rica',
      redirect: `${SITE_URL}/success.html`,
      callback_url: `${SITE_URL}/api/tilopay/webhook`,
      returnData,
      billToFirstName: order.customer.firstName,
      billToLastName: order.customer.lastName,
      billToAddress: order.shipping.address,
      billToAddress2: '',
      billToCity: order.shipping.canton,
      billToState: order.shipping.province,
      billToZipCode: '10101',
      billToCountry: 'CR',
      billToEmail: order.customer.email,
      billToPhone: order.customer.phone.replace(/\D/g, ''),
      shipToFirstName: order.customer.firstName,
      shipToLastName: order.customer.lastName,
      shipToAddress: order.shipping.address,
      shipToAddress2: '',
      shipToCity: order.shipping.canton,
      shipToState: order.shipping.province,
      shipToZipCode: '10101',
      shipToCountry: 'CR'
    };

    const payRes = await fetch(`${BASE_URL}/processPayment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(paymentBody)
    });

    const payData = await payRes.json();

    if (!payData.url) {
      console.error('[Tilopay] No URL returned. Status:', payRes.status, 'Body:', payData);
      return res.status(400).json({ error: 'No payment URL received', details: payData });
    }

    // Send InitiateCheckout to Meta CAPI
    const eventId = generateEventId('ic', order.orderId);
    const userData = buildUserData({
      email: order.customer.email,
      phone: order.customer.phone,
      firstName: order.customer.firstName,
      lastName: order.customer.lastName,
      province: order.shipping.province
    });

    sendMetaEvent({
      eventName: 'InitiateCheckout',
      eventId,
      userData,
      customData: {
        content_name: order.product.name,
        content_ids: ['arnes-forgecr'],
        content_type: 'product',
        num_items: order.product.quantity,
        value: order.total,
        currency: 'CRC'
      },
      sourceUrl: SITE_URL
    }).catch(err => console.error('[Meta CAPI] IC error:', err.message));

    return res.status(200).json({ paymentUrl: payData.url });
  } catch (err) {
    console.error('[Tilopay] Create payment error:', err);
    return res.status(500).json({ error: 'Payment processing failed' });
  }
}
