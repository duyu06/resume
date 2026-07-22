import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseURL = process.env.TEST_BASE_URL || 'http://127.0.0.1:4173/resume';
const outputDir = 'test-results/upstream-demo-screenshots';
const devices = [
  { name: 'desktop-1440', viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false },
  { name: 'mobile-390', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
];

const results = [];
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

async function assertNoHorizontalOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
  }));
  const widest = Math.max(dimensions.documentWidth, dimensions.bodyWidth);
  assert(widest <= dimensions.innerWidth + 2, `${label}: horizontal overflow ${widest}px > ${dimensions.innerWidth}px`);
}

async function resetForScreenshot(page) {
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    document.querySelectorAll('.toast').forEach((element) => element.classList.remove('show'));
  });
  await page.waitForTimeout(180);
}

async function testPrismPix(page) {
  await page.goto(`${baseURL}/demos/ai-ecommerce/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#analyze');
  await assertNoHorizontalOverflow(page, 'PrismPix');

  await page.locator('#analyze').click();
  await page.waitForFunction(() => !document.querySelector('#generate-prompts')?.disabled, null, { timeout: 8000 });
  assert((await page.locator('#analysis-state').textContent()) === '分析完成', 'PrismPix: analysis did not complete');

  await page.locator('#generate-prompts').click();
  await page.waitForFunction(() => document.querySelectorAll('.prompt-item').length === 14, null, { timeout: 8000 });
  await page.locator('.prompt-item').first().locator('.prompt-toggle').click();
  assert(await page.locator('.prompt-item').first().evaluate((element) => element.classList.contains('open')), 'PrismPix: prompt editor did not expand');

  await page.locator('#generate-images').click();
  await page.waitForFunction(() => document.querySelector('#stage-images')?.classList.contains('active'), null, { timeout: 10000 });
  assert((await page.locator('.image-card').count()) === 14, 'PrismPix: expected 14 image modules');
}

async function testDigitalHuman(page) {
  await page.goto(`${baseURL}/demos/digitalhuman/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.character-card', { timeout: 8000 });
  await assertNoHorizontalOverflow(page, 'Digital human');

  await page.locator('.character-card .call').first().click();
  await page.waitForSelector('#view-call.active');
  await page.waitForFunction(() => !document.querySelector('#hangup')?.disabled, null, { timeout: 10000 });
  const liveId = (await page.locator('#live-id').textContent())?.trim();
  assert(liveId && liveId !== '-', 'Digital human: live ID was not created');
  assert((await page.locator('#stepper li.done').count()) === 5, 'Digital human: connection stepper did not complete');

  await page.locator('#query-live').click();
  await page.locator('#hangup').click();
  assert((await page.locator('#live-status').textContent()) === 'ended', 'Digital human: hangup did not update status');

  await page.locator('.view-tabs [data-view="editor"]').click();
  await page.waitForSelector('#view-editor.active');
  await page.locator('#character-name').fill('移动端测试角色');
  await page.locator('#character-form button[type="submit"]').click();
  await page.waitForSelector('#view-library.active');
  assert((await page.locator('.character-card').count()) >= 4, 'Digital human: character save failed');
}

async function testWebRPA(page) {
  await page.goto(`${baseURL}/demos/rpa/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.node-card');
  await assertNoHorizontalOverflow(page, 'WebRPA');

  const initialNodes = await page.locator('.node-card').count();
  await page.locator('.module').first().click();
  await page.waitForFunction((count) => document.querySelectorAll('.node-card').length === count + 1, initialNodes);

  await page.locator('#run').click();
  await page.waitForFunction(() => !document.querySelector('#approval-card')?.hidden, null, { timeout: 15000 });
  assert((await page.locator('#current-node').textContent()) === '人工审批', 'WebRPA: did not stop at approval node');
  await page.locator('#approve').click();
  await page.waitForFunction(() => !document.querySelector('#run')?.disabled, null, { timeout: 15000 });
  assert(Number(await page.locator('#success-count').textContent()) >= 7, 'WebRPA: workflow did not complete successfully');

  await page.locator('.node-card').first().click();
  await page.locator('#node-name').fill('测试触发器');
  await page.locator('#node-form button[type="submit"]').click();
  assert((await page.locator('.node-card').first().textContent()).includes('测试触发器'), 'WebRPA: node inspector update failed');
}

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  for (const device of devices) {
    const context = await browser.newContext(device);
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    const tests = [
      ['prismpix', 'PrismPix', testPrismPix],
      ['digitalhuman', 'Digital human', testDigitalHuman],
      ['webrpa', 'WebRPA', testWebRPA],
    ];

    for (const [slug, label, test] of tests) {
      const started = Date.now();
      try {
        await test(page);
        await assertNoHorizontalOverflow(page, label);
        await resetForScreenshot(page);
        await page.screenshot({ path: `${outputDir}/${device.name}-${slug}.png`, fullPage: false });
        results.push({ device: device.name, demo: label, status: 'passed', ms: Date.now() - started });
      } catch (error) {
        await page.screenshot({ path: `${outputDir}/${device.name}-${slug}-failed.png`, fullPage: false }).catch(() => {});
        results.push({ device: device.name, demo: label, status: 'failed', error: error.message });
        throw error;
      }
    }

    if (pageErrors.length) throw new Error(`${device.name}: uncaught page errors: ${pageErrors.join(' | ')}`);
    await context.close();
  }
} finally {
  await browser.close();
}

console.table(results);
if (results.some((result) => result.status === 'failed')) process.exit(1);
