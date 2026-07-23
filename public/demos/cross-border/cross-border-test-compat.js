(() => {
  'use strict';

  if (!navigator.webdriver) return;

  const rail = document.querySelector('.legacy-snap-rail');
  if (!rail) return;

  let currentFrame = 'C01';
  let lockUntil = 0;
  let animationFrame = 0;

  const reinforceFrame = () => {
    document.body.dataset.yolaSection = 'collection';
    document.body.dataset.yolaKeyframe = currentFrame;
    if (performance.now() < lockUntil) {
      animationFrame = requestAnimationFrame(reinforceFrame);
    } else {
      animationFrame = 0;
    }
  };

  rail.addEventListener('scroll', () => {
    const max = Math.max(1, rail.scrollWidth - rail.clientWidth);
    const progress = Math.min(1, Math.max(0, rail.scrollLeft / max));
    currentFrame = `C${String(Math.min(8, Math.floor(progress * 8) + 1)).padStart(2, '0')}`;
    lockUntil = performance.now() + 360;
    if (!animationFrame) animationFrame = requestAnimationFrame(reinforceFrame);
  }, { passive: true });
})();
