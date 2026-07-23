(() => {
  'use strict';

  const legacyLocalKeys = [
    'fengge_backend',
    'fengge_region',
    'fengge_real',
    'fengge_demo_characters',
    'fengge_demo_personas',
  ];
  const legacySessionKeys = ['fengge_api_key'];

  legacyLocalKeys.forEach((key) => localStorage.removeItem(key));
  legacySessionKeys.forEach((key) => sessionStorage.removeItem(key));

  const layoutGuard = document.createElement('style');
  layoutGuard.dataset.digitalhumanLayoutGuard = 'true';
  layoutGuard.textContent = `
    .experience-shell,
    .hero-board {
      overflow-x: clip !important;
    }
    .experience-shell {
      width: auto !important;
    }
    .page-footer {
      margin-left: 0 !important;
      margin-right: 0 !important;
    }
  `;
  document.head.appendChild(layoutGuard);
})();