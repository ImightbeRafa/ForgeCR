import { SITE, formatCRC, PRICE } from '../../../shared/catalog.js';
import { layout, esc } from '../layout.js';

const UPDATED = 'Octubre 2026';
const WA = `<a href="https://wa.me/${SITE.whatsapp}">WhatsApp ${SITE.whatsappDisplay}</a>`;

const prose = (title, intro, body) => `<div class="container"><article class="prose">
  <h1>${esc(title)}</h1>
  <p class="updated">Última actualización: ${UPDATED}</p>
  ${intro ? `<p>${intro}</p>` : ''}
  ${body}
</article></div>`;

export function shippingPage() {
  const body = `
<h2>1. Cobertura y costo de envío</h2>
<ul>
  <li>Enviamos a <b>todo Costa Rica</b> por ${SITE.courier}.</li>
  <li><b>Envío gratis</b> en todos los pedidos del Arnés ForgeCR.</li>
  <li>El costo de envío se muestra en el carrito (₡0). No hay cargos ocultos.</li>
</ul>

<h2>2. Tiempos de entrega</h2>
<ul>
  <li>El tiempo estimado de entrega es de <b>${SITE.deliveryDays}</b>.</li>
  <li>El plazo empieza a contar cuando tu pago está confirmado: al aprobarse el pago con tarjeta, o cuando verificamos tu comprobante de SINPE Móvil.</li>
  <li>Los tiempos son estimados y pueden variar en zonas alejadas o por demoras del servicio de entrega.</li>
</ul>

<h2>3. Cómo pagar</h2>
<ul>
  <li><b>SINPE Móvil.</b> Al confirmar tu pedido te mostramos el número, el monto exacto y tu número de pedido. Enviá el comprobante por WhatsApp. <b>Preparamos tu envío cuando verificamos el depósito.</b></li>
  <li><b>Tarjeta de crédito o débito.</b> El pago se procesa en la pasarela segura de Tilopay. ForgeCR no ve ni almacena los datos de tu tarjeta.</li>
</ul>

<h2>4. Dirección de entrega</h2>
<p>Revisá bien tus datos y tus señas antes de confirmar. Si la dirección es incorrecta o incompleta y el pedido no se puede entregar, vamos a contactarte para coordinar una nueva entrega; el costo de un reenvío por error en la dirección corre por cuenta del cliente.</p>

<h2>5. Pedidos dañados, incompletos o incorrectos</h2>
<ul>
  <li>Si tu pedido llega dañado, incompleto o diferente a lo que compraste, escribinos por ${WA} <b>dentro de las 48 horas siguientes a la entrega</b>, con tu número de pedido y fotos del producto y del empaque.</li>
  <li>Revisamos tu caso y, según corresponda, <b>reemplazamos el producto o te devolvemos el dinero</b>.</li>
</ul>

<h2>6. Cambios de talla</h2>
<p>Si la talla no te queda, escribinos por ${WA}. Revisamos cada caso según el estado del producto.</p>

<p>¿Dudas? ${WA}</p>`;

  return layout({
    title: 'Envíos y devoluciones | ForgeCR',
    description: 'Envío gratis, tiempos de entrega, formas de pago y cambios en Forge Costa Rica.',
    path: '/envios-y-devoluciones/',
    main: prose('Envíos y devoluciones', 'Todo claro sobre cómo llega tu Arnés ForgeCR.', body),
    page: 'static'
  });
}

export function termsPage() {
  const body = `
<p>ForgeCR es una tienda en línea que vende el Arnés ForgeCR en Costa Rica a través de <b>forge.shopping</b>. Al usar este sitio y hacer un pedido aceptás estos términos.</p>
<h2>Productos y precios</h2>
<ul>
  <li>El precio del Arnés ForgeCR es <b>${formatCRC(PRICE)}</b> e incluye envío gratis.</li>
  <li>Los precios se muestran en colones costarricenses (CRC).</li>
</ul>
<h2>Pedidos y pagos</h2>
<ul>
  <li><b>SINPE Móvil:</b> el pedido queda pendiente hasta verificar el comprobante.</li>
  <li><b>Tarjeta:</b> procesada por Tilopay. ForgeCR no almacena los datos de tu tarjeta.</li>
</ul>
<h2>Contacto</h2>
<p>${WA} · Instagram <a href="${SITE.instagram}">${SITE.instagramHandle}</a></p>`;

  return layout({
    title: 'Términos y condiciones | ForgeCR',
    description: 'Términos y condiciones de compra de ForgeCR.',
    path: '/terminos/',
    main: prose('Términos y condiciones', '', body),
    page: 'static'
  });
}

export function privacyPage() {
  const body = `
<p>Cuando comprás en ForgeCR usamos tus datos solo para procesar el pedido, enviarlo y darte soporte.</p>
<h2>Qué datos pedimos</h2>
<ul>
  <li>Nombre, teléfono, correo y dirección de entrega.</li>
  <li>Datos de pago: los procesa Tilopay o tu banco vía SINPE; no guardamos números de tarjeta.</li>
</ul>
<h2>Con quién compartimos</h2>
<ul>
  <li>Pasarela Tilopay (pagos con tarjeta).</li>
  <li>Correo (Resend) y CRM interno para cumplir el pedido.</li>
  <li>Meta (Pixel / Conversions API) para medir campañas, con datos hasheados cuando aplica.</li>
</ul>
<h2>Tus derechos</h2>
<p>Podés pedir acceso, corrección o eliminación de tus datos escribiéndonos por ${WA}.</p>`;

  return layout({
    title: 'Política de privacidad | ForgeCR',
    description: 'Cómo ForgeCR usa tus datos cuando comprás.',
    path: '/privacidad/',
    main: prose('Política de privacidad', '', body),
    page: 'static'
  });
}

export function notFoundPage() {
  const main = `<div class="container"><article class="prose center">
    <h1>Página no encontrada</h1>
    <p>Esa ruta no existe.</p>
    <p><a class="btn btn-cta" href="/">Volver al inicio</a></p>
  </article></div>`;
  return layout({ title: 'Página no encontrada | ForgeCR', description: 'Página no encontrada.', path: '/404.html', main, page: 'static', noindex: true });
}
