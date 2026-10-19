/* Forge shell interactions shared by static/policy pages */
const header = document.getElementById('header');
const hamburger = document.getElementById('hamburger');
const mobileDrawer = document.getElementById('mobileDrawer');
const mobileOverlay = document.getElementById('mobileOverlay');
const drawerClose = document.getElementById('drawerClose');

function openDrawer() {
  mobileDrawer?.classList.add('active');
  mobileOverlay?.classList.add('active');
  document.body.classList.add('no-scroll');
}
function closeDrawer() {
  mobileDrawer?.classList.remove('active');
  mobileOverlay?.classList.remove('active');
  document.body.classList.remove('no-scroll');
}

hamburger?.addEventListener('click', openDrawer);
drawerClose?.addEventListener('click', closeDrawer);
mobileOverlay?.addEventListener('click', closeDrawer);
mobileDrawer?.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeDrawer));

window.addEventListener('scroll', () => {
  if (!header) return;
  if (window.scrollY > 40) header.classList.add('header--scrolled');
  else header.classList.remove('header--scrolled');
}, { passive: true });

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
