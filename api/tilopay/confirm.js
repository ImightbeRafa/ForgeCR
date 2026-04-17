/* Tilopay — Confirm Payment (success redirect) */
import { sendOrderEmails } from '../utils/email.js';
import { sendOrderToBetsyWithRetry } from '../utils/betsy.js';
import { buildUserData, generateEventId, sendMetaEvent } from '../utils/meta.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { returnData, code, transactionId } = req.body;

    if (code !== '1' && code !== 1) {
      return res.status(400).json({ error: 'Payment not successful', code });
    }

    let order;
    try {
      const decoded = Buffer.from(returnData, 'base64').toString('utf-8');
      order = JSON.parse(decoded);
    } catch (e) {
      console.error('[Confirm] returnData decode failed:', e.message);
      return res.status(400).json({ error: 'Invalid returnData' });
    }

    order.transactionId = transactionId;
    order.paymentMethod = 'tilopay';

    // Send emails (non-blocking)
    const emailPromise = sendOrderEmails(order).catch(err => {
      console.error('[Email] Error:', err.message);
    });

    // Sync to BetsyCRM (non-blocking)
    const betsyPromise = sendOrderToBetsyWithRetry(order).catch(err => {
      console.error('[Betsy] Error:', err.message);
    });

    // Send Purchase event to Meta CAPI
    const eventId = generateEventId('purchase', order.orderId, transactionId);
    const userData = buildUserData({
      email: order.customer.email,
      phone: order.customer.phone,
      firstName: order.customer.firstName,
      lastName: order.customer.lastName,
      province: order.shipping.province
    });

    const metaPromise = sendMetaEvent({
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
    }).catch(err => console.error('[Meta CAPI] Purchase error:', err.message));

    // Wait for all (non-blocking — order already confirmed)
    await Promise.allSettled([emailPromise, betsyPromise, metaPromise]);

    return res.status(200).json({ success: true, orderId: order.orderId });
  } catch (err) {
    console.error('[Confirm] Error:', err);
    return res.status(500).json({ error: 'Confirmation processing failed' });
  }
}
