import { initChrome } from './lib/chrome.js';
/* Forge shell interactions shared by static/policy pages */

initChrome();

document.querySelectorAll('.reveal-up, .reveal-right').forEach((el) => {
  if (!('IntersectionObserver' in window)) {
    el.classList.add('revealed');
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  io.observe(el);
});
