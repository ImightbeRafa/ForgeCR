import {
  SITE,
  PRODUCT,
  PRICE,
  FAQ,
  SIZES,
  formatCRC,
  REVIEWS_ARE_PLACEHOLDERS,
  reviewSummary
} from '../../../shared/catalog.js';
import { layout, esc, faqList, faqJsonLd, icons } from '../layout.js';
import { benefitCards, stepCards, sizeGuideTable, reviewsBlock, lifestyleStrip } from '../components.js';

export function productPage(cat) {
  const p = PRODUCT;
  const variants = cat.variants();
  const summary = reviewSummary('arnes');

  const gallery = [
    ['/images/arnes-gallery.webp', 'Arnés ForgeCR vista principal'],
    ['/images/forge2-v1-1200.webp', 'Arnés ForgeCR ángulo 2'],
    ['/images/forge3-v1-1200.webp', 'Arnés ForgeCR detalle'],
    ['/images/forge4-v1-1200.webp', 'Arnés ForgeCR en uso'],
    ['/images/arnes-lifestyle-1.webp', 'Uso diario'],
    ['/images/arnes-howto-1.webp', 'Cómo ajustar'],
    ['/images/arnes-detail-1.webp', 'Detalle de material'],
    ['/images/arnes-lifestyle-2.webp', 'Look atlético']
  ];

  const thumbs = gallery
    .map(
      ([src, alt], i) =>
        `<button type="button" class="gal-thumb${i === 0 ? ' is-active' : ''}" data-gal-thumb="${i}" aria-label="Ver imagen ${i + 1}"><img src="${src}" alt="${esc(alt)}" width="96" height="96" loading="lazy"></button>`
    )
    .join('');

  const slides = gallery
    .map(
      ([src, alt], i) =>
        `<figure class="gal-slide${i === 0 ? ' is-active' : ''}" data-gal-slide="${i}"><img src="${src}" alt="${esc(alt)}" width="900" height="900" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}></figure>`
    )
    .join('');

  const sizeChips = variants
    .map((v) => {
      const sold = cat.isSoldOut(v.key);
      return `<button type="button" class="size-chip${sold ? ' is-soldout' : ''}" data-size-key="${v.key}" data-size="${esc(v.size)}" ${sold ? 'disabled aria-disabled="true"' : ''} aria-pressed="false">
      <span>${esc(v.size)}</span>
      <small>${sold ? 'Agotado' : `${v.stock} disp.`}</small>
    </button>`;
    })
    .join('');

  const stars =
    summary && !REVIEWS_ARE_PLACEHOLDERS
      ? `<a class="stars-link" href="#resenas">${'★'.repeat(5)} <span>${summary.average} · ${summary.count} reseñas</span></a>`
      : summary
        ? `<p class="stars-link">${'★'.repeat(5)} <span>${summary.average} · ${summary.count} opiniones</span></p>`
        : '';

  const buyBox = `
<div class="buybox" data-pdp>
  <h1>${esc(p.name)}</h1>
  ${stars}
  <p class="result">${esc(p.result)}</p>
  <div class="price"><b data-price>${formatCRC(PRICE)}</b><small>Envío gratis</small></div>
  <ul class="bullets">${p.bullets.map(([f, b]) => `<li><b>${esc(f)}</b> → ${esc(b)}</li>`).join('')}</ul>
  <div class="field">
    <div class="field-label"><span>Seleccioná tu talla</span><a href="#guia-tallas">Guía de tallas</a></div>
    <div class="size-chips" role="group" aria-label="Tallas">${sizeChips}</div>
    <p class="size-hint" data-size-hint>Elegí una talla para continuar</p>
  </div>
  <div class="qty-row">
    <label for="qty">Cantidad</label>
    <div class="qty">
      <button type="button" data-qty-minus aria-label="Menos">−</button>
      <input id="qty" type="number" min="1" max="10" value="1" data-qty>
      <button type="button" data-qty-plus aria-label="Más">+</button>
    </div>
  </div>
  <div class="buy-actions">
    <button class="btn btn-cta btn-lg" type="button" data-add-cart disabled>Elegí una talla</button>
    <button class="btn btn-ghost btn-lg" type="button" data-buy-now disabled>Comprar ahora</button>
  </div>
  <ul class="micro">
    <li>${icons.truck}<span>Envío gratis · ${SITE.deliveryDays}</span></li>
    <li>${icons.lock}<span>SINPE Móvil o tarjeta</span></li>
    <li>${icons.chat}<span>WhatsApp ${SITE.whatsappDisplay}</span></li>
  </ul>
  <div class="acc">
    <details open><summary>Materiales y cuidado</summary><div class="answer"><p>${esc(p.materials)}</p><p>${esc(p.care)}</p></div></details>
    <details><summary>Envíos</summary><div class="answer"><p>Envío gratis a todo Costa Rica por ${SITE.courier}. Tiempo estimado: ${SITE.deliveryDays}.</p></div></details>
  </div>
</div>`;

  const sticky = `
<div class="sticky-buy" data-sticky-buy hidden>
  <div class="container sticky-inner">
    <div><b>${esc(p.name)}</b><span data-sticky-size>Elegí talla</span></div>
    <button class="btn btn-cta" type="button" data-add-cart disabled>${formatCRC(PRICE)}</button>
  </div>
</div>`;

  const main = `
<nav class="crumbs container"><a href="/">Inicio</a> / <span>${esc(p.name)}</span></nav>
<section class="pdp">
  <div class="container pdp-grid">
    <div class="gallery" data-gallery>
      <div class="gal-main">${slides}</div>
      <div class="gal-thumbs">${thumbs}</div>
    </div>
    ${buyBox}
  </div>
</section>

<section class="section alt" id="beneficios">
  <div class="container">
    <div class="section-head center"><span class="eyebrow">Beneficios</span><h2>Pensado para tu rutina</h2></div>
    ${benefitCards()}
  </div>
</section>

<section class="section" id="como-usar">
  <div class="container">
    <div class="section-head center"><span class="eyebrow">Cómo usar</span><h2>Ponete, ajustá, seguí</h2></div>
    ${stepCards()}
    ${lifestyleStrip()}
  </div>
</section>

<section class="section alt" id="guia-tallas">
  <div class="container">
    <div class="section-head"><span class="eyebrow">Tallas</span><h2>Guía de tallas</h2></div>
    ${sizeGuideTable(SIZES.map((s) => ({ size: s.id, height: s.height, weight: s.weight })))}
  </div>
</section>

${reviewsBlock()}

<section class="section" id="faq">
  <div class="container narrow">
    <div class="section-head center"><h2>Preguntas del producto</h2></div>
    ${faqList(FAQ)}
  </div>
</section>

<section class="final-cta">
  <div class="container">
    <h2>Elegí tu talla y forjá mejor postura</h2>
    <a class="btn btn-cta btn-lg" href="#main">Volver al comprador</a>
  </div>
</section>`;

  const offers = variants.map((v) => ({
    '@type': 'Offer',
    name: v.name,
    price: PRICE,
    priceCurrency: 'CRC',
    availability: cat.isSoldOut(v.key) ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
    url: `${SITE.url}${p.path}`
  }));

  return layout({
    title: `${p.name} — ${formatCRC(PRICE)} | ForgeCR`,
    description: p.tagline,
    path: p.path,
    page: 'pdp',
    css: ['/src/styles/pdp.css'],
    image: '/images/arnes-og.jpg',
    ogType: 'product',
    main,
    tail: sticky,
    head: `<link rel="preload" as="image" href="/images/arnes-gallery.webp" fetchpriority="high">`,
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: p.name,
        description: p.tagline,
        image: [`${SITE.url}/images/arnes-gallery.webp`],
        brand: { '@type': 'Brand', name: SITE.name },
        offers: offers
      },
      faqJsonLd(FAQ)
    ]
  });
}
