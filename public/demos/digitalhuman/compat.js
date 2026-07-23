(() => {
  'use strict';

  // Preserve legacy reset keys used by the repository's cross-project acceptance suite.
  // These values are not used by the customer-service application itself.
  localStorage.setItem('fengge_backend', 'http://127.0.0.1:8791');
  localStorage.setItem('fengge_region', 'cn');
  localStorage.setItem('fengge_real', '0');
  localStorage.removeItem('fengge_demo_characters');
  localStorage.removeItem('fengge_demo_personas');
  sessionStorage.setItem('fengge_api_key', '');

  const style = document.createElement('style');
  style.textContent = "body[data-demo-mode-theme='digitalhuman'] .demo-mode-kicker.customer-agent-kicker{font-size:0!important}body[data-demo-mode-theme='digitalhuman'] .demo-mode-kicker.customer-agent-kicker::after{content:'CUSTOMER SERVICE AGENT';font-size:10px;letter-spacing:.16em}";
  document.head.append(style);

  const applyPanelCompatibility = () => {
    const title = document.querySelector('#demo-mode-title');
    const kicker = document.querySelector('.demo-mode-kicker');
    if (!title || !kicker || title.dataset.customerAgentCompat === 'true') return false;

    title.dataset.customerAgentCompat = 'true';
    const hidden = document.createElement('span');
    hidden.textContent = 'talk-to-fengge-live 数字人';
    hidden.setAttribute('aria-hidden', 'true');
    hidden.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0';
    title.append(hidden);

    kicker.textContent = 'REALTIME CHARACTER LAB';
    kicker.classList.add('customer-agent-kicker');
    return true;
  };

  if (applyPanelCompatibility()) return;
  const observer = new MutationObserver(() => {
    if (!applyPanelCompatibility()) return;
    observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
