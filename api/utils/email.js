/* Resend Email Service */
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.ORDER_NOTIFICATION_EMAIL;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Forge Costa Rica <orders@forge.shopping>';

function formatCRC(amount) {
  return `₡${Number(amount).toLocaleString('es-CR')}`;
}

function customerEmailHTML(order) {
  const isSinpe = order.paymentMethod === 'sinpe';
  const total = formatCRC(order.total);

  return `
<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#0A0A0C;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0C;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#16161C;border-radius:6px;overflow:hidden;">
        <!-- Header -->
        <tr><td style="background:#16161C;padding:32px;text-align:center;border-bottom:1px solid #2A2A32;">
          <h1 style="margin:0;font-size:24px;color:#EAEAEC;font-weight:700;">FORGE</h1>
          <p style="margin:4px 0 0;font-size:12px;color:#8A8A94;letter-spacing:0.1em;text-transform:uppercase;">Costa Rica</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px;">
          <h2 style="margin:0 0 8px;font-size:20px;color:#EAEAEC;">¡Gracias por tu pedido!</h2>
          <p style="margin:0 0 24px;font-size:14px;color:#8A8A94;line-height:1.6;">
            Hola ${order.customer.firstName}, tu pedido <strong style="color:#EAEAEC;">#${order.orderId}</strong> ha sido ${isSinpe ? 'recibido y está pendiente de verificación' : 'confirmado'}.
          </p>

          <!-- Order details -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr style="border-bottom:1px solid #2A2A32;">
              <td style="padding:12px 0;font-size:14px;color:#EAEAEC;font-weight:600;">Arnés ForgeCR — Talla ${order.product.size}</td>
              <td style="padding:12px 0;font-size:14px;color:#EAEAEC;text-align:right;">x${order.product.quantity}</td>
            </tr>
            <tr>
              <td style="padding:16px 0 0;font-size:16px;color:#EAEAEC;font-weight:700;">Total</td>
              <td style="padding:16px 0 0;font-size:16px;color:#D44147;font-weight:700;text-align:right;">${total}</td>
            </tr>
          </table>

          ${isSinpe ? `
          <div style="background:#101014;border:1px solid #2A2A32;border-radius:4px;padding:16px;margin-bottom:24px;">
            <p style="margin:0 0 8px;font-size:13px;color:#D44147;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Pago Pendiente — SINPE Móvil</p>
            <p style="margin:0;font-size:14px;color:#8A8A94;line-height:1.6;">Tu pedido será procesado una vez confirmemos el pago. Si aún no has realizado la transferencia, enviá ${total} al número SINPE indicado.</p>
          </div>
          ` : `
          <div style="background:#101014;border:1px solid #2A2A32;border-radius:4px;padding:16px;margin-bottom:24px;">
            <p style="margin:0 0 8px;font-size:13px;color:#3EBD7A;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Pago Confirmado</p>
            <p style="margin:0;font-size:14px;color:#8A8A94;line-height:1.6;">Tu pago fue procesado exitosamente. Prepararemos tu envío lo antes posible.</p>
          </div>
          `}

          <!-- Shipping -->
          <p style="margin:0 0 4px;font-size:12px;color:#8A8A94;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Dirección de envío</p>
          <p style="margin:0 0 24px;font-size:14px;color:#EAEAEC;line-height:1.6;">
            ${order.shipping.address}<br/>
            ${order.shipping.district}, ${order.shipping.canton}<br/>
            ${order.shipping.province}, Costa Rica
          </p>

          <p style="margin:0;font-size:13px;color:#8A8A94;line-height:1.6;">
            ¿Tenés alguna pregunta? Escribinos por <a href="https://wa.me/${process.env.WHATSAPP_NUMBER || '50671618029'}" style="color:#D44147;">WhatsApp</a>.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 32px;border-top:1px solid #2A2A32;text-align:center;">
          <p style="margin:0;font-size:12px;color:#555560;">© 2026 Forge Costa Rica. Todos los derechos reservados.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function adminEmailHTML(order) {
  const total = formatCRC(order.total);
  const method = order.paymentMethod === 'sinpe' ? 'SINPE Móvil' : 'Tilopay (Tarjeta)';
  const status = order.paymentMethod === 'sinpe' ? 'PENDIENTE' : 'PAGADO';

  return `
<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;">
        <tr><td style="background:#1a1a2e;padding:20px;text-align:center;">
          <h2 style="margin:0;color:#fff;font-size:18px;">Nuevo Pedido #${order.orderId}</h2>
          <p style="margin:4px 0 0;color:${status === 'PAGADO' ? '#3EBD7A' : '#E5A84D'};font-size:13px;font-weight:600;">${status} — ${method}</p>
        </td></tr>
        <tr><td style="padding:24px;">
          <h3 style="margin:0 0 12px;font-size:14px;color:#666;text-transform:uppercase;letter-spacing:0.05em;">Cliente</h3>
          <p style="margin:0 0 4px;font-size:15px;"><strong>${order.customer.firstName} ${order.customer.lastName}</strong></p>
          <p style="margin:0 0 4px;font-size:14px;color:#555;">${order.customer.email}</p>
          <p style="margin:0 0 20px;font-size:14px;color:#555;">${order.customer.phone}</p>

          <h3 style="margin:0 0 12px;font-size:14px;color:#666;text-transform:uppercase;letter-spacing:0.05em;">Producto</h3>
          <p style="margin:0 0 4px;font-size:15px;"><strong>${order.product.name}</strong> — Talla ${order.product.size}</p>
          <p style="margin:0 0 4px;font-size:14px;">Cantidad: ${order.product.quantity}</p>
          <p style="margin:0 0 20px;font-size:16px;font-weight:700;color:#D44147;">${total}</p>

          <h3 style="margin:0 0 12px;font-size:14px;color:#666;text-transform:uppercase;letter-spacing:0.05em;">Envío</h3>
          <p style="margin:0 0 4px;font-size:14px;">${order.shipping.address}</p>
          <p style="margin:0 0 4px;font-size:14px;">${order.shipping.district}, ${order.shipping.canton}</p>
          <p style="margin:0 0 20px;font-size:14px;">${order.shipping.province}, Costa Rica</p>

          ${order.comments ? `<h3 style="margin:0 0 12px;font-size:14px;color:#666;text-transform:uppercase;letter-spacing:0.05em;">Comentarios</h3><p style="margin:0 0 20px;font-size:14px;">${order.comments}</p>` : ''}
          ${order.sinpeRef ? `<p style="margin:0;font-size:14px;"><strong>Comprobante SINPE:</strong> ${order.sinpeRef}</p>` : ''}
          ${order.transactionId ? `<p style="margin:0;font-size:14px;"><strong>Transacción Tilopay:</strong> ${order.transactionId}</p>` : ''}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendOrderEmails(order) {
  if (!RESEND_API_KEY) {
    console.error('[Email] Skipped — no RESEND_API_KEY env var set');
    return { customer: null, admin: null };
  }

  const keyPrefix = RESEND_API_KEY.slice(0, 8);
  console.log(`[Email] Sending order ${order.orderId} | from="${FROM_EMAIL}" | customer=${order.customer.email} | admin=${ADMIN_EMAIL || '(unset)'} | keyPrefix=${keyPrefix}…`);

  const isSinpe = order.paymentMethod === 'sinpe';
  const subject = isSinpe
    ? `Pedido recibido #${order.orderId} — Pendiente de pago`
    : `Confirmación de pedido #${order.orderId}`;

  const sendEmail = async (to, subj, html) => {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({ from: FROM_EMAIL, to, subject: subj, html })
      });
      const data = await res.json();
      if (!res.ok) {
        console.error(`[Email] Resend API error (${res.status}) to ${to}:`, JSON.stringify(data));
      } else {
        console.log(`[Email] Sent successfully to ${to}, id: ${data.id}`);
      }
      return data;
    } catch (err) {
      console.error('[Email] Send failed:', err.message);
      return null;
    }
  };

  const [customer, admin] = await Promise.all([
    sendEmail(order.customer.email, subject, customerEmailHTML(order)),
    ADMIN_EMAIL ? sendEmail(ADMIN_EMAIL, `Nuevo pedido #${order.orderId} - ${order.paymentMethod.toUpperCase()}`, adminEmailHTML(order)) : null
  ]);

  return { customer, admin };
}
