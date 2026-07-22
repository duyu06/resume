(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const sampleScript = `第 1 场｜雨夜·旧车站\n林默拖着行李箱走进空荡候车厅，发现墙上的时钟停在 23:17。\n\n林默：这里不是已经停运了吗？\n阿梨从售票窗后抬起头，手里握着一张没有日期的车票。\n阿梨：最后一班车只等一个人。\n\n镜头推近车票，票面逐渐浮现林默的名字。`;
  const state = { completed: new Set(), busy: false, failed: false };
  let toastTimer = 0;

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const toast = (message) => {
    const element = $('#toast');
    element.textContent = message;
    element.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => element.classList.remove('show'), 2200);
  };
  const log = (message) => {
    const item = document.createElement('li');
    item.textContent = `${new Date().toLocaleTimeString('zh-CN', { hour12: false })} · ${message}`;
    $('#event-log').append(item);
    $('#progress-label').textContent = `${state.completed.size} / 6`;
  };
  const status = (message) => { $('#global-status').textContent = message; };
  const requireStep = (number, message) => {
    if (state.completed.has(number)) return true;
    toast(message);
    return false;
  };
  const runStep = async (number, label, work) => {
    if (state.busy) return;
    const card = $(`[data-guoyang-step="${number}"]`);
    state.busy = true;
    state.failed = false;
    card.classList.remove('done', 'error');
    card.classList.add('running');
    status(`${label}处理中`);
    log(`${label}任务开始`);
    await delay(520 + number * 70);
    work?.();
    card.classList.remove('running');
    card.classList.add('done');
    state.completed.add(number);
    state.busy = false;
    status(`${label}完成`);
    log(`${label}完成`);
    toast(`${label}完成`);
  };

  $('#load-script').addEventListener('click', () => {
    $('#script-input').value = sampleScript;
    $('#task-id').textContent = `DEMO-${Date.now().toString().slice(-6)}`;
    status('示例剧本已载入');
    log('已载入《最后一班车》示例剧本');
    toast('示例剧本已载入');
  });

  $('#extract-characters').addEventListener('click', async () => {
    if (!$('#script-input').value.trim()) return toast('请先输入或载入剧本');
    await runStep(1, '角色提取', () => {
      $('#character-output').className = 'character-grid';
      $('#character-output').innerHTML = '<div><b>林默</b><br>青年旅客 · 深色风衣 · 谨慎</div><div><b>阿梨</b><br>神秘售票员 · 白色衬衫 · 冷静</div>';
    });
  });

  $('#generate-views').addEventListener('click', async () => {
    if (!requireStep(1, '请先完成角色提取')) return;
    await runStep(2, '角色四视图', () => {
      $('#character-output').insertAdjacentHTML('beforeend', '<div><b>四视图资产</b><br>2 个角色 × 正面 / 侧面 / 背面 / 半身</div>');
    });
  });

  $('#generate-storyboard').addEventListener('click', async () => {
    if (!requireStep(2, '请先生成角色四视图')) return;
    await runStep(3, '智能分镜', () => {
      $('#storyboard-output').className = 'shot-list';
      $('#storyboard-output').innerHTML = '<div>SHOT 01 · 远景 · 雨夜车站外景 · 4s</div><div>SHOT 02 · 中景 · 林默进入候车厅 · 5s</div><div>SHOT 03 · 近景 · 阿梨与无日期车票 · 6s</div><div>SHOT 04 · 特写 · 票面浮现姓名 · 4s</div>';
    });
  });

  $('#generate-shots').addEventListener('click', async () => {
    if (!requireStep(3, '请先生成智能分镜')) return;
    await runStep(4, '镜头生成', () => {
      $('#delivery-output').className = 'delivery-card';
      $('#delivery-output').innerHTML = '<b>4 / 4 镜头已生成</b><br>参考帧一致性 92% · 总时长 19s';
    });
  });

  $('#review-shots').addEventListener('click', async () => {
    if (!requireStep(4, '请先生成镜头')) return;
    await runStep(5, '素材检查', () => {
      $('#delivery-output').innerHTML = '<b>素材检查通过</b><br>角色一致性 92% · 镜头时长合规 · 字幕安全区通过';
    });
  });

  $('#compose-video').addEventListener('click', async () => {
    if (!requireStep(5, '请先完成素材检查')) return;
    await runStep(6, 'FFmpeg 合成', () => {
      $('#delivery-output').innerHTML = '<b>guoyang_demo_final.mp4</b><br>1080p · 19s · H.264 · 字幕与环境音已合成';
      status('演示成片已交付');
    });
  });

  $('#simulate-error').addEventListener('click', async () => {
    if (state.busy) return;
    const card = $('[data-guoyang-step="4"]');
    state.busy = true;
    card.classList.remove('done');
    card.classList.add('running');
    status('视频模型请求中');
    log('正在调用视频模型（模拟）');
    await delay(650);
    card.classList.remove('running');
    card.classList.add('error');
    state.busy = false;
    state.failed = true;
    status('模型超时，已进入重试队列');
    log('ERROR · 视频模型超时，保留任务上下文并等待重试');
    toast('已模拟模型超时');
  });

  window.__guoyangDemo = {
    getState: () => ({ completed: [...state.completed], busy: state.busy, failed: state.failed }),
  };
})();
