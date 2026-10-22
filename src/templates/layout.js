/**
 * ForgeCR page shell — uses original Precision Brutalism classes.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, FAQ, formatCRC, PRICE } from '../../shared/catalog.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

export function readFragment(name) {
  return fs.readFileSync(path.join(root, 'src/templates/fragments', name), 'utf8');
}

const pixelScript = `<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[]}(window,document);
fbq('init','${SITE.pixelId}');fbq('track','PageView');
(function(){function l(){if(window._fbqLoaded)return;window._fbqLoaded=true;var s=document.createElement('script');s.async=true;s.src='https://connect.facebook.net/en_US/fbevents.js';document.head.appendChild(s)}
if('requestIdleCallback' in window)requestIdleCallback(l,{timeout:3000});else addEventListener('load',l)})();
</script>`;

export function header(active = '') {
  const link = (href, label, key) =>
    `<a href="${href}" class="header__link${active === key ? ' header__link--active' : ''}">${label}</a>`;
  return `
<header class="header" id="header">
  <div class="container header__inner">
    <a href="/" class="header__logo">ForgeCR</a>
    <nav class="header__nav" id="headerNav">
      ${link('/producto/arnes-forgecr/', 'Tienda', 'tienda')}
      ${link('/#historia', 'Nuestra Historia', 'historia')}
      ${link('/#tallas', 'Guía de Tallas', 'tallas')}
    </nav>
    <div class="header__actions">
      <a href="/producto/arnes-forgecr/#buybox" class="header__order-cta">Ordenar Ahora</a>
      <a href="/checkout/" class="header__cart" aria-label="Ir al checkout">
        <svg class="icon" aria-hidden="true" focusable="false"><use href="#icon-shopping-cart"></use></svg>
      </a>
      <button class="header__hamburger" id="hamburger" aria-label="Menú" aria-expanded="false" aria-controls="mobileDrawer" type="button">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</header>
<div class="mobile-overlay" id="mobileOverlay"></div>
<div class="mobile-drawer" id="mobileDrawer">
  <button class="mobile-drawer__close" id="drawerClose" aria-label="Cerrar" type="button">&times;</button>
  <nav class="mobile-drawer__nav">
    <a href="/#producto" class="mobile-drawer__link">Tienda</a>
    <a href="/#historia" class="mobile-drawer__link">Nuestra Historia</a>
    <a href="/#tallas" class="mobile-drawer__link">Guía de Tallas</a>
    <a href="/producto/arnes-forgecr/" class="mobile-drawer__link mobile-drawer__cta">Comprar Ahora</a>
  </nav>
</div>`;
}

export function footer() {
  return `
<footer class="footer">
  <div class="container footer__inner">
    <div class="footer__brand">
      <span class="footer__logo">ForgeCR</span>
      <p class="footer__tagline">Equipo de postura de alto rendimiento diseñado para los más exigentes.</p>
      <div class="footer__social">
        <a href="${SITE.instagram}" target="_blank" rel="noopener">Instagram ${SITE.instagramHandle}</a>
        <a href="https://wa.me/${SITE.whatsapp}" target="_blank" rel="noopener">WhatsApp ${SITE.whatsappDisplay}</a>
      </div>
    </div>
    <div class="footer__columns">
      <div class="footer__col">
        <span class="footer__col-title">Tienda</span>
        <a href="/producto/arnes-forgecr/">Arnés ForgeCR</a>
        <a href="/#tallas">Guía de tallas</a>
        <a href="/producto/arnes-forgecr/">Ordenar</a>
      </div>
      <div class="footer__col">
        <span class="footer__col-title">Ayuda</span>
        <a href="/envios-y-devoluciones/">Envíos y devoluciones</a>
        <a href="/terminos/">Términos</a>
        <a href="/privacidad/">Privacidad</a>
      </div>
      <div class="footer__col">
        <span class="footer__col-title">Pagos</span>
        <a href="/producto/arnes-forgecr/">SINPE Móvil</a>
        <a href="/producto/arnes-forgecr/">Tarjeta (Tilopay)</a>
        <span>Desde ${formatCRC(PRICE)} · Envío gratis</span>
      </div>
    </div>
  </div>
  <div class="container footer__bottom">
    <span class="footer__copy">&copy; ${new Date().getFullYear()} ${SITE.legalName}. Todos los derechos reservados.</span>
  </div>
</footer>
<a class="wa-float whatsapp-fab" href="https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('Hola ForgeCR, tengo una consulta')}" target="_blank" rel="noopener" aria-label="WhatsApp ForgeCR">
  <svg class="icon" aria-hidden="true" focusable="false"><use href="#icon-whatsapp"></use></svg>
</a>
<div class="toasts" data-toasts></div>`;
}

export function layout(o) {
  const url = `${SITE.url}${o.path}`;
  const image = `${SITE.url}${o.image || '/images/product/pack-back-1200.webp'}`;
  const css = ['/src/styles/site.css', ...(o.css || [])]
    .map((href) => `<link rel="stylesheet" href="${href}">`)
    .join('\n  ');
  const ld = (o.jsonld || [])
    .map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`)
    .join('\n  ');

  return `<!DOCTYPE html>
<!-- GENERATED by scripts/build-pages.js — edit src/templates/*, not this file. -->
<html lang="es-CR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(o.title)}</title>
  <meta name="description" content="${esc(o.description)}">
  <link rel="canonical" href="${url}">
  <meta name="robots" content="${o.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}">
  <meta name="theme-color" content="#0E0E0E">
  <meta property="og:type" content="${o.ogType || 'website'}">
  <meta property="og:site_name" content="${SITE.name}">
  <meta property="og:title" content="${esc(o.title)}">
  <meta property="og:description" content="${esc(o.description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${image}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="/fonts/space-grotesk-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
  ${o.head || ''}
  ${css}
  ${ld}
</head>
<body class="${o.bodyClass || ''}">
  <noscript><img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id=${SITE.pixelId}&ev=PageView&noscript=1"></noscript>
  ${readFragment('icons.svg.html')}
  ${header(o.nav || '')}
  <main id="main">${o.main}</main>
  ${footer()}
  ${pixelScript}
  <script type="module" src="/src/js/${o.page}.js"></script>
</body>
</html>`;
}

export function faqList(items = FAQ, openFirst = true) {
  return `<div class="faq__list">${items
    .map(
      ([q, a], i) =>
        `<details class="faq-item"${openFirst && i === 0 ? ' open' : ''}><summary class="faq-item__q">${esc(q)}</summary><div class="faq-item__a">${esc(a)}</div></details>`
    )
    .join('')}</div>`;
}

export function faqJsonLd(items = FAQ) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a }
    }))
  };
}

// Compatibility exports used by older template helpers
const icon = (id) => `<svg class="icon" aria-hidden="true" focusable="false"><use href="#${id}"></use></svg>`;
export const icons = {
  lock: icon('icon-lock'),
  truck: icon('icon-local-shipping'),
  chat: icon('icon-chat'),
  check: icon('icon-check'),
  close: icon('icon-close'),
  whatsapp: icon('icon-whatsapp'),
  clock: icon('icon-schedule')
};
export function wordmark() {
  return 'ForgeCR';
}
export function cartShell() {
  return '';
}
