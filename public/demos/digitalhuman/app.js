(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const toast = $('#toast');
  let toastTimer = 0;
  let trainingTimer = 0;
  let trainingProgress = 100;
  let trainingRunning = false;

  function notify(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  $$('.workflow button').forEach((button) => {
    button.addEventListener('click', () => {
      $$('.workflow button').forEach((item) => item.classList.toggle('active', item === button));
      document.querySelector(button.dataset.target)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    });
  });

  $$('.legend button').forEach((button) => {
    button.addEventListener('click', () => {
      $$('.legend button').forEach((item) => item.classList.toggle('active', item === button));
      $('#sample-count').textContent = button.dataset.samples;
      notify(`训练数据筛选：${button.dataset.label}`);
    });
  });

  $$('.tag').forEach((button) => {
    button.addEventListener('click', () => {
      const active = button.getAttribute('aria-pressed') !== 'true';
      button.setAttribute('aria-pressed', String(active));
      notify(`${button.textContent.trim()} ${active ? '已加入' : '已移除'} Prompt 风格协议`);
    });
  });

  const progressBar = $('#train-progress');
  const trainStatus = $('#train-status');
  const trainButton = $('#train-toggle');
  const resetTraining = () => {
    trainingProgress = 0;
    progressBar.style.width = '0%';
    trainStatus.textContent = '准备训练';
  };

  trainButton?.addEventListener('click', () => {
    if (trainingProgress >= 100) resetTraining();
    trainingRunning = !trainingRunning;
    trainButton.textContent = trainingRunning ? '暂停训练' : '继续训练';
    trainStatus.textContent = trainingRunning ? '训练中' : '已暂停';
    clearInterval(trainingTimer);
    if (!trainingRunning) return;
    trainingTimer = setInterval(() => {
      trainingProgress = Math.min(100, trainingProgress + 2);
      progressBar.style.width = `${trainingProgress}%`;
      $('#training-step').textContent = Math.round(18560 * trainingProgress / 100).toLocaleString();
      if (trainingProgress < 100) return;
      clearInterval(trainingTimer);
      trainingRunning = false;
      trainButton.textContent = '重新训练';
      trainStatus.textContent = '已完成';
      notify('训练完成，模型版本已进入固定测试集评测');
    }, 110);
  });

  $('#eval-version')?.addEventListener('change', (event) => {
    const score = event.target.value === 'v3' ? '4.72' : event.target.value === 'v2' ? '4.48' : '4.21';
    $('#total-score').textContent = score;
    $$('.score-row b').forEach((item, index) => {
      item.textContent = (Number(score) - index * .03 + (index === 2 ? .18 : 0)).toFixed(2);
    });
    notify(`已切换至模型 ${event.target.selectedOptions[0].textContent}`);
  });

  const form = $('#chat-form');
  const input = $('#chat-input');
  const messages = $('#messages');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) return;
    const user = document.createElement('div');
    user.className = 'message user';
    user.textContent = value;
    messages.append(user);
    input.value = '';
    messages.scrollTop = messages.scrollHeight;
    const pending = document.createElement('div');
    pending.className = 'message assistant';
    pending.textContent = '正在结合角色设定与历史记忆生成回复…';
    messages.append(pending);
    setTimeout(() => {
      pending.textContent = '我理解你的问题。这个原型会先遵循角色语气，再结合当前上下文给出清晰、分点且符合安全边界的回答。';
      messages.scrollTop = messages.scrollHeight;
    }, 720);
  });

  $('#copy-api')?.addEventListener('click', async () => {
    const code = $('#api-code').textContent;
    try {
      await navigator.clipboard.writeText(code);
      notify('API 示例已复制');
    } catch {
      notify('当前浏览器未授权剪贴板，请手动选择代码');
    }
  });
})();
