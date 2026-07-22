(() => {
  'use strict';

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true, limitCallbacks: true });

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const scrim = $('#scrim');
  const menu = $('#menu-panel');
  const bag = $('#bag-drawer');
  const quickView = $('#quick-view');
  const bagItems = $('#bag-items');
  const bagCount = $('#bag-count');
  const bagTotal = $('#bag-total');
  const toast = $('#toast');
  let activeProduct = null;
  let selectedSize = '7';
  let cart = [];
  let toastTimer = 0;
  let lastFocus = null;

  const productData = {
    obsidian: { name: 'Obsidian Crest', price: 198, image: 'https://d8j0ntlcm91z4.cloudfront.net/user_39ca84eAE1ODL9hbR5VhoEj8tBf/hf_20260628_144408_92b74dc4-ca69-412a-acfd-304f9b29eb5e_min.webp' },
    lava: { name: 'Lava Echo', price: 178, image: 'https://d8j0ntlcm91z4.cloudfront.net/user_39ca84eAE1ODL9hbR5VhoEj8tBf/hf_20260628_145142_ed02063b-d983-47d2-b60b-4b4a5a3448bd_min.webp' },
    crimson: { name: 'Crimson Vein', price: 198, image: 'https://d8j0ntlcm91z4.cloudfront.net/user_39ca84eAE1ODL9hbR5VhoEj8tBf/hf_20260628_144747_f21bc119-e460-45be-a071-851291bd71c5_min.webp' },
    noir: { name: 'Noir Signet', price: 168, image: 'https://d8j0ntlcm91z4.cloudfront.net/user_39ca84eAE1ODL9hbR5VhoEj8tBf/hf_20260627_215521_100b78bd-d24a-4225-b2e8-5bb30d44af73_min.webp' },
    shadow: { name: 'Shadowline Band', price: 148, image: 'https://d8j0ntlcm91z4.cloudfront.net/user_39ca84eAE1ODL9hbR5VhoEj8tBf/hf_20260628_144408_92b74dc4-ca69-412a-acfd-304f9b29eb5e_min.webp' },
  };

  function notify(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
  }

  function lockPage(lock) {
    document.documentElement.style.overflow = lock ? 'hidden' : '';
  }

  function openLayer(layer, trigger) {
    closeLayers(false);
    lastFocus = trigger || document.activeElement;
    layer.classList.add('open');
    scrim.classList.add('open');
    lockPage(true);
    layer.querySelector('button,a,input')?.focus();
  }

  function closeLayers(restore = true) {
    [menu, bag, quickView].forEach((layer) => layer?.classList.remove('open'));
    scrim.classList.remove('open');
    lockPage(false);
    if (restore && lastFocus instanceof HTMLElement) lastFocus.focus();
  }

  $('#menu-open')?.addEventListener('click', (event) => openLayer(menu, event.currentTarget));
  $('#bag-open')?.addEventListener('click', (event) => openLayer(bag, event.currentTarget));
  scrim?.addEventListener('click', () => closeLayers());
  $$('.close-layer').forEach((button) => button.addEventListener('click', () => closeLayers()));
  $$('#menu-panel a').forEach((link) => link.addEventListener('click', () => closeLayers(false)));

  function renderCart() {
    bagCount.textContent = String(cart.length);
    bagItems.innerHTML = cart.length
      ? cart.map((item, index) => `<article class="bag-item"><img src="${item.image}" alt="${item.name}"><div><b>${item.name}</b><small>Size ${item.size}</small></div><button type="button" data-remove="${index}" aria-label="移除 ${item.name}">×</button></article>`).join('')
      : '<p style="color:#766f68">购物袋为空。选择一枚戒指开始体验。</p>';
    bagTotal.textContent = `$${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}`;
    $$('[data-remove]', bagItems).forEach((button) => {
      button.addEventListener('click', () => {
        cart.splice(Number(button.dataset.remove), 1);
        renderCart();
      });
    });
  }

  function openProduct(key, trigger) {
    activeProduct = productData[key];
    selectedSize = '7';
    $('#quick-image').src = activeProduct.image;
    $('#quick-name').textContent = activeProduct.name;
    $('#quick-price').textContent = `$${activeProduct.price.toFixed(2)}`;
    $$('.size').forEach((button) => button.classList.toggle('active', button.dataset.size === selectedSize));
    openLayer(quickView, trigger);
  }

  $$('.product').forEach((button) => button.addEventListener('click', () => openProduct(button.dataset.product, button)));
  $$('.size').forEach((button) => button.addEventListener('click', () => {
    selectedSize = button.dataset.size;
    $$('.size').forEach((item) => item.classList.toggle('active', item === button));
  }));
  $('#add-to-bag')?.addEventListener('click', () => {
    if (!activeProduct) return;
    cart.push({ ...activeProduct, size: selectedSize });
    renderCart();
    closeLayers(false);
    notify(`${activeProduct.name} · Size ${selectedSize} 已加入购物袋`);
  });
  $('#checkout')?.addEventListener('click', () => notify('交互原型：结算前将重新校验价格、规格与库存'));

  $('#newsletter')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = $('input', event.currentTarget);
    if (!input.value.trim()) return;
    notify('订阅成功：原型不会发送真实邮件');
    event.currentTarget.reset();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeLayers();
  });

  if (!reducedMotion) {
    const media = $('.hero-media');
    const titleLines = $$('.hero-copy h1 i');
    const heroCopy = $('.hero-copy p');
    const heroCta = $('.hero-copy .cta');

    gsap.timeline({
      scrollTrigger: {
        trigger: '.hero-scroll',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    })
      .to(media, { scale: 1.22, xPercent: -4, filter: 'brightness(.68)', ease: 'none' }, 0)
      .to(titleLines, { yPercent: -120, opacity: 0, filter: 'blur(10px)', stagger: .06, ease: 'none' }, .55)
      .to([heroCopy, heroCta], { y: -25, opacity: 0, ease: 'none' }, .68);

    gsap.from('.device-stage', {
      y: 80,
      opacity: 0,
      scale: .96,
      duration: 1.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.device-stage', start: 'top 80%', once: true },
    });

    gsap.utils.toArray('.craft-stat').forEach((card) => {
      gsap.from(card, { y: 35, opacity: 0, duration: .8, ease: 'power2.out', scrollTrigger: { trigger: card, start: 'top 82%', once: true } });
    });

    ScrollTrigger.matchMedia({
      '(min-width: 901px)': () => {
        const rail = $('.product-rail');
        const wrap = $('.rail-wrap');
        const distance = () => Math.max(0, rail.scrollWidth - innerWidth);
        const tween = gsap.to(rail, {
          x: () => -distance(),
          ease: 'none',
          force3D: true,
          scrollTrigger: {
            trigger: wrap,
            start: 'top top',
            end: () => `+=${distance() + innerHeight * .8}`,
            pin: true,
            scrub: .7,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        return () => tween.kill();
      },
    });
  }

  renderCart();
  addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
})();
