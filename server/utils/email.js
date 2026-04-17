/* Resend Email — Local dev server version (re-exports from api/utils for local dev) */
// In local dev, we import from the same logic. For Vercel, the api/ versions are used directly.
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.ORDER_NOTIFICATION_EMAIL;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Forge Costa Rica <orders@forge.shopping>';

function formatCRC(amount) {
  return `₡${Number(amount).toLocaleString('es-CR')}`;
}

function customerEmailHTML(order) {
  const isSinpe = order.paymentMethod === 'sinpe';
  const total = formatCRC(order.total);

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#0A0A0C;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0C;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#16161C;border-radius:6px;overflow:hidden;">
        <tr><td style="background:#16161C;padding:32px;text-align:center;border-bottom:1px solid #2A2A32;">
          <h1 style="margin:0;font-size:24px;color:#EAEAEC;font-weight:700;">FORGE</h1>
          <p style="margin:4px 0 0;font-size:12px;color:#8A8A94;letter-spacing:0.1em;text-transform:uppercase;">Costa Rica</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <h2 style="margin:0 0 8px;font-size:20px;color:#EAEAEC;">¡Gracias por tu pedido!</h2>
          <p style="margin:0 0 24px;font-size:14px;color:#8A8A94;line-height:1.6;">
            Hola ${order.customer.firstName}, tu pedido <strong style="color:#EAEAEC;">#${order.orderId}</strong> ha sido ${isSinpe ? 'recibido y está pendiente de verificación' : 'confirmado'}.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr><td style="padding:12px 0;font-size:14px;color:#EAEAEC;font-weight:600;">Arnés ForgeCR — Talla ${order.product.size}</td>
            <td style="padding:12px 0;font-size:14px;color:#EAEAEC;text-align:right;">x${order.product.quantity}</td></tr>
            <tr><td style="padding:16px 0 0;font-size:16px;color:#EAEAEC;font-weight:700;">Total</td>
            <td style="padding:16px 0 0;font-size:16px;color:#D44147;font-weight:700;text-align:right;">${total}</td></tr>
          </table>
          <p style="margin:0 0 24px;font-size:14px;color:#8A8A94;line-height:1.6;">
            ${order.shipping.address}<br/>${order.shipping.district}, ${order.shipping.canton}<br/>${order.shipping.province}, Costa Rica
          </p>
        </td></tr>
        <tr><td style="padding:24px 32px;border-top:1px solid #2A2A32;text-align:center;">
          <p style="margin:0;font-size:12px;color:#555560;">© 2026 Forge Costa Rica</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function adminEmailHTML(order) {
  const total = formatCRC(order.total);
  const method = order.paymentMethod === 'sinpe' ? 'SINPE' : 'Tilopay';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:20px;font-family:Arial,sans-serif;">
  <h2>Nuevo Pedido #${order.orderId} — ${method}</h2>
  <p><strong>${order.customer.firstName} ${order.customer.lastName}</strong><br/>${order.customer.email}<br/>${order.customer.phone}</p>
  <p><strong>${order.product.name}</strong> Talla ${order.product.size} x${order.product.quantity}<br/>Total: ${total}</p>
  <p>${order.shipping.address}<br/>${order.shipping.district}, ${order.shipping.canton}, ${order.shipping.province}</p>
  ${order.comments ? `<p>Comentarios: ${order.comments}</p>` : ''}
</body></html>`;
}

export async function sendOrderEmails(order) {
  if (!RESEND_API_KEY) {
    console.log('[Email] Skipped — no API key');
    return { customer: null, admin: null };
  }

  const keyPrefix = RESEND_API_KEY.slice(0, 8);
  console.log(`[Email] Sending order ${order.orderId} | from="${FROM_EMAIL}" | customer=${order.customer.email} | admin=${ADMIN_EMAIL || '(unset)'} | keyPrefix=${keyPrefix}…`);

  const isSinpe = order.paymentMethod === 'sinpe';
  const subject = isSinpe
    ? `Pedido recibido #${order.orderId}`
    : `Confirmación de pedido #${order.orderId}`;

  const sendEmail = async (to, subj, html) => {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject: subj, html })
    });
    const data = await res.json();
    if (!res.ok) {
      console.error(`[Email] Resend API error (${res.status}) to ${to}:`, JSON.stringify(data));
    } else {
      console.log(`[Email] Sent to ${to}, id: ${data.id}`);
    }
    return data;
  };

  const [customer, admin] = await Promise.all([
    sendEmail(order.customer.email, subject, customerEmailHTML(order)),
    ADMIN_EMAIL ? sendEmail(ADMIN_EMAIL, `Nuevo pedido #${order.orderId}`, adminEmailHTML(order)) : null
  ]);

  return { customer, admin };
}
