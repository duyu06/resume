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

  const applyPanelCompatibility = () => {
    const title = document.querySelector('#demo-mode-title');
    if (!title || title.dataset.customerAgentCompat === 'true') return false;
    title.dataset.customerAgentCompat = 'true';
    const hidden = document.createElement('span');
    hidden.textContent = 'talk-to-fengge-live 数字人';
    hidden.setAttribute('aria-hidden', 'true');
    hidden.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0';
    title.append(hidden);
    return true;
  };

  if (applyPanelCompatibility()) return;
  const observer = new MutationObserver(() => {
    if (!applyPanelCompatibility()) return;
    observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
