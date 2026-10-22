/**
 * Real product photos + extra mute reels for the PDP.
 * Run: node scripts/prep-product-media.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = 'C:\\Users\\Ryan\\Downloads\\forge\\forge post web';
const outDir = path.join(root, 'public/images/product');
const outVideo = path.join(root, 'public/video');

const PHOTOS = [
  { id: 'pack-back', file: 'Arnés ForgeCR Corrector de Postura-15.jpg' },
  { id: 'pack-front', file: 'Arnés ForgeCR Corrector de Postura-1 (6).jpg' },
  { id: 'wear-woman', file: 'Arnés ForgeCR Corrector de Postura-1 (4).jpg' },
  { id: 'wear-man', file: 'Arnés ForgeCR Corrector de Postura-1 (8).jpg' },
  { id: 'wear-both', file: 'Arnés ForgeCR Corrector de Postura-1 (2).jpg' }
];

const CLIPS = [
  { id: 'clip-man-x', file: 'img1860-3p6.jpg', top: 200 },
  { id: 'clip-polo-back', file: 'guion1-4.jpg', top: 300 },
  { id: 'clip-polo-front', file: 'guion1-9.jpg', top: 380 },
  { id: 'clip-polo-side', file: 'guion1-14.jpg', top: 280 },
  { id: 'clip-office-back', file: 'guion2-4.jpg', top: 320 }
];
const clipDir = path.join(root, 'assets-src/video-picks');

const SIZES = [
  { suffix: 'thumb', size: 160, quality: 76 },
  { suffix: '400', size: 400, quality: 74 },
  { suffix: '800', size: 800, quality: 76 },
  { suffix: '1200', size: 1200, quality: 78 }
];

function findFfmpeg() {
  const candidates = [
    process.env.FFMPEG,
    'C:\\Users\\Ryan\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1.2-full_build\\bin\\ffmpeg.exe',
    'ffmpeg'
  ].filter(Boolean);
  for (const c of candidates) {
    try {
      execFileSync(c, ['-version'], { stdio: 'ignore' });
      return c;
    } catch { /* next */ }
  }
  return null;
}

async function writeSet(input, id) {
  const img = sharp(input).rotate();
  const meta = await img.metadata();
  const square = meta.width === meta.height;
  for (const { suffix, size, quality } of SIZES) {
    const dest = path.join(outDir, `${id}-${suffix}.webp`);
    await sharp(input)
      .rotate()
      .resize({
        width: size,
        height: square || suffix === 'thumb' ? size : undefined,
        fit: suffix === 'thumb' ? 'cover' : 'inside',
        withoutEnlargement: true
      })
      .webp({ quality, effort: 5 })
      .toFile(dest);
  }
  console.log('ok', id);
}

function encodeReel(ff, input, dest, { start = 1, seconds = 8 } = {}) {
  execFileSync(ff, [
    '-y', '-ss', String(start), '-i', input,
    '-t', String(seconds), '-an',
    '-vf', 'scale=480:-2',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '28',
    '-movflags', '+faststart',
    dest
  ], { stdio: 'inherit' });
}

function poster(ff, mp4, destJpg, destWebp) {
  execFileSync(ff, ['-y', '-i', mp4, '-vframes', '1', destJpg], { stdio: 'inherit' });
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(outVideo, { recursive: true });

  const ffEarly = findFfmpeg();
  const cleanWear = path.join(clipDir, 'img1860-10p5-clean.png');
  const rawWear = path.join(clipDir, 'img1860-10p5.jpg');
  if (ffEarly && fs.existsSync(rawWear) && !fs.existsSync(cleanWear)) {
    execFileSync(ffEarly, [
      '-y', '-i', rawWear,
      '-vf', 'delogo=x=680:y=2320:w=800:h=200',
      '-frames:v', '1', '-update', '1',
      cleanWear
    ], { stdio: 'inherit' });
  }

  for (const { id, file } of PHOTOS) {
    const input = path.join(srcDir, file);
    if (!fs.existsSync(input)) {
      console.warn('missing photo', file);
      continue;
    }
    await writeSet(input, id);
  }

  for (const { id, file, top } of CLIPS) {
    const input = path.join(clipDir, file);
    if (!fs.existsSync(input)) {
      console.warn('missing clip', file);
      continue;
    }
    const meta = await sharp(input).rotate().metadata();
    const side = Math.min(meta.width, meta.height - top);
    const cropped = await sharp(input)
      .rotate()
      .extract({ left: 0, top, width: side, height: side })
      .toBuffer();
    for (const { suffix, size, quality } of SIZES) {
      await sharp(cropped)
        .resize({ width: size, height: size, fit: 'cover' })
        .webp({ quality, effort: 5 })
        .toFile(path.join(outDir, `${id}-${suffix}.webp`));
    }
    console.log('ok clip', id);
  }

  const ff = findFfmpeg();
  const reels = [
    { id: 'reel-guion1', src: 'D:\\videos\\Forge-20260617T181148Z-3-001\\Forge\\Venta\\Guión 1.mov_', start: 2 },
    { id: 'reel-guion2', src: 'D:\\videos\\Forge-20260617T181148Z-3-001\\Forge\\Venta\\Guión 2.mov', start: 2 },
    { id: 'reel-img1860', src: 'C:\\Users\\Ryan\\Downloads\\IMG_1860.MOV', start: 1 }
  ];

  if (!ff) {
    console.warn('ffmpeg missing — skip reels');
    return;
  }

  for (const r of reels) {
    if (!fs.existsSync(r.src)) {
      console.warn('missing video', r.src);
      continue;
    }
    const dest = path.join(outVideo, `${r.id}.mp4`);
    const tmp = path.join(outVideo, `${r.id}-poster.jpg`);
    const posterWebp = path.join(outVideo, `${r.id}-poster.webp`);
    encodeReel(ff, r.src, dest, { start: r.start, seconds: 8 });
    poster(ff, dest, tmp);
    await sharp(tmp).resize({ width: 480, withoutEnlargement: true }).webp({ quality: 72 }).toFile(posterWebp);
    fs.unlinkSync(tmp);
    console.log('ok video', r.id, fs.statSync(dest).size);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
