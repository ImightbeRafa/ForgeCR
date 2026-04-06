/* SINPE Móvil Order Processing */
import { sendOrderEmails } from '../utils/email.js';
import { sendOrderToBetsyWithRetry } from '../utils/betsy.js';
import { buildUserData, generateEventId, sendMetaEvent } from '../utils/meta.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const order = req.body;
    order.paymentMethod = 'sinpe';

    // Send emails
    const emailPromise = sendOrderEmails(order).catch(err => {
      console.error('[SINPE Email]', err.message);
    });

    // Sync to BetsyCRM with PENDIENTE status
    const betsyPromise = sendOrderToBetsyWithRetry(order).catch(err => {
      console.error('[SINPE Betsy]', err.message);
    });

    // Meta CAPI Lead event
    const eventId = generateEventId('lead', order.orderId);
    const userData = buildUserData({
      email: order.customer.email,
      phone: order.customer.phone,
      firstName: order.customer.firstName,
      lastName: order.customer.lastName,
      province: order.shipping.province
    });

    const metaPromise = sendMetaEvent({
      eventName: 'Lead',
      eventId,
      userData,
      customData: {
        content_name: order.product.name,
        content_category: 'SINPE',
        value: order.total,
        currency: 'CRC'
      },
      sourceUrl: process.env.SITE_URL
    }).catch(err => console.error('[SINPE Meta]', err.message));

    await Promise.allSettled([emailPromise, betsyPromise, metaPromise]);

    return res.status(200).json({ success: true, orderId: order.orderId });
  } catch (err) {
    console.error('[SINPE] Error:', err);
    return res.status(500).json({ error: 'SINPE order processing failed' });
  }
}
