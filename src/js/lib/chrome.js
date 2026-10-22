/** Header scroll + mobile drawer. Shared by every storefront page. */
export function initChrome() {
  const header = document.getElementById('header');
  const hamburger = document.getElementById('hamburger');
  const overlay = document.getElementById('mobileOverlay');
  const drawer = document.getElementById('mobileDrawer');
  const closeBtn = document.getElementById('drawerClose');

  const setOpen = (open) => {
    overlay?.classList.toggle('active', open);
    drawer?.classList.toggle('active', open);
    document.body.classList.toggle('nav-open', open);
    hamburger?.setAttribute('aria-expanded', String(open));
    if (drawer) {
      if (open) drawer.removeAttribute('inert');
      else drawer.setAttribute('inert', '');
    }
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) closeBtn?.focus();
    else hamburger?.focus();
  };

  drawer?.setAttribute('inert', '');
  hamburger?.setAttribute('aria-expanded', 'false');

  hamburger?.addEventListener('click', () => setOpen(!drawer?.classList.contains('active')));
  overlay?.addEventListener('click', () => setOpen(false));
  closeBtn?.addEventListener('click', () => setOpen(false));
  drawer?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer?.classList.contains('active')) setOpen(false);
  });

  if (header) {
    const onScroll = () => header.classList.toggle('header--scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
}
