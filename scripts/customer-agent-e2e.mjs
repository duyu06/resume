import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseURL = (process.env.TEST_BASE_URL || 'http://127.0.0.1:4173/resume').replace(/\/$/, '');
const outputDir = process.env.TEST_OUTPUT_DIR || 'test-results/customer-agent';
const targetName = process.env.TEST_TARGET || 'local-preview';

const devices = [
  { name: 'desktop-1440', viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false },
  { name: 'mobile-390', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
];

const results = [];
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

async function assertNoOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({
    viewport: innerWidth,
    html: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  assert(Math.max(dimensions.html, dimensions.body) <= dimensions.viewport + 2, `${label}: horizontal overflow ${JSON.stringify(dimensions)}`);
}

async function waitForTool(page, name) {
  await page.waitForFunction(
    (toolName) => document.querySelector('#tool-log')?.textContent?.includes(toolName),
    name,
    { timeout: 12000 },
  );
}

async function sendText(page, message) {
  await page.locator('#message-input').fill(message);
  await page.locator('#send-message').click();
}

async function assertMotionExperience(page, deviceName) {
  await page.waitForFunction(() => Boolean(window.gsap && window.ScrollTrigger), null, { timeout: 15000 });
  assert((await page.locator('.workflow-card').count()) === 4, `${deviceName}: workflow story does not contain four stages`);
  assert(await page.locator('.avatar-frame img').isVisible(), `${deviceName}: illustrated digital human avatar is missing`);
  assert(await page.locator('.service-chart').isVisible(), `${deviceName}: service chart is missing`);

  await page.locator('#agent-workflow').scrollIntoViewIfNeeded();
  await page.locator('.workflow-card').nth(2).scrollIntoViewIfNeeded();
  await page.waitForFunction(
    () => document.querySelectorAll('.workflow-card')[2]?.classList.contains('active'),
    null,
    { timeout: 10000 },
  );
  assert((await page.locator('#workflow-output').textContent()) === 'result.verified', `${deviceName}: GSAP workflow stage did not update`);
  await page.locator('#workspace').scrollIntoViewIfNeeded();
}

async function runDevice(browser, device) {
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
    await page.goto(`${baseURL}/demos/digitalhuman/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('#chat-thread', { timeout: 15000 });
    assert((await page.title()).includes('AI 客服数字人'), 'Customer agent: page title is stale');
    assert((await page.locator('h1').textContent())?.includes('真正解决问题'), 'Customer agent: redesigned hero copy missing');
    assert(await page.getByRole('textbox', { name: '客户 ID', exact: true }).isVisible(), 'Customer agent: customer ID input has no accessible name');
    await assertNoOverflow(page, `Customer agent ${device.name} initial`);
    await assertMotionExperience(page, device.name);

    const initialAgentMessages = await page.locator('.message.agent').count();
    assert(initialAgentMessages >= 1, 'Customer agent: initial welcome message missing');

    await page.locator('#settings-toggle').click();
    await page.locator('#backend-url').fill('https://mock.customer-agent.test');
    await page.locator('#agent-token').fill('gateway_session_token');
    await page.locator('#agent-token').press('Tab');
    assert(await page.evaluate(() => sessionStorage.getItem('customer_agent_token') === 'gateway_session_token'), 'Customer agent: gateway token was not stored in sessionStorage');
    assert(await page.evaluate(() => localStorage.getItem('customer_agent_token') === null), 'Customer agent: gateway token leaked into localStorage');
    await page.locator('#settings-toggle').click();

    await page.locator('[data-quick="order"]').click();
    await waitForTool(page, 'lookup_order');
    assert((await page.locator('.message.agent').last().textContent())?.includes('SF13800138000'), 'Customer agent: order lookup response missing tracking details');

    await page.locator('[data-quick="refund"]').click();
    await waitForTool(page, 'process_refund');
    assert((await page.locator('.message.agent').last().textContent())?.includes('退款预申请'), 'Customer agent: refund pre-application was not created');
    assert((await page.evaluate(() => window.__customerServiceAgentDemo.getState().pendingRefund?.orderId)) === 'ORD-12345', 'Customer agent: pending refund state was not retained');

    await sendText(page, '确认商品未拆封且配件完整，请正式提交退款');
    await waitForTool(page, 'confirm_refund');
    assert((await page.locator('.message.agent').last().textContent())?.includes('已正式提交'), 'Customer agent: refund confirmation did not complete the workflow');
    assert((await page.evaluate(() => window.__customerServiceAgentDemo.getState().pendingRefund)) === null, 'Customer agent: pending refund was not cleared after confirmation');

    await sendText(page, '请转人工帮我查询订单 ORD-12345');
    await page.waitForFunction(
      () => document.querySelector('#tool-log .tool-event:first-child b')?.textContent === 'escalate_to_human',
      null,
      { timeout: 12000 },
    );
    assert((await page.locator('.message.agent').last().textContent())?.includes('人工坐席'), 'Customer agent: explicit human handoff lost priority to order lookup');

    await page.locator('[data-quick="angry"]').click();
    await page.waitForFunction(() => document.querySelector('#metric-sentiment')?.textContent === '负面', null, { timeout: 12000 });
    await waitForTool(page, 'escalate_to_human');
    assert((await page.locator('#handoff-note').textContent())?.includes('人工'), 'Customer agent: negative sentiment did not recommend handoff');

    await page.locator('#load-performance').click();
    assert((await page.locator('#performance-report').textContent())?.includes('工具调用'), 'Customer agent: performance report missing tool count');
    assert(Number(await page.locator('#metric-tools').textContent()) >= 5, 'Customer agent: tool counter did not advance through the complete workflow');

    const conversationBefore = await page.locator('#conversation-id').textContent();
    await page.locator('#new-conversation').click();
    const conversationAfter = await page.locator('#conversation-id').textContent();
    assert(conversationBefore !== conversationAfter, 'Customer agent: new conversation did not rotate the conversation ID');
    assert((await page.locator('#metric-tools').textContent()) === '0', 'Customer agent: new conversation did not reset tool count');

    if (!device.isMobile) {
      await page.route('https://mock.customer-agent.test/**', async (route) => {
        const url = new URL(route.request().url());
        if (url.pathname === '/health') {
          return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'healthy' }) });
        }
        if (url.pathname === '/chat') {
          const body = JSON.parse(route.request().postData() || '{}');
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              response: `服务端已处理：${body.message}`,
              conversation_id: body.conversation_id,
              metadata: { sentiment_score: 0.32, total_tool_calls: 1 },
            }),
          });
        }
        if (url.pathname.startsWith('/conversation/')) {
          await new Promise((resolve) => setTimeout(resolve, 650));
          return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'reset' }) });
        }
        if (url.pathname === '/performance') {
          return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ report: 'Mock performance report' }) });
        }
        return route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ detail: 'not found' }) });
      });

      await page.locator('#settings-toggle').click();
      await page.locator('#real-mode').check();
      await page.locator('#test-backend').click();
      await page.waitForFunction(() => document.querySelector('#toast')?.textContent?.includes('连接成功'), null, { timeout: 10000 });
      await page.locator('#settings-toggle').click();

      await sendText(page, '测试真实客服 Agent');
      await page.waitForFunction(() => document.querySelector('.message.agent:last-of-type')?.textContent?.includes('服务端已处理'), null, { timeout: 10000 });
      assert((await page.locator('#connection-badge').textContent())?.includes('Agent'), 'Customer agent: real backend badge did not update');

      const realConversationBefore = await page.locator('#conversation-id').textContent();
      await page.locator('#new-conversation').click();
      assert(await page.locator('#new-conversation').isDisabled(), 'Customer agent: new conversation action stayed enabled during server deletion');
      assert(await page.locator('#send-message').isDisabled(), 'Customer agent: send action stayed enabled during server deletion');
      assert(await page.locator('[data-quick="order"]').isDisabled(), 'Customer agent: quick action stayed enabled during server deletion');
      await page.waitForFunction(() => !document.querySelector('#new-conversation')?.disabled, null, { timeout: 10000 });
      const realConversationAfter = await page.locator('#conversation-id').textContent();
      assert(realConversationBefore !== realConversationAfter, 'Customer agent: slow server deletion did not finish conversation rotation');
    }

    await page.locator('.demo-mode-launcher').click();
    await page.locator('.demo-mode-panel').waitFor({ state: 'visible' });
    await page.locator('[data-demo-action="run"]').click();
    await page.waitForFunction(() => document.querySelector('[data-demo-status]')?.textContent === '演示完成', null, { timeout: 30000 });
    assert((await page.locator('.demo-mode-log li.success').count()) >= 4, 'Customer agent: shared demo control did not complete the refund confirmation workflow');
    assert((await page.locator('#tool-log').textContent())?.includes('confirm_refund'), 'Customer agent: guided demo did not formally submit the refund');

    await assertNoOverflow(page, `Customer agent ${device.name} final`);
    assert(pageErrors.length === 0, `Customer agent: uncaught errors ${pageErrors.join('; ')}`);
    await page.screenshot({ path: `${outputDir}/${targetName}-${device.name}-customer-agent.png`, fullPage: true });
    results.push({ device: device.name, status: 'passed' });
  } catch (error) {
    await page.screenshot({ path: `${outputDir}/${targetName}-${device.name}-customer-agent-failed.png`, fullPage: true }).catch(() => {});
    results.push({ device: device.name, status: 'failed', error: error instanceof Error ? error.message : String(error), pageErrors });
  } finally {
    await context.close();
  }
}

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
for (const device of devices) await runDevice(browser, device);
await browser.close();

const failed = results.filter((item) => item.status === 'failed');
const report = [
  '# AI customer service agent end-to-end report',
  '',
  `- Target: ${targetName}`,
  `- Base URL: ${baseURL}`,
  `- Passed: ${results.length - failed.length}/${results.length}`,
  `- Failed: ${failed.length}`,
  '',
  '| Device | Status | Error |',
  '|---|---|---|',
  ...results.map((item) => `| ${item.device} | ${item.status} | ${(item.error || '').replaceAll('|', '\\|')} |`),
  '',
].join('\n');

await writeFile(`${outputDir}/report.md`, report, 'utf8');
await writeFile(`${outputDir}/report.json`, JSON.stringify({ baseURL, targetName, results }, null, 2), 'utf8');
console.log(report);
if (failed.length) process.exitCode = 1;
