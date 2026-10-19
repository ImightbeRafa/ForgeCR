/**
 * ForgeCR catalog + pricing. SINGLE SOURCE OF TRUTH.
 *
 * One product (Arnés ForgeCR), one catalog entry per size so cart/API/Tilopay
 * keep working without size-aware pricing changes.
 */

export const PRICE = 14900;
/** Always free shipping (owner-approved). */
export const SHIPPING_COST = 0;
export const FREE_SHIPPING_FROM = 0;
export const shippingFor = (subtotal) => (subtotal <= 0 ? 0 : 0);
export const formatCRC = (n) => `₡${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
export const MAX_QTY_PER_LINE = 10;

export const SITE = {
  name: 'ForgeCR',
  legalName: 'Forge Costa Rica',
  url: 'https://forge.shopping',
  whatsapp: '50661043737',
  whatsappDisplay: '6104-3737',
  instagram: 'https://www.instagram.com/forge.costarica/',
  instagramHandle: '@forge.costarica',
  email: 'orders@forge.shopping',
  pixelId: '983130057569210',
  deliveryDays: '2 a 5 días hábiles',
  pickup: '',
  courier: 'Correos de Costa Rica'
};

/** Shared product copy (athletic, non-medical). */
export const PRODUCT = {
  base: 'arnes',
  slug: 'arnes-forgecr',
  name: 'Arnés ForgeCR',
  short: 'Arnés',
  image: 'arnes',
  accent: '#C8FF3D',
  tagline: 'Soporte postural de alto rendimiento para tu día a día',
  result: 'Una sensación de pecho abierto y hombros más firmes mientras entrenás, trabajás o te movés.',
  bullets: [
    ['Correas de doble tensión', 'ajustás el soporte al nivel que necesitás'],
    ['Material transpirable', 'pensado para usarlo debajo de la ropa o en el gym'],
    ['Diseño atlético', 'acompaña tu postura sin verse clínico']
  ],
  benefits: [
    ['Soporte firme', 'ayudá a mantener pecho abierto y hombros atrás durante el día'],
    ['Comodidad real', 'ligero y transpirable para jornadas largas o entrenos'],
    ['Ajuste personalizado', 'tensá más o menos según tu rutina'],
    ['Look premium', 'negro mate que combina con ropa deportiva o casual']
  ],
  howToUse: [
    { title: 'Ponételo como un chaleco', text: 'Pasá los brazos por las correas y centrá el panel en la espalda.' },
    { title: 'Ajustá la tensión', text: 'Empezá suave. Subí la tensión solo hasta sentir soporte cómodo, no dolor.' },
    { title: 'Usalo en tu rutina', text: 'Ideal en el gym, oficina o mientras caminás. Sacalo si sentís molestia.' }
  ],
  materials: 'Malla técnica transpirable, correas ajustables y costuras reforzadas para uso diario.',
  care: 'Lavá a mano con agua fría. Secá a la sombra. No uses blanqueador ni secadora.',
  path: '/producto/arnes-forgecr/'
};

/** Owner sizes + stock (unchanged). */
export const SIZES = [
  { id: 'M/L', key: 'arnes-ml', stock: 22, height: '155-165 cm', weight: '51-60 kg' },
  { id: 'XL', key: 'arnes-xl', stock: 32, height: '160-170 cm', weight: '61-70 kg' },
  { id: '2XL', key: 'arnes-2xl', stock: 28, height: '165-175 cm', weight: '71-80 kg' },
  { id: '3XL', key: 'arnes-3xl', stock: 12, height: '170-180 cm', weight: '81-90 kg' },
  { id: '4XL', key: 'arnes-4xl', stock: 6, height: '175-185 cm', weight: '91-100 kg' }
];

export const SIZE_ORDER = SIZES.map((s) => s.key);

function list(value) {
  return String(value || '').split(',').map((s) => s.trim()).filter(Boolean);
}

export function readConfig(env = {}) {
  return {
    soldOut: list(env.VITE_SOLD_OUT ?? env.SOLD_OUT),
    soldOutMessage: env.VITE_SOLD_OUT_MESSAGE || 'Agotado por ahora — escribinos por WhatsApp'
  };
}

export function buildCatalog(config = {}) {
  const cfg = { soldOut: [], soldOutMessage: '', ...config };
  const products = Object.create(null);

  for (const size of SIZES) {
    products[size.key] = {
      ...PRODUCT,
      key: size.key,
      size: size.id,
      stock: size.stock,
      height: size.height,
      weight: size.weight,
      kind: 'variant',
      price: PRICE,
      compareAt: null,
      includes: [size.key],
      cardImage: 'arnes-card',
      unitLabel: `Talla ${size.id}`,
      name: `Arnés ForgeCR · Talla ${size.id}`,
      path: PRODUCT.path
    };
  }

  const isSoldOut = (key) => cfg.soldOut.includes(key) || (products[key]?.stock ?? 0) <= 0;

  const linePrice = (key, qty) => {
    const p = products[key];
    if (!p) return 0;
    return p.price * Math.max(0, Math.floor(qty));
  };

  const priceOrder = (rawItems) => {
    const merged = new Map();
    for (const it of Array.isArray(rawItems) ? rawItems : []) {
      const key = it && it.key;
      const qty = Math.min(MAX_QTY_PER_LINE, Math.floor(Number(it && it.qty)));
      if (!products[key] || !(qty > 0) || isSoldOut(key)) continue;
      merged.set(key, Math.min(MAX_QTY_PER_LINE, (merged.get(key) || 0) + qty));
    }
    const items = [...merged].map(([key, qty]) => {
      const p = products[key];
      const lineTotal = linePrice(key, qty);
      return {
        key,
        name: p.name,
        size: p.size,
        qty,
        price: p.price,
        lineTotal,
        compareTotal: lineTotal
      };
    });
    const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
    const shipping = items.length ? shippingFor(subtotal) : 0;
    return { items, subtotal, shipping, total: subtotal + shipping, savings: 0 };
  };

  return {
    products,
    isSoldOut,
    linePrice,
    lineCompare: linePrice,
    priceOrder,
    config: cfg,
    product: PRODUCT,
    sizes: () => SIZE_ORDER.map((k) => products[k]).filter(Boolean),
    variants: () => SIZE_ORDER.map((k) => products[k]).filter(Boolean),
    // Compat shims used by leftover ForgeCR helpers during migration
    patches: () => SIZE_ORDER.map((k) => products[k]).filter(Boolean),
    combos: () => [],
    list: (keys) => keys.map((k) => products[k]).filter(Boolean)
  };
}

export const PROVINCES = ['San José', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limón'];

export const FAQ = [
  ['¿Cómo sé qué talla elegir?', 'Usá la guía de tallas según tu estatura y peso. Si estás entre dos tallas, elegí la más pequeña para más tensión.'],
  ['¿Cómo se usa el arnés?', 'Ponételo como un chaleco, centrá el panel en la espalda y ajustá las correas hasta sentir soporte cómodo. Empezá suave.'],
  ['¿Puedo usarlo todo el día?', 'Sí, muchas personas lo usan en oficina o gym. Si sentís molestia, aflojá o sacalo un rato.'],
  ['¿Cómo puedo pagar?', 'Con SINPE Móvil (te damos el número al confirmar) o con tarjeta por Tilopay.'],
  ['¿Cuánto cuesta y cuánto tarda el envío?', `El envío a todo Costa Rica es GRATIS por ${SITE.courier}. Tarda ${SITE.deliveryDays}.`],
  ['¿Hacen cambios de talla?', 'Escribinos por WhatsApp si la talla no te queda. Revisamos cada caso según el estado del producto y la política de envíos.']
];

export const COMMON_USAGE = PRODUCT.howToUse;

/**
 * ⚠ PLACEHOLDER REVIEWS (REVIEWS_ARE_PLACEHOLDERS = true).
 * Owner will replace with real reviews. No "compra verificada", no AggregateRating JSON-LD.
 */
export const REVIEWS_ARE_PLACEHOLDERS = true;

export const REVIEWS = {
  arnes: [
    {
      author: 'María G.',
      city: 'San José',
      rating: 5,
      title: 'Cómodo para la oficina',
      text: 'Lo uso en el trabajo y se siente firme sin apretar de más. Se puede llevar debajo de la camisa.',
      date: '2026-09-18'
    },
    {
      author: 'Carlos R.',
      city: 'Heredia',
      rating: 5,
      title: 'Buena calidad',
      text: 'El material se siente premium y no pica. Lo uso en el gym y se mantiene en su lugar.',
      date: '2026-09-10'
    },
    {
      author: 'Andrea M.',
      city: 'Alajuela',
      rating: 5,
      title: 'Buen regalo',
      text: 'Se lo regalé a mi mamá y le gustó mucho el ajuste. Atención rápida por WhatsApp.',
      date: '2026-08-28'
    }
  ]
};

export function reviewSummary(key) {
  const rows = REVIEWS[key] || REVIEWS.arnes || [];
  if (!rows.length) return null;
  const avg = rows.reduce((s, r) => s + r.rating, 0) / rows.length;
  return { count: rows.length, average: Math.round(avg * 10) / 10 };
}
