/* BetsyCRM Integration with Retry Logic */
const BETSY_API_KEY = process.env.BETSY_API_KEY;
const BETSY_API_URL = process.env.BETSY_API_URL || 'https://www.betsycrm.com/api/integration/orders/create';

function buildBetsyPayload(order) {
  const isSinpe = order.paymentMethod === 'sinpe';

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
      unitPrice: String(order.product.unitPrice)
    },
    shipping: {
      cost: '0',
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
      method: isSinpe ? 'SINPE' : 'Tilopay',
      transactionId: order.transactionId || order.sinpeRef || '',
      status: isSinpe ? 'PENDIENTE' : 'PAGADO',
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
    console.error('[Betsy] Skipped — no API key configured');
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
        return await res.json();
      }

      if (res.status >= 400 && res.status < 500) {
        const errorText = await res.text();
        console.error(`[Betsy] 4xx error (no retry): ${res.status} — ${errorText}`);
        return null;
      }

      console.warn(`[Betsy] Attempt ${attempt}/${maxRetries} failed: ${res.status}`);
    } catch (err) {
      clearTimeout(timeout);
      console.warn(`[Betsy] Attempt ${attempt}/${maxRetries} error: ${err.message}`);
    }

    if (attempt < maxRetries) {
      await new Promise(r => setTimeout(r, attempt * 1000));
    }
  }

  console.error(`[Betsy] All ${maxRetries} attempts failed for order ${order.orderId}`);
  return null;
}
