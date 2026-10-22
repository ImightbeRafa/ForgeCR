import { initBuybox } from './lib/buybox.js';
import { initChrome } from './lib/chrome.js';
import { initLazyVideos } from './lib/lazy-video.js';

initChrome();
initBuybox();
initLazyVideos();

function headerOffset() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--header-h');
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : 64;
}

const sticky = document.querySelector('[data-sticky-buy]');
const buyCta = document.querySelector('[data-buybox] [data-add-cart]');
const finalCta = document.querySelector('#final-cta');
if (sticky && buyCta && 'IntersectionObserver' in window) {
  const inView = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.bottom > headerOffset() && r.top < window.innerHeight;
  };
  const syncSticky = () => {
    const show = window.innerWidth <= 768 && !inView(buyCta) && !inView(finalCta);
    sticky.hidden = !show;
    document.body.classList.toggle('has-sticky-buy', show);
  };
  const io = new IntersectionObserver(syncSticky, { threshold: 0, rootMargin: '0px' });
  io.observe(buyCta);
  if (finalCta) io.observe(finalCta);
  window.addEventListener('resize', syncSticky, { passive: true });
  syncSticky();
}
