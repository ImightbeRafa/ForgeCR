/** Mute looping reels: posters load near the viewport, video loads + plays only while on screen. At most one plays. */
export function initLazyVideos(root = document) {
  const wraps = root.querySelectorAll('[data-lazy-video]');
  if (!wraps.length) return;

  const setPoster = (video) => {
    if (video?.dataset.poster && !video.poster) video.poster = video.dataset.poster;
  };
  if (!('IntersectionObserver' in window)) {
    wraps.forEach((wrap) => setPoster(wrap.querySelector('video')));
    return;
  }

  // Posters are below the fold: keep them off the critical path until the reels get close.
  const pio = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      setPoster(entry.target.querySelector('video'));
      pio.unobserve(entry.target);
    }),
    { rootMargin: '600px 0px' }
  );
  wraps.forEach((wrap) => pio.observe(wrap));

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = navigator.connection?.saveData;
  const videos = () => Array.from(wraps).map((wrap) => wrap.querySelector('video')).filter(Boolean);
  const load = (video) => {
    const source = video?.querySelector('source[data-src]');
    if (source && !source.src) {
      source.src = source.getAttribute('data-src');
      video.load();
    }
  };
  const playOnly = (video) => {
    videos().forEach((other) => { if (other !== video) other.pause(); });
    video.play().catch(() => {});
  };

  // Tap toggles play (the only way to play with reduced motion or data saver on).
  wraps.forEach((wrap) => wrap.addEventListener('click', () => {
    const video = wrap.querySelector('video');
    if (!video) return;
    load(video);
    if (video.paused) playOnly(video); else video.pause();
  }));

  if (reduce || saveData) return;
  const vio = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target.querySelector('video');
        if (!video) return;
        if (entry.isIntersecting) {
          load(video);
          playOnly(video);
        } else {
          video.pause();
        }
      });
    },
    { rootMargin: '120px' }
  );
  wraps.forEach((wrap) => vio.observe(wrap));
}
