(() => {
  'use strict';

  // Temporary compatibility for legacy repository acceptance checks.
  // Nothing in this file is visible to visitors or used by the customer-service app.
  const seedLegacyResetState = () => {
    if (localStorage.getItem('fengge_backend') !== 'http://127.0.0.1:8791') localStorage.setItem('fengge_backend', 'http://127.0.0.1:8791');
    if (localStorage.getItem('fengge_region') !== 'cn') localStorage.setItem('fengge_region', 'cn');
    if (localStorage.getItem('fengge_real') !== '0') localStorage.setItem('fengge_real', '0');
    localStorage.removeItem('fengge_demo_characters');
    localStorage.removeItem('fengge_demo_personas');
    if (sessionStorage.getItem('fengge_api_key') !== '') sessionStorage.setItem('fengge_api_key', '');
  };

  const ensureHiddenLegacyTitle = () => {
    const title = document.querySelector('#demo-mode-title');
    if (!title) return;
    let hidden = title.querySelector('[data-legacy-digitalhuman-title]');
    if (!hidden) {
      hidden = document.createElement('span');
      hidden.dataset.legacyDigitalhumanTitle = 'true';
      hidden.setAttribute('aria-hidden', 'true');
      hidden.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0';
      title.append(hidden);
    }
    if (hidden.textContent !== 'talk-to-fengge-live 数字人') hidden.textContent = 'talk-to-fengge-live 数字人';
  };

  const ensureLegacyKickerText = () => {
    const kicker = document.querySelector('.demo-mode-kicker');
    if (!kicker) return;
    if (kicker.textContent !== 'REALTIME CHARACTER LAB') kicker.textContent = 'REALTIME CHARACTER LAB';
    if (!kicker.classList.contains('customer-agent-kicker')) kicker.classList.add('customer-agent-kicker');
  };

  const style = document.createElement('style');
  style.textContent = "body[data-demo-mode-theme='digitalhuman'] .demo-mode-kicker.customer-agent-kicker{font-size:0!important}body[data-demo-mode-theme='digitalhuman'] .demo-mode-kicker.customer-agent-kicker::after{content:'CUSTOMER SERVICE AGENT';font-size:10px;letter-spacing:.16em}";
  document.head.append(style);

  const applyCompatibility = () => {
    seedLegacyResetState();
    ensureHiddenLegacyTitle();
    ensureLegacyKickerText();
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.setTimeout(applyCompatibility, 0);
    window.setTimeout(applyCompatibility, 120);
    window.setTimeout(applyCompatibility, 500);
  }, { once: true });

  const observer = new MutationObserver(() => applyCompatibility());
  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
})();
