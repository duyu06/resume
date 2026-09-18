import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseURL = (process.env.TEST_BASE_URL || 'http://127.0.0.1:4173/resume').replace(/\/$/, '');
const outputDir = process.env.TEST_OUTPUT_DIR || 'test-results/portfolio';
const targetName = process.env.TEST_TARGET || 'local-preview';

const cases = [
  { name: 'desktop-1440', viewport: { width: 1440, height: 900 }, isMobile: false, reducedMotion: 'no-preference' },
  { name: 'mobile-390', viewport: { width: 390, height: 844 }, isMobile: true, reducedMotion: 'no-preference' },
  { name: 'desktop-reduced-motion', viewport: { width: 1440, height: 900 }, isMobile: false, reducedMotion: 'reduce' },
];

const results = [];
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

async function assertNoHorizontalOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    htmlWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
  }));
  const widest = Math.max(dimensions.htmlWidth, dimensions.bodyWidth);
  assert(widest <= dimensions.innerWidth + 2, `${label}: horizontal overflow ${widest}px > ${dimensions.innerWidth}px`);
}

async function runCase(browser, testCase) {
  const context = await browser.newContext({
    viewport: testCase.viewport,
    isMobile: testCase.isMobile,
    hasTouch: testCase.isMobile,
    reducedMotion: testCase.reducedMotion,
  });
  const page = await context.newPage();
  const pageErrors = [];
  const failedSameOrigin = [];
  const origin = new URL(baseURL).origin;

  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('response', (response) => {
    if (response.url().startsWith(origin) && response.status() >= 400) {
      failedSameOrigin.push(`${response.status()} ${response.url()}`);
    }
  });

  const started = Date.now();
  try {
    await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('#hero', { timeout: 20000 });
    await page.waitForSelector('#projects', { timeout: 20000 });

    const heroText = await page.locator('#hero').textContent();
    for (const text of ['我把 AI', '从 Demo', '推进到产品']) {
      assert(heroText?.includes(text), `Hero positioning missing: ${text}`);
    }

    for (const selector of ['#evidence', '#guoyang', '#projects', '#method', '#career', '#contact']) {
      assert((await page.locator(selector).count()) === 1, `Required section missing: ${selector}`);
    }

    const evidenceText = await page.locator('#evidence').textContent();
    for (const marker of ['1W+ → 7,328', '4h → 20min', '50+', '26']) {
      assert(evidenceText?.includes(marker), `Evidence marker missing: ${marker}`);
    }

    const selectedProjects = [
      ['果漾 AI', 'https://guoyang.xin/'],
      ['AI 电商素材生成平台', '/demos/ai-ecommerce/'],
      ['数字人模型微调', 'github.com/duyu06/resume'],
      ['yaoke 企业 AI 知识中台', 'github.com/duyu06/rag'],
    ];
    for (const [name, hrefPart] of selectedProjects) {
      const link = page.locator('#projects a').filter({ hasText: name }).first();
      await link.waitFor({ state: 'visible' });
      const href = await link.getAttribute('href');
      assert(href?.includes(hrefPart), `Incorrect project link for ${name}: ${href}`);
    }

    const systemButton = page.locator('#projects button').filter({ hasText: 'AI 客服数字人工作台' }).first();
    await systemButton.scrollIntoViewIfNeeded();
    await systemButton.click();
    const dialog = page.getByRole('dialog', { name: 'AI 客服数字人工作台' });
    await dialog.waitFor({ state: 'visible' });

    const closeButton = dialog.getByRole('button', { name: '关闭', exact: true });
    assert(await closeButton.evaluate((element) => document.activeElement === element), 'Project dialog did not move focus to close button');

    const image = dialog.locator('img').first();
    const firstSrc = await image.getAttribute('src');
    assert(firstSrc?.includes('project-digitalhuman-page-a.jpg'), `Unexpected first archive image: ${firstSrc}`);
    await dialog.getByRole('button', { name: '下一张' }).click();
    const secondSrc = await image.getAttribute('src');
    assert(secondSrc?.includes('project-digitalhuman-page-b.jpg'), `Archive carousel did not advance: ${secondSrc}`);

    const demoHref = await dialog.getByRole('link', { name: /打开 Demo/ }).getAttribute('href');
    assert(demoHref?.includes('/demos/digitalhuman/'), `Incorrect digital-human demo link: ${demoHref}`);

    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'detached' });
    assert(await systemButton.evaluate((element) => document.activeElement === element), 'Project dialog did not restore focus to trigger');
    assert(await page.evaluate(() => document.body.style.overflow !== 'hidden'), 'Body scroll remained locked after dialog close');

    if (testCase.isMobile) {
      const dock = page.locator('.mobile-dock-nav');
      await dock.waitFor({ state: 'visible' });
      const box = await dock.boundingBox();
      assert(box && box.left >= 0 && box.right <= testCase.viewport.width, 'Mobile dock exceeds viewport width');

      const heroHeight = await page.locator('#hero').evaluate((element) => element.getBoundingClientRect().height);
      assert(heroHeight <= testCase.viewport.height * 1.35, `Mobile hero retained desktop pin height: ${heroHeight}`);
    } else {
      const heroHeight = await page.locator('#hero').evaluate((element) => element.getBoundingClientRect().height);
      assert(heroHeight >= testCase.viewport.height * 1.8, `Desktop hero lost scroll-story height: ${heroHeight}`);
    }

    if (testCase.reducedMotion === 'reduce') {
      const reduced = await page.evaluate(() => ({
        matches: matchMedia('(prefers-reduced-motion: reduce)').matches,
        scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
      }));
      assert(reduced.matches, 'Reduced-motion media query was not active');
      assert(reduced.scrollBehavior === 'auto', `Reduced-motion scroll behavior should be auto, got ${reduced.scrollBehavior}`);
    }

    await page.locator('#contact').scrollIntoViewIfNeeded();
    await assertNoHorizontalOverflow(page, testCase.name);
    assert(pageErrors.length === 0, `Uncaught page errors: ${pageErrors.join(' | ')}`);
    assert(failedSameOrigin.length === 0, `Failed same-origin responses: ${failedSameOrigin.join(' | ')}`);

    await page.screenshot({ path: `${outputDir}/${targetName}-${testCase.name}.png`, fullPage: true });
    results.push({ case: testCase.name, status: 'passed', duration_ms: Date.now() - started });
  } catch (error) {
    await page.screenshot({ path: `${outputDir}/${targetName}-${testCase.name}-failed.png`, fullPage: true }).catch(() => {});
    results.push({ case: testCase.name, status: 'failed', duration_ms: Date.now() - started, error: error instanceof Error ? error.message : String(error) });
  } finally {
    await context.close();
  }
}

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
try {
  for (const testCase of cases) await runCase(browser, testCase);
} finally {
  await browser.close();
}

const failed = results.filter((item) => item.status === 'failed');
const report = [
  '# Portfolio acceptance report',
  '',
  `- Target: ${targetName}`,
  `- Base URL: ${baseURL}`,
  `- Passed: ${results.length - failed.length}/${results.length}`,
  `- Failed: ${failed.length}`,
  '',
  '| Case | Status | Duration | Error |',
  '|---|---|---:|---|',
  ...results.map((item) => `| ${item.case} | ${item.status} | ${item.duration_ms} ms | ${(item.error || '').replaceAll('|', '\\|')} |`),
  '',
].join('\n');

await writeFile(`${outputDir}/report.md`, report, 'utf8');
await writeFile(`${outputDir}/report.json`, JSON.stringify({ targetName, baseURL, results }, null, 2), 'utf8');
console.log(report);
if (failed.length) process.exit(1);
