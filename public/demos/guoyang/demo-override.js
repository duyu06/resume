(() => {
  'use strict';

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const waitFor = async (predicate, timeout = 12000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const value = predicate();
      if (value) return value;
      await wait(80);
    }
    throw new Error('果漾演示步骤等待超时');
  };

  const install = async () => {
    const oldButton = await waitFor(() => document.querySelector('[data-demo-action="run"]'));
    const button = oldButton.cloneNode(true);
    oldButton.replaceWith(button);

    const status = document.querySelector('[data-demo-status]');
    const percent = document.querySelector('[data-demo-percent]');
    const bar = document.querySelector('.demo-mode-track i');
    const log = document.querySelector('.demo-mode-log');
    const allButtons = () => [...document.querySelectorAll('.demo-mode-actions button')];

    const setProgress = (value, label) => {
      bar.style.width = `${value}%`;
      percent.textContent = `${value}%`;
      status.textContent = label;
    };
    const addLog = (message, tone = 'success') => {
      const item = document.createElement('li');
      item.className = tone;
      item.innerHTML = `<b>${tone.toUpperCase()}</b><span>${message}</span>`;
      log.append(item);
    };

    const run = async () => {
      allButtons().forEach((item) => { item.disabled = true; });
      log.innerHTML = '';
      const steps = [
        ['#load-script', null, '载入示例剧本'],
        ['#extract-characters', 1, '提取角色'],
        ['#generate-views', 2, '生成角色四视图'],
        ['#generate-storyboard', 3, '生成智能分镜'],
        ['#generate-shots', 4, '生成镜头'],
        ['#review-shots', 5, '检查素材'],
        ['#compose-video', 6, '合成成片'],
      ];
      try {
        for (let index = 0; index < steps.length; index += 1) {
          const [selector, stepNumber, label] = steps[index];
          setProgress(Math.round(((index + 1) / steps.length) * 100), label);
          document.querySelector(selector)?.click();
          if (stepNumber) await waitFor(() => document.querySelector(`[data-guoyang-step="${stepNumber}"]`)?.classList.contains('done'));
          else await wait(180);
          addLog(`${label}完成`);
        }
        status.textContent = '演示完成';
      } catch (error) {
        addLog(error instanceof Error ? error.message : String(error), 'error');
        status.textContent = '演示失败';
      } finally {
        allButtons().forEach((item) => { item.disabled = false; });
      }
    };

    button.addEventListener('click', run);
    if (window.__portfolioDemoMode) window.__portfolioDemoMode.run = run;
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();
