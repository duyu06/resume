import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseURL = (process.env.TEST_BASE_URL || 'http://127.0.0.1:4173/resume').replace(/\/$/, '');
const outputDir = process.env.TEST_OUTPUT_DIR || 'test-results/portfolio';
const targetName = process.env.TEST_TARGET || 'local-preview';

const cases = [
  { name: 'desktop-1440', viewport: { width: 1440, height: 900 }, isMobile: false, reducedMotion: 'no-preference' },
  { name: 'mobile-390', viewport: { width: 390, height: 844 }, isMobile: true, reducedMotion: 'no-preference' },
  { name: 'tablet-1024', viewport: { width: 1024, height: 768 }, isMobile: false, reducedMotion: 'no-preference' },
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

    for (const selector of ['#snapshot', '#evidence', '#guoyang', '#projects', '#method', '#career', '#contact']) {
      assert((await page.locator(selector).count()) === 1, `Required section missing: ${selector}`);
    }

    const snapshotText = await page.locator('#snapshot').textContent();
    for (const marker of ['60-SECOND BRIEF', 'AI 产品经理', '业务问题', '7,328', '50+ token/s']) {
      assert(snapshotText?.includes(marker), `Recruiter snapshot missing: ${marker}`);
    }
    const snapshotProjectHref = await page.locator('#snapshot a').filter({ hasText: '看代表项目' }).getAttribute('href');
    assert(snapshotProjectHref === '#guoyang', `Recruiter snapshot project CTA is incorrect: ${snapshotProjectHref}`);

    const structuredData = await page.locator('script[type="application/ld+json"]').textContent();
    const schema = JSON.parse(structuredData || '{}');
    const graph = Array.isArray(schema['@graph']) ? schema['@graph'] : [];
    const person = graph.find((item) => item['@type'] === 'Person');
    const website = graph.find((item) => item['@type'] === 'WebSite');
    assert(person?.name === '张滨文', 'Structured data is missing the portfolio owner');
    assert(Array.isArray(person?.jobTitle) && person.jobTitle.includes('AI 产品经理'), 'Structured data is missing AI product role');
    assert(website?.inLanguage === 'zh-CN', 'Structured data is missing website language');

    const visualImages = page.locator('#guoyang img, #projects img');
    const visualImageCount = await visualImages.count();
    assert(visualImageCount >= 6, `Expected portfolio visual evidence, got ${visualImageCount} images`);
    for (let index = 0; index < visualImageCount; index += 1) {
      const image = visualImages.nth(index);
      await image.scrollIntoViewIfNeeded();
      const loaded = await image.evaluate((element) =>
        new Promise((resolve) => {
          const target = element;
          if (target.complete) {
            resolve(target.naturalWidth > 0);
            return;
          }
          target.addEventListener('load', () => resolve(true), { once: true });
          target.addEventListener('error', () => resolve(false), { once: true });
        }),
      );
      assert(loaded, `Portfolio image failed to load: ${await image.getAttribute('src')}`);
    }

    const evidenceText = await page.locator('#evidence').textContent();
    for (const marker of ['1W+ → 7,328', '4h → 20min', '50+', '26']) {
      assert(evidenceText?.includes(marker), `Evidence marker missing: ${marker}`);
    }
    const relatedCaseLinks = page.locator('#evidence a[href="#project-03"]');
    assert((await relatedCaseLinks.count()) === 2, 'Model evidence should deep-link to the digital-human fine-tuning case');
    assert((await page.locator('#project-03').count()) === 1, 'Evidence target #project-03 is missing');

    const socialPreview = await page.locator('meta[property="og:image"]').getAttribute('content');
    assert(
      socialPreview === 'https://duyu06.github.io/resume/og-cover.jpg',
      `Open Graph preview must use an absolute URL: ${socialPreview}`,
    );

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

    const aiTrigger = page.getByRole('button', { name: '打开 MaxKB 智能问答' });
    if ((await aiTrigger.count()) === 1) {
      await aiTrigger.click();
      const aiDialog = page.getByRole('dialog', { name: 'MaxKB 智能问答' });
      await aiDialog.waitFor({ state: 'visible' });
      const aiClose = aiDialog.getByRole('button', { name: '关闭智能问答' });
      assert(await aiClose.evaluate((element) => document.activeElement === element), 'AI chat did not move focus to close button');
      assert(await page.evaluate(() => document.body.style.overflow === 'hidden'), 'AI chat did not lock body scroll');
      await page.keyboard.press('Escape');
      await aiDialog.waitFor({ state: 'detached' });
      assert(await aiTrigger.evaluate((element) => document.activeElement === element), 'AI chat did not restore focus to trigger');
      assert(await page.evaluate(() => document.body.style.overflow !== 'hidden'), 'AI chat left body scroll locked');
    }

    if (testCase.isMobile) {
      const dock = page.locator('.mobile-dock-nav');
      await dock.waitFor({ state: 'visible' });
      const box = await dock.boundingBox();
      assert(
        box && box.x >= -1 && box.x + box.width <= testCase.viewport.width + 1,
        `Mobile dock exceeds viewport width: ${JSON.stringify(box)} / ${testCase.viewport.width}`,
      );

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
      const animatedResidue = await page.locator('[data-motion-reveal]').evaluateAll((elements) =>
        elements
          .map((element) => {
            const style = getComputedStyle(element);
            return { opacity: style.opacity, transform: style.transform };
          })
          .filter((style) => style.opacity !== '1' || style.transform !== 'none'),
      );
      assert(animatedResidue.length === 0, `Reduced-motion reveal residue: ${JSON.stringify(animatedResidue)}`);
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
