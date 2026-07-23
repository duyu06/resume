import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseURL = (process.env.TEST_BASE_URL || 'http://127.0.0.1:4173/resume').replace(/\/$/, '');
const outputDir = process.env.TEST_OUTPUT_DIR || 'test-results/customer-agent-review';
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const matchesAny = (value, names) => names.some((name) => value?.includes(name));

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));

try {
  let chatCount = 0;
  await page.route('https://mock.customer-agent.test/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === '/health') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'healthy' }) });
    }
    if (url.pathname === '/chat') {
      chatCount += 1;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          response: chatCount === 1 ? '服务端已调用三个业务工具。' : '服务端直接回答，本轮没有新增工具。',
          conversation_id: 'CONV-METADATA',
          metadata: { total_tool_calls: 3, sentiment_score: 0.1 },
        }),
      });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });

  await page.goto(`${baseURL}/demos/digitalhuman/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.locator('#settings-toggle').click();
  await page.locator('#backend-url').fill('https://mock.customer-agent.test');
  await page.locator('#real-mode').check();
  await page.locator('#test-backend').click();
  await page.waitForFunction(() => document.querySelector('#toast')?.textContent?.includes('连接成功'), null, { timeout: 10000 });
  await page.locator('#settings-toggle').click();

  await page.locator('#message-input').fill('执行需要多个工具的请求');
  await page.locator('#send-message').click();
  await page.waitForFunction(() => document.querySelector('.message.agent:last-of-type')?.textContent?.includes('三个业务工具'), null, { timeout: 10000 });
  assert((await page.locator('#metric-tools').textContent()) === '3', 'Backend metadata: total tool count was not reflected as 3');
  assert((await page.locator('#tool-log .tool-event:first-child b').textContent()) === 'backend_tool_calls', 'Backend metadata: tool trace type is incorrect');
  const firstTrace = await page.locator('#tool-log .tool-event:first-child').textContent();
  assert(firstTrace?.includes('本轮执行 3 次') && firstTrace.includes('累计 3 次'), 'Backend metadata: delta and cumulative counts are missing');

  await page.locator('#message-input').fill('这次直接回答');
  await page.locator('#send-message').click();
  await page.waitForFunction(() => document.querySelector('.message.agent:last-of-type')?.textContent?.includes('没有新增工具'), null, { timeout: 10000 });
  assert((await page.locator('#metric-tools').textContent()) === '3', 'Backend metadata: no-tool response incorrectly increased the counter');
  assert((await page.locator('#tool-log .tool-event:first-child b').textContent()) === 'agent_response', 'Backend metadata: no-tool response trace is incorrect');

  await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  const card = page.locator('button').filter({ hasText: /AI 客服数字人(?:工作台| Agent)/ }).first();
  await card.waitFor({ state: 'visible', timeout: 15000 });
  const firstCandidates = ['project-digitalhuman-page-a.jpg', 'proj-customer-agent-a.svg'];
  const secondCandidates = ['project-digitalhuman-page-b.jpg', 'proj-customer-agent-b.svg'];
  const cardImage = await card.locator('img').getAttribute('src');
  assert(matchesAny(cardImage, firstCandidates), `Portfolio visual: unexpected card image (${cardImage})`);
  await card.click();
  const dialog = page.getByRole('dialog');
  await dialog.waitFor({ state: 'visible' });
  const firstImage = await dialog.locator('img').getAttribute('src');
  assert(matchesAny(firstImage, firstCandidates), `Portfolio visual: unexpected first modal image (${firstImage})`);
  await dialog.getByRole('button', { name: '下一张' }).click();
  const secondImage = await dialog.locator('img').getAttribute('src');
  assert(matchesAny(secondImage, secondCandidates), `Portfolio visual: unexpected second modal image (${secondImage})`);

  assert(errors.length === 0, `Uncaught browser errors: ${errors.join('; ')}`);
  await page.screenshot({ path: `${outputDir}/customer-agent-review.png`, fullPage: true });
  await writeFile(`${outputDir}/report.md`, '# Customer Agent review regression\n\n- Backend tool metadata: passed\n- No-tool delta handling: passed\n- Portfolio customer-agent visuals: passed\n', 'utf8');
} finally {
  await context.close();
  await browser.close();
}
