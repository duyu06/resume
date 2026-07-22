import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseURL = process.env.TEST_BASE_URL || 'http://127.0.0.1:4173/resume';
const outputDir = 'test-results/demo-screenshots';
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
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert(dimensions.scrollWidth <= dimensions.innerWidth + 2, `${label}: horizontal overflow ${dimensions.scrollWidth}px > ${dimensions.innerWidth}px`);
}

async function prepareVisualCapture(page) {
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    document.querySelectorAll('.toast,.motion-enrich-state-demo').forEach((element) => element.classList.remove('show', 'is-visible'));
  });
  await page.waitForTimeout(220);
}

async function testYola(page) {
  await page.goto(`${baseURL}/demos/cross-border/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.product');
  await assertNoHorizontalOverflow(page, 'YOLA');
  await page.locator('.product').first().click();
  await page.waitForSelector('#quick-view.open');
  await page.locator('.size[data-size="8"]').click();
  await page.locator('#add-to-bag').click();
  await page.locator('#bag-open').click();
  await page.waitForSelector('#bag-drawer.open');
  assert((await page.locator('#bag-count').textContent()) === '1', 'YOLA: cart count did not update');
  await page.locator('#bag-drawer .close-layer').click();
}

async function testDigitalHuman(page) {
  await page.goto(`${baseURL}/demos/digitalhuman/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#sample-count');
  await assertNoHorizontalOverflow(page, 'Digital human');
  await page.locator('.legend button').nth(1).click();
  assert((await page.locator('#sample-count').textContent()) === '2,975', 'Digital human: dataset filter failed');
  await page.locator('#chat-input').fill('请介绍一下当前模型版本');
  await page.locator('#chat-form button').click();
  await page.waitForFunction(() => document.querySelectorAll('#messages .message').length >= 4);
  await page.locator('#train-toggle').click();
  await page.waitForTimeout(250);
  assert((await page.locator('#train-status').textContent()) === '训练中', 'Digital human: training did not start');
  await page.locator('#train-toggle').click();
}

async function testRpa(page) {
  await page.goto(`${baseURL}/demos/rpa/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#simulate-error');
  await assertNoHorizontalOverflow(page, 'RPA');
  await page.locator('#simulate-error').click();
  assert((await page.locator('.browser').nth(3).locator('.status').textContent()) === '登录失效', 'RPA: error state failed');
  await page.locator('#approve').click();
  assert((await page.locator('#approval-kpi').textContent()) === '6', 'RPA: approval count failed');
  assert((await page.locator('#approval-title').textContent()) === '数据提交审批', 'RPA: next approval record was not selected');
  assert(!(await page.locator('#approval-meta').textContent()).includes('undefined'), 'RPA: approval metadata contains undefined');
  await page.locator('#toggle-run').click();
  assert((await page.locator('#running-kpi').textContent()) === '0', 'RPA: pause failed');
}

async function testAiEcommerce(page) {
  await page.goto(`${baseURL}/demos/ai-ecommerce/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#generate');
  await assertNoHorizontalOverflow(page, 'AI ecommerce');
  await page.locator('#upload-demo').click();
  await page.locator('#generate').click();
  await page.waitForFunction(() => document.querySelector('#generate')?.textContent === '重新生成', null, { timeout: 5000 });
  await page.locator('.result').nth(1).click();
  assert((await page.locator('#score').textContent()) === '92', 'AI ecommerce: result selection failed');
  await page.locator('#compare-range').evaluate((element) => {
    element.value = '70';
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.locator('#download-one').click();
}

async function testSharedExperimentalDemo(page, slug, label) {
  await page.goto(`${baseURL}/demos/${slug}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.motion-enrich-launcher', { timeout: 10000 });
  await assertNoHorizontalOverflow(page, label);
  await page.locator('.motion-enrich-launcher').click();
  await page.waitForFunction(() => document.querySelector('#motion-enrich-drawer')?.classList.contains('is-open'));
  await page.locator('#motion-enrich-drawer [data-state="error"]').click();
  await page.waitForFunction(() => document.querySelector('.motion-enrich-state-demo')?.classList.contains('is-visible'));
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('#motion-enrich-drawer')?.classList.contains('is-open'));
}

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  for (const device of devices) {
    const context = await browser.newContext(device);
    const page = await context.newPage();
    page.on('pageerror', (error) => results.push({ device: device.name, pageError: error.message }));
    const tests = [
      ['yola', 'YOLA', testYola],
      ['digitalhuman', 'Digital human', testDigitalHuman],
      ['rpa', 'RPA', testRpa],
      ['ai-ecommerce', 'AI ecommerce', testAiEcommerce],
      ['webui', 'Open WebUI', (targetPage) => testSharedExperimentalDemo(targetPage, 'webui', 'Open WebUI')],
      ['soulcaller', 'SoulCaller', (targetPage) => testSharedExperimentalDemo(targetPage, 'soulcaller', 'SoulCaller')],
    ];
    for (const [slug, name, test] of tests) {
      const started = Date.now();
      try {
        await test(page);
        await prepareVisualCapture(page);
        await page.screenshot({ path: `${outputDir}/${device.name}-${slug}.png`, fullPage: false });
        results.push({ device: device.name, demo: name, status: 'passed', ms: Date.now() - started });
      } catch (error) {
        await page.screenshot({ path: `${outputDir}/${device.name}-${slug}-failed.png`, fullPage: false }).catch(() => {});
        results.push({ device: device.name, demo: name, status: 'failed', error: error.message });
        throw error;
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
}

console.table(results);
if (results.some((result) => result.status === 'failed' || result.pageError)) process.exit(1);
