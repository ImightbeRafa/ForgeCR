import { SITE, PRODUCT, PRICE, formatCRC } from '../../../shared/catalog.js';
import { layout } from '../layout.js';

/** Dedicated PDP: send people into the real Forge buy flow on the home page. */
export function productPage() {
  const main = `
<section class="product" id="producto">
  <div class="container product__inner">
    <div class="product__hero-text">
      <h1 class="product__headline reveal-up">EQUIPO DE<br/>PRECISIÓN.</h1>
      <p class="product__intro reveal-up">${PRODUCT.result}</p>
    </div>
  </div>
  <div class="container product__layout">
    <div class="product__gallery">
      <div class="product__main-image">
        <img src="/images/forge-v1-800.webp" srcset="/images/forge-v1-400.webp 400w, /images/forge-v1-800.webp 800w, /images/forge-v1-1200.webp 1200w" sizes="(max-width: 768px) calc(100vw - 48px), min(624px, 45vw)" width="1200" height="1200" alt="Arnés ForgeCR" loading="eager" fetchpriority="high">
      </div>
    </div>
    <div class="product__info">
      <span class="product__series">Serie de Alto Rendimiento</span>
      <h2 class="product__name">${PRODUCT.name}</h2>
      <div class="product__price">
        <span class="product__price-currency">CRC</span>
        <span class="product__price-value">14,900</span>
      </div>
      <p class="product__intro">${PRODUCT.tagline}. Envío gratis a todo el país.</p>
      <a class="btn btn--primary product__add-btn" href="/#pedido">Elegir talla y comprar</a>
      <a class="product__direct-order" href="/#tallas">Ver guía de tallas</a>
      <ul class="product__badges">
        <li>Envío gratis</li>
        <li>SINPE o tarjeta</li>
        <li>WhatsApp ${SITE.whatsappDisplay}</li>
      </ul>
    </div>
  </div>
</section>
<section class="conversion-band">
  <div class="container conversion-band__inner">
    <div class="conversion-band__copy">
      <p class="conversion-band__eyebrow">Listo para forjar</p>
      <h2 class="conversion-band__title">${formatCRC(PRICE)} · envío gratis</h2>
      <p class="conversion-band__text">Seleccioná tu talla, completá tus datos y pagá seguro con tarjeta o SINPE.</p>
      <a class="btn btn--primary conversion-band__cta" href="/#pedido">Ordenar ahora</a>
    </div>
  </div>
</section>`;

  return layout({
    title: `${PRODUCT.name} — ${formatCRC(PRICE)} | ForgeCR`,
    description: PRODUCT.tagline,
    path: PRODUCT.path,
    page: 'static',
    image: '/images/forge-v1-1200.webp',
    main
  });
}
