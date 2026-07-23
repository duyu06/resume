import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const siteBase = (process.env.TEST_BASE_URL || 'http://127.0.0.1:4173/resume').replace(/\/+$/, '');
const upstreamBase = (process.env.RTY798_UPSTREAM_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');
const adapterBase = (process.env.RTY798_ADAPTER_URL || 'http://127.0.0.1:8787').replace(/\/+$/, '');
const outputDir = process.env.TEST_OUTPUT_DIR || 'test-results/rty798-digitalhuman';
const results = [];

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${url}: ${payload.detail || payload.error || `HTTP ${response.status}`}`);
  return payload;
};

const postChat = (message) => requestJson(`${upstreamBase}/api/chat`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ message, conversation_id: 'CONV-E2E-DIRECT' }),
});

async function testUpstreamApi() {
  const scenario = { name: 'upstream-api', status: 'passed', checks: [] };
  try {
    const health = await requestJson(`${upstreamBase}/api/health`);
    assert(health.status === 'ok', `unexpected health payload ${JSON.stringify(health)}`);
    scenario.checks.push('health');

    const product = await postChat('你们有什么产品？');
    assert(product.intent === 'product_inquiry', `product intent ${product.intent}`);
    assert(product.reply.includes('智能蓝牙耳机'), `product reply ${product.reply}`);
    assert(product.thought_chain.some((item) => item.agent === 'knowledge'), 'product path missing knowledge agent');
    scenario.checks.push('product-inquiry');

    const order = await postChat('查询订单 ORD-001');
    assert(order.intent === 'order_query', `order intent ${order.intent}`);
    assert(order.reply.includes('ORD-001'), `order reply ${order.reply}`);
    assert(order.thought_chain.some((item) => item.agent === 'tool' && String(item.detail).includes('query_order')), 'order path missing query_order');
    scenario.checks.push('order-query');

    const shipment = await postChat('ORD-001 到哪里了？');
    assert(shipment.reply.includes('SF1234567890'), `shipment reply ${shipment.reply}`);
    assert(shipment.thought_chain.some((item) => item.agent === 'tool' && String(item.detail).includes('track_shipment')), 'shipment path missing track_shipment');
    scenario.checks.push('shipment-tracking');

    const returns = await postChat('怎么退货？');
    assert(returns.reply.includes('7天无理由'), `return policy reply ${returns.reply}`);
    assert(returns.thought_chain.some((item) => item.agent === 'knowledge'), 'return policy path missing knowledge agent');
    scenario.checks.push('return-policy');

    const complaint = await postChat('我要投诉，订单 ORD-001 等了很久，请转人工');
    assert(complaint.intent === 'complaint', `complaint intent ${complaint.intent}`);
    assert(complaint.escalation_ticket?.ticket_id, `complaint ticket missing ${JSON.stringify(complaint)}`);
    assert(complaint.reply.includes('人工客服') || complaint.reply.includes('工单'), `complaint reply ${complaint.reply}`);
    scenario.checks.push('complaint-escalation');

    const streamResponse = await fetch(`${upstreamBase}/api/chat/stream`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: '查询订单 ORD-001', conversation_id: 'CONV-E2E-SSE' }),
    });
    assert(streamResponse.ok, `SSE HTTP ${streamResponse.status}`);
    const streamText = await streamResponse.text();
    const events = streamText
      .split('\n\n')
      .map((block) => block.trim())
      .filter((block) => block.startsWith('data: '))
      .map((block) => JSON.parse(block.slice(6)));
    assert(events.some((event) => event.event === 'thought'), 'SSE missing thought event');
    assert(events.some((event) => event.event === 'message' && String(event.data?.content).includes('ORD-001')), 'SSE missing message event');
    assert(events.at(-1)?.event === 'done', `SSE did not finish: ${JSON.stringify(events.at(-1))}`);
    scenario.checks.push('sse-stream');
  } catch (error) {
    scenario.status = 'failed';
    scenario.error = error instanceof Error ? error.message : String(error);
  }
  results.push(scenario);
}

const demoPrompts = [
  { label: '商品咨询', text: '你们有什么产品？', expect: '智能蓝牙耳机' },
  { label: '订单查询', text: '查询订单 ORD-001', expect: 'ORD-001' },
  { label: '物流追踪', text: 'ORD-001 到哪里了？', expect: 'SF1234567890' },
  { label: '退货政策', text: '怎么退货？', expect: '7天无理由' },
  { label: '投诉升级', text: '我要投诉，订单 ORD-001 等了很久，请转人工', expect: '人工客服' },
];

async function installDemoBridge(page) {
  await page.evaluate(({ prompts }) => {
    const runButton = document.querySelector('[data-demo-action="run"]');
    if (!runButton || runButton.dataset.rty798Bridge === 'true') return;
    runButton.dataset.rty798Bridge = 'true';

    runButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      const status = document.querySelector('[data-demo-status]');
      const percent = document.querySelector('[data-demo-percent]');
      const bar = document.querySelector('.demo-mode-track i');
      const log = document.querySelector('.demo-mode-log');
      const setProgress = (value, label) => {
        status.textContent = label;
        percent.textContent = `${value}%`;
        bar.style.width = `${value}%`;
      };
      const addLog = (message, tone = 'success') => {
        const item = document.createElement('li');
        item.className = tone;
        item.innerHTML = `<b>${tone.toUpperCase()}</b><span>${message}</span>`;
        log.append(item);
      };

      void (async () => {
        runButton.disabled = true;
        log.innerHTML = '';
        setProgress(2, '连接 RTY798 Agent');
        addLog('使用 RTY798/ai-customer-service-agent 执行真实多 Agent 演示', 'info');
        try {
          const demo = window.__customerServiceAgentDemo;
          if (!demo?.send || !demo?.reset) throw new Error('数字人客服演示 API 未初始化');
          await demo.reset();
          addLog('新建客服会话完成');

          for (let index = 0; index < prompts.length; index += 1) {
            const prompt = prompts[index];
            setProgress(12 + Math.round(((index + 1) / prompts.length) * 72), prompt.label);
            const before = document.querySelectorAll('#chat-thread .message.agent').length;
            await demo.send(prompt.text);
            const messages = [...document.querySelectorAll('#chat-thread .message.agent')];
            const latest = messages.at(-1)?.textContent || '';
            if (messages.length <= before || !latest.includes(prompt.expect)) {
              throw new Error(`${prompt.label}未返回预期内容：${latest}`);
            }
            addLog(`${prompt.label}完成：${prompt.expect}`);
          }

          document.querySelector('#load-performance')?.click();
          const started = Date.now();
          while (Date.now() - started < 5000) {
            if (document.querySelector('#performance-report')?.textContent.includes('RTY798')) break;
            await new Promise((resolve) => setTimeout(resolve, 80));
          }
          if (!document.querySelector('#performance-report')?.textContent.includes('RTY798')) {
            throw new Error('性能报告未标记 RTY798 Provider');
          }
          addLog('性能与会话摘要已生成');
          setProgress(100, '演示完成');
          document.dispatchEvent(new CustomEvent('rty798-demo-complete'));
        } catch (error) {
          setProgress(Number(percent.textContent.replace('%', '')) || 0, '演示失败');
          addLog(error instanceof Error ? error.message : String(error), 'error');
          document.dispatchEvent(new CustomEvent('rty798-demo-failed'));
        } finally {
          runButton.disabled = false;
        }
      })();
    }, true);
  }, { prompts: demoPrompts });
}

async function testUiDevice(browser, device) {
  const scenario = { name: `ui-${device.name}`, status: 'passed', checks: [] };
  const context = await browser.newContext({
    viewport: device.viewport,
    isMobile: device.isMobile,
    hasTouch: device.hasTouch,
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  try {
    await page.goto(`${siteBase}/demos/digitalhuman/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('#chat-thread', { timeout: 15000 });
    await page.waitForSelector('.demo-mode-launcher', { timeout: 15000 });
    await page.screenshot({ path: `${outputDir}/${device.name}-01-initial.png`, fullPage: false });

    await page.locator('#settings-toggle').click();
    await page.locator('#backend-url').fill(adapterBase);
    await page.locator('#real-mode').check();
    await page.locator('#real-mode').dispatchEvent('change');
    await page.locator('#test-backend').click();
    await page.waitForFunction(() => document.querySelector('#connection-badge')?.textContent.includes('Agent'), null, { timeout: 10000 });
    scenario.checks.push('adapter-connected');
    await page.locator('#settings-toggle').click();

    await page.locator('.demo-mode-launcher').click();
    await page.locator('.demo-mode-panel').waitFor({ state: 'visible', timeout: 10000 });
    await installDemoBridge(page);
    await page.screenshot({ path: `${outputDir}/${device.name}-02-demo-panel.png`, fullPage: false });

    await page.locator('[data-demo-action="run"]').click();
    await page.waitForFunction(() => document.querySelector('[data-demo-status]')?.textContent === '演示完成', null, { timeout: 60000 });
    assert((await page.locator('[data-demo-percent]').textContent()) === '100%', 'demo progress did not reach 100%');
    assert((await page.locator('.demo-mode-log li.success').count()) >= 6, 'demo success log is incomplete');
    scenario.checks.push('guided-demo-complete');
    await page.screenshot({ path: `${outputDir}/${device.name}-03-demo-complete-panel.png`, fullPage: false });

    const transcript = await page.locator('#chat-thread').textContent();
    for (const prompt of demoPrompts) {
      assert(transcript.includes(prompt.expect), `${device.name}: transcript missing ${prompt.expect}`);
    }
    assert((await page.locator('#performance-report').textContent()).includes('RTY798'), `${device.name}: performance report missing provider`);
    assert((await page.locator('#tool-log').textContent()).includes('backend_tool_calls'), `${device.name}: tool trace missing backend calls`);
    scenario.checks.push('transcript-and-trace');

    await page.locator('.demo-mode-close').click();
    await page.screenshot({ path: `${outputDir}/${device.name}-04-workspace-complete.png`, fullPage: false });

    const overflow = await page.evaluate(() => ({
      viewport: innerWidth,
      html: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
    }));
    assert(Math.max(overflow.html, overflow.body) <= overflow.viewport + 2, `${device.name}: horizontal overflow ${JSON.stringify(overflow)}`);
    assert(pageErrors.length === 0, `${device.name}: page errors ${pageErrors.join('; ')}`);
    scenario.checks.push('no-overflow-or-page-errors');
  } catch (error) {
    scenario.status = 'failed';
    scenario.error = error instanceof Error ? error.message : String(error);
    scenario.pageErrors = pageErrors;
    await page.screenshot({ path: `${outputDir}/${device.name}-failed.png`, fullPage: false }).catch(() => {});
  } finally {
    await context.close();
  }
  results.push(scenario);
}

await mkdir(outputDir, { recursive: true });
await testUpstreamApi();

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
await testUiDevice(browser, { name: 'desktop-1440', viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false });
await testUiDevice(browser, { name: 'mobile-390', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await browser.close();

const adapterDebug = await requestJson(`${adapterBase}/debug/sessions`).catch((error) => ({ error: error instanceof Error ? error.message : String(error) }));
const failed = results.filter((result) => result.status === 'failed');
const report = [
  '# RTY798 AI Customer Service Agent E2E Report',
  '',
  `- Upstream: RTY798/ai-customer-service-agent@master`,
  `- Upstream URL: ${upstreamBase}`,
  `- Digitalhuman URL: ${siteBase}/demos/digitalhuman/`,
  `- Adapter URL: ${adapterBase}`,
  `- Passed: ${results.length - failed.length}/${results.length}`,
  `- Failed: ${failed.length}`,
  '',
  '| Scenario | Status | Checks | Error |',
  '|---|---|---|---|',
  ...results.map((result) => `| ${result.name} | ${result.status} | ${(result.checks || []).join(', ')} | ${(result.error || '').replaceAll('|', '\\|')} |`),
  '',
  '## Boundaries',
  '',
  '- The upstream LangGraph, routing, knowledge retrieval, tool execution, escalation and summary code run unchanged.',
  '- GitHub Actions uses a deterministic OpenAI-compatible LLM stub, so no external API key or paid model call is required.',
  '- The compatibility adapter only maps the current demo API contract to the upstream `/api/*` endpoints and supplies client-side session metrics.',
  '- Refund execution and persistent conversation storage are not claimed as upstream capabilities.',
  '',
].join('\n');

await writeFile(`${outputDir}/report.md`, report, 'utf8');
await writeFile(`${outputDir}/report.json`, JSON.stringify({ siteBase, upstreamBase, adapterBase, results, adapterDebug }, null, 2), 'utf8');
console.log(report);
if (failed.length) process.exitCode = 1;
