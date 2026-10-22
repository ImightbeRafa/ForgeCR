/** Mute looping reels: load + play only while on screen. At most one plays. */
export function initLazyVideos(root = document) {
  const wraps = root.querySelectorAll('[data-lazy-video]');
  if (!wraps.length || !('IntersectionObserver' in window)) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = navigator.connection?.saveData;
  if (reduce || saveData) return;

  const videos = () => Array.from(wraps).map((wrap) => wrap.querySelector('video')).filter(Boolean);

  const vio = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target.querySelector('video');
        const source = video?.querySelector('source[data-src]');
        if (!video || !source) return;
        if (entry.isIntersecting) {
          if (!source.src) {
            source.src = source.getAttribute('data-src');
            video.load();
          }
          videos().forEach((other) => {
            if (other !== video) other.pause();
          });
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    },
    { rootMargin: '120px' }
  );
  wraps.forEach((wrap) => vio.observe(wrap));
}
