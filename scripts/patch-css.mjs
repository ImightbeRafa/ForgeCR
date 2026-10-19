import fs from 'node:fs';

const p = new URL('../src/styles/site.css', import.meta.url);
let c = fs.readFileSync(p, 'utf8');
const start = c.indexOf('@font-face');
const end = c.indexOf('@media (min-width: 900px)');
if (start < 0 || end < 0) throw new Error('markers not found');

const insert = `@font-face {
  font-family: 'Space Grotesk';
  font-style: normal;
  font-weight: 300 700;
  font-display: swap;
  src: url('/fonts/space-grotesk-latin-wght-normal.woff2') format('woff2');
}
@font-face {
  font-family: 'Manrope';
  font-style: normal;
  font-weight: 300 800;
  font-display: swap;
  src: url('/fonts/manrope-latin-wght-normal.woff2') format('woff2');
}

:root {
  --primary: #FFFFFF;
  --primary-faint: #1C1B1B;
  --primary-soft: #353534;
  --cta: #C8FF3D;
  --cta-hover: #B4E635;
  --on-cta: #0E0E0E;
  --dark: #0E0E0E;
  --dark-soft: #1C1B1B;
  --accent: #C8FF3D;
  --ink: #E5E2E1;
  --text: #C6C6C6;
  --muted: #919191;
  --line: rgba(71, 71, 71, 0.35);
  --line-soft: rgba(71, 71, 71, 0.15);
  --bg: #131313;
  --surface: #1C1B1B;
  --soft: #201F1F;
  --ok: #C8FF3D;
  --ok-soft: #243018;
  --warn: #f5a623;
  --warn-soft: #3a2a10;
  --error: #ff6b6b;
  --error-soft: #3a1515;
  --star: #C8FF3D;
  --radius-sm: 6px;
  --radius: 10px;
  --radius-lg: 16px;
  --radius-full: 9999px;
  --shadow-sm: none;
  --shadow: none;
  --shadow-lg: none;
  --font: 'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-display: 'Space Grotesk', var(--font);
  --ease: cubic-bezier(.4, 0, .2, 1);
  --max: 1160px;
  --gutter: 16px;
  --header-h: 60px;
}

`;

const forgeExtras = `

/* ===== ForgeCR overrides ===== */
body { background: var(--bg); color: var(--text); }
h1,h2,h3,.wordmark,.hero-brand { font-family: var(--font-display); letter-spacing: -0.02em; color: var(--ink); }
.wordmark { font-weight: 700; font-size: 1.15rem; }
.wordmark-accent { color: var(--accent); }
.ann { background: var(--accent); color: var(--on-cta); font-weight: 700; text-align: center; padding: 0.45rem 1rem; font-size: 0.8rem; }
.site-header { background: rgba(14,14,14,.92); border-bottom: 1px solid var(--line-soft); backdrop-filter: blur(12px); }
.btn-cta { background: var(--cta); color: var(--on-cta); border: none; font-weight: 800; text-transform: uppercase; letter-spacing: .12em; }
.btn-cta:hover { background: var(--cta-hover); }
.btn-ghost { border: 1px solid var(--line); color: var(--ink); background: transparent; }
.forge-hero { display: grid; min-height: min(92vh, 860px); position: relative; }
.forge-hero .hero-media { position: absolute; inset: 0; }
.forge-hero .hero-media img { width: 100%; height: 100%; object-fit: cover; filter: brightness(.55); }
.forge-hero .hero-copy { position: relative; z-index: 1; align-self: end; padding: clamp(1.5rem,4vw,4rem); max-width: 720px; }
.forge-hero h1 { font-size: clamp(2.8rem, 10vw, 6.5rem); line-height: .92; margin: .2rem 0 1rem; color: #fff; }
.forge-hero .accent { color: var(--accent); }
.forge-hero .hero-sub { color: #ddd; max-width: 36rem; }
.hero-brand { text-transform: uppercase; letter-spacing: .28em; font-size: .7rem; color: var(--accent); }
.hero-points { display: flex; flex-wrap: wrap; gap: .75rem 1.25rem; list-style: none; padding: 0; color: #ccc; font-size: .9rem; }
.size-chips { display: flex; flex-wrap: wrap; gap: .5rem; }
.size-chip { border: 1px solid var(--line); background: var(--soft); color: var(--ink); padding: .65rem .9rem; border-radius: var(--radius); cursor: pointer; }
.size-chip[aria-pressed="true"] { border-color: var(--accent); box-shadow: inset 0 0 0 1px var(--accent); }
.size-chip.is-soldout { opacity: .4; text-decoration: line-through; }
.lifestyle-strip { display: grid; grid-template-columns: repeat(2,1fr); gap: .75rem; }
@media (min-width: 900px) { .lifestyle-strip { grid-template-columns: repeat(4,1fr); } }
.lifestyle-strip figure { margin: 0; }
.lifestyle-strip img { width: 100%; aspect-ratio: 4/5; object-fit: cover; border-radius: var(--radius); background: var(--soft); }
.lifestyle-strip figcaption { font-size: .75rem; color: var(--muted); margin-top: .35rem; }
.reviews-note { color: var(--warn); font-size: .85rem; }
.final-cta { background: var(--dark); color: #fff; text-align: center; padding: 4rem 1rem; }
.final-cta h2 { color: #fff; }
.pdp-grid { display: grid; gap: 2rem; }
@media (min-width: 900px) { .pdp-grid { grid-template-columns: 1.05fr 1fr; gap: 3.5rem; } }
.gal-main { position: relative; aspect-ratio: 1; background: var(--soft); border-radius: var(--radius-lg); overflow: hidden; }
.gal-slide { display: none; margin: 0; height: 100%; }
.gal-slide.is-active { display: block; }
.gal-slide img { width: 100%; height: 100%; object-fit: cover; }
.gal-thumbs { display: flex; gap: .4rem; margin-top: .6rem; overflow-x: auto; }
.gal-thumb { border: 1px solid transparent; padding: 0; background: none; border-radius: 8px; overflow: hidden; width: 64px; height: 64px; }
.gal-thumb.is-active { border-color: var(--accent); }
.gal-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.sticky-buy { position: fixed; left: 0; right: 0; bottom: 0; background: rgba(14,14,14,.95); border-top: 1px solid var(--line); z-index: 40; padding: .75rem 0; }
.sticky-inner { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
.site-footer { background: #0E0E0E; color: var(--muted); }
.pay-badges span { border: 1px solid var(--line); padding: .25rem .5rem; border-radius: 999px; margin-right: .35rem; font-size: .75rem; }
`;

c = `/* ForgeCR – Precision Brutalism design system */\n\n${insert}${c.slice(end)}`;
if (!c.includes('ForgeCR overrides')) c += forgeExtras;
fs.writeFileSync(p, c);
console.log('css updated', fs.statSync(p).size);
