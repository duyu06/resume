(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const toast = $('#toast');
  const progress = $('#generate-progress i');
  const generateButton = $('#generate');
  const resultCards = $$('.result');
  const score = $('#score');
  const scoreRing = $('.score');
  const compareGenerated = $('.compare-side.generated');
  const compareRange = $('#compare-range');
  const fileLabel = $('#file-label');
  const uploadButton = $('#upload-demo');
  const lockButton = $('#subject-lock');
  let selectedScene = resultCards[0]?.dataset.scene || 'scene-warm';
  let timer = 0;

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(timer);
    timer = window.setTimeout(() => toast.classList.remove('show'), 2600);
  };

  const setActiveChip = (button) => {
    const group = button.closest('.chips');
    if (!group) return;
    $$('.chip', group).forEach((item) => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
  };

  $$('.chip').forEach((button) => {
    button.addEventListener('click', () => {
      setActiveChip(button);
      showToast(`已选择：${button.textContent.trim()}`);
    });
  });

  uploadButton?.addEventListener('click', () => {
    fileLabel.textContent = 'luxury-serum-demo.png · 1200 × 1200';
    uploadButton.textContent = '重新选择示例图';
    showToast('示例商品图已载入，主体识别完成');
  });

  lockButton?.addEventListener('click', () => {
    const next = lockButton.getAttribute('aria-pressed') !== 'true';
    lockButton.setAttribute('aria-pressed', String(next));
    showToast(next ? '已锁定商品主体与包装文字' : '已解除主体锁定');
  });

  const selectResult = (card) => {
    resultCards.forEach((item) => item.classList.toggle('active', item === card));
    selectedScene = card.dataset.scene || 'scene-warm';
    const nextScore = Number(card.dataset.score || 92);
    score.textContent = String(nextScore);
    scoreRing.style.setProperty('--score', nextScore);
    compareGenerated.className = `compare-side generated ${selectedScene}`;
    compareGenerated.style.background = getComputedStyle(card).backgroundImage;
    showToast(`已选中生成版本 ${card.dataset.index}`);
  };

  resultCards.forEach((card) => {
    card.type = 'button';
    card.setAttribute('aria-label', `选择生成版本 ${card.dataset.index}`);
    card.addEventListener('click', () => selectResult(card));
  });

  compareRange?.addEventListener('input', () => {
    compareGenerated.style.setProperty('--split', `${compareRange.value}%`);
  });

  generateButton?.addEventListener('click', () => {
    if (generateButton.disabled) return;
    generateButton.disabled = true;
    generateButton.textContent = '正在生成 8 个版本…';
    resultCards.forEach((card) => {
      card.style.opacity = '.35';
      card.setAttribute('aria-busy', 'true');
    });

    let value = 0;
    const id = window.setInterval(() => {
      value += 8 + Math.random() * 12;
      progress.style.width = `${Math.min(100, value)}%`;
      if (value < 100) return;
      window.clearInterval(id);
      resultCards.forEach((card, index) => {
        window.setTimeout(() => {
          card.style.opacity = '1';
          card.removeAttribute('aria-busy');
        }, index * 80);
      });
      generateButton.disabled = false;
      generateButton.textContent = '重新生成';
      showToast('生成完成：8 个版本已进入人工审核');
    }, 150);
  });

  $$('.export button').forEach((button) => {
    button.addEventListener('click', () => {
      $$('.export button').forEach((item) => item.classList.toggle('active', item === button));
      showToast(`导出格式已切换为 ${button.textContent.trim()}`);
    });
  });

  $('#download-one')?.addEventListener('click', () => showToast('原型演示：已准备当前高清版本'));
  $('#download-batch')?.addEventListener('click', () => showToast('原型演示：8 个版本已加入批量导出队列'));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      const activeIndex = Math.max(0, resultCards.findIndex((card) => card.classList.contains('active')));
      const next = event.key === 'ArrowRight'
        ? (activeIndex + 1) % resultCards.length
        : (activeIndex - 1 + resultCards.length) % resultCards.length;
      selectResult(resultCards[next]);
      resultCards[next].focus();
    }
  });
})();
