(() => {
  'use strict';

  const segments = location.pathname.split('/').filter(Boolean);
  const demosIndex = segments.indexOf('demos');
  const slug = demosIndex >= 0 ? segments[demosIndex + 1] : '';
  const supported = ['guoyang', 'cross-border', 'ai-ecommerce', 'digitalhuman', 'rpa', 'webui', 'soulcaller'];
  if (!supported.includes(slug)) return;

  const projects = {
    guoyang: {
      title: '果漾 AI 多模态平台',
      copy: '演示剧本导入、角色提取、四视图、分镜、镜头生成和成片合成的完整任务链路。',
      boundary: '当前页面只使用本地模拟任务，不调用生产模型、生产账号、生产存储或真实计费服务。',
    },
    'cross-border': {
      title: 'YOLA 珠宝独立站',
      copy: '演示浏览系列、商品快速查看、加入购物袋和库存校验反馈。',
      boundary: '购物袋、价格和库存均为前端模拟，不创建真实订单，不触发支付或邮件。',
    },
    'ai-ecommerce': {
      title: 'PrismPix AI 电商',
      copy: '演示商品分析、营销策略、14 条 Prompt 和 14 个图片模块的完整生成流程。',
      boundary: '默认使用演示数据。未连接自行部署的 PrismPix 后端时，不执行真实图片生成。',
    },
    digitalhuman: {
      title: 'talk-to-fengge-live 数字人',
      copy: '演示角色选择、会话创建、RTC / WebSocket 状态、通话控制和状态查询。',
      boundary: '默认使用模拟会话，不连接真实 RTC、WebSocket、语音克隆或视频流服务。',
    },
    rpa: {
      title: 'WebRPA 自动化系统',
      copy: '演示工作流运行、人工审批、断点暂停、继续执行和审计日志。',
      boundary: '默认只在浏览器内模拟节点执行，不控制真实网页、Windows 桌面或 Android 设备。',
    },
    webui: {
      title: 'Open WebUI 本地模型平台',
      copy: '演示模型选择、服务启动、Prompt 推理、吞吐和显存状态。',
      boundary: '模拟推理不会连接 Ollama、vLLM、GPU 或真实模型服务。',
    },
    soulcaller: {
      title: '叫魂者多 Agent 系统',
      copy: '演示角色 Agent、记忆 Agent、导演 Agent 和世界状态的一轮协作。',
      boundary: '剧情与 Agent 输出为本地模拟，不调用外部模型，也不用于现实决策。',
    },
  };

  const meta = projects[slug];
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const click = (selector, root = document) => {
    const element = $(selector, root);
    if (!element) throw new Error(`未找到控件：${selector}`);
    element.click();
    return element;
  };
  const waitFor = async (predicate, timeout = 15000, interval = 80) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const value = predicate();
      if (value) return value;
      await sleep(interval);
    }
    throw new Error('等待页面状态超时');
  };

  let running = false;
  let toastTimer = 0;
  let panelOpen = false;
  let lastFocus = null;

  const launcher = document.createElement('button');
  launcher.type = 'button';
  launcher.className = 'demo-mode-launcher';
  launcher.setAttribute('aria-haspopup', 'dialog');
  launcher.setAttribute('aria-expanded', 'false');
  launcher.innerHTML = '<i></i><span>演示模式</span>';

  const scrim = document.createElement('button');
  scrim.type = 'button';
  scrim.className = 'demo-mode-scrim';
  scrim.setAttribute('aria-label', '关闭演示面板');

  const panel = document.createElement('aside');
  panel.className = 'demo-mode-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-labelledby', 'demo-mode-title');
  panel.innerHTML = `
    <header class="demo-mode-head">
      <div>
        <div class="demo-mode-kicker">LOCAL INTERACTIVE DEMO</div>
        <h2 id="demo-mode-title">${meta.title}</h2>
      </div>
      <button class="demo-mode-close" type="button" aria-label="关闭演示面板">×</button>
    </header>
    <div class="demo-mode-body">
      <p class="demo-mode-copy">${meta.copy}</p>
      <div class="demo-mode-boundary">${meta.boundary}</div>
      <div class="demo-mode-actions">
        <button type="button" data-demo-action="run">运行完整演示</button>
        <button type="button" data-demo-action="error">模拟异常</button>
        <button type="button" data-demo-action="reset">重置演示</button>
      </div>
      <div class="demo-mode-progress">
        <div class="demo-mode-progress__top"><span data-demo-status>等待开始</span><span data-demo-percent>0%</span></div>
        <div class="demo-mode-track"><i></i></div>
      </div>
      <div class="demo-mode-extra"></div>
      <ol class="demo-mode-log" aria-live="polite"></ol>
    </div>
  `;

  const toast = document.createElement('div');
  toast.className = 'demo-mode-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');

  document.body.append(launcher, scrim, panel, toast);

  const runButton = $('[data-demo-action="run"]', panel);
  const errorButton = $('[data-demo-action="error"]', panel);
  const resetButton = $('[data-demo-action="reset"]', panel);
  const closeButton = $('.demo-mode-close', panel);
  const logList = $('.demo-mode-log', panel);
  const statusLabel = $('[data-demo-status]', panel);
  const percentLabel = $('[data-demo-percent]', panel);
  const progressBar = $('.demo-mode-track i', panel);
  const extra = $('.demo-mode-extra', panel);

  const setProgress = (percent, label) => {
    const safe = Math.max(0, Math.min(100, Math.round(percent)));
    progressBar.style.width = `${safe}%`;
    percentLabel.textContent = `${safe}%`;
    statusLabel.textContent = label;
  };

  const addLog = (message, tone = 'info') => {
    const item = document.createElement('li');
    item.className = tone;
    item.innerHTML = `<b>${tone.toUpperCase()}</b><span>${message}</span>`;
    logList.append(item);
    item.scrollIntoView({ block: 'nearest' });
  };

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
  };

  const setBusy = (busy) => {
    running = busy;
    document.body.classList.toggle('demo-mode-busy', busy);
    runButton.disabled = busy;
    errorButton.disabled = busy;
    resetButton.disabled = busy;
  };

  const openPanel = () => {
    if (panelOpen) return;
    panelOpen = true;
    lastFocus = document.activeElement;
    launcher.setAttribute('aria-expanded', 'true');
    panel.classList.add('is-open');
    scrim.classList.add('is-open');
    closeButton.focus();
  };

  const closePanel = () => {
    if (!panelOpen) return;
    panelOpen = false;
    launcher.setAttribute('aria-expanded', 'false');
    panel.classList.remove('is-open');
    scrim.classList.remove('is-open');
    if (lastFocus instanceof HTMLElement) lastFocus.focus();
  };

  launcher.addEventListener('click', openPanel);
  closeButton.addEventListener('click', closePanel);
  scrim.addEventListener('click', closePanel);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && panelOpen) closePanel();
  });

  const ensureDemoMode = () => {
    const realMode = $('#real-mode');
    if (realMode?.checked) {
      realMode.checked = false;
      realMode.dispatchEvent(new Event('change', { bubbles: true }));
      addLog('已切换回演示模式');
    }
  };

  const runAiEcommerce = async () => {
    ensureDemoMode();
    setProgress(8, '载入示例商品');
    $('#load-sample')?.click();
    $('[data-stage="analysis"]')?.click();
    await sleep(180);
    setProgress(22, '分析商品');
    click('#analyze');
    await waitFor(() => $('#analysis-state')?.textContent === '分析完成');
    addLog('产品身份证和 Campaign Strategy 已生成', 'success');
    setProgress(48, '生成 Prompt');
    click('#generate-prompts');
    await waitFor(() => $$('.prompt-item').length === 14);
    addLog('H1-H5 与 D1-D9 共 14 条 Prompt 已生成', 'success');
    setProgress(72, '生成图片模块');
    click('#generate-images');
    await waitFor(() => $('#stage-images')?.classList.contains('active'), 18000);
    await waitFor(() => $$('.image-card').length > 0, 18000);
    setProgress(100, '演示完成');
    addLog(`已生成 ${$$('.image-card').length} 个图片结果模块`, 'success');
  };

  const runDigitalHuman = async () => {
    ensureDemoMode();
    setProgress(12, '进入角色库');
    $('.view-tabs [data-view="library"]')?.click();
    await waitFor(() => $('#view-library')?.classList.contains('active'));
    const card = $('.character-card');
    if (!card) throw new Error('角色库为空');
    setProgress(30, '选择数字人角色');
    const callButton = $('.call', card);
    if (!callButton) throw new Error('角色缺少通话入口');
    callButton.click();
    await waitFor(() => $('#view-call')?.classList.contains('active'));
    setProgress(58, '建立模拟会话');
    await waitFor(() => !$('#hangup')?.disabled, 15000);
    await waitFor(() => $$('#stepper li.done').length >= 5, 15000);
    addLog(`模拟会话已建立：${$('#live-id')?.textContent || 'demo-live'}`, 'success');
    setProgress(82, '查询会话状态');
    $('#query-live')?.click();
    await waitFor(() => $('#live-status')?.textContent === 'active');
    setProgress(100, '通话演示运行中');
    addLog('RTC、WebSocket 与初始化步骤均已完成', 'success');
  };

  const runRpa = async () => {
    ensureDemoMode();
    if (!$$('.node-card').length) location.reload();
    setProgress(10, '启动工作流');
    click('#run');
    await waitFor(() => !$('#approval-card')?.hidden, 22000);
    setProgress(48, '等待人工审批');
    addLog('流程已停在人工审批节点');
    click('#approve');
    setProgress(66, '审批通过');
    await waitFor(() => !$('#run')?.disabled || $('#pause')?.textContent?.includes('继续'), 16000);
    if ($('#pause')?.textContent?.includes('继续')) {
      click('#pause');
      addLog('命中断点后已人工继续');
    }
    await waitFor(() => !$('#run')?.disabled, 24000);
    setProgress(100, '工作流完成');
    addLog(`成功节点：${$('#success-count')?.textContent || '0'}，失败节点：${$('#failure-count')?.textContent || '0'}`, 'success');
  };

  const runYola = async () => {
    setProgress(16, '进入商品系列');
    $('#collection')?.scrollIntoView({ behavior: 'smooth' });
    await sleep(650);
    const card = $('.product-card');
    if (!card) throw new Error('商品卡片未加载');
    setProgress(42, '打开商品快速查看');
    card.click();
    await waitFor(() => $('.motion-product-dialog-scrim')?.classList.contains('is-open'));
    setProgress(72, '加入购物袋');
    click('.motion-product-dialog__bag');
    await sleep(300);
    const bag = $('.header-action')?.textContent || '';
    setProgress(100, '购物链路完成');
    addLog(`商品已加入购物袋：${bag}`, 'success');
  };

  const runGuoyang = async () => {
    const steps = ['#load-script', '#extract-characters', '#generate-views', '#generate-storyboard', '#generate-shots', '#compose-video'];
    const labels = ['载入示例剧本', '提取角色', '生成角色四视图', '生成分镜', '生成镜头', '合成成片'];
    for (let index = 0; index < steps.length; index += 1) {
      setProgress(((index + 1) / steps.length) * 100, labels[index]);
      click(steps[index]);
      await waitFor(() => $(`[data-guoyang-step="${index + 1}"]`)?.classList.contains('done'), 12000);
      addLog(`${labels[index]}完成`, 'success');
    }
  };

  const configureWebUiExtra = () => {
    extra.innerHTML = `
      <label>推理模型<select data-webui-model><option>Qwen2.5-7B-Instruct</option><option>DeepSeek-R1-Distill</option><option>Gemma-3-12B</option></select></label>
      <label>Prompt<textarea data-webui-prompt>请用三点总结本地大模型部署的验收标准。</textarea></label>
      <button type="button" data-webui-run>运行一次模拟推理</button>
      <div class="demo-mode-extra-output" data-webui-output>服务尚未启动。</div>
    `;
    $('[data-webui-run]', extra).addEventListener('click', async () => {
      setBusy(true);
      setProgress(20, '启动推理服务');
      $('[data-webui-output]', extra).textContent = '加载模型权重…';
      await sleep(450);
      setProgress(55, '生成 Token');
      $('[data-webui-output]', extra).textContent = '模型已加载，正在生成回复…';
      await sleep(650);
      $('[data-webui-output]', extra).textContent = '1. 健康检查与模型可用性\n2. 吞吐、首 Token 时延与显存占用\n3. 监控、日志、回滚与故障恢复\n\n模拟指标：52 token/s · VRAM 78%';
      setProgress(100, '模拟推理完成');
      addLog('本地推理模拟完成：52 token/s，显存 78%', 'success');
      setBusy(false);
    });
  };

  const configureSoulcallerExtra = () => {
    extra.innerHTML = `
      <label>当前角色<select data-soul-role><option>调查者</option><option>守门人</option><option>失忆者</option></select></label>
      <label>本轮行动<textarea data-soul-input>检查废弃剧院后台，并询问守门人昨夜发生了什么。</textarea></label>
      <button type="button" data-soul-run>运行一轮 Agent 协作</button>
      <div class="demo-mode-extra-output" data-soul-output>世界状态：真相进度 12% · 风险等级低。</div>
    `;
    $('[data-soul-run]', extra).addEventListener('click', async () => {
      setBusy(true);
      setProgress(24, '角色 Agent 生成意图');
      await sleep(350);
      setProgress(52, '记忆 Agent 检索事实');
      await sleep(350);
      setProgress(78, '导演 Agent 合并状态');
      await sleep(420);
      $('[data-soul-output]', extra).textContent = '导演 Agent：守门人承认昨夜听到舞台下方的敲击声，但拒绝进入地下室。\n世界状态：新增线索「地下室敲击」；真相进度 24%；风险等级中。';
      setProgress(100, '本轮协作完成');
      addLog('世界状态已更新，角色信息边界保持有效', 'success');
      setBusy(false);
    });
  };

  if (slug === 'webui') configureWebUiExtra();
  if (slug === 'soulcaller') configureSoulcallerExtra();

  const runners = {
    guoyang: runGuoyang,
    'cross-border': runYola,
    'ai-ecommerce': runAiEcommerce,
    digitalhuman: runDigitalHuman,
    rpa: runRpa,
    webui: async () => $('[data-webui-run]', extra).click(),
    soulcaller: async () => $('[data-soul-run]', extra).click(),
  };

  const runFullDemo = async () => {
    if (running) return;
    document.body.classList.remove('demo-mode-error');
    logList.innerHTML = '';
    setBusy(true);
    setProgress(0, '准备演示');
    addLog('开始运行本地演示流程');
    try {
      await runners[slug]();
      if (!['webui', 'soulcaller'].includes(slug)) setBusy(false);
      showToast('演示流程已完成');
    } catch (error) {
      setBusy(false);
      document.body.classList.add('demo-mode-error');
      setProgress(Number(percentLabel.textContent.replace('%', '')) || 0, '演示失败');
      addLog(error instanceof Error ? error.message : String(error), 'error');
      showToast('演示流程未完成，请查看日志');
    }
  };

  const runErrorDemo = async () => {
    if (running) return;
    setBusy(true);
    document.body.classList.add('demo-mode-error');
    setProgress(36, '模拟异常');
    const messages = {
      guoyang: '视频模型响应超时，任务已进入自动重试队列。',
      'cross-border': '库存重新校验失败，购物袋暂不进入结算。',
      'ai-ecommerce': '图片生成服务不可用，保留 Prompt 和任务记录等待重试。',
      digitalhuman: 'RTC 初始化失败，会话未进入真实通话状态。',
      rpa: '登录状态失效，工作流已暂停并等待人工接管。',
      webui: '显存不足，建议降低上下文长度、并发或调整量化方案。',
      soulcaller: '角色尝试读取未授权事实，本回合已回滚。',
    };
    await sleep(450);
    addLog(messages[slug], 'error');
    if (slug === 'webui') $('[data-webui-output]', extra).textContent = 'ERROR: CUDA out of memory · 建议切换 4-bit 量化或降低并发。';
    if (slug === 'soulcaller') $('[data-soul-output]', extra).textContent = 'BOUNDARY VIOLATION：角色读取了未授权事实。当前回合已回滚，世界状态未改变。';
    if (slug === 'rpa' && !running) {
      const run = $('#run');
      if (run && !run.disabled) {
        run.click();
        try {
          await waitFor(() => !$('#approval-card')?.hidden, 20000);
          $('#reject')?.click();
        } catch {
          // The shared panel still records the intended failure path.
        }
      }
    }
    setProgress(100, '异常已捕获');
    setBusy(false);
    showToast('异常演示完成');
  };

  const resetDemo = () => {
    const keys = {
      'ai-ecommerce': ['prismpix_backend'],
      digitalhuman: ['fengge_characters', 'fengge_backend', 'fengge_region'],
      rpa: ['webrpa_demo_workflow', 'webrpa_backend'],
      'cross-border': [],
      webui: [],
      soulcaller: [],
      guoyang: [],
    };
    (keys[slug] || []).forEach((key) => localStorage.removeItem(key));
    if (slug === 'digitalhuman') sessionStorage.removeItem('fengge_api_key');
    showToast('演示数据已重置');
    setTimeout(() => location.reload(), 250);
  };

  runButton.addEventListener('click', runFullDemo);
  errorButton.addEventListener('click', runErrorDemo);
  resetButton.addEventListener('click', resetDemo);

  window.__portfolioDemoMode = {
    slug,
    open: openPanel,
    close: closePanel,
    run: runFullDemo,
    error: runErrorDemo,
    reset: resetDemo,
    getState: () => ({ running, progress: Number(percentLabel.textContent.replace('%', '')), status: statusLabel.textContent }),
  };
})();
