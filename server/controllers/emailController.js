import { sendOrderEmails } from '../utils/email.js';
import { sendOrderToBetsyWithRetry } from '../utils/betsy.js';

export async function sendSinpe(req, res) {
  try {
    const order = req.body;
    order.paymentMethod = 'sinpe';

    sendOrderEmails(order).catch(e => console.error('[SINPE Email]', e.message));
    sendOrderToBetsyWithRetry(order).catch(e => console.error('[SINPE Betsy]', e.message));

    return res.json({ success: true, orderId: order.orderId });
  } catch (err) {
    console.error('[SINPE]', err);
    return res.status(500).json({ error: 'SINPE order failed' });
  }
}
