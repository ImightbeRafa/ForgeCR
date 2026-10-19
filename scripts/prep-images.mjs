/**
 * Map existing Forge photos into catalog filenames + make OG jpg.
 * Also accepts AI-generated PNGs dropped into assets-src/.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const images = path.join(root, 'public/images');
const srcDir = path.join(root, 'assets-src');

async function ensureFrom(srcName, outs) {
  const src = path.join(images, srcName);
  if (!fs.existsSync(src)) {
    console.warn('missing source', srcName);
    return;
  }
  const base = sharp(src).rotate();
  for (const [out, size] of outs) {
    const dest = path.join(images, out);
    await base
      .clone()
      .resize(size, size, { fit: 'cover', position: 'centre' })
      .webp({ quality: 82 })
      .toFile(dest);
    console.log('wrote', out);
  }
}

async function copyAi(name, outBase) {
  const candidates = [`${name}.png`, `${name}.jpg`, `${name}.webp`].map((f) => path.join(srcDir, f));
  const src = candidates.find((f) => fs.existsSync(f));
  if (!src) return false;
  const img = sharp(src).rotate();
  await img.clone().resize(800, 1000, { fit: 'cover' }).webp({ quality: 84 }).toFile(path.join(images, `${outBase}.webp`));
  console.log('ai ->', outBase);
  return true;
}

fs.mkdirSync(srcDir, { recursive: true });

await ensureFrom('forge-v1-1200.webp', [
  ['arnes-thumb.webp', 96],
  ['arnes-sm.webp', 320],
  ['arnes-card.webp', 520],
  ['arnes-gallery.webp', 900]
]);

await sharp(path.join(images, 'forge-v1-1200.webp'))
  .resize(1200, 630, { fit: 'cover' })
  .jpeg({ quality: 85 })
  .toFile(path.join(images, 'arnes-og.jpg'));

for (const [ai, out] of [
  ['lifestyle-1', 'arnes-lifestyle-1'],
  ['lifestyle-2', 'arnes-lifestyle-2'],
  ['howto-1', 'arnes-howto-1'],
  ['detail-1', 'arnes-detail-1']
]) {
  const ok = await copyAi(ai, out);
  if (!ok) {
    // Fallback: derive from product photos so pages never 404
    const fallback = out.includes('howto') || out.includes('detail') ? 'forge3-v1-1200.webp' : 'forge4-v1-1200.webp';
    if (fs.existsSync(path.join(images, fallback))) {
      await sharp(path.join(images, fallback))
        .resize(800, 1000, { fit: 'cover' })
        .webp({ quality: 82 })
        .toFile(path.join(images, `${out}.webp`));
      console.log('fallback', out);
    }
  }
}

console.log('prep-images done');
