import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const port = Number(process.env.EMAIL_PREVIEW_PORT || 4174);
const host = '127.0.0.1';
process.env.SITE_URL = `http://${host}:${port}`;

const { customerEmailHTML } = await import('../api/utils/email.js');
const { normalizeTrustedOrder } = await import('../shared/order.js');
const logoPath = fileURLToPath(new URL('../public/images/forgecr-logo.png', import.meta.url));

const sampleOrder = normalizeTrustedOrder({
  orderId: 'ORD-FORGE-2026',
  customer: {
    firstName: 'Daniela',
    lastName: 'Vargas',
    email: 'daniela@example.com',
    phone: '8888-8888'
  },
  product: {
    size: 'M/L',
    quantity: 1
  },
  shipping: {
    province: 'San José',
    canton: 'Montes de Oca',
    district: 'San Pedro',
    address: 'Del parque central, 200 m este'
  },
  paymentMethod: 'tilopay',
  transactionId: 'TX-PREVIEW',
  createdAt: new Date().toISOString()
});

createServer(async (req, res) => {
  if (req.url === '/images/forgecr-logo.png') {
    const logo = await readFile(logoPath);
    res.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' });
    return res.end(logo);
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  return res.end(customerEmailHTML(sampleOrder));
}).listen(port, host, () => {
  console.log(`[Forge Email Preview] http://${host}:${port}`);
});
