(() => {
  'use strict';

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({
    ignoreMobileResize: true,
    limitCallbacks: true,
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const activeScrubbers = [];
  let rebuildTimer = 0;
  let lastWidth = window.innerWidth;
  let footerObserver = null;

  const isMobileViewport = () => window.matchMedia('(max-width: 768px)').matches;

  function loadSmoothStyles() {
    const existing = document.querySelector('link[data-yola-smooth]');
    if (existing) return Promise.resolve();

    return new Promise((resolve) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = './cross-border-smooth.css';
      link.dataset.yolaSmooth = 'true';
      link.addEventListener('load', resolve, { once: true });
      link.addEventListener('error', resolve, { once: true });
      document.head.appendChild(link);
    });
  }

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

  function createVideoScrubber(video, options = {}) {
    const mobile = isMobileViewport();
    const state = {
      duration: 0,
      targetTime: 0,
      currentTime: 0,
      lastSeekAt: 0,
      active: false,
      ready: false,
      destroyed: false,
      raf: 0,
    };

    const lerp = options.lerp ?? 0.08;
    const minimumDelta = options.minimumDelta ?? 0.01;
    const minimumInterval = options.minimumInterval ?? (mobile ? 42 : 28);

    video.muted = true;
    video.playsInline = true;
    video.disablePictureInPicture = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.preload = 'auto';
    video.pause();

    const markReady = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      if (duration <= 0) return;

      state.duration = duration;
      if (!state.ready) {
        state.ready = true;
        state.currentTime = video.currentTime || 0;
        if (!video.seeking && video.currentTime === 0 && duration > 0.05) {
          try {
            video.currentTime = 0.01;
          } catch {
            // Keep the poster until the first frame can be decoded.
          }
        }
      }
      video.classList.add('is-ready');
      video.classList.remove('is-error');
    };

    const markError = () => {
      video.classList.remove('is-ready');
      video.classList.add('is-error');
    };

    video.addEventListener('loadedmetadata', markReady, { passive: true });
    video.addEventListener('loadeddata', markReady, { passive: true });
    video.addEventListener('canplay', markReady, { passive: true });
    video.addEventListener('error', markError, { passive: true });

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) markReady();
    else if (video.networkState === HTMLMediaElement.NETWORK_EMPTY) video.load();

    function tick(now) {
      if (state.destroyed) return;

      if (
        state.active &&
        !document.hidden &&
        state.ready &&
        state.duration > 0 &&
        video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
      ) {
        state.currentTime += (state.targetTime - state.currentTime) * (reducedMotion ? 1 : lerp);

        if (
          !video.seeking &&
          Math.abs(video.currentTime - state.currentTime) > minimumDelta &&
          now - state.lastSeekAt >= minimumInterval
        ) {
          state.lastSeekAt = now;
          try {
            video.currentTime = Math.max(0, Math.min(state.duration - 0.01, state.currentTime));
          } catch {
            // A rejected seek should keep the most recently decoded frame.
          }
        }
      }

      state.raf = requestAnimationFrame(tick);
    }

    state.raf = requestAnimationFrame(tick);

    const controller = {
      setProgress(progress) {
        const safeProgress = Math.max(0, Math.min(1, progress));
        state.targetTime = safeProgress * Math.max(0, state.duration - 0.03);
      },
      setActive(active) {
        state.active = Boolean(active);
      },
      destroy() {
        state.destroyed = true;
        cancelAnimationFrame(state.raf);
        video.removeEventListener('loadedmetadata', markReady);
        video.removeEventListener('loadeddata', markReady);
        video.removeEventListener('canplay', markReady);
        video.removeEventListener('error', markError);
      },
    };

    activeScrubbers.push(controller);
    return controller;
  }

  function destroyAnimations() {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill(true));
    while (activeScrubbers.length) activeScrubbers.pop()?.destroy();
    gsap.killTweensOf('.awards-grid,.video-scaling-wrapper,[data-fade-slide-in],.stat-char,.detail-word,.card-subtext');
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

  function setupHeroAnimation() {
    const hero = document.querySelector('.hero-scroll');
    const video = document.querySelector('.hero-video');
    const button = document.querySelector('.hero-content .capsule-button');
    const chars = [...document.querySelectorAll('.hero-char')];
    if (!hero || !video) return;

    chars.forEach((character) => {
      character.style.opacity = '1';
      character.style.filter = 'blur(0px)';
      character.style.transform = 'translate3d(0,0,0)';
    });
    if (button) {
      button.style.opacity = '1';
      button.style.transform = 'translate3d(0,0,0)';
    }

    const scrubber = createVideoScrubber(video);

    ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom bottom',
      invalidateOnRefresh: true,
      onEnter: () => scrubber.setActive(true),
      onEnterBack: () => scrubber.setActive(true),
      onLeave: () => scrubber.setActive(false),
      onLeaveBack: () => scrubber.setActive(false),
      onUpdate(self) {
        scrubber.setActive(self.isActive);
        scrubber.setProgress(self.progress);

        const exitProgress = Math.max(0, Math.min(1, (self.progress - 0.8) / 0.2));
        const eased = 1 - Math.pow(1 - exitProgress, 3);

        chars.forEach((character, index) => {
          const stagger = (index / Math.max(1, chars.length)) * 0.28;
          const local = Math.max(0, Math.min(1, (eased - stagger) / 0.72));
          character.style.opacity = String(1 - local);
          character.style.filter = `blur(${local * 10}px)`;
          character.style.transform = `translate3d(0,${-local * 28}px,0)`;
        });

        if (button) {
          const buttonExit = Math.pow(exitProgress, 4);
          button.style.opacity = String(1 - buttonExit);
          button.style.transform = `translate3d(0,${-buttonExit * 24}px,0)`;
        }
      },
    });
  }

  function setupAwardsAnimation() {
    const section = document.querySelector('.awards-section');
    const grid = document.querySelector('.awards-grid');
    const reveal = document.querySelector('.video-scaling-wrapper');
    const revealVideo = document.querySelector('.reveal-video');
    if (!section || !grid || !reveal || !revealVideo) return;

    gsap.set(grid, { x: 0, force3D: true });
    gsap.set(reveal, { scaleX: 0, transformOrigin: '50% 50%', force3D: true });

    const scrubber = createVideoScrubber(revealVideo, {
      minimumInterval: isMobileViewport() ? 46 : 30,
    });

    const getDistance = () => Math.max(0, grid.scrollWidth - window.innerWidth);
    const getEnd = () => `+=${Math.max(window.innerHeight * 2.35, getDistance() + window.innerHeight * 1.35)}`;

    const timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: getEnd,
        pin: true,
        pinSpacing: true,
        scrub: reducedMotion ? false : isMobileViewport() ? 0.7 : 0.45,
        anticipatePin: 1,
        fastScrollEnd: true,
        invalidateOnRefresh: true,
        onUpdate(self) {
          const videoProgress = Math.max(0, Math.min(1, (self.progress - 0.72) / 0.28));
          scrubber.setActive(self.isActive && videoProgress > 0.001);
          scrubber.setProgress(videoProgress);
          reveal.style.pointerEvents = videoProgress > 0.02 ? 'auto' : 'none';
        },
        onLeave: () => scrubber.setActive(false),
        onLeaveBack: () => scrubber.setActive(false),
      },
    });

    timeline.to(grid, {
      x: () => -getDistance(),
      duration: 0.72,
      force3D: true,
    });

    timeline.to(reveal, {
      scaleX: 1,
      duration: 0.28,
      force3D: true,
    });
  }

  function setupStatsAnimations() {
    const targets = [...document.querySelectorAll('[data-fade-slide-in]')];

    if (reducedMotion) {
      gsap.set(targets, { autoAlpha: 1, y: 0 });
      gsap.set('.stat-char,.detail-word,.card-subtext', { opacity: 1, y: 0, yPercent: 0 });
      return;
    }

    if (targets.length) {
      gsap.set(targets, { autoAlpha: 0, y: 20 });
      gsap.to(targets, {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.stats-left',
          start: 'top 72%',
          once: true,
        },
      });
    }

    document.querySelectorAll('.stat-card').forEach((card) => {
      const chars = card.querySelectorAll('.stat-char');
      const words = card.querySelectorAll('.detail-word');
      const subtext = card.querySelector('.card-subtext');

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: 'top 72%',
          once: true,
        },
      });

      timeline.fromTo(
        chars,
        { yPercent: 105, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.55, stagger: 0.025, ease: 'power3.out' },
      );

      timeline.fromTo(
        words,
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, stagger: 0.018, ease: 'power2.out' },
        '-=0.2',
      );

      if (subtext) timeline.fromTo(subtext, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, '-=0.2');
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
    footerObserver?.disconnect();
    if ('ResizeObserver' in window) {
      footerObserver = new ResizeObserver(sync);
      footerObserver.observe(footer);
    }
    window.addEventListener('resize', sync, { passive: true });
  }

  function setupButtons() {
    document.querySelectorAll('[data-scroll-target]').forEach((button) => {
      button.addEventListener('click', () => {
        document.querySelector(button.dataset.scrollTarget)?.scrollIntoView({
          behavior: reducedMotion ? 'auto' : 'smooth',
        });
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

  function buildAnimations() {
    setupHeroAnimation();
    setupAwardsAnimation();
    setupStatsAnimations();
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  function initialize() {
    prepareText();
    setupMenu();
    setupFooter();
    setupButtons();
    buildAnimations();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) document.querySelectorAll('video').forEach((video) => video.pause());
  });

  window.addEventListener(
    'resize',
    () => {
      clearTimeout(rebuildTimer);
      rebuildTimer = window.setTimeout(() => {
        if (window.innerWidth === lastWidth) return;
        lastWidth = window.innerWidth;
        destroyAnimations();
        requestAnimationFrame(buildAnimations);
      }, 200);
    },
    { passive: true },
  );

  window.addEventListener(
    'pagehide',
    () => {
      destroyAnimations();
      footerObserver?.disconnect();
    },
    { once: true },
  );

  const fontsReady = document.fonts?.ready ?? Promise.resolve();
  Promise.all([fontsReady, loadSmoothStyles()]).then(initialize);
})();
