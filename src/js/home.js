import { initChrome } from './lib/chrome.js';
import { initBuybox } from './lib/buybox.js';
import { initLazyVideos } from './lib/lazy-video.js';

function metaTrack(eventName, params = {}, options = {}) {
  if (typeof fbq !== 'function') return;
  if (options.eventID) fbq('track', eventName, params, { eventID: options.eventID });
  else fbq('track', eventName, params);
}

initChrome();
initBuybox();
initLazyVideos();

function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-right');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || 0, 10);
        setTimeout(() => entry.target.classList.add('visible'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealElements.forEach((el) => observer.observe(el));
}
initScrollReveal();

const productSection = document.getElementById('producto');
if (productSection) {
  const viewed = new Set();
  const vcObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !viewed.has('arnes-forgecr')) {
        viewed.add('arnes-forgecr');
        metaTrack('ViewContent', {
          content_name: 'Arnés ForgeCR',
          content_type: 'product',
          content_ids: ['arnes-forgecr'],
          value: 14900,
          currency: 'CRC'
        });
        vcObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  vcObserver.observe(productSection);
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64;
    const y = target.getBoundingClientRect().top + window.pageYOffset - headerH - 12;
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
});

const orderSection = document.getElementById('pedido');
if (orderSection && 'IntersectionObserver' in window) {
  const orderObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      document.body.classList.toggle('order-in-view', entry.isIntersecting);
    });
  }, { threshold: 0.12 });
  orderObserver.observe(orderSection);
}
