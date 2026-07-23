(() => {
  'use strict';

  const hero = document.querySelector('.hero-scroll');
  const collection = document.querySelector('[data-yola-collection]');
  const productGrid = document.querySelector('.awards-grid');
  if (!hero || !collection) return;

  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const pad = (value) => String(value).padStart(2, '0');
  let scheduled = false;

  const syncState = () => {
    scheduled = false;
    const y = window.scrollY;
    const heroStart = hero.offsetTop;
    const heroDistance = Math.max(1, hero.offsetHeight - window.innerHeight);
    const heroEnd = heroStart + heroDistance;
    const collectionStart = collection.offsetTop;
    const collectionEnd = collectionStart + Math.max(collection.offsetHeight, window.innerHeight);

    if (y <= heroEnd + 1) {
      const progress = clamp((y - heroStart) / heroDistance);
      document.body.dataset.yolaSection = 'hero';
      document.body.dataset.yolaKeyframe = pad(Math.min(14, Math.floor(progress * 14) + 1));
      return;
    }

    if (y < collectionEnd) {
      let progress;
      if (window.matchMedia('(max-width: 768px)').matches && productGrid) {
        progress = clamp(productGrid.scrollLeft / Math.max(1, productGrid.scrollWidth - productGrid.clientWidth));
      } else {
        progress = clamp((y - collectionStart) / Math.max(1, collection.offsetHeight - window.innerHeight));
      }
      document.body.dataset.yolaSection = 'collection';
      document.body.dataset.yolaKeyframe = `C${pad(Math.min(8, Math.floor(progress * 8) + 1))}`;
      return;
    }

    document.body.dataset.yolaSection = 'about';
  };

  const scheduleSync = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(syncState);
  };

  window.addEventListener('scroll', scheduleSync, { passive: true });
  window.addEventListener('resize', scheduleSync, { passive: true });
  productGrid?.addEventListener('scroll', scheduleSync, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) scheduleSync();
  });

  scheduleSync();
})();
