import { SITE, FAQ, PRICE, formatCRC } from '../../../shared/catalog.js';
import { layout, readFragment, faqJsonLd } from '../layout.js';

export function homePage() {
  const main = readFragment('home-main.html');
  return layout({
    title: 'ForgeCR — Forjá tu Postura',
    description: 'Arnés postural de alto rendimiento. Envío gratis en Costa Rica. Pagá con SINPE Móvil o tarjeta.',
    path: '/',
    page: 'home',
    nav: 'tienda',
    image: '/images/forge-v1-1200.webp',
    head: `
  <link rel="preload" as="image" type="image/webp" media="(max-width: 768px)" href="/images/forge4-v1-800.webp" imagesrcset="/images/forge4-v1-400.webp 400w, /images/forge4-v1-800.webp 800w, /images/forge4-v1-1200.webp 1200w" imagesizes="100vw" fetchpriority="high">
  <link rel="preload" as="image" type="image/webp" media="(min-width: 769px)" href="/images/forge-v1-1200.webp" imagesrcset="/images/forge-v1-400.webp 400w, /images/forge-v1-800.webp 800w, /images/forge-v1-1200.webp 1200w, /images/forge-v1-1600.webp 1600w" imagesizes="100vw" fetchpriority="high">`,
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
        image: [`${SITE.url}/images/forge-v1-1200.webp`],
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
