import http from 'node:http';

const port = Number(process.env.RTY798_LLM_STUB_PORT || 9001);

const readJson = async (request) => {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
};

const sendJson = (response, status, payload) => {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
  });
  response.end(body);
};

const pickUserText = (messages = []) => {
  const user = [...messages].reverse().find((message) => message.role === 'user');
  return String(user?.content || '');
};

const completion = (message) => ({
  id: `chatcmpl-rty798-${Date.now()}`,
  object: 'chat.completion',
  created: Math.floor(Date.now() / 1000),
  model: 'rty798-e2e-stub',
  choices: [{ index: 0, finish_reason: 'stop', message }],
  usage: { prompt_tokens: 24, completion_tokens: 48, total_tokens: 72 },
});

const routerMessage = (text) => {
  let intent = 'general';
  let reason = '一般咨询进入知识库流程';
  if (/(投诉|生气|人工|太差|失望)/.test(text)) {
    intent = 'complaint';
    reason = '用户表达投诉或明确要求人工处理';
  } else if (/(ORD-|订单|物流|到哪里|到哪了|配送状态)/i.test(text)) {
    intent = 'order_query';
    reason = '用户正在查询订单或物流';
  } else if (/(产品|商品|有什么|价格|耳机|键盘|充电板)/.test(text)) {
    intent = 'product_inquiry';
    reason = '用户正在咨询商品信息';
  } else if (/(退货|退款政策|怎么退)/.test(text)) {
    intent = 'general';
    reason = '退货政策通过知识库回答';
  }
  return { role: 'assistant', content: JSON.stringify({ intent, reason }) };
};

const toolMessage = (text) => {
  const orderId = text.match(/ORD-[A-Z0-9-]+/i)?.[0]?.toUpperCase() || 'ORD-001';
  const isShipment = /(物流|到哪里|到哪了|快递|运输)/.test(text);
  const name = isShipment ? 'track_shipment' : 'query_order';
  return {
    role: 'assistant',
    content: null,
    tool_calls: [{
      id: `call_${name}_${Date.now()}`,
      type: 'function',
      function: { name, arguments: JSON.stringify({ order_id: orderId }) },
    }],
  };
};

const knowledgeMessage = (text) => {
  if (/(退货|退款|怎么退)/.test(text)) {
    return { role: 'assistant', content: '根据售后政策，电子产品支持7天无理由退货，商品需保持包装完整、配件齐全；收到退货后3至5个工作日原路退款。' };
  }
  if (/(产品|商品|有什么|耳机|键盘|充电板)/.test(text)) {
    return { role: 'assistant', content: '目前演示商品包括：智能蓝牙耳机 Pro（299元）、无线充电板（89元）和机械键盘 K8（459元）。' };
  }
  return { role: 'assistant', content: '您好，我可以协助查询商品、订单、物流、退货政策，也可以在投诉场景中创建人工工单。' };
};

const escalationMessage = (text) => ({
  role: 'assistant',
  content: JSON.stringify({
    ticket_summary: '订单配送投诉',
    issue_category: '物流与服务投诉',
    detail: text.slice(0, 120),
    urgency: 'high',
    suggested_action: '优先联系客户并核查订单物流，必要时提供补偿方案',
  }),
});

const summaryMessage = (text) => {
  if (text.includes('升级工单已生成')) {
    return { role: 'assistant', content: '很抱歉给您带来不便。我已创建高优先级人工客服工单，坐席会携带当前问题摘要继续处理，您无需重复描述。请问还有其他信息需要补充吗？' };
  }
  if (text.includes('track_shipment')) {
    return { role: 'assistant', content: '您好，订单 ORD-001 已通过顺丰快递发出，运单号 SF1234567890，当前位于上海市分拣中心，预计明日送达。请问还需要我继续协助吗？' };
  }
  if (text.includes('query_order')) {
    return { role: 'assistant', content: '您好，已查询到订单 ORD-001：智能蓝牙耳机 Pro，订单状态为已发货，订单金额299元。请问需要继续查询物流吗？' };
  }
  if (/(7天无理由|退货政策)/.test(text)) {
    return { role: 'assistant', content: '您好，电子产品支持7天无理由退货，需要保持包装完整、配件齐全；收到退货后3至5个工作日原路退款。请问还需要其他帮助吗？' };
  }
  if (/(智能蓝牙耳机|无线充电板|机械键盘)/.test(text)) {
    return { role: 'assistant', content: '您好，目前有智能蓝牙耳机 Pro、无线充电板和机械键盘 K8 三款演示商品，价格分别为299元、89元和459元。请问想了解哪一款？' };
  }
  return { role: 'assistant', content: '您好，我可以协助商品、订单、物流、退货政策和投诉升级。请问需要什么帮助？' };
};

const server = http.createServer(async (request, response) => {
  if (request.method === 'GET' && request.url === '/health') {
    return sendJson(response, 200, { status: 'ok', provider: 'deterministic-openai-stub' });
  }

  if (request.method !== 'POST' || request.url !== '/v1/chat/completions') {
    return sendJson(response, 404, { error: 'not_found' });
  }

  try {
    const body = await readJson(request);
    const system = String(body.messages?.[0]?.content || '');
    const userText = pickUserText(body.messages);
    let message;

    if (body.tools?.length) message = toolMessage(userText);
    else if (system.includes('意图分类器')) message = routerMessage(userText);
    else if (system.includes('知识库问答助手')) message = knowledgeMessage(userText);
    else if (system.includes('升级处理专员')) message = escalationMessage(userText);
    else if (system.includes('回复汇总助手')) message = summaryMessage(userText);
    else message = { role: 'assistant', content: 'E2E stub response' };

    return sendJson(response, 200, completion(message));
  } catch (error) {
    return sendJson(response, 500, { error: error instanceof Error ? error.message : String(error) });
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`RTY798 OpenAI-compatible stub listening on http://127.0.0.1:${port}/v1`);
});
