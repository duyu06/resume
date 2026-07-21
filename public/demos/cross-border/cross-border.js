(() => {
  'use strict';

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const activeScrubbers = [];
  let rebuildTimer = 0;
  let lastWidth = window.innerWidth;

  function splitCharacters(element, className) {
    if (!element || element.dataset.split === 'true') return;
    const text = element.textContent || '';
    element.textContent = '';
    [...text].forEach((character) => {
      const span = document.createElement('span');
      span.className = className;
      span.textContent = character === ' ' ? '\u00a0' : character;
      element.appendChild(span);
    });
    element.dataset.split = 'true';
  }

  function splitWords(element) {
    if (!element || element.dataset.split === 'true') return;
    const words = (element.textContent || '').trim().split(/\s+/);
    element.textContent = '';
    words.forEach((word, index) => {
      const span = document.createElement('span');
      span.className = 'detail-word';
      span.textContent = word;
      element.appendChild(span);
      if (index < words.length - 1) element.appendChild(document.createTextNode(' '));
    });
    element.dataset.split = 'true';
  }

  function createScrubber(video, options = {}) {
    const state = {
      duration: 0,
      targetProgress: 0,
      targetTime: 0,
      currentTime: 0,
      lastSeekAt: 0,
      raf: 0,
      destroyed: false,
    };

    const lerp = options.lerp ?? (isMobile ? 0.12 : 0.08);
    const minimumDelta = options.minimumDelta ?? (isMobile ? 0.035 : 0.012);
    const minimumInterval = options.minimumInterval ?? (isMobile ? 50 : 28);

    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.preload = isMobile ? 'metadata' : 'auto';
    video.pause();

    const syncTarget = () => {
      if (state.duration > 0) state.targetTime = state.targetProgress * Math.max(0, state.duration - 0.03);
    };
    const markReady = () => {
      state.duration = Number.isFinite(video.duration) ? video.duration : 0;
      state.currentTime = video.currentTime || 0;
      syncTarget();
      video.pause();
      video.classList.add('is-ready');
    };
    const markBuffering = () => video.classList.remove('is-ready');
    const markError = () => {
      video.classList.remove('is-ready');
      video.classList.add('is-error');
    };

    video.addEventListener('loadedmetadata', markReady, { passive: true });
    video.addEventListener('loadeddata', markReady, { passive: true });
    video.addEventListener('canplay', markReady, { passive: true });
    video.addEventListener('seeked', markReady, { passive: true });
    video.addEventListener('waiting', markBuffering, { passive: true });
    video.addEventListener('stalled', markBuffering, { passive: true });
    video.addEventListener('error', markError, { passive: true });

    function tick(now) {
      if (state.destroyed) return;
      if (!document.hidden && state.duration > 0 && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        state.currentTime += (state.targetTime - state.currentTime) * (reducedMotion ? 1 : lerp);
        const delta = state.currentTime - video.currentTime;
        if (!video.seeking && Math.abs(delta) > minimumDelta && now - state.lastSeekAt >= minimumInterval) {
          state.lastSeekAt = now;
          try {
            video.currentTime = Math.max(0, Math.min(state.duration, state.currentTime));
          } catch {
            // Keep the last decoded frame when the browser rejects a seek.
          }
        }
      }
      state.raf = requestAnimationFrame(tick);
    }

    state.raf = requestAnimationFrame(tick);

    const controller = {
      setProgress(progress) {
        state.targetProgress = Math.max(0, Math.min(1, progress));
        syncTarget();
      },
      destroy() {
        state.destroyed = true;
        cancelAnimationFrame(state.raf);
        video.removeEventListener('loadedmetadata', markReady);
        video.removeEventListener('loadeddata', markReady);
        video.removeEventListener('canplay', markReady);
        video.removeEventListener('seeked', markReady);
        video.removeEventListener('waiting', markBuffering);
        video.removeEventListener('stalled', markBuffering);
        video.removeEventListener('error', markError);
      },
    };
    activeScrubbers.push(controller);
    return controller;
  }

  function setupMenu() {
    const button = document.querySelector('.menu-button');
    const panel = document.querySelector('.menu-panel');
    if (!button || !panel) return;
    const close = () => {
      panel.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
    };
    button.addEventListener('click', () => {
      const open = !panel.classList.contains('is-open');
      panel.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
    });
    panel.querySelectorAll('a,button').forEach((item) => item.addEventListener('click', close));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') close();
    });
  }

  function setupHero() {
    const hero = document.querySelector('.hero-scroll');
    const video = document.querySelector('.hero-video');
    const button = document.querySelector('.hero-content .capsule-button');
    const chars = [...document.querySelectorAll('.hero-char')];
    if (!hero || !video) return;

    const scrubber = createScrubber(video);
    ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate(self) {
        const progress = self.progress;
        scrubber.setProgress(progress);
        const exitProgress = Math.max(0, Math.min(1, (progress - 0.8) / 0.2));
        const eased = 1 - Math.pow(1 - exitProgress, 3);
        chars.forEach((character, index) => {
          const stagger = index / Math.max(1, chars.length) * 0.28;
          const local = Math.max(0, Math.min(1, (eased - stagger) / 0.72));
          character.style.opacity = String(1 - local);
          character.style.filter = `blur(${local * 12}px)`;
          character.style.transform = `translateY(${-local * 30}px)`;
        });
        if (button) {
          const buttonExit = Math.pow(exitProgress, 4);
          button.style.opacity = String(1 - buttonExit);
          button.style.transform = `translateY(${-buttonExit * 24}px)`;
        }
      },
    });
  }

  function setupAwards() {
    const section = document.querySelector('.awards-section');
    const grid = document.querySelector('.awards-grid');
    const reveal = document.querySelector('.video-scaling-wrapper');
    const revealVideo = document.querySelector('.reveal-video');
    if (!section || !grid || !reveal || !revealVideo) return;

    const scrubber = createScrubber(revealVideo, { minimumInterval: isMobile ? 58 : 30 });
    const getDistance = () => Math.max(0, grid.scrollWidth - window.innerWidth);
    const getEnd = () => `+=${Math.max(window.innerHeight * 2.2, getDistance() + window.innerHeight * 1.25)}`;

    const timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: getEnd,
        pin: true,
        scrub: reducedMotion ? false : 0.35,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate(self) {
          const videoProgress = Math.max(0, Math.min(1, (self.progress - 0.7) / 0.3));
          scrubber.setProgress(videoProgress);
          reveal.style.pointerEvents = videoProgress > 0.02 ? 'auto' : 'none';
        },
      },
    });

    timeline.to(grid, { x: () => -getDistance(), duration: 0.7 });
    timeline.to(reveal, { width: '100%', duration: 0.3 });
  }

  function setupStats() {
    const targets = [...document.querySelectorAll('[data-fade-slide-in]')];
    if (targets.length) {
      gsap.to(targets, {
        autoAlpha: 1,
        y: 0,
        duration: reducedMotion ? 0 : 0.8,
        stagger: reducedMotion ? 0 : 0.15,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.stats-left', start: 'top 72%', once: true },
      });
    }

    document.querySelectorAll('.stat-card').forEach((card) => {
      const chars = card.querySelectorAll('.stat-char');
      const words = card.querySelectorAll('.detail-word');
      const subtext = card.querySelector('.card-subtext');
      const timeline = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 72%', once: true } });
      timeline.from(chars, {
        yPercent: 105,
        opacity: 0,
        duration: reducedMotion ? 0 : 0.55,
        stagger: reducedMotion ? 0 : 0.025,
        ease: 'power3.out',
      });
      timeline.from(words, {
        y: 12,
        opacity: 0,
        duration: reducedMotion ? 0 : 0.45,
        stagger: reducedMotion ? 0 : 0.018,
        ease: 'power2.out',
      }, '-=0.2');
      if (subtext) timeline.from(subtext, { opacity: 0, y: 10, duration: 0.4 }, '-=0.2');
    });
  }

  function setupFooter() {
    const footer = document.querySelector('.site-footer');
    const spacer = document.querySelector('.footer-spacer');
    if (!footer || !spacer) return;
    const sync = () => {
      spacer.style.height = `${footer.offsetHeight}px`;
    };
    sync();
    if ('ResizeObserver' in window) new ResizeObserver(sync).observe(footer);
    window.addEventListener('resize', sync, { passive: true });
  }

  function setupButtons() {
    document.querySelectorAll('[data-scroll-target]').forEach((button) => {
      button.addEventListener('click', () => {
        document.querySelector(button.dataset.scrollTarget)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
      });
    });
    document.querySelector('.newsletter-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = event.currentTarget.querySelector('input');
      if (!input?.value.trim()) return;
      alert("You're on the list. Welcome.");
      event.currentTarget.reset();
    });
  }

  function prepareText() {
    document.querySelectorAll('.hero-title-line-inner').forEach((element) => splitCharacters(element, 'hero-char'));
    document.querySelectorAll('.heading-style-h1:last-child').forEach((element) => splitCharacters(element, 'stat-char'));
    document.querySelectorAll('.detail-paragraph').forEach(splitWords);
  }

  function initialize() {
    prepareText();
    setupMenu();
    setupHero();
    setupAwards();
    setupStats();
    setupFooter();
    setupButtons();
    ScrollTrigger.refresh();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) document.querySelectorAll('video').forEach((video) => video.pause());
  });

  window.addEventListener('resize', () => {
    clearTimeout(rebuildTimer);
    rebuildTimer = window.setTimeout(() => {
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        ScrollTrigger.refresh();
      }
    }, 200);
  }, { passive: true });

  window.addEventListener('pagehide', () => activeScrubbers.forEach((controller) => controller.destroy()), { once: true });

  const start = () => initialize();
  if (document.fonts?.ready) document.fonts.ready.then(start);
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();