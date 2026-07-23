(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const heroSection = $('.hero-scroll');
  const heroVideo = $('#hero-video');
  const collectionVideo = $('#collection-video');
  const awardsSection = $('.awards-section');
  const awardsGrid = $('.awards-grid');
  const videoWrapper = $('.video-scaling-wrapper');
  const footer = $('.site-footer');
  const footerSpacer = $('.footer-spacer');
  const menuButton = $('.menu-button');
  const menuPanel = $('.menu-panel');
  const heroChars = [];
  const scrubbers = [];
  let resizeTimer = 0;
  let lastWidth = window.innerWidth;
  let rafId = 0;

  const splitChars = (element, className) => {
    if (!element || element.dataset.split === 'true') return [];
    const text = element.textContent || '';
    element.textContent = '';
    const result = [...text].map((character) => {
      const span = document.createElement('span');
      span.className = className;
      span.textContent = character === ' ' ? '\u00a0' : character;
      element.appendChild(span);
      return span;
    });
    element.dataset.split = 'true';
    return result;
  };

  const splitWords = (element) => {
    if (!element || element.dataset.split === 'true') return [];
    const words = (element.textContent || '').trim().split(/\s+/);
    element.textContent = '';
    const result = words.map((word) => {
      const span = document.createElement('span');
      span.className = 'detail-word';
      span.textContent = word;
      element.appendChild(span);
      return span;
    });
    element.dataset.split = 'true';
    return result;
  };

  const createScrubber = (video) => {
    if (!video) return null;
    const scrubber = { video, target: 0, current: 0 };
    video.pause();
    video.addEventListener('loadedmetadata', () => {
      scrubber.current = clamp(video.currentTime || 0, 0, Math.max(0, video.duration - 0.04));
      video.pause();
    });
    scrubbers.push(scrubber);
    return scrubber;
  };

  const heroScrubber = createScrubber(heroVideo);
  const collectionScrubber = createScrubber(collectionVideo);

  const scrubLoop = () => {
    scrubbers.forEach((scrubber) => {
      const duration = Number.isFinite(scrubber.video.duration) ? Math.max(0, scrubber.video.duration - 0.04) : 0;
      if (!duration) return;
      const targetTime = clamp(scrubber.target) * duration;
      scrubber.current += (targetTime - scrubber.current) * 0.08;
      if (!scrubber.video.seeking && Math.abs(scrubber.video.currentTime - scrubber.current) > 0.01) {
        scrubber.video.currentTime = clamp(scrubber.current, 0, duration);
      }
    });
    rafId = requestAnimationFrame(scrubLoop);
  };

  const animateHeroExit = (progress) => {
    const exit = clamp((progress - 0.8) / 0.2);
    heroChars.forEach((character, index) => {
      const stagger = index / Math.max(1, heroChars.length - 1) * 0.28;
      const local = clamp((exit - stagger) / Math.max(0.01, 1 - stagger));
      const eased = 1 - Math.pow(1 - local, 3);
      character.style.opacity = String(1 - eased);
      character.style.filter = `blur(${eased * 8}px)`;
      character.style.transform = `translate3d(0, ${-eased * 28}px, 0)`;
    });
    const discover = $('.discover-button');
    if (discover) {
      const eased = Math.pow(exit, 4);
      discover.style.opacity = String(1 - eased);
      discover.style.transform = `translate3d(0, ${-eased * 24}px, 0)`;
    }
  };

  const updateFooterSpacer = () => {
    if (!footer || !footerSpacer) return;
    footerSpacer.style.height = `${Math.ceil(footer.getBoundingClientRect().height)}px`;
  };

  const updateKeyframe = (progress) => {
    const frame = Math.min(14, Math.max(1, Math.floor(progress * 14) + 1));
    document.body.dataset.yolaKeyframe = String(frame).padStart(2, '0');
  };

  const initScrollMotion = () => {
    if (!window.gsap || !window.ScrollTrigger) return;
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      trigger: heroSection,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: ({ progress }) => {
        if (heroScrubber) heroScrubber.target = progress;
        animateHeroExit(progress);
        updateKeyframe(progress);
      },
    });

    const overflow = () => Math.max(0, awardsGrid.scrollWidth - window.innerWidth);
    const carousel = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: awardsSection,
        start: 'top top',
        end: () => `+=${Math.max(window.innerHeight * 1.5, overflow() + window.innerHeight * 1.1)}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: ({ progress }) => {
          if (collectionScrubber) collectionScrubber.target = clamp((progress - 0.645) / 0.355);
          document.body.dataset.yolaSection = progress < 0.645 ? 'collection' : 'collection-film';
        },
      },
    });
    carousel.to(awardsGrid, { x: () => -overflow(), duration: 1 });
    carousel.to(videoWrapper, { width: '100%', duration: 0.55 });

    gsap.utils.toArray('[data-fade-slide-in]').forEach((element, index) => {
      gsap.fromTo(element,
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          delay: index * 0.04,
          ease: 'power2.out',
          scrollTrigger: { trigger: element, start: 'top 88%', once: true },
        });
    });

    $$('.stat-card').forEach((card) => {
      const chars = $$('.stat-char', card);
      const words = $$('.detail-word', card);
      gsap.fromTo(chars,
        { yPercent: 115, autoAlpha: 0 },
        {
          yPercent: 0,
          autoAlpha: 1,
          stagger: 0.025,
          duration: 0.72,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 75%', once: true },
        });
      gsap.fromTo(words,
        { y: 12, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          stagger: 0.025,
          duration: 0.46,
          ease: 'power2.out',
          scrollTrigger: { trigger: card, start: 'top 69%', once: true },
        });
    });

    ScrollTrigger.create({
      trigger: $('.craft-section'),
      start: 'top center',
      end: 'bottom center',
      onEnter: () => { document.body.dataset.yolaSection = 'about'; },
      onEnterBack: () => { document.body.dataset.yolaSection = 'about'; },
    });

    ScrollTrigger.refresh();
  };

  const rebuildScrollMotion = () => {
    if (!window.ScrollTrigger || !window.gsap) return;
    window.ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    window.gsap.set(awardsGrid, { clearProps: 'transform' });
    window.gsap.set(videoWrapper, { width: '0%' });
    initScrollMotion();
  };

  const bindControls = () => {
    $$('[data-scroll-target]').forEach((control) => {
      control.addEventListener('click', () => {
        const target = $(control.dataset.scrollTarget);
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    menuButton?.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      menuPanel?.classList.toggle('is-open', open);
    });
    $$('.menu-panel a').forEach((link) => link.addEventListener('click', () => {
      menuButton?.setAttribute('aria-expanded', 'false');
      menuPanel?.classList.remove('is-open');
    }));

    $('.newsletter-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      window.alert("You're on the list. Welcome.");
      event.currentTarget.reset();
    });

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        updateFooterSpacer();
        if (window.innerWidth !== lastWidth) {
          lastWidth = window.innerWidth;
          rebuildScrollMotion();
        } else {
          window.ScrollTrigger?.refresh();
        }
      }, 200);
    }, { passive: true });
  };

  const init = () => {
    $$('.hero-title-line-inner').forEach((line) => heroChars.push(...splitChars(line, 'hero-char')));
    $$('.heading-style-h1').forEach((heading) => splitChars(heading, 'stat-char'));
    $$('.detail-paragraph').forEach(splitWords);
    bindControls();
    updateFooterSpacer();
    initScrollMotion();
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(scrubLoop);
    document.documentElement.classList.add('yola-ready');
  };

  const ready = document.fonts?.ready || Promise.resolve();
  ready.then(init).catch(init);
})();
