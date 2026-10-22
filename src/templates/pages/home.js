import { SITE, FAQ, PRICE, REVIEWS, REVIEWS_ARE_PLACEHOLDERS, formatCRC } from '../../../shared/catalog.js';
import { layout, readFragment, faqList, faqJsonLd, esc } from '../layout.js';
import { buybox, reelsSection, stickyBar } from '../sections/buybox.js';

/** Only real reviews are published; placeholders stay out of the live site. */
function reviews() {
  const rows = REVIEWS.arnes || [];
  if (REVIEWS_ARE_PLACEHOLDERS || !rows.length) return '';
  return `
  <section class="testimonials" id="testimonios">
    <div class="container">
      <div class="testimonials__header reveal-up">
        <h2 class="testimonials__title">Lo que dicen nuestros clientes</h2>
      </div>
      <div class="testimonials__grid">
        ${rows
          .map(
            (r, i) => `<div class="testimonial-card reveal-up" data-delay="${i * 100}">
          <p class="testimonial-card__text">“${esc(r.text)}”</p>
          <div class="testimonial-card__author">
            <span class="testimonial-card__name">${esc(r.author)}</span>
            <span class="testimonial-card__location">${esc(r.city)}</span>
          </div>
        </div>`
          )
          .join('')}
      </div>
    </div>
  </section>`;
}

export function homePage(cat) {
  const main = readFragment('home-main.html')
    .replace('<!--@PRICE-->', formatCRC(PRICE))
    .replace('<!--@WA-->', SITE.whatsappDisplay)
    .replace(
      '<!--@BUYBOX-->',
      buybox(cat, {
        id: 'producto',
        compact: true,
        headingTag: 'h2',
        sizeGuideHref: '#tallas',
        showDetailLink: true
      })
    )
    .replace(
      '<!--@REELS-->',
      reelsSection({
        id: 'en-uso',
        title: 'Miralo en uso',
        lead: 'Tomas reales: cómo se pone, cómo se usa y el arnés de cerca.'
      })
    )
    .replace('<!--@REVIEWS-->', reviews())
    .replace('<!--@FAQ-->', faqList(FAQ, false)) + stickyBar();
  return layout({
    title: 'ForgeCR — Forjá tu Postura | Arnés postural en Costa Rica',
    description: `Arnés postural de alto rendimiento desde ${formatCRC(PRICE)}. Envío gratis a todo Costa Rica. Pagá con SINPE Móvil o tarjeta.`,
    path: '/',
    page: 'home',
    nav: 'tienda',
    bodyClass: 'page-home',
    css: ['/src/styles/pdp.css'],
    image: '/images/product/pack-back-1200.webp',
    head: `
  <link rel="preload" as="image" type="image/webp" href="/images/product/wear-man-800.webp" imagesrcset="/images/product/wear-man-400.webp 400w, /images/product/wear-man-800.webp 800w, /images/product/wear-man-1200.webp 1200w" imagesizes="(max-width: 768px) 70vw, 44vw" fetchpriority="high">`,
    main,
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE.name,
        url: SITE.url,
        sameAs: [SITE.instagram]
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Arnés ForgeCR',
        description: 'Arnés postural de alto rendimiento',
        image: [`${SITE.url}/images/product/pack-back-1200.webp`],
        brand: { '@type': 'Brand', name: SITE.name },
        offers: {
          '@type': 'Offer',
          price: PRICE,
          priceCurrency: 'CRC',
          availability: 'https://schema.org/InStock',
          url: SITE.url
        }
      },
      faqJsonLd(FAQ)
    ]
  });
}
