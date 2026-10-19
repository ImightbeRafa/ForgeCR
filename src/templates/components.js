/** Reusable HTML fragments for ForgeCR pages. */
import { formatCRC, SITE, PRODUCT, PRICE, REVIEWS, REVIEWS_ARE_PLACEHOLDERS, reviewSummary } from '../../shared/catalog.js';
import { esc, icons } from './layout.js';

export const productImage = (_p, size = 'card') => {
  const map = {
    thumb: '/images/arnes-thumb.webp',
    sm: '/images/arnes-sm.webp',
    card: '/images/arnes-card.webp',
    gallery: '/images/arnes-gallery.webp'
  };
  return map[size] || map.card;
};

export function priceBlock() {
  return `<div class="price"><b>${formatCRC(PRICE)}</b><small>Envío gratis</small></div>`;
}

export function productCard(cat) {
  const p = cat.product;
  return `
<article class="card feature-card">
  <div class="card-media">
    <img src="/images/arnes-card.webp" srcset="/images/arnes-sm.webp 320w, /images/arnes-card.webp 520w, /images/arnes-gallery.webp 900w" sizes="(min-width: 900px) 420px, 90vw" alt="${esc(p.name)}" width="520" height="520" loading="lazy" decoding="async">
  </div>
  <div class="card-body">
    <h3><a href="${p.path}">${esc(p.name)}</a></h3>
    <p class="card-tagline">${esc(p.tagline)}</p>
    <div class="card-foot">
      ${priceBlock()}
      <a class="btn btn-cta" href="${p.path}">Elegir talla</a>
    </div>
  </div>
</article>`;
}

export function benefitCards(items = PRODUCT.benefits) {
  return `<div class="benefits">${items
    .map(
      ([title, text]) => `
  <div class="benefit"><div class="ico">${icons.shield}</div><div><h3>${esc(title)}</h3><p>${esc(text)}</p></div></div>`
    )
    .join('')}</div>`;
}

export function stepCards(steps = PRODUCT.howToUse) {
  return `<div class="steps">${steps
    .map((s, i) => `<div class="step"><span class="step-num">${i + 1}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div>`)
    .join('')}</div>`;
}

export function trustStrip() {
  const items = [
    [icons.truck, 'Envío gratis', `A todo el país · ${SITE.deliveryDays}`],
    [icons.lock, 'Pagá como prefieras', 'SINPE Móvil o tarjeta'],
    [icons.shield, 'Soporte premium', 'Material atlético transpirable'],
    [icons.chat, 'Atención por WhatsApp', SITE.whatsappDisplay]
  ];
  return `<section class="trust-strip" aria-label="Garantías de compra"><div class="container"><ul>${items
    .map(([ico, b, s]) => `<li>${ico}<div><b>${b}</b><span>${s}</span></div></li>`)
    .join('')}</ul></div></section>`;
}

export function sizeGuideTable(sizes) {
  return `<div class="size-table-wrap"><table class="size-table">
  <thead><tr><th>Talla</th><th>Estatura</th><th>Peso</th></tr></thead>
  <tbody>${sizes
    .map((s) => `<tr><td>${esc(s.size)}</td><td>${esc(s.height)}</td><td>${esc(s.weight)}</td></tr>`)
    .join('')}</tbody>
</table></div>`;
}

export function reviewsBlock() {
  const rows = REVIEWS.arnes || [];
  if (!rows.length) return '';
  const summary = reviewSummary('arnes');
  const note = REVIEWS_ARE_PLACEHOLDERS
    ? `<p class="reviews-note">Reseñas de ejemplo para diseño — se reemplazarán con reseñas reales de clientes.</p>`
    : '';
  return `
<section class="section" id="resenas">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Opiniones</span>
      <h2>${summary ? `${summary.average} ★ · ${summary.count} reseñas` : 'Lo que dicen'}</h2>
      ${note}
    </div>
    <div class="reviews-grid">${rows
      .map(
        (r) => `
      <article class="review-card">
        <div class="stars" aria-label="${r.rating} de 5">${icons.star.repeat(r.rating)}</div>
        <h3>${esc(r.title)}</h3>
        <p>${esc(r.text)}</p>
        <footer><b>${esc(r.author)}</b> · ${esc(r.city)}</footer>
      </article>`
      )
      .join('')}</div>
  </div>
</section>`;
}

/** Lifestyle / how-to image strip (real + AI-generated assets). */
export function lifestyleStrip() {
  const shots = [
    ['/images/arnes-lifestyle-1.webp', 'Arnés ForgeCR en uso diario'],
    ['/images/arnes-howto-1.webp', 'Cómo ajustar las correas'],
    ['/images/arnes-lifestyle-2.webp', 'Look atlético premium'],
    ['/images/arnes-detail-1.webp', 'Detalle de material y costuras']
  ];
  return `<div class="lifestyle-strip">${shots
    .map(
      ([src, alt]) =>
        `<figure><img src="${src}" alt="${esc(alt)}" width="800" height="1000" loading="lazy" decoding="async"><figcaption>${esc(alt)}</figcaption></figure>`
    )
    .join('')}</div>`;
}
