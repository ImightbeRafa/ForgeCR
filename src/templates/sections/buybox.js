/**
 * Shared buy box: pack ladder + size chips + CTAs.
 * Used on the product page (and can be embedded on home later).
 */
import { SITE, PRODUCT, PRICE, formatCRC } from '../../../shared/catalog.js';
import { esc } from '../layout.js';

function galleryThumbs(items) {
  return items
    .map(([id, label], i) => {
      const srcset = `/images/product/${id}-400.webp 400w, /images/product/${id}-800.webp 800w, /images/product/${id}-1200.webp 1200w`;
      return `<button type="button" class="bb-thumb${i === 0 ? ' is-active' : ''}" data-gal-src="/images/product/${id}-800.webp" data-gal-srcset="${srcset}" aria-label="${esc(label)}">
            <img src="/images/product/${id}-thumb.webp" width="80" height="80" alt="" loading="lazy">
          </button>`;
    })
    .join('');
}

export function frameImg(id, { square = false, alt = '', eager = false, sizes = '(max-width:768px) 92vw, 420px' } = {}) {
  const mid = square ? `${id}-sq` : id;
  const w = square ? 576 : 324;
  const h = square ? 576 : 576;
  return `<img
    src="/images/frames/${mid}-400.webp"
    srcset="/images/frames/${mid}-400.webp 400w, /images/frames/${mid}-576.webp 576w"
    sizes="${sizes}"
    width="${w}" height="${h}"
    alt="${esc(alt)}"
    loading="${eager ? 'eager' : 'lazy'}"
    decoding="async"
  >`;
}

const FULL_THUMBS = [
  ['pack-back', 'Vista posterior'],
  ['pack-front', 'Vista frontal'],
  ['clip-man-x', 'Tejido X de cerca'],
  ['clip-polo-back', 'Mujer — espalda'],
  ['clip-polo-front', 'Mujer — frente'],
  ['clip-polo-side', 'Faja y correa'],
  ['clip-office-back', 'Debajo de la camisa'],
  ['wear-woman', 'Estudio — mujer'],
  ['wear-man', 'Estudio — hombre'],
  ['wear-both', 'Frente y espalda']
];

const COMPACT_THUMBS = [
  ['pack-back', 'Vista posterior'],
  ['wear-man', 'Estudio — hombre'],
  ['clip-polo-back', 'Mujer — espalda'],
  ['clip-office-back', 'Debajo de la camisa'],
  ['wear-both', 'Frente y espalda'],
  ['clip-man-x', 'Tejido X de cerca']
];

export function reelsSection({
  id = 'como-usar',
  title = 'Mirá el arnés en movimiento',
  lead = 'Tomas reales de cómo se pone y se usa.'
} = {}) {
  const reels = [
    ['reel-guion1', 'Así se usa'],
    ['reel-guion2', 'En el día a día'],
    ['reel-img1860', 'El arnés de cerca']
  ];
  return `
<section class="pdp-block pdp-video" id="${esc(id)}">
  <div class="container">
    <h2 class="pdp-block__title">${esc(title)}</h2>
    <p class="pdp-block__lead">${esc(lead)}</p>
    <div class="pdp-reels">
      ${reels
        .map(
          ([vid, label]) => `<figure class="pdp-video__frame" data-lazy-video>
          <video muted loop playsinline preload="none" poster="/video/${vid}-poster.webp" width="480" height="854" aria-label="${esc(label)}">
            <source data-src="/video/${vid}.mp4" type="video/mp4">
          </video>
          <figcaption>${esc(label)}</figcaption>
        </figure>`
        )
        .join('')}
    </div>
  </div>
</section>`;
}

export function buybox(cat, {
  id = 'buybox',
  showGallery = true,
  compact = false,
  headingTag = 'h1',
  sizeGuideHref = '#tallas-pdp',
  showDetailLink = true
} = {}) {
  const titleTag = headingTag === 'h2' ? 'h2' : 'h1';
  const sizes = cat.sizes();
  const bundle = cat.bundle;
  const chips = sizes
    .map((s) => {
      const sold = cat.isSoldOut(s.key);
      return `<button type="button" class="bb-chip${sold ? ' is-sold' : ''}" data-size-key="${s.key}" aria-pressed="false"${sold ? ' disabled' : ''}>
        <span class="bb-chip__size">${esc(s.size)}</span>
        <span class="bb-chip__meta">${esc(s.height)}</span>
      </button>`;
    })
    .join('');

  const packs = bundle.enabled
    ? `<fieldset class="bb-packs" data-packs>
        <legend class="bb-lbl">Cantidad</legend>
        <label class="bb-pack" data-pack="1">
          <input type="radio" name="pack-${id}" value="1" checked>
          <span class="bb-pack__radio" aria-hidden="true"></span>
          <span class="bb-pack__main"><b>1 unidad</b><span>${formatCRC(PRICE)} · envío gratis</span></span>
          <span class="bb-pack__price"><b>${formatCRC(PRICE)}</b></span>
        </label>
        <label class="bb-pack is-popular" data-pack="2">
          <span class="bb-pack__tag">AHORRÁS ${formatCRC(bundle.save)}</span>
          <input type="radio" name="pack-${id}" value="2">
          <span class="bb-pack__radio" aria-hidden="true"></span>
          <span class="bb-pack__main"><b>2 unidades</b><span>${formatCRC(Math.round(bundle.price / 2))} c/u · mezcla tallas</span></span>
          <span class="bb-pack__price"><b>${formatCRC(bundle.price)}</b><s>${formatCRC(PRICE * 2)}</s></span>
        </label>
      </fieldset>`
    : '';

  const gallery = showGallery
    ? `<div class="bb-gallery" data-gallery>
        <div class="bb-gallery__main">
          <img
            data-gal-main
            src="/images/product/pack-back-800.webp"
            srcset="/images/product/pack-back-400.webp 400w, /images/product/pack-back-800.webp 800w, /images/product/pack-back-1200.webp 1200w"
            sizes="(max-width:899px) min(360px, 88vw), min(560px, 48vw)"
            width="1200" height="1200"
            alt="Arnés ForgeCR — vista posterior"
            loading="${compact ? 'lazy' : 'eager'}"${compact ? '' : ' fetchpriority="high"'} decoding="async"
          >
        </div>
        <div class="bb-gallery__thumbs" role="tablist" aria-label="Galería">
          ${galleryThumbs(compact ? COMPACT_THUMBS : FULL_THUMBS)}
        </div>
      </div>`
    : '';

  return `
<section class="bb${compact ? ' bb--compact' : ''}" id="${id}" data-buybox data-bundle="${bundle.enabled ? '1' : '0'}" data-price="${PRICE}" data-bundle-price="${bundle.price}">
  <div class="container bb__layout">
    ${gallery}
    <div class="bb__info">
      <div class="bb__head">
        <span class="bb__series">Serie de Alto Rendimiento</span>
        <${titleTag} class="bb__title">${esc(PRODUCT.name)}</${titleTag}>
        <p class="bb__result">${esc(PRODUCT.result)}</p>
        <div class="bb__price" data-bb-price>
          <b data-bb-total>${formatCRC(PRICE)}</b>
          <span data-bb-save hidden></span>
          <small>Envío gratis a todo Costa Rica</small>
        </div>
      </div>
      <ul class="bb__bullets">
        ${PRODUCT.bullets.map(([f, b]) => `<li><b>${esc(f)}</b> → ${esc(b)}</li>`).join('')}
      </ul>
      ${packs}
      <div class="bb-sizes" data-sizes>
        <div class="bb-sizes__head">
          <span class="bb-lbl" data-size-label>Elegí tu talla</span>
          <a class="bb-sizes__guide" href="${esc(sizeGuideHref)}">Guía de tallas</a>
        </div>
        <div class="bb-sizes__chips" role="group" aria-label="Tallas">${chips}</div>
        <div class="bb-sizes__second" data-size-second hidden>
          <span class="bb-lbl">Talla unidad 2</span>
          <div class="bb-sizes__chips" data-sizes-b role="group" aria-label="Talla segunda unidad">${chips.replace(/data-size-key=/g, 'data-size-key-b=')}</div>
        </div>
        <p class="bb-hint" data-size-hint>Elegí una talla para continuar</p>
      </div>
      <div class="bb-actions buy-actions">
        <button type="button" class="btn btn--primary bb-cta" data-add-cart disabled>Agregar al carrito · ${formatCRC(PRICE)}</button>
        <button type="button" class="btn btn--ghost bb-buy" data-buy-now disabled>Comprar ahora</button>
        <a class="bb-wa" data-wa-order href="https://wa.me/${SITE.whatsapp}" target="_blank" rel="noopener">Pedir por WhatsApp</a>
      </div>
      <div class="bb-pay">
        <span class="bb-lbl">Métodos de pago</span>
        <div class="bb-pay__row">
          <span class="bb-pay__opt"><b>SINPE Móvil</b><small>Desde la app de tu banco</small></span>
          <span class="bb-pay__opt"><b>Tarjeta</b><small>Visa · Mastercard · Tilopay</small></span>
        </div>
      </div>
      <ul class="bb-trust">
        <li><svg class="icon" aria-hidden="true"><use href="#icon-local-shipping"></use></svg> Envío gratis · ${esc(SITE.deliveryDays)}</li>
        <li><svg class="icon" aria-hidden="true"><use href="#icon-chat"></use></svg> WhatsApp ${SITE.whatsappDisplay}</li>
      </ul>
      ${showDetailLink ? `<a class="bb-detail-link" href="${compact ? `${PRODUCT.path}#como-usar` : '#como-usar'}">Ver cómo se usa ↓</a>` : ''}
    </div>
  </div>
</section>`;
}
