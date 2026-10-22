# Deploying ForgeCR to the VPS

Live: `https://www.forge.shopping` → Cloudflare → Caddy → **Node (`server/prod.js`)**.
(`forge.shopping` 301-redirects to `www`. The old Vercel project is not used.)

The app is a static multi-page build (`dist/`) plus Vercel-style API handlers in `api/`.
`server/prod.js` serves both with no extra dependencies, so the VPS only needs Node ≥ 20.12.

## 1. Pull and build

```sh
cd /path/to/forgecr          # the clone of github.com/imightberafa/forgecr
git fetch origin && git checkout master && git pull --ff-only
npm ci --include=dev         # vite/terser are needed to build
npm test                     # must say: fail 0
npm run build                # generates pages + dist/
```

## 2. Environment (`.env` next to package.json, or the process manager's env)

Required for real orders. See `.env.example` for the full list.

| Variable | Notes |
|---|---|
| `SINPE_PHONE`, `SINPE_HOLDER` | SINPE Móvil number (8 digits) and holder name. Without them SINPE is hidden. |
| `TILOPAY_API_KEY`, `TILOPAY_USER`, `TILOPAY_PASSWORD`, `TILOPAY_BASE_URL` | Card payments. Without them the card option is hidden. |
| `TILOPAY_WEBHOOK_SECRET` | Webhook signature check. |
| `ORDER_SIGNING_SECRET` | Long random string (e.g. `openssl rand -hex 32`). Signs the order snapshot sent through Tilopay. |
| `RESEND_API_KEY`, `ORDER_NOTIFICATION_EMAIL` | Customer + admin emails. |
| `BETSY_API_KEY`, `BETSY_API_URL` | CRM orders. |
| `META_CAPI_ACCESS_TOKEN` (`META_PIXEL_ID` optional) | Server-side Meta events. |
| `APP_URL=https://www.forge.shopping` | Used for Tilopay return URLs. **Must be the www host.** |
| `PORT` | Port for the Node server (default 3000). |

**Do not set** `ORDER_DRY_RUN`, `TILOPAY_REDIRECT_FULFILL` or `TILOPAY_ALLOW_UNSIGNED_WEBHOOKS` in production.
(`npm start` forces production mode, so a stray `ORDER_DRY_RUN=true` is ignored there.)

## 3. Run it (pm2 or systemd)

```sh
pm2 start npm --name forgecr -- start      # first time
pm2 restart forgecr --update-env           # every deploy after `npm run build`
pm2 save
```

Sanity check on the VPS before switching traffic (no real side effects):

```sh
PORT=4180 npm run start:sandbox &
curl -s localhost:4180/api/config          # {"sinpe":{"enabled":true},"card":{"enabled":true}}
kill %1
```

## 4. Caddy

Send everything for the site to the Node server (it already serves static files, clean URLs,
404 page, MP4 range requests and the security/cache headers from `vercel.json`):

```caddy
www.forge.shopping {
    encode zstd gzip
    reverse_proxy localhost:3000
}
forge.shopping {
    redir https://www.forge.shopping{uri} permanent
}
```

`caddy reload` (or `systemctl reload caddy`) after editing.

## 5. After every deploy

1. **Purge the Cloudflare cache** (HTML is cached at the edge): Caching → Purge Everything.
2. Smoke test:
   ```sh
   for p in / /producto/arnes-forgecr/ /checkout/ /envios-y-devoluciones/ /api/config; do
     curl -s -o /dev/null -w "%{http_code} $p\n" https://www.forge.shopping$p; done
   ```
   All 200. `https://www.forge.shopping/no-existe` → 404.
3. Tilopay dashboard: webhook URL = `https://www.forge.shopping/api/tilopay/webhook`.
4. Place **one real SINPE order** and **one small real card payment**; confirm the emails,
   the BetsyCRM order and the Meta events arrive.

## Rollback

```sh
git checkout <previous-commit> && npm ci --include=dev && npm run build && pm2 restart forgecr
```
The commit before this rework is `889937a` (old single-page site; its API layout differs,
so a rollback to it also needs the old server setup).
