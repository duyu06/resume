(() => {
  'use strict';

  const normalize = (root = document) => {
    root.querySelectorAll?.('button[aria-label="关闭项目详情"].absolute.inset-0').forEach((button) => {
      button.setAttribute('aria-label', '点击遮罩退出弹窗');
    });
  };

  normalize();
  new MutationObserver((records) => {
    records.forEach((record) => record.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) normalize(node);
    }));
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
