/* Resend Email Service */
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.ORDER_NOTIFICATION_EMAIL;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Forge Costa Rica <orders@forge.shopping>';
const SITE_URL = (process.env.SITE_URL || 'https://forge.shopping').replace(/\/$/, '');
const LOGO_URL = `${SITE_URL}/images/forgecr-logo.png`;

function formatCRC(amount) {
  return `₡${Number(amount).toLocaleString('es-CR')}`;
}

function escapeHTML(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function customerEmailHTML(order) {
  const isSinpe = order.paymentMethod === 'sinpe';
  const subtotal = formatCRC(order.subtotal);
  const shipping = formatCRC(order.shipping.cost);
  const total = formatCRC(order.total);
  const firstName = escapeHTML(order.customer.firstName);
  const orderId = escapeHTML(order.orderId);
  const productName = escapeHTML(order.product.name);
  const size = escapeHTML(order.product.size);
  const quantity = escapeHTML(order.product.quantity);
  const address = escapeHTML(order.shipping.address);
  const district = escapeHTML(order.shipping.district);
  const canton = escapeHTML(order.shipping.canton);
  const province = escapeHTML(order.shipping.province);
  const whatsappNumber = String(process.env.WHATSAPP_NUMBER || '50671618029').replace(/\D/g, '');
  const statusColor = isSinpe ? '#E5A84D' : '#3EBD7A';
  const statusBackground = isSinpe ? '#2B2315' : '#13271D';
  const statusLabel = isSinpe ? 'PAGO PENDIENTE' : 'PAGO CONFIRMADO';
  const headline = isSinpe ? 'Recibimos tu pedido' : '¡Tu pedido está confirmado!';
  const statusMessage = isSinpe
    ? `Confirmaremos tu pedido cuando verifiquemos la transferencia SINPE por ${total}.`
    : 'Tu pago fue procesado correctamente. Ahora prepararemos tu pedido para el envío.';

  return `
<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Pedido ${orderId} | ForgeCR</title>
</head>
<body style="margin:0;padding:0;background:#08080A;font-family:Arial,Helvetica,sans-serif;color:#EAEAEC;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${headline} — Pedido ${orderId}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08080A;">
    <tr><td align="center" style="padding:32px 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#151519;border:1px solid #2A2A32;border-radius:12px;overflow:hidden;">
        <tr><td style="height:4px;background:#D44147;font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td align="center" style="background:#000000;padding:26px 24px 20px;">
          <a href="${SITE_URL}" style="text-decoration:none;">
            <img src="${LOGO_URL}" width="230" alt="ForgeCR" style="display:block;width:230px;max-width:100%;height:auto;border:0;margin:0 auto;"/>
          </a>
          <p style="margin:12px 0 0;font-size:10px;line-height:1.4;color:#8A8A94;letter-spacing:2px;text-transform:uppercase;">Equipo de postura · Costa Rica</p>
        </td></tr>

        <tr><td style="padding:36px 34px 30px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="background:${statusBackground};border:1px solid ${statusColor};border-radius:999px;padding:6px 11px;font-size:10px;line-height:1;color:${statusColor};font-weight:700;letter-spacing:1.2px;">${statusLabel}</td>
          </tr></table>
          <h1 style="margin:18px 0 10px;font-size:27px;line-height:1.2;color:#FFFFFF;font-weight:700;">${headline}</h1>
          <p style="margin:0 0 8px;font-size:15px;color:#B9B9C2;line-height:1.65;">Hola ${firstName},</p>
          <p style="margin:0 0 26px;font-size:15px;color:#B9B9C2;line-height:1.65;">${statusMessage}</p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0E0E12;border:1px solid #2A2A32;border-radius:8px;">
            <tr><td colspan="2" style="padding:17px 20px;border-bottom:1px solid #2A2A32;">
              <p style="margin:0;font-size:10px;color:#777783;letter-spacing:1.4px;text-transform:uppercase;">Resumen del pedido</p>
              <p style="margin:6px 0 0;font-size:13px;color:#EAEAEC;font-weight:700;">#${orderId}</p>
            </td></tr>
            <tr>
              <td style="padding:18px 20px 15px;font-size:14px;color:#EAEAEC;font-weight:700;">${productName}<br/><span style="font-size:12px;color:#8A8A94;font-weight:400;">Talla ${size}</span></td>
              <td align="right" style="padding:18px 20px 15px;font-size:13px;color:#B9B9C2;vertical-align:top;">Cant. ${quantity}</td>
            </tr>
            <tr>
              <td style="padding:4px 20px;font-size:13px;color:#8A8A94;">Subtotal</td>
              <td align="right" style="padding:4px 20px;font-size:13px;color:#B9B9C2;">${subtotal}</td>
            </tr>
            <tr>
              <td style="padding:4px 20px 15px;font-size:13px;color:#8A8A94;">Envío</td>
              <td align="right" style="padding:4px 20px 15px;font-size:13px;color:#B9B9C2;">${shipping}</td>
            </tr>
            <tr>
              <td style="padding:16px 20px;border-top:1px solid #2A2A32;font-size:15px;color:#FFFFFF;font-weight:700;">Total</td>
              <td align="right" style="padding:16px 20px;border-top:1px solid #2A2A32;font-size:19px;color:#D44147;font-weight:700;">${total}</td>
            </tr>
          </table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px;background:#1B1B21;border-radius:8px;">
            <tr><td style="padding:18px 20px;">
              <p style="margin:0 0 7px;font-size:10px;color:#777783;letter-spacing:1.4px;text-transform:uppercase;font-weight:700;">Dirección de envío</p>
              <p style="margin:0;font-size:14px;color:#EAEAEC;line-height:1.65;">${address}<br/>${district}, ${canton}<br/>${province}, Costa Rica</p>
            </td></tr>
          </table>

          ${isSinpe ? '' : `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px;">
            <tr>
              <td width="28" valign="top" style="font-size:18px;color:#3EBD7A;">✓</td>
              <td style="font-size:13px;color:#A7A7B0;line-height:1.55;"><strong style="color:#EAEAEC;">Siguiente paso:</strong> prepararemos tu pedido y coordinaremos el envío. El tiempo de entrega varía según tu ubicación.</td>
            </tr>
          </table>`}

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:30px;">
            <tr><td align="center">
              <a href="https://wa.me/${whatsappNumber}" style="display:inline-block;background:#D44147;color:#FFFFFF;text-decoration:none;font-size:13px;font-weight:700;line-height:1;padding:14px 22px;border-radius:6px;">¿Necesitás ayuda? Escribinos</a>
            </td></tr>
          </table>
          <p style="margin:16px 0 0;text-align:center;font-size:11px;color:#686872;line-height:1.5;">Conservá este correo como comprobante de tu pedido.</p>
        </td></tr>

        <tr><td align="center" style="padding:22px 24px;border-top:1px solid #2A2A32;background:#101014;">
          <p style="margin:0 0 5px;font-size:12px;color:#A7A7B0;font-weight:700;">ForgeCR · Costa Rica</p>
          <p style="margin:0;font-size:10px;color:#555560;line-height:1.5;">Materiales de calidad para acompañar tu rendimiento.</p>
          <p style="margin:10px 0 0;font-size:10px;color:#555560;">© 2026 Forge Costa Rica. Todos los derechos reservados.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function adminEmailHTML(order) {
  const subtotal = formatCRC(order.subtotal);
  const shipping = formatCRC(order.shipping.cost);
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
          <p style="margin:0 0 4px;font-size:14px;">Subtotal: ${subtotal}</p>
          <p style="margin:0 0 4px;font-size:14px;">Envío: ${shipping}</p>
          <p style="margin:0 0 20px;font-size:16px;font-weight:700;color:#D44147;">Total: ${total}</p>

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
