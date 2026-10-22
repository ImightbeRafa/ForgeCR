/** Small helpers shared by the API handlers. */

/** Same-origin only: no CORS headers are emitted. Rejects cross-site browser POSTs. */
export function guardPost(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return false;
  }
  const origin = req.headers.origin;
  // Behind Caddy/Cloudflare the public host may arrive as X-Forwarded-Host.
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (origin) {
    let originHost = '';
    try { originHost = new URL(origin).host; } catch { /* fall through */ }
    if (originHost !== host) {
      res.status(403).json({ error: 'Forbidden origin' });
      return false;
    }
  }
  return true;
}

export function appUrl() {
  let url = process.env.APP_URL || 'https://www.forge.shopping';
  if (!/^https?:\/\//.test(url)) url = `https://${url}`;
  return url.replace(/\/+$/, '');
}

export function parseBody(req) {
  const body = req.body;
  if (!body) return {};
  if (typeof body === 'string') {
    try { return JSON.parse(body); } catch { return {}; }
  }
  return body;
}

export function newOrderId() {
  return `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export const ORDER_ID_RE = /^ORD-\d{10,}-\d{4}$/;

export function sinpeConfig() {
  const phone = String(process.env.SINPE_PHONE || '').replace(/\D/g, '');
  const holder = String(process.env.SINPE_HOLDER || '').trim();
  if (!(phone.length === 8 && holder) && isDryRun()) {
    // Sandbox only (isDryRun is never true in production): lets the SINPE flow be tested locally.
    return { enabled: true, phone: '88880000', holder: 'Nombre de ejemplo (sandbox)' };
  }
  return { enabled: phone.length === 8 && Boolean(holder), phone, holder };
}

export function cardConfig() {
  return { enabled: Boolean(process.env.TILOPAY_API_KEY && process.env.TILOPAY_USER && process.env.TILOPAY_PASSWORD) };
}

/** Sandbox mode: no emails, CRM sync, Meta events or Tilopay calls. `npm run dev` defaults to this. */
export function isDryRun() {
  // Never sandbox real traffic: Vercel production, or the VPS server (server/prod.js sets NODE_ENV=production).
  if (process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production') return false;
  return String(process.env.ORDER_DRY_RUN || '').toLowerCase() === 'true';
}
