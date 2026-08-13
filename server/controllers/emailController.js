import { sendOrderEmails } from '../utils/email.js';
import { sendOrderToBetsyWithRetry } from '../utils/betsy.js';
import { normalizeTrustedOrder } from '../../shared/order.js';

export async function sendSinpe(req, res) {
  try {
    const order = normalizeTrustedOrder(req.body);
    order.paymentMethod = 'sinpe';

    sendOrderEmails(order).catch(e => console.error('[SINPE Email]', e.message));
    sendOrderToBetsyWithRetry(order).catch(e => console.error('[SINPE Betsy]', e.message));

    return res.json({ success: true, orderId: order.orderId });
  } catch (err) {
    console.error('[SINPE]', err);
    const status = err instanceof TypeError ? 400 : 500;
    return res.status(status).json({ error: status === 400 ? err.message : 'SINPE order failed' });
  }
}
