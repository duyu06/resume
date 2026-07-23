(() => {
  'use strict';

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function stabilizeLayout() {
    const shell = $('.experience-shell');
    if (shell) shell.style.width = 'auto';

    const footer = $('.page-footer');
    if (footer) {
      footer.style.marginLeft = '0';
      footer.style.marginRight = '0';
    }
  }

  stabilizeLayout();

  const setMotionReady = () => document.documentElement.classList.add('motion-ready');

  if (!gsap || !ScrollTrigger) {
    setMotionReady();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ limitCallbacks: true, ignoreMobileResize: true });

  function revealPage() {
    if (reducedMotion) {
      gsap.set('[data-motion], .metrics article, .chat-panel, .insight-deck > *, .story-head > *', {
        clearProps: 'all',
        opacity: 1,
      });
      setMotionReady();
      return;
    }

    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
    timeline
      .from('[data-motion="topbar"]', { y: -26, opacity: 0, duration: 0.72 })
      .from('[data-motion="sidebar"]', { x: -34, opacity: 0, duration: 0.72 }, '-=0.48')
      .from('[data-motion="avatar"]', { x: -34, opacity: 0, scale: 0.98, duration: 0.82 }, '-=0.46')
      .from('[data-motion="console"]', { y: 34, opacity: 0, duration: 0.82 }, '-=0.62')
      .from('[data-motion="insights"]', { x: 34, opacity: 0, duration: 0.82 }, '-=0.68')
      .from('.metrics article', { y: 20, opacity: 0, stagger: 0.07, duration: 0.5 }, '-=0.48')
      .from('.chat-panel', { y: 22, opacity: 0, duration: 0.58 }, '-=0.46')
      .add(setMotionReady, '-=0.2');
  }

  function animateAvatar() {
    if (reducedMotion) return;

    gsap.to('.avatar-depth-one', {
      rotation: 360,
      duration: 28,
      repeat: -1,
      ease: 'none',
      transformOrigin: '50% 50%',
    });

    gsap.to('.avatar-depth-two', {
      rotation: -360,
      duration: 20,
      repeat: -1,
      ease: 'none',
      transformOrigin: '50% 50%',
    });

    gsap.to('.avatar-frame img', {
      y: -7,
      duration: 3.2,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });

    gsap.to('.brand-orb', {
      rotate: 360,
      duration: 18,
      repeat: -1,
      ease: 'none',
    });

    $$('.voice-wave i').forEach((bar, index) => {
      gsap.to(bar, {
        scaleY: index % 2 ? 0.42 : 1.38,
        opacity: index % 2 ? 0.55 : 1,
        duration: 0.5 + (index % 3) * 0.12,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: index * 0.05,
      });
    });

    gsap.to('.nav-status > i, .online-label i', {
      scale: 1.34,
      opacity: 0.58,
      duration: 1.25,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }

  function setupCursorAura() {
    if (!finePointer || reducedMotion) return;

    const aura = $('.cursor-aura');
    if (!aura) return;

    const moveX = gsap.quickTo(aura, 'x', { duration: 0.55, ease: 'power3.out' });
    const moveY = gsap.quickTo(aura, 'y', { duration: 0.55, ease: 'power3.out' });

    window.addEventListener('pointermove', (event) => {
      moveX(event.clientX - window.innerWidth / 2);
      moveY(event.clientY - window.innerHeight / 2);
    }, { passive: true });

    const board = $('.hero-board');
    const portrait = $('.avatar-frame img');
    const insight = $('.insight-deck');
    if (!board || !portrait || !insight) return;

    const portraitX = gsap.quickTo(portrait, 'x', { duration: 0.8, ease: 'power3.out' });
    const portraitY = gsap.quickTo(portrait, 'y', { duration: 0.8, ease: 'power3.out' });
    const insightX = gsap.quickTo(insight, 'x', { duration: 0.9, ease: 'power3.out' });
    const insightY = gsap.quickTo(insight, 'y', { duration: 0.9, ease: 'power3.out' });

    board.addEventListener('pointermove', (event) => {
      const rect = board.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      portraitX(nx * 14);
      portraitY(ny * 10 - 7);
      insightX(nx * -7);
      insightY(ny * -5);
    }, { passive: true });

    board.addEventListener('pointerleave', () => {
      portraitX(0);
      portraitY(-7);
      insightX(0);
      insightY(0);
    }, { passive: true });
  }

  function animateDynamicItems() {
    const chatThread = $('#chat-thread');
    const toolLog = $('#tool-log');

    if (chatThread) {
      const observer = new MutationObserver((records) => {
        records.forEach((record) => {
          [...record.addedNodes].forEach((node) => {
            if (!(node instanceof HTMLElement) || !node.classList.contains('message')) return;
            if (reducedMotion) return;
            const fromX = node.classList.contains('user') ? 26 : -26;
            gsap.fromTo(node,
              { x: fromX, y: 10, opacity: 0, scale: 0.97 },
              { x: 0, y: 0, opacity: 1, scale: 1, duration: 0.46, ease: 'power3.out' },
            );
          });
        });
      });
      observer.observe(chatThread, { childList: true });
    }

    if (toolLog) {
      const observer = new MutationObserver((records) => {
        records.forEach((record) => {
          [...record.addedNodes].forEach((node) => {
            if (!(node instanceof HTMLElement) || !node.classList.contains('tool-event')) return;
            if (reducedMotion) return;
            gsap.fromTo(node,
              { x: 22, opacity: 0, scale: 0.97 },
              { x: 0, opacity: 1, scale: 1, duration: 0.42, ease: 'power3.out' },
            );
            gsap.fromTo(node,
              { boxShadow: '0 0 0 rgba(139,92,255,0)' },
              { boxShadow: '0 0 30px rgba(139,92,255,.16)', duration: 0.32, yoyo: true, repeat: 1 },
            );
          });
        });
      });
      observer.observe(toolLog, { childList: true });
    }

    ['metric-sentiment', 'metric-tools', 'metric-messages', 'metric-customer'].forEach((id) => {
      const target = document.getElementById(id);
      if (!target) return;
      new MutationObserver(() => {
        if (reducedMotion) return;
        gsap.fromTo(target, { scale: 1.16, color: '#c9b7ff' }, {
          scale: 1,
          color: '#f7f8ff',
          duration: 0.45,
          ease: 'back.out(2)',
        });
      }).observe(target, { childList: true, characterData: true, subtree: true });
    });
  }

  function setupSettingsAnimation() {
    const panel = $('#settings-panel');
    if (!panel) return;

    new MutationObserver(() => {
      if (panel.hidden || reducedMotion) return;
      gsap.fromTo(panel,
        { y: -14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.34, ease: 'power3.out' },
      );
    }).observe(panel, { attributes: true, attributeFilter: ['hidden'] });
  }

  function setupNavigation() {
    $$('[data-scroll-target]').forEach((button) => {
      button.addEventListener('click', () => {
        const target = $(button.dataset.scrollTarget);
        if (!target) return;
        target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      });
    });

    $$('[data-quick-nav]').forEach((button) => {
      button.addEventListener('click', () => {
        const target = $(`.quick-actions [data-quick="${button.dataset.quickNav}"]`);
        $('#workspace')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
        window.setTimeout(() => target?.click(), reducedMotion ? 0 : 420);
      });
    });

    const navItems = $$('.nav-item[data-scroll-target]');
    const sections = navItems
      .map((item) => ({ item, section: $(item.dataset.scrollTarget) }))
      .filter(({ section }) => section);

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          sections.forEach(({ item, section }) => item.classList.toggle('active', section === entry.target));
        });
      }, { rootMargin: '-32% 0px -58% 0px', threshold: 0 });
      sections.forEach(({ section }) => observer.observe(section));
    }
  }

  function setupWorkflowStory() {
    const cards = $$('.workflow-card');
    const orb = $('#workflow-orb');
    const orbNumber = $('#workflow-orb b');
    const label = $('#workflow-label');
    const output = $('#workflow-output');
    const progress = $('.workflow-line i');
    if (!cards.length || !orb || !orbNumber || !label || !output || !progress) return;

    const activate = (index) => {
      const card = cards[index];
      if (!card) return;
      cards.forEach((item, cardIndex) => item.classList.toggle('active', cardIndex === index));
      orbNumber.textContent = String(index + 1).padStart(2, '0');
      label.textContent = card.dataset.label || '';
      output.textContent = card.dataset.output || '';

      if (reducedMotion) {
        progress.style.width = `${(index + 1) * 25}%`;
        return;
      }

      gsap.to(progress, { width: `${(index + 1) * 25}%`, duration: 0.48, ease: 'power2.out' });
      gsap.fromTo([orbNumber, label, output],
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.04, ease: 'power3.out' },
      );
      gsap.fromTo(orb,
        { rotate: index % 2 ? -8 : 8, scale: 0.92 },
        { rotate: 0, scale: 1, duration: 0.62, ease: 'back.out(1.7)' },
      );
    };

    cards.forEach((card, index) => {
      ScrollTrigger.create({
        trigger: card,
        start: 'top 58%',
        end: 'bottom 42%',
        onEnter: () => activate(index),
        onEnterBack: () => activate(index),
      });
    });

    if (!reducedMotion) {
      gsap.from('.story-head > *', {
        y: 40,
        opacity: 0,
        stagger: 0.1,
        duration: 0.75,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.story-head', start: 'top 78%', once: true },
      });

      gsap.from('.workflow-stage', {
        x: -30,
        opacity: 0,
        duration: 0.75,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.story-layout', start: 'top 72%', once: true },
      });

      cards.forEach((card) => {
        gsap.from(card, {
          y: 36,
          opacity: 0,
          duration: 0.65,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 86%', once: true },
        });
      });
    }
  }

  function drawChart() {
    const line = $('.service-chart path[stroke]');
    if (!line || reducedMotion) return;
    const length = typeof line.getTotalLength === 'function' ? line.getTotalLength() : 420;
    gsap.set(line, { strokeDasharray: length, strokeDashoffset: length });
    gsap.to(line, {
      strokeDashoffset: 0,
      duration: 1.3,
      ease: 'power2.out',
      delay: 0.8,
    });
  }

  function setupVoiceToggle() {
    const button = $('.voice-toggle');
    const deck = $('.avatar-deck');
    if (!button || !deck) return;
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      const muted = deck.classList.toggle('voice-muted');
      button.setAttribute('aria-pressed', String(muted));
      button.innerHTML = muted ? '<span>×</span>' : '<span>◖</span>';
      gsap.to('.voice-wave i', { opacity: muted ? 0.18 : 1, scaleY: muted ? 0.2 : 1, duration: 0.28 });
    });
  }

  function initialize() {
    stabilizeLayout();
    revealPage();
    animateAvatar();
    setupCursorAura();
    animateDynamicItems();
    setupSettingsAnimation();
    setupNavigation();
    setupWorkflowStory();
    drawChart();
    setupVoiceToggle();
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  const fontsReady = document.fonts?.ready || Promise.resolve();
  fontsReady.then(initialize);
})();