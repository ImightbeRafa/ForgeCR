/**
 * Production server for the VPS (behind Caddy/Cloudflare). Zero dependencies.
 *
 *   npm run build && npm start            -> real traffic (emails, CRM, Tilopay, Meta)
 *   npm run build && npm start -- --sandbox -> same server, ORDER_DRY_RUN (no side effects)
 *
 * Serves dist/ (clean URLs, 404.html) and /api/* from the same handlers Vercel would run,
 * with the security/cache headers from vercel.json so both hosts behave the same.
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const sandbox = process.argv.includes('--sandbox');

try { process.loadEnvFile(path.join(root, '.env')); } catch { /* env comes from the process manager */ }
if (sandbox) {
  process.env.ORDER_DRY_RUN = 'true';
  if (!process.env.ORDER_SIGNING_SECRET) process.env.ORDER_SIGNING_SECRET = 'forge-sandbox-signing-secret';
} else {
  process.env.NODE_ENV = 'production'; // isDryRun() is always false in production
}

const PORT = Number(process.env.PORT) || 3000;
const MAX_BODY = 100 * 1024;
const API_TIMEOUT_MS = 30000;

if (!fs.existsSync(path.join(dist, 'index.html'))) {
  console.error('[server] dist/ is missing. Run `npm run build` first.');
  process.exit(1);
}

/* ---------- headers: reuse vercel.json so there is one place to change them ---------- */
const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
const headerRules = (vercel.headers || []).map((r) => ({
  re: new RegExp(`^${r.source.replace(/\(\.\*\)/g, '.*')}$`),
  headers: r.headers
}));
function applyHeaders(res, pathname) {
  for (const rule of headerRules) {
    if (rule.re.test(pathname)) for (const h of rule.headers) res.setHeader(h.key, h.value);
  }
}

/* ---------- static files ---------- */
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.webmanifest': 'application/manifest+json'
};

function resolveStatic(pathname) {
  let rel;
  try { rel = decodeURIComponent(pathname); } catch { return null; }
  const file = path.join(dist, rel);
  if (!file.startsWith(dist)) return null; // path traversal
  try {
    const st = fs.statSync(file);
    if (st.isFile()) return { file, st };
    if (st.isDirectory()) {
      if (!pathname.endsWith('/')) return { redirect: `${pathname}/` };
      const index = path.join(file, 'index.html');
      if (fs.existsSync(index)) return { file: index, st: fs.statSync(index) };
    }
  } catch { /* not found */ }
  return null;
}

function sendFile(req, res, file, st, status = 200) {
  const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
  res.setHeader('Content-Type', type);
  res.setHeader('Last-Modified', st.mtime.toUTCString());
  if (type.startsWith('text/html')) res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.setHeader('Accept-Ranges', 'bytes');

  // Range requests: iOS Safari will not play MP4 without them.
  const range = req.headers.range && /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
  if (range && status === 200) {
    let start = range[1] === '' ? st.size - Number(range[2]) : Number(range[1]);
    let end = range[1] !== '' && range[2] !== '' ? Number(range[2]) : st.size - 1;
    if (!(start >= 0) || start >= st.size || end < start) {
      res.writeHead(416, { 'Content-Range': `bytes */${st.size}` });
      return res.end();
    }
    end = Math.min(end, st.size - 1);
    res.writeHead(206, { 'Content-Range': `bytes ${start}-${end}/${st.size}`, 'Content-Length': end - start + 1 });
    if (req.method === 'HEAD') return res.end();
    return fs.createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(status, { 'Content-Length': st.size });
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(file).pipe(res);
}

/* ---------- API: /api/<name> -> api/<name>.js (underscore folders are private) ---------- */
const handlers = new Map();
async function loadHandler(rel) {
  if (!handlers.has(rel)) handlers.set(rel, import(pathToFileURL(path.join(root, 'api', `${rel}.js`)).href).then((m) => m.default));
  return handlers.get(rel);
}

async function handleApi(req, res, pathname) {
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => {
    if (!res.headersSent) res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(data));
    return res;
  };

  const rel = pathname.replace(/^\/api\//, '').replace(/\/+$/, '');
  if (!/^[a-z0-9-]+(\/[a-z0-9-]+)*$/i.test(rel) || rel.split('/').some((s) => s.startsWith('_')) || !fs.existsSync(path.join(root, 'api', `${rel}.js`))) {
    return res.status(404).json({ error: 'Not found' });
  }

  let raw = '';
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) return res.status(413).json({ error: 'Payload too large' });
    raw += chunk;
  }
  req.body = undefined;
  if (raw) {
    if (String(req.headers['content-type'] || '').includes('application/json')) {
      try { req.body = JSON.parse(raw); } catch { req.body = raw; }
    } else if (String(req.headers['content-type'] || '').includes('application/x-www-form-urlencoded')) {
      req.body = Object.fromEntries(new URLSearchParams(raw));
    } else {
      req.body = raw;
    }
  }
  req.query = Object.fromEntries(new URL(req.url, 'http://x').searchParams);

  const timer = setTimeout(() => {
    if (!res.writableEnded) res.status(504).json({ error: 'Timeout' });
  }, API_TIMEOUT_MS);
  try {
    const handler = await loadHandler(rel);
    await handler(req, res);
  } catch (err) {
    console.error(`[api] ${rel}:`, err && (err.stack || err.message));
    if (!res.writableEnded) res.status(500).json({ error: 'Internal error' });
  } finally {
    clearTimeout(timer);
  }
}

/* ---------- server ---------- */
const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://x');
  applyHeaders(res, pathname);

  if (pathname.startsWith('/api/')) return handleApi(req, res, pathname);
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    return res.end();
  }

  const hit = resolveStatic(pathname);
  if (hit?.redirect) {
    res.writeHead(301, { Location: hit.redirect });
    return res.end();
  }
  if (hit) return sendFile(req, res, hit.file, hit.st);
  const notFound = path.join(dist, '404.html');
  return sendFile(req, res, notFound, fs.statSync(notFound), 404);
});

server.requestTimeout = 60000;
server.listen(PORT, () => {
  console.log(`[ForgeCR] ${sandbox ? 'SANDBOX (no emails/CRM/charges)' : 'PRODUCTION'} on http://localhost:${PORT}`);
});
