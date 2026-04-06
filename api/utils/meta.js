/* Meta Conversions API Helper */
import { createHash } from 'crypto';

const PIXEL_ID = process.env.META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const GRAPH_URL = `https://graph.facebook.com/v18.0/${PIXEL_ID}/events`;

export function hashValue(value) {
  if (!value) return undefined;
  return createHash('sha256')
    .update(value.toString().trim().toLowerCase())
    .digest('hex');
}

export function buildUserData(customer) {
  const data = {};
  if (customer.email) data.em = [hashValue(customer.email)];
  if (customer.phone) data.ph = [hashValue(customer.phone.replace(/\D/g, ''))];
  if (customer.firstName) data.fn = [hashValue(customer.firstName)];
  if (customer.lastName) data.ln = [hashValue(customer.lastName)];
  if (customer.province) data.st = [hashValue(customer.province)];
  data.country = [hashValue('cr')];
  return data;
}

export function generateEventId(prefix, orderId, extra = '') {
  const parts = [prefix, orderId];
  if (extra) parts.push(extra);
  return parts.join('_');
}

export async function sendMetaEvent({ eventName, eventId, userData, customData, eventTime, sourceUrl }) {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.log('[Meta CAPI] Skipped — no pixel ID or access token configured');
    return null;
  }

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: eventTime || Math.floor(Date.now() / 1000),
        event_id: eventId,
        event_source_url: sourceUrl || process.env.SITE_URL,
        action_source: 'website',
        user_data: userData,
        custom_data: customData
      }
    ],
    access_token: ACCESS_TOKEN
  };

  try {
    const res = await fetch(GRAPH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    console.log(`[Meta CAPI] ${eventName} sent:`, result);
    return result;
  } catch (err) {
    console.error(`[Meta CAPI] ${eventName} failed:`, err.message);
    return null;
  }
}
