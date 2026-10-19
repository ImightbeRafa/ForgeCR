import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'tmp-master-index.html'), 'utf8');
const bodyStart = html.indexOf('<body>');
const bodyEnd = html.lastIndexOf('</body>');
let body = html.slice(bodyStart + 6, bodyEnd);

body = body.replace(/<script[\s\S]*?<\/script>/gi, '');
// Keep on-page checkout (#pedido) — that was the working Forge UX
body = body.replace('href="#" class="header__logo"', 'href="/" class="header__logo"');
body = body.replaceAll('₡3,000', 'Gratis');
body = body.replaceAll('₡17,900', '₡14,900');
body = body.replaceAll('17,900', '14,900');
body = body.replaceAll('>₡3.000<', '>Gratis<');
body = body.replace(
  /id="liveShipping">[\s\S]*?</,
  'id="liveShipping">Gratis<'
);
body = body.replace(
  /id="summaryShipping">[\s\S]*?</,
  'id="summaryShipping">Gratis<'
);
body = body.replace(
  'Envíos por Correos de CR</span>',
  'Envío gratis a todo el país</span>'
);
body = body.replace(
  'Corrección postural de precisión para el atleta moderno. Diseñado para perfeccionar su alineación mediante compresión de alto rendimiento y durabilidad transpirable.',
  'Soporte postural de alto rendimiento para el atleta moderno. Diseñado para acompañar tu alineación con compresión firme y material transpirable.'
);
body = body.replace(
  /<span class="testimonials__count">[\s\S]*?<\/span>/,
  '<span class="testimonials__count">Opiniones de ejemplo — las reemplazamos con reseñas reales</span>'
);
body = body.replaceAll('Compra Verificada', 'Cliente');
body = body.replace(
  'logrando una corrección inmediata que perdura durante entrenamientos de alta intensidad.',
  'pensado para dar soporte firme durante entrenamientos de alta intensidad.'
);
body = body.replace('el dolor de espalda desapareció. ', '');
body = body.replaceAll('50671618029', '50661043737');
body = body.replaceAll('7161-8029', '6104-3737');

// Keep SVG icon sprite + page sections; layout.js owns header/footer/mobile chrome
const svgStart = body.indexOf('<svg xmlns="http://www.w3.org/2000/svg"');
const mainStart = body.indexOf('<!-- ===================== HERO');
const footerStart = body.indexOf('<!-- ===================== FOOTER');
if (svgStart === -1 || mainStart === -1 || footerStart === -1) throw new Error('section markers missing');
const svg = body.slice(svgStart, body.indexOf('</svg>', svgStart) + 6);
const main = `${svg}\n${body.slice(mainStart, footerStart)}`;

const outDir = path.join(root, 'src/templates/fragments');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'home-main.html'), main);
console.log('wrote home-main.html', main.length);
