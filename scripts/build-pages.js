/**
 * Static page generator for ForgeCR.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadEnv } from 'vite';
import { buildCatalog, readConfig, SITE, PRODUCT } from '../shared/catalog.js';
import { homePage } from '../src/templates/pages/home.js';
import { productPage } from '../src/templates/pages/product.js';
import { checkoutPage } from '../src/templates/pages/checkout.js';
import { confirmPage, successPage, errorPage } from '../src/templates/pages/orders.js';
import { shippingPage, termsPage, privacyPage, notFoundPage } from '../src/templates/pages/static.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const GENERATED = [
  'index.html',
  'success.html',
  'error.html',
  '404.html',
  'producto',
  'checkout',
  'pedido',
  'envios-y-devoluciones',
  'terminos',
  'privacidad'
];

export function generatePages(mode = 'production') {
  const env = { ...loadEnv(mode, root, ''), ...process.env };
  const cat = buildCatalog(readConfig(env));

  for (const entry of GENERATED) fs.rmSync(path.join(root, entry), { recursive: true, force: true });

  const pages = {
    'index.html': homePage(cat),
    [`producto/${PRODUCT.slug}/index.html`]: productPage(cat),
    'checkout/index.html': checkoutPage(),
    'pedido/index.html': confirmPage(),
    'success.html': successPage(),
    'error.html': errorPage(),
    'envios-y-devoluciones/index.html': shippingPage(),
    'terminos/index.html': termsPage(),
    'privacidad/index.html': privacyPage(),
    '404.html': notFoundPage()
  };

  for (const [file, html] of Object.entries(pages)) {
    const target = path.join(root, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, html);
  }

  const indexable = ['/', PRODUCT.path, '/envios-y-devoluciones/', '/terminos/', '/privacidad/'];
  const today = new Date().toISOString().slice(0, 10);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable.map((u) => `  <url><loc>${SITE.url}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`;
  fs.writeFileSync(path.join(root, 'public/sitemap.xml'), sitemap);
  fs.writeFileSync(
    path.join(root, 'public/robots.txt'),
    `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /checkout/\nDisallow: /pedido/\nDisallow: /success.html\nDisallow: /error.html\n\nSitemap: ${SITE.url}/sitemap.xml\n`
  );

  return Object.keys(pages);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const files = generatePages(process.env.NODE_ENV === 'development' ? 'development' : 'production');
  console.log(`Generated ${files.length} pages`);
}
