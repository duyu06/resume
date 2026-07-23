(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const defaults = {
    backend: 'http://127.0.0.1:8000',
    customerId: 'CUST-001',
    conversationId: 'CONV-DEMO-001',
  };

  const state = {
    backend: localStorage.getItem('customer_agent_backend') || defaults.backend,
    real: localStorage.getItem('customer_agent_real') === '1',
    token: sessionStorage.getItem('customer_agent_token') || '',
    customerId: localStorage.getItem('customer_agent_customer_id') || defaults.customerId,
    conversationId: localStorage.getItem('customer_agent_conversation_id') || defaults.conversationId,
    messages: 0,
    toolCalls: 0,
    busy: false,
    sentiment: { label: 'neutral', score: 0 },
  };

  const toast = $('#toast');
  let toastTimer = 0;

  function notify(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
    }[char]));
  }

  function normalizeBase(value) {
    return value.trim().replace(/\/+$/, '');
  }

  function headers() {
    const result = { 'Content-Type': 'application/json' };
    if (state.token) {
      result.Authorization = `Bearer ${state.token}`;
      result['X-API-Key'] = state.token;
    }
    return result;
  }

  async function requestJson(path, options = {}) {
    const base = normalizeBase(state.backend);
    if (!base) throw new Error('请先填写客服 Agent API 地址');
    const response = await fetch(`${base}${path}`, {
      ...options,
      headers: { ...headers(), ...(options.headers || {}) },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.detail || payload.error || `HTTP ${response.status}`);
    return payload;
  }

  function saveSettings() {
    state.backend = normalizeBase($('#backend-url').value) || defaults.backend;
    state.real = $('#real-mode').checked;
    state.token = $('#agent-token').value.trim();
    state.customerId = $('#customer-id').value.trim() || defaults.customerId;

    localStorage.setItem('customer_agent_backend', state.backend);
    localStorage.setItem('customer_agent_real', state.real ? '1' : '0');
    localStorage.setItem('customer_agent_customer_id', state.customerId);
    localStorage.setItem('customer_agent_conversation_id', state.conversationId);
    sessionStorage.setItem('customer_agent_token', state.token);

    $('#connection-badge').textContent = state.real ? '真实 Agent 后端' : '演示模式';
    $('#connection-badge').classList.toggle('real', state.real);
    $('#metric-customer').textContent = state.customerId;
  }

  function setBusy(busy, label = '') {
    state.busy = busy;
    $('#send-message').disabled = busy;
    $('#message-input').disabled = busy;
    $$('.quick-actions button').forEach((button) => { button.disabled = busy; });
    $('#agent-state').textContent = label || (busy ? '正在处理客户问题' : '等待客户消息');
  }

  function setSentiment(label, score) {
    const safeScore = Math.max(-1, Math.min(1, Number(score) || 0));
    state.sentiment = { label, score: safeScore };
    const display = label === 'negative' ? '负面' : label === 'positive' ? '正面' : '中性';
    $('#metric-sentiment').textContent = display;
    $('#sentiment-value').textContent = `${label} · ${safeScore.toFixed(2)}`;
    const percent = Math.max(6, Math.min(100, (safeScore + 1) * 50));
    $('#sentiment-fill').style.width = `${percent}%`;
    $('#sentiment-fill').style.background = safeScore < -0.25 ? 'var(--red)' : safeScore > 0.25 ? 'var(--green)' : 'var(--amber)';
    $('#handoff-note').textContent = safeScore < -0.45 ? '建议转人工坐席，优先安抚并确认补偿方案。' : '当前无需人工接管。';
  }

  function addMessage(role, content, meta = '') {
    const item = document.createElement('article');
    item.className = `message ${role}`;
    item.innerHTML = `${escapeHtml(content)}${meta ? `<small>${escapeHtml(meta)}</small>` : ''}`;
    $('#chat-thread').append(item);
    $('#chat-thread').scrollTop = $('#chat-thread').scrollHeight;
    if (role !== 'typing') {
      state.messages += 1;
      $('#metric-messages').textContent = String(state.messages);
    }
    return item;
  }

  function addTool(name, detail, status = 'success') {
    const empty = $('#tool-log > p');
    empty?.remove();
    const item = document.createElement('article');
    item.className = `tool-event ${status}`;
    item.innerHTML = `<b>${escapeHtml(name)}</b><span>${escapeHtml(detail)}</span>`;
    $('#tool-log').prepend(item);
    state.toolCalls += 1;
    $('#metric-tools').textContent = String(state.toolCalls);
  }

  function detectSentiment(message) {
    const text = message.toLowerCase();
    const negativeWords = ['生气', '投诉', '太差', '没收到', '退款', '失望', '骗子', '很久'];
    const positiveWords = ['谢谢', '满意', '很好', '喜欢', '不错'];
    const negative = negativeWords.filter((word) => text.includes(word)).length;
    const positive = positiveWords.filter((word) => text.includes(word)).length;
    const score = Math.max(-1, Math.min(1, (positive - negative) * 0.28));
    return { label: score < -0.18 ? 'negative' : score > 0.18 ? 'positive' : 'neutral', score };
  }

  function extractOrder(message) {
    return message.match(/ORD-[A-Z0-9-]+/i)?.[0]?.toUpperCase() || '';
  }

  async function demoReply(message) {
    const sentiment = detectSentiment(message);
    setSentiment(sentiment.label, sentiment.score);
    const order = extractOrder(message);
    const lower = message.toLowerCase();

    await sleep(320);

    if (order && /(订单|物流|到哪|状态|查询)/.test(message)) {
      addTool('lookup_order', `${order} · 已发货 · 顺丰 SF13800138000`);
      return `已查到订单 ${order}：商品已从长沙仓发出，当前运输至广州分拨中心，预计明天下午送达。物流单号为 SF13800138000。需要我继续帮你催促配送吗？`;
    }

    if (/(退款|退货|不要了)/.test(message)) {
      if (!order) {
        addTool('request_order_number', '退款流程缺少订单号', 'waiting');
        return '可以协助处理退款。请先提供订单号，例如 ORD-12345，我会核验订单状态和退款资格。';
      }
      addTool('process_refund', `${order} · 符合七天无理由条件 · 等待客户确认`);
      return `订单 ${order} 当前符合退款条件。我已生成退款预申请，预计原路退回需要 1–3 个工作日。正式提交前，请确认商品未拆封且配件完整。`;
    }

    if (/(库存|有货|耳机|商品)/.test(message)) {
      addTool('check_inventory', 'SKU-HEADPHONE-BLK · 可售 18 件 · 长沙仓');
      return '黑色耳机目前有货，长沙仓可售 18 件。今天 18:00 前下单可在当日出库，我也可以继续帮你查看其他颜色。';
    }

    if (sentiment.score < -0.45 || /(人工|客服经理|投诉)/.test(message)) {
      addTool('escalate_to_human', '优先级 P1 · 原因：负面情绪或明确要求人工');
      return '很抱歉让你等待这么久。我已经保留当前会话和订单信息，并将问题标记为优先处理，人工坐席接入后无需你重复描述。';
    }

    addTool('knowledge_search', '检索售后政策与常见问题知识库');
    return '我可以协助查询订单、库存、退款和售后政策。你可以直接提供订单号，或描述遇到的问题。';
  }

  async function realReply(message) {
    const payload = await requestJson('/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        customer_id: state.customerId,
        conversation_id: state.conversationId,
      }),
    });
    const metadata = payload.metadata || {};
    const score = metadata.sentiment_score ?? metadata.last_sentiment ?? 0;
    setSentiment(score < -0.18 ? 'negative' : score > 0.18 ? 'positive' : 'neutral', score);
    addTool('agent_backend', `会话 ${payload.conversation_id || state.conversationId} · 服务端 Agent 已响应`);
    return payload.response || '客服 Agent 已处理请求，但未返回文本内容。';
  }

  async function sendMessage(message) {
    const text = String(message || '').trim();
    if (!text || state.busy) return;

    saveSettings();
    addMessage('user', text, `${state.customerId} · ${new Date().toLocaleTimeString('zh-CN', { hour12: false })}`);
    $('#message-input').value = '';
    setBusy(true, state.real ? '正在请求客服 Agent 后端' : '正在分析意图并选择工具');
    const typing = addMessage('typing', '数字人正在思考…');

    try {
      const response = state.real ? await realReply(text) : await demoReply(text);
      typing.remove();
      addMessage('agent', response, state.real ? 'AI Customer Service Agent API' : '本地演示 Agent');
      $('#agent-state').textContent = '问题已处理';
    } catch (error) {
      typing.remove();
      addMessage('agent', '当前无法完成请求，已保留会话内容。请检查 Agent 服务后重试。', '系统降级响应');
      addTool('fallback', error instanceof Error ? error.message : String(error), 'error');
      notify(error instanceof Error ? error.message : String(error));
      $('#agent-state').textContent = '请求失败，已降级';
    } finally {
      setBusy(false);
    }
  }

  function createConversationId() {
    return `CONV-${Date.now().toString(36).toUpperCase()}`;
  }

  async function resetConversation() {
    if (state.busy) return;
    if (state.real) {
      try {
        await requestJson(`/conversation/${encodeURIComponent(state.conversationId)}`, { method: 'DELETE' });
      } catch (error) {
        notify(`服务端会话未清除：${error instanceof Error ? error.message : String(error)}`);
      }
    }
    state.conversationId = createConversationId();
    state.messages = 0;
    state.toolCalls = 0;
    localStorage.setItem('customer_agent_conversation_id', state.conversationId);
    $('#conversation-id').textContent = state.conversationId;
    $('#metric-messages').textContent = '0';
    $('#metric-tools').textContent = '0';
    $('#tool-log').innerHTML = '<p>等待 Agent 选择工具。</p>';
    $('#chat-thread').innerHTML = '';
    setSentiment('neutral', 0);
    addMessage('agent', '新的客服会话已建立。请告诉我需要查询订单、库存、退款，还是转接人工。', 'AI 客服数字人');
    notify('新会话已建立');
  }

  async function loadPerformance() {
    try {
      if (state.real) {
        const payload = await requestJson('/performance');
        $('#performance-report').textContent = typeof payload.report === 'string' ? payload.report : JSON.stringify(payload, null, 2);
      } else {
        $('#performance-report').textContent = [
          `会话消息：${state.messages}`,
          `工具调用：${state.toolCalls}`,
          `当前情绪：${state.sentiment.label} (${state.sentiment.score.toFixed(2)})`,
          '演示响应成功率：100%',
          '人工转接策略：负面情绪 < -0.45',
        ].join('\n');
      }
      notify('性能报告已更新');
    } catch (error) {
      notify(error instanceof Error ? error.message : String(error));
    }
  }

  $('#backend-url').value = state.backend;
  $('#agent-token').value = state.token;
  $('#real-mode').checked = state.real;
  $('#customer-id').value = state.customerId;
  $('#conversation-id').textContent = state.conversationId;
  saveSettings();

  $('#settings-toggle').addEventListener('click', (event) => {
    const panel = $('#settings-panel');
    const open = panel.hidden;
    panel.hidden = !open;
    event.currentTarget.setAttribute('aria-expanded', String(open));
  });

  ['backend-url', 'agent-token', 'real-mode', 'customer-id'].forEach((id) => {
    $(`#${id}`).addEventListener('change', saveSettings);
  });

  $('#test-backend').addEventListener('click', async () => {
    saveSettings();
    try {
      const payload = await requestJson('/health');
      notify(`客服 Agent 连接成功：${payload.status || 'healthy'}`);
      $('#connection-badge').textContent = 'Agent 已连接';
      $('#connection-badge').classList.add('real');
    } catch (error) {
      notify(`连接失败：${error instanceof Error ? error.message : String(error)}`);
    }
  });

  $('#chat-form').addEventListener('submit', (event) => {
    event.preventDefault();
    sendMessage($('#message-input').value);
  });

  const quickMessages = {
    order: '帮我查询订单 ORD-12345 现在到哪里了？',
    inventory: '黑色耳机还有库存吗？',
    refund: '我要为 ORD-12345 申请退款',
    angry: '等了很久还没收到，我很生气，请尽快处理',
  };

  $$('.quick-actions [data-quick]').forEach((button) => {
    button.addEventListener('click', () => sendMessage(quickMessages[button.dataset.quick]));
  });

  $('#new-conversation').addEventListener('click', resetConversation);
  $('#load-performance').addEventListener('click', loadPerformance);

  addMessage('agent', '你好，我是 AI 客服数字人。可以帮你查询订单、库存、退款状态，也可以在复杂问题时转接人工。', '客服会话已建立');
  setSentiment('neutral', 0);

  window.__customerServiceAgentDemo = {
    send: sendMessage,
    reset: resetConversation,
    getState: () => ({ ...state }),
  };
})();
