(() => {
  'use strict';

  const mediaDescriptor = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'currentTime');
  if (!mediaDescriptor?.get || !mediaDescriptor?.set) return;

  const fallbackPoster = 'https://d8j0ntlcm91z4.cloudfront.net/user_39ca84eAE1ODL9hbR5VhoEj8tBf/hf_20260628_144408_92b74dc4-ca69-412a-acfd-304f9b29eb5e_min.webp';
  const managed = new WeakSet();
  const cleanups = new Set();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lowPowerDevice = window.matchMedia('(max-width: 768px)').matches || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

  function manageVideo(video) {
    if (!(video instanceof HTMLVideoElement) || managed.has(video)) return;
    managed.add(video);

    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.disableRemotePlayback = true;
    video.preload = 'auto';
    if (!video.poster) video.poster = fallbackPoster;

    const state = {
      target: 0,
      actual: 0,
      lastSeekAt: 0,
      raf: 0,
      disposed: false,
      ready: false,
    };

    try {
      state.actual = mediaDescriptor.get.call(video) || 0;
      state.target = state.actual;

      Object.defineProperty(video, 'currentTime', {
        configurable: true,
        enumerable: true,
        get() {
          return mediaDescriptor.get.call(video);
        },
        set(value) {
          const next = Number(value);
          if (Number.isFinite(next)) state.target = Math.max(0, next);
        },
      });
    } catch {
      return;
    }

    const markReady = () => {
      state.ready = true;
      video.classList.add('scrub-video-ready');
      video.closest('section, div')?.classList.add('scrub-media-ready');
      video.pause();
    };

    const markFailed = () => {
      video.classList.add('scrub-video-failed');
      video.closest('section, div')?.classList.add('scrub-media-failed');
    };

    video.addEventListener('loadeddata', markReady, { passive: true });
    video.addEventListener('canplay', markReady, { passive: true });
    video.addEventListener('error', markFailed, { passive: true });

    const minSeekInterval = lowPowerDevice ? 64 : 34;
    const lerpFactor = lowPowerDevice ? 0.12 : 0.085;
    const minDelta = lowPowerDevice ? 0.055 : 0.025;

    function tick(now) {
      if (state.disposed) return;

      if (!document.hidden && state.ready && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        const current = mediaDescriptor.get.call(video) || 0;
        const duration = Number.isFinite(video.duration) ? video.duration : Infinity;
        const target = Math.min(Math.max(0, state.target), duration);
        const delta = target - current;

        if (!video.seeking && Math.abs(delta) > minDelta && now - state.lastSeekAt >= minSeekInterval) {
          const next = reducedMotion ? target : current + delta * lerpFactor;
          state.lastSeekAt = now;
          try {
            mediaDescriptor.set.call(video, next);
          } catch {
            // Keep the last rendered frame when a browser rejects a seek.
          }
        }
      }

      state.raf = requestAnimationFrame(tick);
    }

    state.raf = requestAnimationFrame(tick);

    const cleanup = () => {
      state.disposed = true;
      cancelAnimationFrame(state.raf);
      video.removeEventListener('loadeddata', markReady);
      video.removeEventListener('canplay', markReady);
      video.removeEventListener('error', markFailed);
    };
    cleanups.add(cleanup);
  }

  function scan(root = document) {
    root.querySelectorAll?.('video').forEach(manageVideo);
    if (root instanceof HTMLVideoElement) manageVideo(root);
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) scan(node);
      });
    }
  });

  scan();
  observer.observe(document.documentElement, { childList: true, subtree: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) document.querySelectorAll('video').forEach((video) => video.pause());
  });

  window.addEventListener('pagehide', () => {
    observer.disconnect();
    cleanups.forEach((cleanup) => cleanup());
    cleanups.clear();
  }, { once: true });
})();
