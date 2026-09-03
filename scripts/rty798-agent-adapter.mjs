import http from 'node:http';

const port = Number(process.env.RTY798_ADAPTER_PORT || 8787);
const upstream = (process.env.RTY798_UPSTREAM_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');
const sessions = new Map();

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'content-type, authorization, x-api-key',
  'access-control-allow-methods': 'GET,POST,DELETE,OPTIONS',
};

const sendJson = (response, status, payload) => {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    ...corsHeaders,
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
  });
  response.end(body);
};

const readJson = async (request) => {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
};

const detectSentiment = (message) => {
  const negativeWords = ['生气', '投诉', '太差', '没收到', '失望', '人工', '很久'];
  const positiveWords = ['谢谢', '满意', '很好', '喜欢', '不错'];
  const negative = negativeWords.filter((word) => message.includes(word)).length;
  const positive = positiveWords.filter((word) => message.includes(word)).length;
  return Math.max(-1, Math.min(1, (positive - negative) * 0.3));
};

const countExecutions = (thoughtChain = []) => thoughtChain.reduce((total, thought) => {
  if (thought.agent === 'tool') {
    const matches = String(thought.detail || '').match(/调用\s+[a-z_]+/g);
    return total + Math.max(1, matches?.length || 0);
  }
  if (thought.agent === 'escalation') return total + 1;
  return total;
}, 0);

const proxyJson = async (path, options = {}) => {
  const response = await fetch(`${upstream}${path}`, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.detail || payload.error || `HTTP ${response.status}`);
  return payload;
};

const getSession = (conversationId) => {
  const key = conversationId || 'CONV-ADAPTER-DEFAULT';
  if (!sessions.has(key)) {
    sessions.set(key, {
      conversationId: key,
      messages: 0,
      toolCalls: 0,
      lastIntent: 'general',
      lastThoughtChain: [],
      lastTicket: null,
      startedAt: Date.now(),
    });
  }
  return sessions.get(key);
};

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, corsHeaders);
    return response.end();
  }

  try {
    const url = new URL(request.url || '/', `http://${request.headers.host || '127.0.0.1'}`);

    if (request.method === 'GET' && url.pathname === '/health') {
      const payload = await proxyJson('/api/health');
      return sendJson(response, 200, {
        status: payload.status || 'ok',
        provider: 'RTY798/ai-customer-service-agent',
        upstream,
      });
    }

    if (request.method === 'POST' && url.pathname === '/chat') {
      const body = await readJson(request);
      const conversationId = String(body.conversation_id || `CONV-${Date.now().toString(36).toUpperCase()}`);
      const message = String(body.message || '').trim();
      if (!message) return sendJson(response, 422, { detail: 'message is required' });

      const upstreamPayload = await proxyJson('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message, conversation_id: conversationId }),
      });

      const session = getSession(conversationId);
      const executions = countExecutions(upstreamPayload.thought_chain);
      session.messages += 2;
      session.toolCalls += executions;
      session.lastIntent = upstreamPayload.intent || 'general';
      session.lastThoughtChain = upstreamPayload.thought_chain || [];
      session.lastTicket = upstreamPayload.escalation_ticket || null;

      return sendJson(response, 200, {
        response: upstreamPayload.reply || '',
        conversation_id: conversationId,
        metadata: {
          total_tool_calls: session.toolCalls,
          sentiment_score: detectSentiment(message),
          intent: session.lastIntent,
          thought_chain: session.lastThoughtChain,
          escalation_ticket: session.lastTicket,
          provider: 'RTY798/ai-customer-service-agent',
        },
      });
    }

    if (request.method === 'GET' && url.pathname === '/performance') {
      const totals = [...sessions.values()].reduce((accumulator, session) => ({
        conversations: accumulator.conversations + 1,
        messages: accumulator.messages + session.messages,
        toolCalls: accumulator.toolCalls + session.toolCalls,
      }), { conversations: 0, messages: 0, toolCalls: 0 });

      return sendJson(response, 200, {
        report: [
          'Provider：RTY798/ai-customer-service-agent',
          `会话数量：${totals.conversations}`,
          `会话消息：${totals.messages}`,
          `工具与升级调用：${totals.toolCalls}`,
          'Agent 链路：Router → Knowledge / Tool / Escalation → Summary',
          'LLM：GitHub Actions 内使用确定性 OpenAI 兼容测试桩',
        ].join('\n'),
      });
    }

    if (request.method === 'DELETE' && url.pathname.startsWith('/conversation/')) {
      const conversationId = decodeURIComponent(url.pathname.slice('/conversation/'.length));
      sessions.delete(conversationId);
      return sendJson(response, 200, { status: 'reset', conversation_id: conversationId });
    }

    if (request.method === 'GET' && url.pathname === '/debug/sessions') {
      return sendJson(response, 200, { sessions: [...sessions.values()] });
    }

    return sendJson(response, 404, { detail: 'not_found' });
  } catch (error) {
    return sendJson(response, 502, { detail: error instanceof Error ? error.message : String(error) });
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`RTY798 compatibility adapter listening on http://127.0.0.1:${port}`);
});
