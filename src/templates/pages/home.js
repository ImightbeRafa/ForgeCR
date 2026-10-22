import { SITE, FAQ, PRICE, formatCRC } from '../../../shared/catalog.js';
import { layout, readFragment, faqJsonLd } from '../layout.js';
import { buybox, reelsSection } from '../sections/buybox.js';

export function homePage(cat) {
  const main = readFragment('home-main.html')
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
        lead: 'Tres tomas reales: cómo se pone, cómo se usa y el arnés de cerca.'
      })
    );
  return layout({
    title: 'ForgeCR — Forjá tu Postura',
    description: 'Arnés postural de alto rendimiento. Envío gratis en Costa Rica. Pagá con SINPE Móvil o tarjeta.',
    path: '/',
    page: 'home',
    nav: 'tienda',
    bodyClass: 'page-home',
    css: ['/src/styles/pdp.css'],
    image: '/images/product/pack-back-1200.webp',
    head: `
  <link rel="preload" as="image" type="image/webp" href="/images/product/pack-back-800.webp" imagesrcset="/images/product/pack-back-400.webp 400w, /images/product/pack-back-800.webp 800w, /images/product/pack-back-1200.webp 1200w" imagesizes="100vw" fetchpriority="high">`,
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
