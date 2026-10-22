/**
 * Arnés ForgeCR — long-form conversion PDP (Opus 25-block plan).
 */
import {
  SITE,
  PRODUCT,
  PRICE,
  FAQ,
  SIZES,
  REVIEWS,
  REVIEWS_ARE_PLACEHOLDERS,
  EXCHANGE_POLICY,
  formatCRC
} from '../../../shared/catalog.js';
import { layout, esc, faqList, faqJsonLd } from '../layout.js';
import { buybox, frameImg, reelsSection } from '../sections/buybox.js';

function announce() {
  return `<div class="pdp-announce">Envío GRATIS a todo Costa Rica · SINPE o tarjeta · WhatsApp ${SITE.whatsappDisplay}</div>`;
}

function problem() {
  return `
<section class="pdp-block pdp-problem">
  <div class="container pdp-split">
    <div class="pdp-split__copy">
      <span class="pdp-eyebrow">El día a día</span>
      <h2>Horas sentado. Hombros hacia adelante. Celular todo el día.</h2>
      <p>Tu cuerpo se adapta a la postura que más repetís. El Arnés ForgeCR te da un recordatorio físico para abrir el pecho y mantener los hombros más firmes.</p>
    </div>
    <div class="pdp-split__media">${frameImg('guion1-003', { alt: 'Rutina diaria sin soporte postural' })}</div>
  </div>
</section>`;
}

function painCards() {
  const cards = [
    ['guion2-002', 'Oficina', 'Muchas horas frente a la pantalla'],
    ['guion2-005', 'Gym', 'Querés soporte firme al entrenar'],
    ['guion2-009', 'Celular', 'Cuello y hombros hacia adelante']
  ];
  return `
<section class="pdp-block pdp-pain">
  <div class="container">
    <h2 class="pdp-block__title">¿Te suena familiar?</h2>
    <div class="pdp-pain__grid">
      ${cards
        .map(
          ([id, t, d]) => `<article class="pdp-pain__card">
          ${frameImg(id, { square: true, alt: t, sizes: '(max-width:768px) 45vw, 280px' })}
          <h3>${esc(t)}</h3>
          <p>${esc(d)}</p>
        </article>`
        )
        .join('')}
    </div>
  </div>
</section>`;
}

function solution() {
  return `
<section class="pdp-block pdp-solution">
  <div class="container pdp-solution__inner">
    <div class="pdp-solution__copy">
      <span class="pdp-eyebrow">La herramienta</span>
      <h2>Arnés ForgeCR: soporte que te recuerda abrir el pecho.</h2>
      <p>${esc(PRODUCT.tagline)}. Material transpirable, correas de doble tensión y look atlético.</p>
    </div>
    <div class="pdp-solution__media">
      <img src="/images/product/wear-man-800.webp" srcset="/images/product/wear-man-400.webp 400w, /images/product/wear-man-800.webp 800w, /images/product/wear-man-1200.webp 1200w" sizes="(max-width:768px) 92vw, 420px" width="800" height="800" alt="Hombre con el Arnés ForgeCR" loading="lazy" decoding="async">
    </div>
  </div>
</section>`;
}

function benefits() {
  return `
<section class="pdp-block" id="beneficios-pdp">
  <div class="container">
    <h2 class="pdp-block__title">Por qué se siente distinto</h2>
    <div class="pdp-benefits">
      ${PRODUCT.benefits
        .map(
          ([t, d], i) => `<article class="pdp-benefits__card">
          <span class="pdp-benefits__n">0${i + 1}</span>
          <h3>${esc(t)}</h3>
          <p>${esc(d)}</p>
        </article>`
        )
        .join('')}
    </div>
  </div>
</section>`;
}

function anatomy() {
  return `
<section class="pdp-block biomech" id="anatomia">
  <div class="container biomech__inner">
    <h2 class="biomech__title">Anatomía del arnés</h2>
    <div class="pdp-anatomy">
      <div class="pdp-anatomy__media">
        <img src="/images/product/pack-back-800.webp" srcset="/images/product/pack-back-400.webp 400w, /images/product/pack-back-800.webp 800w" sizes="(max-width:768px) 92vw, 420px" width="800" height="800" alt="Correas en X y faja" loading="lazy" decoding="async">
        <img src="/images/product/pack-front-800.webp" srcset="/images/product/pack-front-400.webp 400w, /images/product/pack-front-800.webp 800w" sizes="(max-width:768px) 92vw, 420px" width="800" height="800" alt="Cierre frontal del arnés" loading="lazy" decoding="async">
      </div>
      <ol class="biomech__steps">
        <li class="biomech__step"><span class="biomech__num">01</span><div><h3 class="biomech__step-title">Correas de doble tensión</h3><p>Ajustás el soporte al nivel que necesitás.</p></div></li>
        <li class="biomech__step"><span class="biomech__num">02</span><div><h3 class="biomech__step-title">Malla técnica</h3><p>${esc(PRODUCT.materials)}</p></div></li>
        <li class="biomech__step"><span class="biomech__num">03</span><div><h3 class="biomech__step-title">Costuras reforzadas</h3><p>Pensado para uso diario en gym u oficina.</p></div></li>
      </ol>
    </div>
  </div>
</section>`;
}

function howtoVideo() {
  return reelsSection({ id: 'como-usar' });
}

function howtoSteps() {
  const imgs = ['wear-man', 'clip-polo-side', 'clip-office-back'];
  return `
<section class="pdp-block pdp-steps">
  <div class="container">
    <h2 class="pdp-block__title">Cómo se usa</h2>
    <ol class="pdp-steps__list">
      ${PRODUCT.howToUse
        .map(
          (s, i) => `<li class="pdp-steps__item">
          <span class="pdp-steps__n">0${i + 1}</span>
          <img src="/images/product/${imgs[i]}-800.webp" srcset="/images/product/${imgs[i]}-400.webp 400w, /images/product/${imgs[i]}-800.webp 800w" sizes="(max-width:768px) 80vw, 280px" width="800" height="800" alt="${esc(s.title)}" loading="lazy" decoding="async">
          <h3>${esc(s.title)}</h3>
          <p>${esc(s.text)}</p>
        </li>`
        )
        .join('')}
    </ol>
  </div>
</section>`;
}

function midCta() {
  return `
<section class="conversion-band">
  <div class="container conversion-band__inner">
    <div class="conversion-band__copy">
      <p class="conversion-band__eyebrow">Listo para forjar</p>
      <h2 class="conversion-band__title">${formatCRC(PRICE)} · envío gratis</h2>
      <p class="conversion-band__text">Elegí tu talla, pagá con SINPE o tarjeta y te llega por ${SITE.courier}.</p>
      <a class="btn btn--primary conversion-band__cta" href="#buybox">Elegir talla</a>
    </div>
  </div>
</section>`;
}

function useCases() {
  const items = [
    ['guion1-007', 'Oficina'],
    ['guion1-014', 'Gym'],
    ['guion2-012', 'Manejando'],
    ['guion2-016', 'En casa']
  ];
  return `
<section class="pdp-block pdp-usecases">
  <div class="container">
    <h2 class="pdp-block__title">Usalo donde te movés</h2>
    <div class="pdp-usecases__track">
      ${items
        .map(
          ([id, t]) => `<article class="pdp-usecases__card">
          ${frameImg(id, { square: true, alt: t, sizes: '200px' })}
          <h3>${esc(t)}</h3>
        </article>`
        )
        .join('')}
    </div>
  </div>
</section>`;
}

function underClothes() {
  return `
<section class="pdp-block pdp-split pdp-under">
  <div class="container pdp-split">
    <div class="pdp-split__media">
      <img src="/images/product/wear-woman-800.webp" srcset="/images/product/wear-woman-400.webp 400w, /images/product/wear-woman-800.webp 800w" sizes="(max-width:768px) 92vw, 420px" width="800" height="800" alt="Arnés debajo de la ropa" loading="lazy" decoding="async">
    </div>
    <div class="pdp-split__copy">
      <span class="pdp-eyebrow">Discreto</span>
      <h2>Se usa debajo de la camisa. Nadie lo nota.</h2>
      <p>Perfil bajo, malla liviana y ajuste personalizado para jornadas largas sin verse clínico.</p>
    </div>
  </div>
</section>`;
}

function compare() {
  const rows = [
    ['Material transpirable', true, false, false],
    ['Ajuste de doble tensión', true, true, false],
    ['Envío local gratis', true, false, false],
    ['Soporte por WhatsApp', true, false, false],
    ['Pago SINPE o tarjeta', true, false, false]
  ];
  const cell = (v) => (v ? '<span class="pdp-cmp__yes">✓</span>' : '<span class="pdp-cmp__no">✕</span>');
  return `
<section class="pdp-block pdp-cmp">
  <div class="container">
    <h2 class="pdp-block__title">ForgeCR vs alternativas</h2>
    <div class="pdp-cmp__wrap">
      <table class="pdp-cmp__table">
        <thead><tr><th></th><th>ForgeCR</th><th>Genérico</th><th>Nada</th></tr></thead>
        <tbody>
          ${rows.map(([l, a, b, c]) => `<tr><th scope="row">${esc(l)}</th><td>${cell(a)}</td><td>${cell(b)}</td><td>${cell(c)}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>
</section>`;
}

function sizeGuide() {
  return `
<section class="pdp-block size-guide" id="tallas-pdp">
  <div class="container">
    <h2 class="pdp-block__title">Guía de tallas</h2>
    <p class="pdp-block__lead">Entre dos tallas → elegí la más pequeña para más tensión.</p>
    <div class="size-guide__table-wrap">
      <table class="size-guide__table">
        <thead><tr><th>Talla</th><th>Estatura</th><th>Peso</th></tr></thead>
        <tbody>
          ${SIZES.map((s) => `<tr><td>${esc(s.id)}</td><td>${esc(s.height)}</td><td>${esc(s.weight)}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
    <a class="btn btn--ghost" href="https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('Hola ForgeCR, dudás de talla. Mi altura y peso:')}" target="_blank" rel="noopener">¿Dudás? Mandanos tu altura y peso</a>
  </div>
</section>`;
}

function materials() {
  return `
<section class="pdp-block">
  <div class="container pdp-acc">
    <details open><summary>Materiales</summary><div class="pdp-acc__body"><p>${esc(PRODUCT.materials)}</p></div></details>
    <details><summary>Cuidado</summary><div class="pdp-acc__body"><p>${esc(PRODUCT.care)}</p></div></details>
    <details><summary>Qué recibís</summary><div class="pdp-acc__body"><p>1 Arnés ForgeCR en la talla que elegiste. Envío por ${SITE.courier} en ${SITE.deliveryDays}.</p>
      <img src="/images/product/pack-back-800.webp" srcset="/images/product/pack-back-400.webp 400w, /images/product/pack-back-800.webp 800w" sizes="(max-width:768px) 90vw, 420px" width="800" height="800" alt="Producto ForgeCR" loading="lazy" decoding="async">
    </div></details>
  </div>
</section>`;
}

function testimonials() {
  const rows = REVIEWS.arnes || [];
  if (!rows.length) return '';
  const note = REVIEWS_ARE_PLACEHOLDERS
    ? '<p class="pdp-reviews__note">Testimonios de ejemplo — pronto reseñas reales.</p>'
    : '';
  return `
<section class="pdp-block pdp-reviews" id="testimonios">
  <div class="container">
    <h2 class="pdp-block__title">Lo que dicen</h2>
    ${note}
    <div class="pdp-reviews__grid">
      ${rows
        .map(
          (r) => `<article class="pdp-reviews__card">
          <p>“${esc(r.text)}”</p>
          <span>${esc(r.author)} · ${esc(r.city)}</span>
        </article>`
        )
        .join('')}
    </div>
  </div>
</section>`;
}

function igStrip() {
  const ids = ['guion1-001', 'guion1-005', 'guion2-001', 'guion2-004'];
  return `
<section class="pdp-block pdp-ig">
  <div class="container">
    <h2 class="pdp-block__title">Mirá cómo se usa</h2>
    <p class="pdp-block__lead"><a href="${SITE.instagram}" target="_blank" rel="noopener">${SITE.instagramHandle}</a></p>
    <div class="pdp-ig__grid">
      ${ids
        .map(
          (id) => `<a class="pdp-ig__tile" href="${SITE.instagram}" target="_blank" rel="noopener" aria-label="Instagram ForgeCR">
          ${frameImg(id, { square: true, alt: 'ForgeCR en Instagram', sizes: '160px' })}
        </a>`
        )
        .join('')}
    </div>
  </div>
</section>`;
}

function howToBuy() {
  return `
<section class="pdp-block">
  <div class="container">
    <h2 class="pdp-block__title">Cómo comprar en Costa Rica</h2>
    <ol class="pdp-buyflow">
      <li><b>01</b><span>Elegí tu talla (o el pack de 2)</span></li>
      <li><b>02</b><span>Pagá con SINPE Móvil o tarjeta (Tilopay)</span></li>
      <li><b>03</b><span>Te llega por ${SITE.courier} en ${SITE.deliveryDays}</span></li>
    </ol>
  </div>
</section>`;
}

function shipping() {
  return `
<section class="pdp-block pdp-ship">
  <div class="container">
    <h2 class="pdp-block__title">Envíos y cambios</h2>
    <p><b>Envío gratis</b> a todo el país por ${SITE.courier} · ${SITE.deliveryDays}.</p>
    <p>${esc(EXCHANGE_POLICY)}</p>
    <a href="/envios-y-devoluciones/">Ver política completa →</a>
  </div>
</section>`;
}

function faqBlock() {
  return `
<section class="pdp-block faq" id="faq">
  <div class="container">
    <h2 class="pdp-block__title">Preguntas frecuentes</h2>
    ${faqList(FAQ, true)}
    <p class="pdp-fineprint">No es un dispositivo médico. Es un soporte atlético de bienestar postural.</p>
  </div>
</section>`;
}

function finalCta(cat) {
  const bundle = cat.bundle;
  return `
<section class="conversion-band pdp-final" id="final-cta">
  <div class="container conversion-band__inner">
    <div class="conversion-band__copy">
      <p class="conversion-band__eyebrow">${esc(PRODUCT.name)}</p>
      <h2 class="conversion-band__title">${formatCRC(PRICE)}${bundle.enabled ? ` · pack 2 ${formatCRC(bundle.price)}` : ''}</h2>
      <p class="conversion-band__text">Envío gratis · SINPE o tarjeta · WhatsApp ${SITE.whatsappDisplay}</p>
      <div class="pdp-final__actions">
        <a class="btn btn--primary" href="#buybox">Elegir talla</a>
        <a class="btn btn--ghost" href="https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('Hola ForgeCR, quiero ordenar el Arnés')}" target="_blank" rel="noopener">WhatsApp</a>
      </div>
    </div>
  </div>
</section>`;
}

function stickyBar() {
  return `
<div class="pdp-sticky" data-sticky-buy hidden>
  <div class="pdp-sticky__inner">
    <div class="pdp-sticky__meta">
      <span data-sticky-size>Elegí talla</span>
      <b data-sticky-total>${formatCRC(PRICE)}</b>
    </div>
    <button type="button" class="btn btn--primary" data-sticky-scroll>Comprar</button>
  </div>
</div>`;
}

export function productPage(cat) {
  const main = `
${announce()}
${buybox(cat, { id: 'buybox' })}
${problem()}
${painCards()}
${solution()}
${benefits()}
${anatomy()}
${howtoVideo()}
${howtoSteps()}
${midCta()}
${useCases()}
${underClothes()}
${compare()}
${sizeGuide()}
${materials()}
${testimonials()}
${igStrip()}
${howToBuy()}
${shipping()}
${faqBlock()}
${finalCta(cat)}
${stickyBar()}
`;

  return layout({
    title: `${PRODUCT.name} — ${formatCRC(PRICE)} | ForgeCR`,
    description: `${PRODUCT.tagline}. Envío gratis a todo Costa Rica. Pagá con SINPE o tarjeta.`,
    path: PRODUCT.path,
    page: 'pdp',
    nav: 'tienda',
    css: ['/src/styles/pdp.css'],
    image: '/images/product/pack-back-1200.webp',
    head: `<link rel="preload" as="image" type="image/webp" href="/images/product/pack-back-800.webp" fetchpriority="high">`,
    bodyClass: 'page-pdp',
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: PRODUCT.name,
        description: PRODUCT.tagline,
        image: [`${SITE.url}/images/product/pack-back-1200.webp`],
        brand: { '@type': 'Brand', name: SITE.name },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'CRC',
          price: PRICE,
          availability: 'https://schema.org/InStock',
          url: `${SITE.url}${PRODUCT.path}`
        }
      },
      faqJsonLd(FAQ)
    ],
    main
  });
}
