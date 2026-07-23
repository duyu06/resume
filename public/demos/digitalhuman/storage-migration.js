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
})();
