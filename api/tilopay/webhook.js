/* Tilopay — Webhook (async backup) */
import { createHmac } from 'crypto';
import { sendOrderEmails } from '../utils/email.js';
import { sendOrderToBetsyWithRetry } from '../utils/betsy.js';
import { buildUserData, generateEventId, sendMetaEvent } from '../utils/meta.js';

function verifyHMAC(body, signature) {
  const secret = process.env.TILOPAY_WEBHOOK_SECRET;
  if (!secret) return false;

  const raw = typeof body === 'string' ? body : JSON.stringify(body);
  const expected = createHmac('sha256', secret).update(raw).digest('hex');
  return expected === signature;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const signature = req.headers['hash-tilopay'] || req.headers['x-tilopay-secret'];

    if (!verifyHMAC(req.body, signature)) {
      console.error('[Webhook] HMAC verification failed');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { code, returnData, transactionId } = req.body;

    if (code !== '1' && code !== 1) {
      return res.status(200).json({ received: true, processed: false });
    }

    let order;
    try {
      const decoded = Buffer.from(returnData, 'base64').toString('utf-8');
      order = JSON.parse(decoded);
    } catch (e) {
      console.error('[Webhook] Invalid returnData');
      return res.status(400).json({ error: 'Invalid returnData' });
    }

    order.transactionId = transactionId;
    order.paymentMethod = 'tilopay';

    // Send emails
    sendOrderEmails(order).catch(err => console.error('[Webhook Email]', err.message));

    // Sync to BetsyCRM
    sendOrderToBetsyWithRetry(order).catch(err => console.error('[Webhook Betsy]', err.message));

    // Meta CAPI Purchase
    const eventId = generateEventId('purchase', order.orderId, transactionId);
    const userData = buildUserData({
      email: order.customer.email,
      phone: order.customer.phone,
      firstName: order.customer.firstName,
      lastName: order.customer.lastName,
      province: order.shipping.province
    });

    sendMetaEvent({
      eventName: 'Purchase',
      eventId,
      userData,
      customData: {
        content_name: order.product.name,
        content_ids: ['arnes-forgecr'],
        content_type: 'product',
        num_items: order.product.quantity,
        value: order.total,
        currency: 'CRC',
        order_id: order.orderId,
        transaction_id: transactionId
      },
      sourceUrl: `${process.env.SITE_URL}/success.html`
    }).catch(err => console.error('[Webhook Meta]', err.message));

    return res.status(200).json({ received: true, processed: true });
  } catch (err) {
    console.error('[Webhook] Error:', err);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
