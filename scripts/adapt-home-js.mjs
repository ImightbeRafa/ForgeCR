import fs from 'node:fs';

let js = fs.readFileSync('tmp-master-main.js', 'utf8').replace(/^\uFEFF/, '');

js = `import { PRICE, SIZES } from '../../shared/catalog.js';\n\n` + js;

js = js.replace(
  /import \{ FORGE_PRODUCT, calculateOrderTotals \} from '[^']+';?\r?\n/,
  ''
);

js = js.replace(
  /const PRODUCT = \{[\s\S]*?\n\};/,
  `const SIZE_KEY = {
  'M/L': 'arnes-ml', XL: 'arnes-xl', '2XL': 'arnes-2xl', '3XL': 'arnes-3xl', '4XL': 'arnes-4xl'
};
const PRODUCT = {
  id: 'arnes-forgecr',
  name: 'Arnés ForgeCR',
  price: PRICE,
  currency: 'CRC',
  sizes: Object.fromEntries(SIZES.map((s) => [s.id, s.stock]))
};
function calculateOrderTotals(quantity) {
  const subtotal = PRODUCT.price * quantity;
  return { subtotal, shippingCost: 0, total: subtotal };
}`
);

js = js.replaceAll('/api/email/send-sinpe', '/api/sinpe/create-order');

// Replace product object in order payload with items[] for new API
js = js.replace(
  /product:\s*\{[\s\S]*?unitPrice:\s*PRODUCT\.price\s*\}/,
  'items: [{ key: SIZE_KEY[state.selectedSize], qty: state.quantity }]'
);

// Normalize customer fields for new API (nombre instead of nested customer)
// Keep building orderData then remap before fetch
js = js.replace(
  /const orderData = \{([\s\S]*?)\};/,
  `const orderData = {$1};
  const apiBody = {
    ...orderData,
    nombre: \`\${orderData.customer.firstName} \${orderData.customer.lastName}\`.trim(),
    telefono: orderData.customer.phone,
    email: orderData.customer.email,
    provincia: orderData.shipping.province,
    canton: orderData.shipping.canton,
    distrito: orderData.shipping.district,
    direccion: orderData.shipping.address,
    comentarios: orderData.comments || '',
    items: orderData.items
  };`
);

js = js.replace(
  /body: JSON\.stringify\(orderData\)/g,
  'body: JSON.stringify(apiBody)'
);

js = js.replace(
  /if \(liveShipping\) liveShipping\.textContent =[^\n]+/,
  "if (liveShipping) liveShipping.textContent = 'Gratis';"
);

fs.writeFileSync('src/js/home.js', js);
console.log('wrote src/js/home.js', fs.statSync('src/js/home.js').size);
