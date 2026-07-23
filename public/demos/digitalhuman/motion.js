(() => {
  'use strict';

  const gsap = window.gsap;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const setReady = () => document.documentElement.classList.add('motion-ready');

  function revealPage() {
    if (!gsap || reducedMotion) {
      setReady();
      return;
    }

    gsap.set('[data-motion]', { opacity: 1 });

    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
    timeline
      .from('[data-motion="nav"]', { y: -14, opacity: 0, duration: 0.5 })
      .from('[data-motion="badge"]', { y: 10, opacity: 0, duration: 0.5 }, '-=0.2')
      .from('[data-motion="headline"]', { y: 16, opacity: 0, duration: 0.6 }, '-=0.4')
      .from('[data-motion="subtitle"]', { y: 16, opacity: 0, duration: 0.6 }, '-=0.5')
      .from('[data-motion="actions"]', { y: 16, opacity: 0, duration: 0.6 }, '-=0.5')
      .from('[data-motion="dashboard"]', { y: 30, opacity: 0, duration: 0.8 }, '-=0.42')
      .add(setReady, '-=0.1');
  }

  function animateDynamicContent() {
    const chatThread = $('#chat-thread');
    const toolLog = $('#tool-log');

    if (chatThread) {
      new MutationObserver((records) => {
        records.forEach((record) => {
          [...record.addedNodes].forEach((node) => {
            if (!(node instanceof HTMLElement) || !node.classList.contains('message') || !gsap || reducedMotion) return;
            const fromX = node.classList.contains('user') ? 18 : -18;
            gsap.fromTo(node,
              { x: fromX, y: 8, opacity: 0, scale: 0.98 },
              { x: 0, y: 0, opacity: 1, scale: 1, duration: 0.36, ease: 'power3.out' },
            );
          });
        });
      }).observe(chatThread, { childList: true });
    }

    if (toolLog) {
      new MutationObserver((records) => {
        records.forEach((record) => {
          [...record.addedNodes].forEach((node) => {
            if (!(node instanceof HTMLElement) || !node.classList.contains('tool-event') || !gsap || reducedMotion) return;
            gsap.fromTo(node,
              { x: 14, opacity: 0 },
              { x: 0, opacity: 1, duration: 0.32, ease: 'power3.out' },
            );
          });
        });
      }).observe(toolLog, { childList: true });
    }

    ['metric-sentiment', 'metric-tools', 'metric-messages', 'metric-customer'].forEach((id) => {
      const target = document.getElementById(id);
      if (!target) return;
      new MutationObserver(() => {
        if (!gsap || reducedMotion) return;
        gsap.fromTo(target,
          { scale: 1.08, color: 'hsl(239 84% 67%)' },
          { scale: 1, color: 'hsl(210 14% 17%)', duration: 0.35, ease: 'back.out(1.8)' },
        );
      }).observe(target, { childList: true, characterData: true, subtree: true });
    });
  }

  function setupSettingsMotion() {
    const panel = $('#settings-panel');
    if (!panel) return;

    new MutationObserver(() => {
      if (panel.hidden || !gsap || reducedMotion) return;
      gsap.fromTo(panel,
        { y: -10, opacity: 0, scale: 0.985 },
        { y: 0, opacity: 1, scale: 1, duration: 0.28, ease: 'power3.out' },
      );
    }).observe(panel, { attributes: true, attributeFilter: ['hidden'] });
  }

  function setupDemoTriggers() {
    const heroDemo = $('#hero-demo');
    const play = $('#demo-play');
    const orderAction = $('.quick-actions [data-quick="order"]');

    const runOrderDemo = () => {
      orderAction?.click();
      if (!gsap || reducedMotion) return;
      gsap.fromTo('.dashboard-frame',
        { boxShadow: '0 25px 80px -12px rgba(0,0,0,.08), 0 0 0 1px rgba(0,0,0,.06)' },
        { boxShadow: '0 30px 95px -12px rgba(99,102,241,.2), 0 0 0 1px rgba(99,102,241,.18)', duration: 0.28, yoyo: true, repeat: 1 },
      );
    };

    heroDemo?.addEventListener('click', runOrderDemo);
    play?.addEventListener('click', runOrderDemo);

    $$('.sidebar-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        $$('.sidebar-item').forEach((button) => button.classList.remove('active'));
        item.classList.add('active');

        const quickMap = ['order', 'order', 'order', 'inventory', 'refund', 'angry'];
        const quick = $(`.quick-actions [data-quick="${quickMap[index]}"]`);
        if (index > 0) quick?.click();
      });
    });
  }

  function setupSubtleFloat() {
    if (!gsap || reducedMotion) return;
    gsap.to('.brand-mark', {
      y: -2,
      duration: 1.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
    gsap.to('.conversation-state i, .performance-card .panel-title b i', {
      scale: 1.25,
      opacity: 0.62,
      duration: 1.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }

  revealPage();
  animateDynamicContent();
  setupSettingsMotion();
  setupDemoTriggers();
  setupSubtleFloat();
})();
