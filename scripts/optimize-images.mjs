import { mkdir, rename, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const VERSION = 'v1';
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT_DIR = path.join(ROOT, 'public', 'images');

const SOURCE_DIR = process.argv[2];

if (!SOURCE_DIR) {
  console.error('Usage: npm run optimize:images -- /path/to/original-exports');
  console.error('');
  console.error('Expected files in the source directory:');
  console.error('  forge.jpg, forge2.jpg, forge3.jpg, forge4.jpg, forgecr-logo.png');
  console.error('');
  console.error('Outputs versioned WebP variants into public/images/.');
  console.error('Does not write originals back to public/.');
  process.exit(1);
}

const PHOTO_JOBS = [
  { file: 'forge.jpg', widths: [400, 800, 1200, 1600], thumb: 160 },
  { file: 'forge2.jpg', widths: [400, 800, 1200], thumb: 160 },
  { file: 'forge3.jpg', widths: [400, 800, 1200], thumb: 160 },
  { file: 'forge4.jpg', widths: [400, 800, 1200], thumb: false }
];

function qualityForWidth(width) {
  return width >= 1600 ? 68 : 70;
}

async function fileKb(filePath) {
  const { size } = await stat(filePath);
  return size / 1024;
}

async function optimizePhoto(job) {
  const input = path.join(SOURCE_DIR, job.file);
  const stem = job.file.replace(/\.[^.]+$/, '');

  for (const width of job.widths) {
    const dest = path.join(OUT_DIR, `${stem}-${VERSION}-${width}.webp`);
    await sharp(input)
      .rotate()
      .resize(width, width, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: qualityForWidth(width), effort: 6 })
      .toFile(dest);

    const kb = await fileKb(dest);
    const limit = width >= 1600 ? 250 : 200;
    const flag = kb > limit ? '  ! over target' : '';
    console.log(`  ${path.basename(dest).padEnd(28)} ${kb.toFixed(1).padStart(7)} KB${flag}`);
  }

  if (job.thumb) {
    const dest = path.join(OUT_DIR, `${stem}-${VERSION}-thumb.webp`);
    await sharp(input)
      .rotate()
      .resize(job.thumb, job.thumb, { fit: 'cover' })
      .webp({ quality: 65, effort: 6 })
      .toFile(dest);

    const kb = await fileKb(dest);
    console.log(`  ${path.basename(dest).padEnd(28)} ${kb.toFixed(1).padStart(7)} KB`);
  }
}

async function optimizeLogo() {
  const input = path.join(SOURCE_DIR, 'forgecr-logo.png');
  const dest = path.join(OUT_DIR, 'forgecr-logo.png');
  const tmp = path.join(OUT_DIR, '.forgecr-logo.tmp.png');

  await sharp(input)
    .rotate()
    .resize(460, 345, { fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(tmp);

  await rename(tmp, dest);

  const kb = await fileKb(dest);
  console.log(`  ${'forgecr-logo.png'.padEnd(28)} ${kb.toFixed(1).padStart(7)} KB`);
}

await mkdir(OUT_DIR, { recursive: true });

console.log(`Optimizing images from ${SOURCE_DIR}`);
console.log(`Writing to ${OUT_DIR}\n`);

for (const job of PHOTO_JOBS) {
  await optimizePhoto(job);
}

await optimizeLogo();
console.log('\nDone.');
