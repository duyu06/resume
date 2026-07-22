(() => {
  'use strict';

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true, limitCallbacks: true });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileQuery = window.matchMedia('(max-width: 768px)');
  const body = document.body;
  const hero = document.querySelector('.hero-scroll');
  const heroRoot = document.querySelector('[data-yola-motion-root]');
  const heroVideo = document.querySelector('.hero-video');
  const heroTitle = document.querySelector('.hero-title');
  const heroDeclaration = document.querySelector('.hero-declaration');
  const heroButton = document.querySelector('.hero-content .capsule-button');
  const storyFrames = [...document.querySelectorAll('[data-yola-frame]')];
  const markers = [...document.querySelectorAll('[data-yola-marker]')];
  const railLabel = document.querySelector('[data-yola-rail-label]');
  const material = document.querySelector('[data-yola-material]');
  const weight = document.querySelector('[data-yola-weight]');
  const finish = document.querySelector('[data-yola-finish]');
  const collection = document.querySelector('[data-yola-collection]');
  const collectionPin = document.querySelector('.awards-pin');
  const productGrid = document.querySelector('.awards-grid');
  const productCards = [...document.querySelectorAll('.product-card')];
  const collectionIndex = document.querySelector('[data-collection-index]');
  const reveal = document.querySelector('.video-scaling-wrapper');
  const revealVideo = document.querySelector('.reveal-video');
  const craftReveal = document.querySelector('.craft-reveal');

  const HERO_KEYFRAMES = 14;
  const COLLECTION_KEYFRAMES = 8;
  const media = [heroVideo, revealVideo].filter(Boolean);
  let heroFrame = -1;
  let collectionFrame = -1;
  let lastWidth = window.innerWidth;
  let resizeTimer = 0;
  let footerObserver = null;

  body.dataset.yolaKeyframeCount = String(HERO_KEYFRAMES);
  body.dataset.yolaCollectionStageCount = String(COLLECTION_KEYFRAMES);

  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const mapRange = (value, start, end) => clamp((value - start) / Math.max(0.0001, end - start));
  const pad = (value) => String(value).padStart(2, '0');

  function splitCharacters(element) {
    if (!element || element.dataset.split === 'true') return;
    const text = element.textContent || '';
    element.textContent = '';
    [...text].forEach((character) => {
      const span = document.createElement('span');
      span.className = 'hero-char';
      span.textContent = character === ' ' ? '\u00a0' : character;
      element.append(span);
    });
    element.dataset.split = 'true';
  }

  function prepareVideos() {
    media.forEach((video) => {
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.disablePictureInPicture = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.addEventListener('loadeddata', () => video.classList.add('is-ready'), { passive: true });
      video.addEventListener('error', () => video.classList.add('is-error'), { passive: true });
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) video.classList.add('is-ready');
    });
  }

  async function startVideo(video, rate = 0.7) {
    if (!video || reducedMotion || document.hidden) return;
    video.playbackRate = rate;
    try {
      await video.play();
    } catch {
      // Poster and transform choreography remain fully functional without autoplay.
    }
  }

  function stopVideo(video) {
    if (!video || video.paused) return;
    video.pause();
  }

  function updateMaterial(frame) {
    const entries = [
      ['OXIDIZED SILVER', '42 G', 'MATTE / RAW'],
      ['STERLING SILVER', '46 G', 'BRUSHED'],
      ['BLACKENED BRONZE', '56 G', 'OXIDIZED'],
      ['RAW BRASS', '62 G', 'HAND CUT'],
      ['STERLING SILVER', '68 G', 'HAMMERED'],
      ['BLACKENED BRONZE', '74 G', 'EDGE LEFT'],
      ['OXIDIZED SILVER', '78 G', 'SHADOW MATTE'],
      ['STERLING SILVER', '82 G', 'ROTATED FORM'],
      ['RAW BRASS', '86 G', 'ARTISAN MARK'],
      ['MIXED METAL', '88 G', 'COLLECTION'],
      ['OXIDIZED SILVER', '90 G', 'OBJECT INDEX'],
      ['BLACKENED BRONZE', '92 G', 'MATERIAL INDEX'],
      ['STERLING SILVER', '76 G', 'WEAR TRACE'],
      ['SIX OBJECTS', '14–92 G', 'YOLA STUDIO'],
    ];
    const [nextMaterial, nextWeight, nextFinish] = entries[frame] || entries[0];
    if (material) material.textContent = nextMaterial;
    if (weight) weight.textContent = nextWeight;
    if (finish) finish.textContent = nextFinish;
  }

  function setHeroFrame(index) {
    const safeIndex = Math.max(0, Math.min(HERO_KEYFRAMES - 1, index));
    if (safeIndex === heroFrame) return;
    heroFrame = safeIndex;
    const label = pad(safeIndex + 1);
    body.dataset.yolaKeyframe = label;
    body.dataset.yolaSection = 'hero';
    heroRoot?.setAttribute('data-yola-active-frame', label);
    storyFrames.forEach((frame) => frame.classList.toggle('is-active', frame.dataset.yolaFrame === label));
    markers.forEach((marker) => marker.classList.toggle('is-active', marker.dataset.yolaMarker === label));
    if (railLabel) railLabel.textContent = label;
    updateMaterial(safeIndex);
  }

  function setCollectionFrame(index) {
    const safeIndex = Math.max(0, Math.min(COLLECTION_KEYFRAMES - 1, index));
    if (safeIndex === collectionFrame) return;
    collectionFrame = safeIndex;
    body.dataset.yolaSection = 'collection';
    body.dataset.yolaKeyframe = `C${pad(safeIndex + 1)}`;
  }

  function setupHeroMotion() {
    if (!hero || !heroRoot) return;
    document.querySelectorAll('.hero-title-line-inner').forEach(splitCharacters);
    setHeroFrame(reducedMotion ? HERO_KEYFRAMES - 1 : 0);

    if (reducedMotion) {
      heroRoot.style.setProperty('--yola-progress', '1');
      return;
    }

    ScrollTrigger.create({
      id: 'yola-hero-density',
      trigger: hero,
      start: 'top top',
      end: 'bottom bottom',
      invalidateOnRefresh: true,
      onEnter: () => startVideo(heroVideo, 0.68),
      onEnterBack: () => startVideo(heroVideo, 0.68),
      onLeave: () => stopVideo(heroVideo),
      onLeaveBack: () => stopVideo(heroVideo),
      onUpdate(self) {
        const progress = clamp(self.progress);
        heroRoot.style.setProperty('--yola-progress', progress.toFixed(4));
        setHeroFrame(Math.min(HERO_KEYFRAMES - 1, Math.floor(progress * HERO_KEYFRAMES)));

        const introExit = mapRange(progress, 0.035, 0.2);
        const titleScale = 1 - introExit * 0.11;
        const titleX = introExit * -4.5;
        const titleOpacity = 1 - mapRange(progress, 0.1, 0.24);
        gsap.set(heroTitle, { xPercent: titleX, scale: titleScale, opacity: titleOpacity, force3D: true });
        gsap.set(heroDeclaration, { y: introExit * -24, opacity: 1 - mapRange(progress, 0.055, 0.19), force3D: true });
        gsap.set(heroButton, { y: introExit * -18, opacity: 1 - mapRange(progress, 0.04, 0.16), force3D: true });

        const chars = document.querySelectorAll('.hero-char');
        chars.forEach((character, index) => {
          const local = mapRange(progress, 0.11 + index * 0.0022, 0.23 + index * 0.0022);
          gsap.set(character, {
            yPercent: -local * 115,
            rotate: (index % 2 ? 1 : -1) * local * 4,
            opacity: 1 - local,
            filter: `blur(${local * 8}px)`,
            force3D: true,
          });
        });
      },
    });
  }

  function focusProduct(index) {
    const safeIndex = Math.max(0, Math.min(productCards.length - 1, index));
    productCards.forEach((card, cardIndex) => card.classList.toggle('is-focus', cardIndex === safeIndex));
    if (collectionIndex) collectionIndex.textContent = pad(safeIndex + 1);
  }

  function setupDesktopCollection() {
    if (!collection || !productGrid || !collectionPin || !productCards.length) return;
    focusProduct(0);

    ScrollTrigger.create({
      id: 'yola-collection-density',
      trigger: collection,
      start: 'top top',
      end: 'bottom bottom',
      invalidateOnRefresh: true,
      onLeave: () => {
        stopVideo(revealVideo);
        body.dataset.yolaSection = 'about';
      },
      onLeaveBack: () => stopVideo(revealVideo),
      onUpdate(self) {
        const progress = clamp(self.progress);
        collectionPin.style.setProperty('--yola-collection-progress', progress.toFixed(4));
        setCollectionFrame(Math.min(COLLECTION_KEYFRAMES - 1, Math.floor(progress * COLLECTION_KEYFRAMES)));

        const railProgress = mapRange(progress, 0.09, 0.78);
        const distance = Math.max(0, productGrid.scrollWidth - window.innerWidth);
        gsap.set(productGrid, { x: -distance * railProgress, force3D: true });

        const focused = Math.min(productCards.length - 1, Math.round(railProgress * (productCards.length - 1)));
        focusProduct(focused);

        const revealProgress = mapRange(progress, 0.77, 0.93);
        gsap.set(reveal, { scaleX: revealProgress, force3D: true });
        gsap.set(craftReveal, {
          opacity: mapRange(progress, 0.84, 0.94) * (1 - mapRange(progress, 0.975, 1)),
          y: 40 * (1 - mapRange(progress, 0.84, 0.94)),
          scale: 0.94 + mapRange(progress, 0.84, 0.94) * 0.06,
          force3D: true,
        });

        if (revealProgress > 0.05) startVideo(revealVideo, 0.78);
        else stopVideo(revealVideo);
      },
    });
  }

  function setupMobileCollection() {
    if (!productGrid || !productCards.length) return;
    focusProduct(0);
    let ticking = false;

    const update = () => {
      ticking = false;
      const maxScroll = Math.max(1, productGrid.scrollWidth - productGrid.clientWidth);
      const progress = clamp(productGrid.scrollLeft / maxScroll);
      productGrid.style.setProperty('--yola-collection-progress', progress.toFixed(4));
      const index = Math.min(productCards.length - 1, Math.round(progress * (productCards.length - 1)));
      focusProduct(index);
      setCollectionFrame(Math.min(COLLECTION_KEYFRAMES - 1, Math.round(progress * (COLLECTION_KEYFRAMES - 1))));
    };

    productGrid.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          body.dataset.yolaSection = 'collection';
          update();
        }
      });
    }, { threshold: 0.18 });
    if (collection) observer.observe(collection);
  }

  function setupStatsMotion() {
    const targets = [...document.querySelectorAll('[data-fade-slide-in]')];
    const cards = [...document.querySelectorAll('.stat-card')];
    if (reducedMotion) {
      gsap.set(targets, { autoAlpha: 1, y: 0 });
      return;
    }

    targets.forEach((target, index) => {
      gsap.fromTo(target, { autoAlpha: 0, y: 26 }, {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        delay: index * 0.03,
        ease: 'power3.out',
        scrollTrigger: { trigger: target, start: 'top 88%', once: true },
      });
    });

    cards.forEach((card, index) => {
      gsap.fromTo(card, { clipPath: 'inset(0 0 100% 0)' }, {
        clipPath: 'inset(0 0 0% 0)',
        duration: 1,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: card, start: 'top 82%', once: true },
      });
      gsap.fromTo(card.querySelectorAll('.heading-style-h1'), { yPercent: 105 }, {
        yPercent: 0,
        duration: 0.75,
        delay: index * 0.025,
        ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 78%', once: true },
      });
    });
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
      window.alert("You're on the list. Welcome.");
      event.currentTarget.reset();
    });
  }

  function setupFooter() {
    const footer = document.querySelector('.site-footer');
    const spacer = document.querySelector('.footer-spacer');
    if (!footer || !spacer) return;
    const sync = () => { spacer.style.height = `${footer.offsetHeight}px`; };
    sync();
    if ('ResizeObserver' in window) {
      footerObserver = new ResizeObserver(sync);
      footerObserver.observe(footer);
    }
  }

  function rebuildResponsiveMotion() {
    ScrollTrigger.getById('yola-collection-density')?.kill(true);
    gsap.set(productGrid, { clearProps: 'transform' });
    gsap.set(reveal, { clearProps: 'transform' });
    gsap.set(craftReveal, { clearProps: 'transform,opacity' });
    if (mobileQuery.matches || reducedMotion) setupMobileCollection();
    else setupDesktopCollection();
    ScrollTrigger.refresh();
  }

  function initialize() {
    prepareVideos();
    setupMenu();
    setupButtons();
    setupFooter();
    setupHeroMotion();
    setupStatsMotion();
    rebuildResponsiveMotion();
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) media.forEach(stopVideo);
  });

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      rebuildResponsiveMotion();
    }, 220);
  }, { passive: true });

  window.addEventListener('pagehide', () => {
    media.forEach(stopVideo);
    footerObserver?.disconnect();
  }, { once: true });

  const fontsReady = document.fonts?.ready ?? Promise.resolve();
  fontsReady.then(initialize);
})();
