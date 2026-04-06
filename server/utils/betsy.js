/* BetsyCRM — Local dev server version (same logic as api/utils/betsy.js) */
const BETSY_API_KEY = process.env.BETSY_API_KEY;
const BETSY_API_URL = process.env.BETSY_API_URL || 'https://www.betsycrm.com/api/integration/orders/create';

function buildBetsyPayload(order) {
  return {
    orderId: order.orderId,
    customer: {
      name: `${order.customer.firstName} ${order.customer.lastName}`,
      phone: order.customer.phone,
      email: order.customer.email
    },
    product: {
      name: order.product.name,
      quantity: order.product.quantity,
      unitPrice: order.product.unitPrice
    },
    shipping: {
      cost: 0,
      courier: 'Correos de Costa Rica',
      address: {
        province: order.shipping.province,
        canton: order.shipping.canton,
        district: order.shipping.district,
        fullAddress: order.shipping.address
      }
    },
    total: `₡${Number(order.total).toLocaleString('es-CR')}`,
    payment: {
      method: order.paymentMethod === 'sinpe' ? 'SINPE' : 'Tilopay',
      transactionId: order.transactionId || order.sinpeRef || '',
      status: order.paymentMethod === 'sinpe' ? 'PENDIENTE' : 'PAGADO',
      date: order.createdAt || new Date().toISOString()
    },
    source: 'Forge Costa Rica Website',
    salesChannel: 'Website',
    seller: 'Website',
    metadata: {
      campaign: 'organic',
      referrer: 'direct',
      comments: order.comments || '',
      size: order.product.size,
      createdAt: order.createdAt || new Date().toISOString()
    }
  };
}

export async function sendOrderToBetsyWithRetry(order, maxRetries = 3) {
  if (!BETSY_API_KEY) {
    console.log('[Betsy] Skipped — no API key');
    return null;
  }

  const payload = buildBetsyPayload(order);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(BETSY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': BETSY_API_KEY
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (res.ok) {
        console.log(`[Betsy] Synced order ${order.orderId}`);
        return await res.json();
      }

      if (res.status >= 400 && res.status < 500) {
        console.error(`[Betsy] 4xx: ${res.status}`);
        return null;
      }
    } catch (err) {
      clearTimeout(timeout);
      console.warn(`[Betsy] Attempt ${attempt}: ${err.message}`);
    }

    if (attempt < maxRetries) {
      await new Promise(r => setTimeout(r, attempt * 1000));
    }
  }

  console.error(`[Betsy] Failed for ${order.orderId}`);
  return null;
}
