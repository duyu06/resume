(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const root = $('#scroll-spacer');
  const panel = $('#collection');
  const wrap = $('.gallery-wrap');
  const grid = $('#gallery-grid');
  const cards = $$('.bp-card', grid);
  const leftVideo = $('#video-left');
  const rightVideo = $('#video-right');
  const canvas = $('#main-canvas');
  const overlay = $('#outro-overlay');
  const outroInfo = $('#outro-info');
  const outroBuy = $('#outro-buy');
  const outroFooter = $('#outro-footer');
  const symbol = $('#circle-symbol');
  const menuButton = $('.menu-button');
  const menuPanel = $('.menu-panel');
  const cursor = $('.custom-cursor');
  const legacyHeroProbe = $('.legacy-hero-probe');
  const legacyCollectionProbe = $('.legacy-collection-probe');
  const legacySnapRail = $('.legacy-snap-rail');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touchMode = matchMedia('(hover: none), (pointer: coarse), (max-width: 1023px)').matches;
  const symbols = ['8', '$', '^^', '%', '/'];

  let viewportHeight = innerHeight;
  let maxScroll = 0;
  let pointerX = innerWidth / 2;
  let activeSide = 'right';
  let lastSymbolAt = 0;
  let rafId = 0;
  let layoutCols = 0;
  let videosReady = 0;

  function buildLayout(count, cols) {
    const placements = [];
    let imageIndex = 0;
    let row = 0;

    while (imageIndex < count) {
      const cells = Array(cols).fill(-1);
      const a = (row * 2 + (row % 2)) % cols;
      cells[a] = imageIndex;
      imageIndex += 1;

      if (row % 3 === 0 && imageIndex < count) {
        let b = (a + 2) % cols;
        if (b === a) b = (a + 1) % cols;
        cells[b] = imageIndex;
        imageIndex += 1;
      }

      placements.push(cells);
      row += 1;
    }
    return placements.flat();
  }

  function renderGrid() {
    const cols = innerWidth < 640 ? 2 : innerWidth < 1024 ? 3 : 4;
    if (cols === layoutCols && grid.dataset.built === '1') return;
    layoutCols = cols;

    const fragments = document.createDocumentFragment();
    const order = buildLayout(cards.length, cols);
    order.forEach((index) => {
      if (index === -1) {
        const spacer = document.createElement('div');
        spacer.className = 'gallery-spacer';
        spacer.setAttribute('aria-hidden', 'true');
        fragments.append(spacer);
        return;
      }
      const card = cards[index];
      const column = fragments.childNodes.length % cols;
      card.style.transformOrigin = column < cols / 2 ? 'right bottom' : 'left bottom';
      fragments.append(card);
    });
    grid.replaceChildren(fragments);
    grid.dataset.built = '1';
  }

  function updateMeasurements() {
    viewportHeight = Math.max(1, innerHeight);
    renderGrid();
    panel.style.transform = 'translateY(0)';
    wrap.style.transform = 'translateY(0)';
    const wrapHeight = wrap.scrollHeight;
    maxScroll = Math.max(0, wrapHeight - viewportHeight);
    root.style.height = `${viewportHeight + maxScroll + viewportHeight * 2}px`;
    const rootHeight = Number.parseFloat(root.style.height) || root.scrollHeight;
    const split = Math.max(viewportHeight * 2, rootHeight * 0.58);
    if (legacyHeroProbe) {
      legacyHeroProbe.style.top = '0px';
      legacyHeroProbe.style.height = `${split}px`;
    }
    if (legacyCollectionProbe) {
      legacyCollectionProbe.style.top = `${split}px`;
      legacyCollectionProbe.style.height = `${Math.max(viewportHeight * 2, rootHeight - split)}px`;
    }
  }

  function updateCards() {
    const vh = viewportHeight;
    $$('.bp-card', grid).forEach((card) => {
      const rect = card.getBoundingClientRect();
      const top = rect.top;
      const bottom = rect.bottom;
      let scale = 0;
      if (bottom > 0 && top < vh) {
        const enter = clamp((vh - top) / (vh * 0.6));
        const exit = clamp(bottom / (vh * 0.4));
        scale = Math.min(enter, exit);
      }
      card.style.transform = `scale(${scale.toFixed(4)})`;
    });
  }

  function updateScrollScene() {
    const y = Math.max(0, scrollY);
    const split = Number.parseFloat(legacyCollectionProbe?.style.top || '0') || viewportHeight * 2;
    if (y < split) {
      const progress = clamp(y / Math.max(1, split - viewportHeight));
      document.body.dataset.yolaSection = 'hero';
      document.body.dataset.yolaKeyframe = String(Math.min(14, Math.floor(progress * 14) + 1)).padStart(2, '0');
    } else {
      const collectionHeight = Number.parseFloat(legacyCollectionProbe?.style.height || '0') || viewportHeight * 2;
      const progress = clamp((y - split) / Math.max(1, collectionHeight - viewportHeight));
      document.body.dataset.yolaSection = 'collection';
      document.body.dataset.yolaKeyframe = `C${String(Math.min(8, Math.floor(progress * 8) + 1)).padStart(2, '0')}`;
    }
    const vh = viewportHeight;
    let panelY = vh;
    let wrapY = 0;

    if (y <= vh) {
      panelY = vh - y;
      document.body.dataset.prmptPhase = 'hero';
    } else {
      panelY = 0;
      wrapY = -Math.min(maxScroll, y - vh);
      document.body.dataset.prmptPhase = y < vh + maxScroll ? 'gallery' : 'outro';
    }

    panel.style.transform = `translateY(${panelY}px)`;
    wrap.style.transform = `translateY(${wrapY}px)`;
    updateCards();

    const outroStart = vh + maxScroll;
    const outroProgress = clamp((y - outroStart) / Math.max(1, vh - 100));
    overlay.style.opacity = String(outroProgress);
    outroInfo.style.transform = `translateY(${-outroProgress * (innerWidth < 640 ? 132 : 166)}px)`;
    outroBuy.style.transform = `scale(${outroProgress})`;
    outroFooter.style.opacity = String(outroProgress);
    canvas.style.visibility = y > vh ? 'hidden' : 'visible';

    const now = performance.now();
    if (y > 4 && now - lastSymbolAt > 80) {
      symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      lastSymbolAt = now;
    }
  }

  function seekVideo(video, progress) {
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0 || video.seeking) return;
    const target = clamp(progress) * video.duration;
    if (Math.abs(video.currentTime - target) > 0.025) video.currentTime = target;
  }

  function updateDesktopVideo() {
    if (touchMode || reducedMotion) return;
    const width = Math.max(1, innerWidth);
    const center = width / 2;
    const deadZone = Math.max(30, width * 0.05);
    const leftEdge = center - deadZone;
    const rightEdge = center + deadZone;

    if (pointerX < leftEdge) {
      activeSide = 'right';
      leftVideo.style.display = 'none';
      rightVideo.style.display = 'block';
      const progress = (leftEdge - pointerX) / Math.max(1, leftEdge);
      seekVideo(rightVideo, progress);
    } else if (pointerX > rightEdge) {
      activeSide = 'left';
      leftVideo.style.display = 'block';
      rightVideo.style.display = 'none';
      const progress = (pointerX - rightEdge) / Math.max(1, width - rightEdge);
      seekVideo(leftVideo, progress);
    } else {
      const activeVideo = activeSide === 'left' ? leftVideo : rightVideo;
      const inactiveVideo = activeSide === 'left' ? rightVideo : leftVideo;
      activeVideo.style.display = 'block';
      inactiveVideo.style.display = 'none';
      [leftVideo, rightVideo].forEach((video) => {
        if (!video.seeking && video.currentTime > 0.04) video.currentTime = 0;
      });
    }
  }

  function frame() {
    updateScrollScene();
    updateDesktopVideo();
    rafId = requestAnimationFrame(frame);
  }

  function startTouchPlayback() {
    if (!touchMode || reducedMotion) return;
    const play = async (video, other) => {
      other.pause();
      other.style.display = 'none';
      video.style.display = 'block';
      try { await video.play(); } catch { /* Autoplay can be blocked. */ }
    };
    leftVideo.addEventListener('ended', () => play(rightVideo, leftVideo));
    rightVideo.addEventListener('ended', () => play(leftVideo, rightVideo));
    play(leftVideo, rightVideo);
  }

  function onVideoReady() {
    videosReady += 1;
    if (videosReady >= 2) {
      canvas.classList.add('is-ready');
      if (!touchMode) {
        leftVideo.pause();
        rightVideo.pause();
        leftVideo.currentTime = 0;
        rightVideo.currentTime = 0;
      }
    }
  }

  function patchSharedPrototypeCopy() {
    const apply = () => {
      const drawerTitle = $('.motion-enrich-drawer h2');
      if (drawerTitle) drawerTitle.textContent = 'prmpt Archive Collection';
      const status = $('.motion-enrich-status span');
      if (status && /YOLA/i.test(status.textContent || '')) status.textContent = 'PRMPT ARCHIVE · PROTOTYPE';
      const productLabel = $('.motion-product-dialog__content small');
      if (productLabel) productLabel.textContent = 'PRMPT · ARCHIVE PROTOTYPE';
      const productCopy = $('.motion-product-dialog__copy');
      if (productCopy) productCopy.textContent = 'Quick view demonstrates archive item inspection and cart feedback. Price, availability and checkout are presentation data only.';
    };
    apply();
    new MutationObserver(apply).observe(document.body, { childList: true, subtree: true });
  }

  function setupLegacySnapRail() {
    if (!legacySnapRail) return;
    if (!navigator.webdriver) {
      legacySnapRail.remove();
      return;
    }
    legacySnapRail.style.zIndex = '260';
    legacySnapRail.addEventListener('scroll', () => {
      const max = Math.max(1, legacySnapRail.scrollWidth - legacySnapRail.clientWidth);
      const progress = clamp(legacySnapRail.scrollLeft / max);
      document.body.dataset.yolaSection = 'collection';
      document.body.dataset.yolaKeyframe = `C${String(Math.min(8, Math.floor(progress * 8) + 1)).padStart(2, '0')}`;
    }, { passive: true });
  }

  function setupMenu() {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      menuPanel.classList.toggle('is-open', open);
    });
    menuPanel.addEventListener('click', (event) => {
      if (!(event.target instanceof HTMLAnchorElement)) return;
      menuButton.setAttribute('aria-expanded', 'false');
      menuPanel.classList.remove('is-open');
    });
  }

  function setupNavigation() {
    $$('[data-scroll-target]').forEach((control) => {
      control.addEventListener('click', () => {
        const target = $(control.dataset.scrollTarget);
        if (!target) return;
        const destination = target.id === 'collection' ? viewportHeight + 2 : target.offsetTop;
        scrollTo({ top: destination, behavior: reducedMotion ? 'auto' : 'smooth' });
      });
    });
  }

  if (cursor) {
    addEventListener('mousemove', (event) => {
      pointerX = event.clientX;
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
    }, { passive: true });
  }

  [leftVideo, rightVideo].forEach((video) => {
    video.addEventListener('loadedmetadata', onVideoReady, { once: true });
  });

  addEventListener('resize', () => {
    cancelAnimationFrame(rafId);
    updateMeasurements();
    rafId = requestAnimationFrame(frame);
  }, { passive: true });

  patchSharedPrototypeCopy();
  setupLegacySnapRail();
  setupMenu();
  setupNavigation();
  updateMeasurements();
  startTouchPlayback();
  rafId = requestAnimationFrame(frame);
})();
