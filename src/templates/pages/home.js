import { SITE, FAQ, PRODUCT, PRICE, formatCRC, SIZES } from '../../../shared/catalog.js';
import { layout, esc, faqList, faqJsonLd } from '../layout.js';
import { productCard, benefitCards, stepCards, trustStrip, sizeGuideTable, reviewsBlock, lifestyleStrip } from '../components.js';

export function homePage(cat) {
  const p = PRODUCT;

  const hero = `
<section class="hero forge-hero">
  <div class="hero-media">
    <picture>
      <source media="(max-width: 768px)" srcset="/images/forge4-v1-400.webp 400w, /images/forge4-v1-800.webp 800w, /images/forge4-v1-1200.webp 1200w" sizes="100vw">
      <img src="/images/forge-v1-1200.webp" srcset="/images/forge-v1-800.webp 800w, /images/forge-v1-1200.webp 1200w, /images/forge-v1-1600.webp 1600w" sizes="100vw" alt="Arnés ForgeCR" width="1600" height="1000" fetchpriority="high">
    </picture>
  </div>
  <div class="hero-copy">
    <p class="hero-brand">${esc(SITE.name)}</p>
    <h1>Forjá tu <span class="accent">postura</span></h1>
    <p class="hero-sub">${esc(p.tagline)}. ${formatCRC(PRICE)} · envío gratis a todo el país.</p>
    <div class="hero-actions">
      <a class="btn btn-cta btn-lg" href="${p.path}">Elegir mi talla</a>
      <a class="btn btn-ghost btn-lg" href="#como-usar">Cómo se usa</a>
    </div>
    <ul class="hero-points"><li>Envío gratis</li><li>SINPE o tarjeta</li><li>WhatsApp ${SITE.whatsappDisplay}</li></ul>
  </div>
</section>`;

  const main = `
${hero}
${trustStrip()}

<section class="section" id="producto">
  <div class="container split">
    <div class="section-head">
      <span class="eyebrow">El producto</span>
      <h2>${esc(p.name)}</h2>
      <p>${esc(p.result)}</p>
    </div>
    ${productCard(cat)}
  </div>
</section>

<section class="section alt" id="beneficios">
  <div class="container">
    <div class="section-head center"><span class="eyebrow">Por qué Forge</span><h2>Upsides reales, sin humo médico</h2><p>Diseñado para acompañarte: soporte, comodidad y un look que se siente premium.</p></div>
    ${benefitCards()}
  </div>
</section>

<section class="section" id="en-uso">
  <div class="container">
    <div class="section-head"><span class="eyebrow">En uso</span><h2>Cómo se ve y se siente</h2><p>Roll shots, detalle y guía visual para que sepas exactamente qué estás comprando.</p></div>
    ${lifestyleStrip()}
  </div>
</section>

<section class="section alt" id="como-usar">
  <div class="container">
    <div class="section-head center"><span class="eyebrow">Cómo usar</span><h2>Tres pasos</h2></div>
    ${stepCards()}
  </div>
</section>

<section class="section" id="tallas">
  <div class="container">
    <div class="section-head"><span class="eyebrow">Guía de tallas</span><h2>Elegí tu talla con precisión</h2><p>Si estás entre dos tallas, elegí la más pequeña para más tensión.</p></div>
    ${sizeGuideTable(SIZES.map((s) => ({ size: s.id, height: s.height, weight: s.weight })))}
    <p class="center-cta"><a class="btn btn-cta" href="${p.path}">Comprar · ${formatCRC(PRICE)}</a></p>
  </div>
</section>

${reviewsBlock()}

<section class="section alt" id="faq">
  <div class="container narrow">
    <div class="section-head center"><span class="eyebrow">FAQ</span><h2>Preguntas frecuentes</h2></div>
    ${faqList(FAQ)}
  </div>
</section>

<section class="final-cta">
  <div class="container">
    <h2>Listo para forjar mejor postura</h2>
    <p>${formatCRC(PRICE)} · envío gratis · SINPE o tarjeta</p>
    <a class="btn btn-cta btn-lg" href="${p.path}">Elegir talla ahora</a>
  </div>
</section>`;

  return layout({
    title: 'ForgeCR — Forjá tu postura',
    description: 'Arnés postural de alto rendimiento. Envío gratis en Costa Rica. Pagá con SINPE Móvil o tarjeta.',
    path: '/',
    page: 'home',
    image: '/images/forge-v1-1200.webp',
    main,
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE.name,
        url: SITE.url,
        sameAs: [SITE.instagram]
      },
      faqJsonLd(FAQ)
    ]
  });
}
