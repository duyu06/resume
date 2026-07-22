(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const modules = [
    { type: 'trigger', category: 'control', icon: '⚡', name: '定时触发器', desc: '按计划启动流程', params: { cron: '0 */1 * * *' } },
    { type: 'open-page', category: 'web', icon: '◎', name: '打开网页', desc: '导航到目标 URL', params: { url: 'https://example.com', wait: 1500 } },
    { type: 'click', category: 'web', icon: '⌁', name: '点击元素', desc: 'CSS / XPath 定位', params: { selector: '#submit', timeout: 10000 } },
    { type: 'input', category: 'web', icon: 'T', name: '填写表单', desc: '向输入框写入内容', params: { selector: '#content', value: '{{content}}' } },
    { type: 'extract', category: 'web', icon: '▤', name: '采集数据', desc: '提取文本与属性', params: { selector: '.result', output: 'records' } },
    { type: 'excel', category: 'data', icon: 'X', name: '读取 Excel', desc: '加载任务批次', params: { file: 'tasks.xlsx', sheet: 'Sheet1' } },
    { type: 'transform', category: 'data', icon: 'ƒ', name: '数据处理', desc: '清洗与字段映射', params: { expression: 'record.trim()' } },
    { type: 'http', category: 'data', icon: '↗', name: 'HTTP 请求', desc: '调用外部接口', params: { method: 'POST', url: 'https://api.example.com' } },
    { type: 'condition', category: 'control', icon: '?', name: '条件判断', desc: '根据变量选择分支', params: { expression: 'status === 200' } },
    { type: 'loop', category: 'control', icon: '∞', name: '循环任务', desc: '遍历列表或次数', params: { source: '{{records}}', max: 100 } },
    { type: 'wait', category: 'control', icon: '◷', name: '显式等待', desc: '等待元素或时间', params: { milliseconds: 1200 } },
    { type: 'approval', category: 'human', icon: '人', name: '人工审批', desc: '关键动作必须确认', params: { message: '请核对内容与账号后再提交' } },
    { type: 'writeback', category: 'data', icon: '✓', name: '结果回写', desc: '保存状态与失败原因', params: { target: 'results.csv' } },
  ];

  const defaultWorkflow = [
    { id: 'n1', type: 'trigger', name: '定时触发', x: 60, y: 120, params: { cron: '0 */1 * * *' }, breakpoint: false, retry: false },
    { id: 'n2', type: 'excel', name: '读取任务批次', x: 270, y: 120, params: { file: 'tasks.xlsx', sheet: 'Sheet1' }, breakpoint: false, retry: true },
    { id: 'n3', type: 'open-page', name: '打开运营页面', x: 480, y: 120, params: { url: 'https://example.com', wait: 1500 }, breakpoint: false, retry: true },
    { id: 'n4', type: 'input', name: '填写发布内容', x: 690, y: 120, params: { selector: '#content', value: '{{content}}' }, breakpoint: false, retry: true },
    { id: 'n5', type: 'approval', name: '人工审批', x: 900, y: 120, params: { message: '核对账号、内容和提交时间' }, breakpoint: false, retry: false },
    { id: 'n6', type: 'click', name: '提交发布', x: 1110, y: 120, params: { selector: '#submit', timeout: 10000 }, breakpoint: true, retry: false },
    { id: 'n7', type: 'writeback', name: '结果回写', x: 1320, y: 120, params: { target: 'results.csv' }, breakpoint: false, retry: true },
  ];

  const state = {
    nodes: [],
    selectedId: null,
    running: false,
    paused: false,
    stopped: false,
    currentIndex: -1,
    success: 0,
    failures: 0,
    startedAt: 0,
    timer: 0,
    approvalResolve: null,
    pauseResolve: null,
    zoom: 1,
    backend: localStorage.getItem('webrpa_backend') || 'http://127.0.0.1:5921',
    real: localStorage.getItem('webrpa_real') === '1',
  };

  const toast = $('#toast');
  let toastTimer = 0;
  function notify(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
  }
  function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
  function moduleByType(type) { return modules.find((item) => item.type === type) || modules[0]; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }

  function addLog(message, level = 'INFO', node = '-') {
    const row = document.createElement('div');
    row.className = `log-row${level === 'ERROR' ? ' error' : ''}`;
    row.innerHTML = `<time>${new Date().toLocaleTimeString('zh-CN', { hour12: false })}</time><code>${escapeHtml(node)}</code><span>${escapeHtml(message)}</span><em>${level}</em>`;
    $('#log-list').prepend(row);
  }

  function saveSettings() {
    state.backend = $('#backend-url').value.trim().replace(/\/+$/, '') || 'http://127.0.0.1:5921';
    state.real = $('#real-mode').checked;
    localStorage.setItem('webrpa_backend', state.backend);
    localStorage.setItem('webrpa_real', state.real ? '1' : '0');
    $('#open-backend').href = state.backend;
    $('#mode-badge').textContent = state.real ? '本地执行器模式' : '浏览器演示';
    $('#mode-badge').classList.toggle('real', state.real);
  }
  $('#backend-url').value = state.backend;
  $('#real-mode').checked = state.real;
  saveSettings();
  $('#backend-toggle').addEventListener('click', (event) => { const panel = $('#backend-panel'); const open = panel.hidden; panel.hidden = !open; event.currentTarget.setAttribute('aria-expanded', String(open)); });
  $('#backend-url').addEventListener('change', saveSettings);
  $('#real-mode').addEventListener('change', saveSettings);
  $('#test-backend').addEventListener('click', async () => {
    saveSettings();
    try {
      const response = await fetch(state.backend, { mode: 'cors' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      notify('WebRPA 地址可访问，请在本地窗口执行真实自动化');
      addLog(`执行器地址可访问：${state.backend}`);
    } catch (error) {
      notify(`地址测试失败：${error.message}`);
      addLog(error.message, 'ERROR');
    }
  });

  function renderModules(filter = 'all', query = '') {
    const list = modules.filter((item) => (filter === 'all' || item.category === filter) && `${item.name}${item.desc}${item.type}`.toLowerCase().includes(query.toLowerCase()));
    $('#module-list').innerHTML = list.map((item) => `<div class="module" draggable="true" data-type="${item.type}"><i>${item.icon}</i><div><b>${escapeHtml(item.name)}</b><small>${escapeHtml(item.desc)}</small></div></div>`).join('');
    $$('.module').forEach((item) => {
      item.addEventListener('click', () => addNode(item.dataset.type));
      item.addEventListener('dragstart', (event) => event.dataTransfer.setData('text/webrpa-module', item.dataset.type));
    });
  }
  renderModules();
  $$('.category-tabs button').forEach((button) => button.addEventListener('click', () => { $$('.category-tabs button').forEach((item) => item.classList.toggle('active', item === button)); renderModules(button.dataset.category, $('#module-search').value); }));
  $('#module-search').addEventListener('input', () => renderModules($('.category-tabs button.active').dataset.category, $('#module-search').value));

  const canvas = $('#canvas');
  canvas.addEventListener('dragover', (event) => event.preventDefault());
  canvas.addEventListener('drop', (event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('text/webrpa-module');
    if (!type) return;
    const rect = canvas.getBoundingClientRect();
    addNode(type, (event.clientX - rect.left + canvas.scrollLeft) / state.zoom, (event.clientY - rect.top + canvas.scrollTop) / state.zoom);
  });

  function addNode(type, x, y) {
    const module = moduleByType(type);
    const last = state.nodes.at(-1);
    const node = {
      id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      name: module.name,
      x: Number.isFinite(x) ? Math.max(20, x - 80) : (last ? last.x + 210 : 60),
      y: Number.isFinite(y) ? Math.max(30, y - 40) : (last ? last.y : 120),
      params: clone(module.params),
      breakpoint: false,
      retry: true,
      status: 'idle',
    };
    state.nodes.push(node);
    renderWorkflow();
    selectNode(node.id);
    markDirty();
    notify(`已添加模块：${module.name}`);
  }

  function renderWorkflow() {
    const existing = new Map($$('.node-card', canvas).map((element) => [element.dataset.id, element]));
    state.nodes.forEach((node) => {
      let element = existing.get(node.id);
      if (!element) {
        element = document.createElement('article');
        element.className = 'node-card';
        element.dataset.id = node.id;
        canvas.append(element);
        bindNodeEvents(element);
      }
      existing.delete(node.id);
      const module = moduleByType(node.type);
      element.dataset.category = module.category;
      element.style.left = `${node.x}px`;
      element.style.top = `${node.y}px`;
      element.className = `node-card${state.selectedId === node.id ? ' selected' : ''}${node.status && node.status !== 'idle' ? ` ${node.status}` : ''}`;
      element.innerHTML = `<div class="node-head"><i class="node-icon">${module.icon}</i><div><b>${escapeHtml(node.name)}</b><div class="node-status">${statusLabel(node.status)}</div></div></div><div class="node-body">${escapeHtml(module.desc)}</div><span class="port in"></span><span class="port out"></span>${node.breakpoint ? '<span class="breakpoint" title="断点"></span>' : ''}`;
    });
    existing.forEach((element) => element.remove());
    $('.canvas-hint').hidden = state.nodes.length > 0;
    requestAnimationFrame(updateEdges);
  }

  function statusLabel(status) {
    return ({ idle: '等待', running: '运行中', success: '成功', failed: '失败', waiting: '等待审批', paused: '已暂停' }[status] || '等待');
  }

  function bindNodeEvents(element) {
    element.addEventListener('click', () => selectNode(element.dataset.id));
    element.addEventListener('pointerdown', (event) => {
      const header = event.target.closest('.node-head');
      if (!header || state.running) return;
      const node = state.nodes.find((item) => item.id === element.dataset.id);
      if (!node) return;
      selectNode(node.id);
      const start = { x: event.clientX, y: event.clientY, nx: node.x, ny: node.y };
      element.setPointerCapture(event.pointerId);
      const move = (moveEvent) => {
        node.x = Math.max(0, start.nx + (moveEvent.clientX - start.x) / state.zoom);
        node.y = Math.max(0, start.ny + (moveEvent.clientY - start.y) / state.zoom);
        element.style.left = `${node.x}px`;
        element.style.top = `${node.y}px`;
        updateEdges();
      };
      const up = () => {
        element.removeEventListener('pointermove', move);
        element.removeEventListener('pointerup', up);
        markDirty();
      };
      element.addEventListener('pointermove', move);
      element.addEventListener('pointerup', up);
    });
  }

  function updateEdges() {
    const svg = $('#edges');
    const defs = '<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#8ca0af"/></marker></defs>';
    const paths = state.nodes.slice(0, -1).map((node, index) => {
      const next = state.nodes[index + 1];
      const x1 = node.x + 160, y1 = node.y + 40, x2 = next.x, y2 = next.y + 40;
      const c = Math.max(40, Math.abs(x2 - x1) * .45);
      return `<path class="edge" d="M${x1},${y1} C${x1 + c},${y1} ${x2 - c},${y2} ${x2},${y2}"/>`;
    }).join('');
    svg.innerHTML = defs + paths;
  }

  function selectNode(id) {
    state.selectedId = id;
    const node = state.nodes.find((item) => item.id === id);
    renderWorkflow();
    $('#delete-node').disabled = !node;
    $('#empty-inspector').hidden = Boolean(node);
    $('#node-form').hidden = !node;
    if (!node) { $('#inspector-title').textContent = '未选择节点'; return; }
    $('#inspector-title').textContent = node.name;
    $('#node-name').value = node.name;
    $('#node-type').value = node.type;
    $('#node-params').value = JSON.stringify(node.params, null, 2);
    $('#node-breakpoint').checked = Boolean(node.breakpoint);
    $('#node-retry').checked = Boolean(node.retry);
  }

  $('#node-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const node = state.nodes.find((item) => item.id === state.selectedId);
    if (!node) return;
    try {
      node.params = JSON.parse($('#node-params').value || '{}');
      node.name = $('#node-name').value.trim() || moduleByType(node.type).name;
      node.breakpoint = $('#node-breakpoint').checked;
      node.retry = $('#node-retry').checked;
      renderWorkflow();
      markDirty();
      notify('节点配置已更新');
    } catch (error) { notify(`参数 JSON 无效：${error.message}`); }
  });
  $('#delete-node').addEventListener('click', () => {
    if (!state.selectedId || state.running) return;
    state.nodes = state.nodes.filter((item) => item.id !== state.selectedId);
    state.selectedId = null;
    selectNode(null);
    renderWorkflow();
    markDirty();
  });

  function markDirty() { $('#workflow-state').textContent = '未保存'; }
  function saveWorkflow() {
    const payload = { version: 1, name: '内容发布自动化', nodes: state.nodes.map(({ status, ...node }) => node), edges: state.nodes.slice(0, -1).map((node, index) => ({ source: node.id, target: state.nodes[index + 1].id })) };
    localStorage.setItem('webrpa_demo_workflow', JSON.stringify(payload));
    $('#workflow-state').textContent = '已保存';
    const item = document.createElement('li'); item.innerHTML = `<b>${new Date().toLocaleString('zh-CN')}</b><span>本地快照</span>`; $('#version-list').prepend(item);
    notify('工作流已保存到当前浏览器');
    return payload;
  }
  $('#save-local').addEventListener('click', saveWorkflow);
  $('#export-json').addEventListener('click', () => {
    const payload = saveWorkflow();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'webrpa-workflow.json'; link.click(); URL.revokeObjectURL(link.href);
  });
  $('#import-json').addEventListener('change', async () => {
    const file = $('#import-json').files?.[0]; if (!file) return;
    try {
      const payload = JSON.parse(await file.text());
      if (!Array.isArray(payload.nodes)) throw new Error('缺少 nodes 数组');
      state.nodes = payload.nodes.map((node, index) => ({ ...node, id: node.id || `import_${index}`, x: Number(node.x) || 60 + index * 210, y: Number(node.y) || 120, params: node.params || {}, status: 'idle' }));
      state.selectedId = null; renderWorkflow(); markDirty(); notify(`已导入 ${state.nodes.length} 个节点`);
    } catch (error) { notify(`导入失败：${error.message}`); }
  });
  $('#new-workflow').addEventListener('click', () => { if (!confirm('清空当前工作流并新建？')) return; state.nodes = []; state.selectedId = null; renderWorkflow(); selectNode(null); markDirty(); addLog('已创建空白工作流'); });

  $$('.bottom-panel nav button').forEach((button) => button.addEventListener('click', () => {
    $$('.bottom-panel nav button').forEach((item) => item.classList.toggle('active', item === button));
    $$('.bottom-view').forEach((view) => view.classList.toggle('active', view.id === `bottom-${button.dataset.bottom}`));
  }));

  function setRunControls(running) {
    $('#run').disabled = running;
    $('#pause').disabled = !running;
    $('#stop').disabled = !running;
    $('#step').disabled = running;
  }
  function updateExecutionInfo() {
    const node = state.nodes[state.currentIndex];
    $('#current-node').textContent = node?.name || '-';
    $('#success-count').textContent = String(state.success);
    $('#failure-count').textContent = String(state.failures);
  }
  function startTimer() {
    state.startedAt = Date.now(); clearInterval(state.timer);
    state.timer = setInterval(() => { const s = Math.floor((Date.now() - state.startedAt) / 1000); $('#run-time').textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }, 1000);
  }
  function waitIfPaused() {
    if (!state.paused) return Promise.resolve();
    return new Promise((resolve) => { state.pauseResolve = resolve; });
  }
  function resumePause() { state.paused = false; state.pauseResolve?.(); state.pauseResolve = null; }

  async function executeNode(node, index) {
    state.currentIndex = index; updateExecutionInfo();
    node.status = 'running'; renderWorkflow(); addLog(`开始执行：${node.name}`, 'INFO', node.id);
    if (node.breakpoint) {
      node.status = 'paused'; state.paused = true; renderWorkflow(); $('#pause').textContent = '▶ 继续'; notify(`断点暂停：${node.name}`); addLog('命中断点，等待继续', 'WARN', node.id); await waitIfPaused();
    }
    if (state.stopped) return false;
    await delay(380 + Math.random() * 420);
    if (node.type === 'approval') {
      node.status = 'waiting'; renderWorkflow(); $('#approval-card').hidden = false; $('#approval-message').textContent = node.params.message || '关键提交节点已暂停。'; addLog('等待人工审批', 'WARN', node.id);
      const approved = await new Promise((resolve) => { state.approvalResolve = resolve; });
      $('#approval-card').hidden = true; state.approvalResolve = null;
      if (!approved) { node.status = 'failed'; state.failures += 1; renderWorkflow(); addLog('人工驳回，流程停止', 'ERROR', node.id); return false; }
    }
    if (state.stopped) return false;
    node.status = 'success'; state.success += 1; updateExecutionInfo(); renderWorkflow(); addLog('执行成功', 'INFO', node.id); return true;
  }
  function delay(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

  async function runWorkflow(startIndex = 0, oneStep = false) {
    if (!state.nodes.length) return notify('请先添加节点');
    state.running = true; state.stopped = false; state.paused = false; state.success = 0; state.failures = 0; state.nodes.forEach((node) => { node.status = 'idle'; }); renderWorkflow(); setRunControls(true); startTimer(); addLog(state.real ? '本地执行器模式：页面进行兼容模拟，请在 WebRPA 原生窗口执行真实流程' : '浏览器演示执行开始');
    const end = oneStep ? Math.min(state.nodes.length, startIndex + 1) : state.nodes.length;
    for (let index = startIndex; index < end; index += 1) {
      if (state.stopped) break;
      await waitIfPaused();
      const ok = await executeNode(state.nodes[index], index);
      if (!ok) break;
    }
    clearInterval(state.timer); state.running = false; state.paused = false; setRunControls(false); $('#pause').textContent = 'Ⅱ 暂停'; updateExecutionInfo();
    if (state.stopped) addLog('流程已由用户停止', 'WARN'); else if (state.failures) addLog('流程结束，存在失败节点', 'ERROR'); else addLog(oneStep ? '单步执行完成' : '工作流执行完成');
  }
  $('#run').addEventListener('click', () => runWorkflow(0, false));
  $('#step').addEventListener('click', () => runWorkflow(Math.min(state.currentIndex + 1, state.nodes.length - 1), true));
  $('#pause').addEventListener('click', (event) => {
    if (!state.running) return;
    if (state.paused) { resumePause(); event.currentTarget.textContent = 'Ⅱ 暂停'; addLog('人工继续执行'); }
    else { state.paused = true; event.currentTarget.textContent = '▶ 继续'; addLog('人工暂停执行', 'WARN'); }
  });
  $('#stop').addEventListener('click', () => { state.stopped = true; resumePause(); state.approvalResolve?.(false); state.approvalResolve = null; $('#approval-card').hidden = true; });
  $('#approve').addEventListener('click', () => { state.approvalResolve?.(true); notify('审批通过，流程继续'); });
  $('#reject').addEventListener('click', () => { state.approvalResolve?.(false); notify('审批驳回，流程停止'); });

  function setZoom(value) {
    state.zoom = Math.max(.6, Math.min(1.4, value));
    canvas.style.zoom = state.zoom;
    $('#zoom-value').textContent = `${Math.round(state.zoom * 100)}%`;
  }
  $('#zoom-in').addEventListener('click', () => setZoom(state.zoom + .1));
  $('#zoom-out').addEventListener('click', () => setZoom(state.zoom - .1));
  $('#fit').addEventListener('click', () => { setZoom(1); canvas.scrollTo({ left: 0, top: 0, behavior: 'smooth' }); });

  try {
    const saved = JSON.parse(localStorage.getItem('webrpa_demo_workflow') || 'null');
    state.nodes = saved?.nodes?.length ? saved.nodes.map((node) => ({ ...node, status: 'idle' })) : clone(defaultWorkflow);
  } catch { state.nodes = clone(defaultWorkflow); }
  renderWorkflow();
  selectNode(state.nodes[0]?.id || null);
  addLog('WebRPA 兼容工作室已就绪');
})();
