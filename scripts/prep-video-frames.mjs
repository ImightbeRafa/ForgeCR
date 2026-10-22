/**
 * Convert curated video frames + howto loop into public/ assets.
 * Run: node scripts/prep-video-frames.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcRoot = path.join(root, 'assets-src/video-frames');
const outFrames = path.join(root, 'public/images/frames');
const outVideo = path.join(root, 'public/video');

const FRAMES = [
  // gallery / solution / howto
  'img1860/frame_004',
  'img1860/frame_003',
  'img1860/frame_005',
  'img1860/frame_006',
  'img1860/frame_008',
  // problem + pain
  'guion1/frame_003',
  'guion2/frame_002',
  'guion2/frame_003',
  'guion2/frame_005',
  'guion2/frame_009',
  // use cases + ig strip
  'guion1/frame_001',
  'guion1/frame_005',
  'guion1/frame_007',
  'guion1/frame_010',
  'guion1/frame_014',
  'guion2/frame_001',
  'guion2/frame_004',
  'guion2/frame_012',
  'guion2/frame_016'
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

function outBase(rel) {
  return rel.replace('/', '-').replace('frame_', '');
}

async function writeWebp(input, dest, { width, height, fit = 'cover' }) {
  await sharp(input)
    .rotate()
    .resize({ width, height, fit, position: 'centre', withoutEnlargement: true })
    .webp({ quality: 72, effort: 5 })
    .toFile(dest);
}

async function main() {
  fs.mkdirSync(outFrames, { recursive: true });
  fs.mkdirSync(outVideo, { recursive: true });

  for (const rel of FRAMES) {
    const input = path.join(srcRoot, `${rel}.jpg`);
    if (!fs.existsSync(input)) {
      console.warn('missing', rel);
      continue;
    }
    const base = outBase(rel);
    await writeWebp(input, path.join(outFrames, `${base}-400.webp`), { width: 400 });
    await writeWebp(input, path.join(outFrames, `${base}-576.webp`), { width: 576 });
    await writeWebp(input, path.join(outFrames, `${base}-sq-400.webp`), { width: 400, height: 400 });
    await writeWebp(input, path.join(outFrames, `${base}-sq-576.webp`), { width: 576, height: 576 });
    console.log('ok', base);
  }

  const loopSrc = path.join(root, 'assets-src/video-loops/howto-loop.mp4');
  const ff = findFfmpeg();
  if (ff && fs.existsSync(loopSrc)) {
    const destMp4 = path.join(outVideo, 'howto-loop.mp4');
    const posterJpg = path.join(outVideo, 'howto-poster-tmp.jpg');
    const posterWebp = path.join(outVideo, 'howto-poster.webp');
    execFileSync(ff, [
      '-y', '-i', loopSrc,
      '-t', '8', '-an',
      '-vf', 'scale=480:-2',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '28',
      '-movflags', '+faststart',
      destMp4
    ], { stdio: 'inherit' });
    execFileSync(ff, ['-y', '-i', destMp4, '-vframes', '1', posterJpg], { stdio: 'inherit' });
    await writeWebp(posterJpg, posterWebp, { width: 480 });
    fs.unlinkSync(posterJpg);
    console.log('ok video', destMp4, fs.statSync(destMp4).size);
  } else {
    console.warn('ffmpeg or loop source missing — skip video');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
