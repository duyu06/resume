(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const SAMPLE_ROOT = 'https://raw.githubusercontent.com/keirosang/PrismPix/main/samples/DDLYQ005';
  const moduleMeta = [
    ['H1', '纯净白底定妆', '1:1', '产品占比 35-40%，显式留白 45%，front 3/4，保持结构与颜色完全一致。'],
    ['H2', '45°结构细节', '1:1', '产品占比 25-30%，侧向 90°，强调结构、材质和工艺。'],
    ['H3', '模特场景上身', '1:1', '产品占比 20-25%，生活方式场景，保留平台标题空间。'],
    ['H4', '核心卖点特写', '1:1', '产品占比 55-60%，90°俯视微距，突出关键卖点。'],
    ['H5', '多角度组合陈列', '1:1', '产品占比 60-70%，rear 45°，呈现多角度与配色。'],
    ['D1', '详情首屏承接', '2:3', 'E-commerce infographic：标题 + 产品 + 4 个图标 + 副标题。'],
    ['D2', '核心卖点', '2:3', 'E-commerce infographic：左产品右利益列表的双栏布局。'],
    ['D3', '材质微距', '2:3', 'E-commerce infographic：材质纹理、标注圆和信任徽章。'],
    ['D4', '结构拆解', '2:3', 'E-commerce infographic：侧向结构拆解与尺寸标注。'],
    ['D5', '场景一', '2:3', 'E-commerce infographic：三行场景卡，强化使用情境。'],
    ['D6', '场景二', '2:3', 'E-commerce infographic：低角度生活方式场景，增强代入感。'],
    ['D7', '痛点对比', '2:3', 'E-commerce infographic：痛点到解决方案的对比布局。'],
    ['D8', '信任元素', '2:3', 'E-commerce infographic：包装、质检、细节与信任背书。'],
    ['D9', 'CTA 收尾', '2:3', 'E-commerce infographic：标题、卖点徽章与明确 CTA。'],
  ];

  const state = {
    file: null,
    prompts: [],
    workspace: '',
    backend: localStorage.getItem('prismpix_backend') || '',
    real: localStorage.getItem('prismpix_real') === '1',
    expanded: false,
    busy: false,
  };

  const toast = $('#toast');
  let toastTimer = 0;
  const notify = (message) => {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  };

  const backendInput = $('#backend-url');
  const realMode = $('#real-mode');
  backendInput.value = state.backend;
  realMode.checked = state.real;

  function normalizeBase(value) {
    return value.trim().replace(/\/+$/, '');
  }

  function api(path) {
    const base = normalizeBase(backendInput.value);
    if (!base) throw new Error('请先填写 PrismPix 后端地址');
    return `${base}${path}`;
  }

  function saveConnection() {
    state.backend = normalizeBase(backendInput.value);
    state.real = realMode.checked;
    localStorage.setItem('prismpix_backend', state.backend);
    localStorage.setItem('prismpix_real', state.real ? '1' : '0');
    $('#mode-badge').textContent = state.real ? '真实后端模式' : '演示模式';
    $('#mode-badge').classList.toggle('real', state.real);
  }
  saveConnection();
  backendInput.addEventListener('change', saveConnection);
  realMode.addEventListener('change', saveConnection);

  $('#connection-toggle').addEventListener('click', (event) => {
    const panel = $('#connection-panel');
    const open = panel.hidden;
    panel.hidden = !open;
    event.currentTarget.setAttribute('aria-expanded', String(open));
  });

  $('#test-backend').addEventListener('click', async () => {
    saveConnection();
    try {
      const response = await fetch(api('/'), { method: 'GET' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      notify('PrismPix 后端连接成功');
    } catch (error) {
      notify(`连接失败：${error.message}。请确认服务已启动并允许 CORS。`);
    }
  });

  const fileInput = $('#image-file');
  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    state.file = file;
    const url = URL.createObjectURL(file);
    $('#product-preview').src = url;
    $('#file-label').textContent = `${file.name} · ${(file.size / 1024).toFixed(0)} KB`;
    notify('产品图已载入');
  });

  $('#load-sample').addEventListener('click', () => {
    state.file = null;
    fileInput.value = '';
    $('#product-preview').src = `${SAMPLE_ROOT}/product_ref.png`;
    $('#file-label').textContent = '示例：DDLYQ005 产品身份证';
    notify('示例产品已载入');
  });

  function setStage(name) {
    $$('.stage-tabs button').forEach((button) => button.classList.toggle('active', button.dataset.stage === name));
    $$('.stage').forEach((stage) => stage.classList.toggle('active', stage.id === `stage-${name}`));
  }
  $$('.stage-tabs button').forEach((button) => button.addEventListener('click', () => setStage(button.dataset.stage)));

  function setTask(status, progress, logIndex, taskId = '') {
    $('#task-status').textContent = status;
    $('#task-progress').style.width = `${Math.max(0, Math.min(100, progress))}%`;
    if (taskId) $('#task-id').textContent = taskId;
    $$('#task-log li').forEach((item, index) => item.classList.toggle('done', index <= logIndex));
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function simulateSteps(steps) {
    for (const step of steps) {
      setTask(step[0], step[1], step[2]);
      await delay(step[3]);
    }
  }

  function formDataBase() {
    const data = new FormData();
    const fields = ['sku', 'category', 'style', 'platform', 'language', 'additional_requirements'];
    fields.forEach((name) => data.append(name, $(`[name="${name}"]`).value));
    data.append('generation_mode', $('#generation-mode').value);
    data.append('force', '0');
    if (state.file) data.append('image', state.file, state.file.name);
    return data;
  }

  async function pollTask(taskId, onProgress) {
    const started = Date.now();
    while (Date.now() - started < 12 * 60 * 1000) {
      const response = await fetch(api(`/api/status/${encodeURIComponent(taskId)}`));
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || `HTTP ${response.status}`);
      onProgress?.(payload);
      if (payload.status === 'done') return payload.result || {};
      if (payload.status === 'failed') throw new Error(payload.error || '任务失败');
      await delay(850);
    }
    throw new Error('任务轮询超时');
  }

  function updateAnalysisFromForm() {
    const category = $('#category').value;
    const style = $('#style').selectedOptions[0].textContent;
    const platform = $('#platform').value;
    $('#product-facts').innerHTML = `<div><dt>SKU</dt><dd>${escapeHtml($('#sku').value || 'DEMO')}</dd></div><div><dt>类目</dt><dd>${escapeHtml(category)}</dd></div><div><dt>风格</dt><dd>${escapeHtml(style)}</dd></div><div><dt>约束</dt><dd>产品结构、颜色、Logo 与文字不可修改</dd></div>`;
    $('#selling-points').innerHTML = '<li>产品主体一致性与结构辨识度</li><li>统一 Campaign Style Lock</li><li>平台主图与详情页完整承接</li>';
    $('#scene-tags').innerHTML = `<span>${escapeHtml(platform)} 主图</span><span>材质微距</span><span>生活方式</span><span>信任背书</span>`;
    $('#campaign-copy').textContent = `以“产品一致性 + ${style}”为视觉策略，为 ${platform} 生成可复用的主图与详情图资产。`;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  $('#product-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (state.busy) return;
    state.busy = true;
    $('#analyze').disabled = true;
    $('#analysis-state').textContent = '分析中';
    try {
      if (state.real) {
        if (!state.file) throw new Error('真实后端模式需要上传产品图');
        const data = formDataBase();
        data.append('stop_at_stage', '2');
        const response = await fetch(api('/api/generate'), { method: 'POST', body: data });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || `HTTP ${response.status}`);
        setTask('Analyzing', 15, 1, payload.task_id);
        const result = await pollTask(payload.task_id, (task) => {
          const count = task.progress?.length || 0;
          setTask('Analyzing', Math.min(88, 20 + count * 10), 2, payload.task_id);
        });
        state.workspace = result.workspace || result.ws || '';
      } else {
        await simulateSteps([['Vision analysis', 22, 1, 320], ['Campaign strategy', 64, 2, 420], ['Analysis complete', 100, 2, 280]]);
      }
      updateAnalysisFromForm();
      $('#analysis-state').textContent = '分析完成';
      $('#generate-prompts').disabled = false;
      notify('产品分析与营销策略已完成');
    } catch (error) {
      $('#analysis-state').textContent = '分析失败';
      setTask('Failed', 100, 1);
      notify(error.message);
    } finally {
      state.busy = false;
      $('#analyze').disabled = false;
    }
  });

  function buildDemoPrompts() {
    const style = $('#style').value;
    const platform = $('#platform').value;
    const requirements = $('#requirements').value.trim();
    return moduleMeta.map(([code, title, ratio, rule]) => ({
      code,
      title,
      ratio,
      prompt: `${code} · ${title}. ${rule} Visual style: ${style}. Platform: ${platform}. Campaign Style Lock: #111111 / #D9D4CC / #FFFFFF. ${requirements} Negative constraints: no deformation, no invented logo, no changed product color, no incorrect text.`,
    }));
  }

  function normalizePromptPayload(payload) {
    if (Array.isArray(payload)) return payload.map((item, index) => ({ code: item.code || moduleMeta[index]?.[0] || `P${index + 1}`, title: item.title || moduleMeta[index]?.[1] || 'Prompt', ratio: item.ratio || moduleMeta[index]?.[2] || '', prompt: item.prompt || item.text || JSON.stringify(item, null, 2) }));
    if (payload && typeof payload === 'object') {
      return Object.entries(payload).map(([code, value]) => ({ code, title: moduleMeta.find((item) => item[0] === code)?.[1] || code, ratio: moduleMeta.find((item) => item[0] === code)?.[2] || '', prompt: typeof value === 'string' ? value : value.prompt || JSON.stringify(value, null, 2) }));
    }
    return [];
  }

  function renderPrompts() {
    const list = $('#prompt-list');
    list.innerHTML = state.prompts.map((item, index) => `<article class="prompt-item${state.expanded ? ' open' : ''}" data-index="${index}"><div class="prompt-head"><span class="prompt-code">${escapeHtml(item.code)}</span><div><b>${escapeHtml(item.title)}</b><small>${escapeHtml(item.ratio || '')}</small></div><button class="prompt-toggle" type="button" aria-label="展开 Prompt">⌄</button></div><div class="prompt-body"><textarea aria-label="${escapeHtml(item.code)} Prompt">${escapeHtml(item.prompt)}</textarea></div></article>`).join('');
    $$('.prompt-toggle').forEach((button) => button.addEventListener('click', () => button.closest('.prompt-item').classList.toggle('open')));
    $$('.prompt-body textarea').forEach((textarea) => textarea.addEventListener('input', () => {
      const index = Number(textarea.closest('.prompt-item').dataset.index);
      state.prompts[index].prompt = textarea.value;
    }));
  }

  $('#generate-prompts').addEventListener('click', async () => {
    if (state.busy) return;
    state.busy = true;
    $('#generate-prompts').disabled = true;
    try {
      if (state.real && state.workspace) {
        const data = formDataBase();
        data.delete('image');
        data.append('ws', state.workspace);
        const response = await fetch(api('/api/generate-prompts'), { method: 'POST', body: data });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || `HTTP ${response.status}`);
        setTask('Generating prompts', 30, 3, payload.task_id);
        const result = await pollTask(payload.task_id, (task) => setTask('Generating prompts', Math.min(92, 35 + (task.progress?.length || 0) * 15), 3, payload.task_id));
        state.workspace = result.workspace || state.workspace;
        const promptResponse = await fetch(api(`/api/prompts?ws=${encodeURIComponent(state.workspace)}`));
        const promptPayload = await promptResponse.json();
        if (!promptResponse.ok) throw new Error(promptPayload.error || '读取 prompts.json 失败');
        state.prompts = normalizePromptPayload(promptPayload);
      } else {
        await simulateSteps([['Prompt protocol', 30, 3, 260], ['Generating 14 prompts', 72, 3, 460], ['Prompts ready', 100, 3, 220]]);
        state.prompts = buildDemoPrompts();
      }
      renderPrompts();
      $('#generate-images').disabled = state.prompts.length === 0;
      setStage('prompts');
      notify(`已生成 ${state.prompts.length} 条 Prompt，可逐条编辑`);
    } catch (error) {
      notify(error.message);
      $('#generate-prompts').disabled = false;
    } finally {
      state.busy = false;
    }
  });

  $('#expand-prompts').addEventListener('click', (event) => {
    state.expanded = !state.expanded;
    event.currentTarget.textContent = state.expanded ? '全部折叠' : '全部展开';
    $$('.prompt-item').forEach((item) => item.classList.toggle('open', state.expanded));
  });

  $('#download-prompts').addEventListener('click', () => {
    if (!state.prompts.length) return notify('请先生成 Prompt');
    const blob = new Blob([JSON.stringify(state.prompts, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${$('#sku').value || 'SKU'}-prompts.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  });

  function sampleImageUrl(code) {
    return `${SAMPLE_ROOT}/${code}.png`;
  }

  function renderImages(workspace = '') {
    const mode = $('#generation-mode').value;
    const modules = mode === 'main' ? moduleMeta.filter((item) => item[0].startsWith('H')) : mode === 'detail' ? moduleMeta.filter((item) => item[0].startsWith('D')) : mode === 'lookbook' ? [['M1','正面全身','2:3'],['M2','侧身行走','2:3'],['M3','纯背面','2:3'],['M4','近景互动','2:3'],['M5','场景抓拍','2:3']] : moduleMeta;
    $('#image-grid').innerHTML = modules.map(([code, title, ratio]) => {
      const url = workspace ? api(`/api/image?ws=${encodeURIComponent(workspace)}&code=${encodeURIComponent(code)}`) : sampleImageUrl(code);
      return `<article class="image-card${ratio === '2:3' ? ' detail' : ''}" data-prefix="${code[0]}"><img loading="lazy" src="${escapeHtml(url)}" alt="${escapeHtml(code + ' ' + title)}" onerror="this.closest('.image-card').classList.add('image-error');this.alt='图片尚未生成'"><div class="image-meta"><b>${escapeHtml(code)} · ${escapeHtml(title)}</b><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">查看 ↗</a></div></article>`;
    }).join('');
  }

  $('#generate-images').addEventListener('click', async () => {
    if (state.busy || !state.prompts.length) return;
    state.busy = true;
    $('#generate-images').disabled = true;
    try {
      let workspace = '';
      if (state.real) {
        if (!state.file) throw new Error('真实后端模式需要上传原始产品图');
        const data = formDataBase();
        data.append('prompts', JSON.stringify(Object.fromEntries(state.prompts.map((item) => [item.code, item.prompt]))));
        const response = await fetch(api('/api/generate-images'), { method: 'POST', body: data });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || `HTTP ${response.status}`);
        setTask('Generating images', 20, 4, payload.task_id);
        const result = await pollTask(payload.task_id, (task) => {
          const completed = task.progress?.filter((item) => item.stage === 'image_done').length || 0;
          setTask('Generating images', Math.min(94, 18 + completed * 6), 4, payload.task_id);
        });
        workspace = result.workspace || '';
      } else {
        await simulateSteps([['Creating product reference', 22, 4, 320], ['Generating images', 62, 4, 620], ['Quality checks', 88, 4, 340], ['Completed', 100, 4, 220]]);
      }
      renderImages(workspace);
      setStage('images');
      notify(state.real ? '真实图片任务已完成' : '演示图片已载入');
    } catch (error) {
      notify(error.message);
    } finally {
      state.busy = false;
      $('#generate-images').disabled = false;
    }
  });

  $$('.module-filter button').forEach((button) => button.addEventListener('click', () => {
    $$('.module-filter button').forEach((item) => item.classList.toggle('active', item === button));
    const prefix = button.dataset.prefix;
    $$('.image-card').forEach((card) => { card.hidden = prefix !== 'all' && card.dataset.prefix !== prefix; });
  }));

  renderImages();
})();
