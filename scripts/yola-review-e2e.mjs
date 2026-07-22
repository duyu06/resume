import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseURL = (process.env.TEST_BASE_URL || 'http://127.0.0.1:4173/resume').replace(/\/$/, '');
const outputDir = process.env.TEST_OUTPUT_DIR || 'test-results/yola-review';
const targetName = process.env.TEST_TARGET || 'local-preview';
const results = [];

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

async function waitForYola(page) {
  await page.goto(`${baseURL}/demos/cross-border/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => document.body.dataset.yolaKeyframeCount === '14', null, { timeout: 15000 });
  await page.waitForFunction(() => document.querySelectorAll('.product-card.motion-enrich-reveal').length === 6, null, { timeout: 10000 });
}

async function scrollSection(page, selector, progress) {
  await page.evaluate(async ({ selector: targetSelector, progress: targetProgress }) => {
    const section = document.querySelector(targetSelector);
    if (!section) throw new Error(`Missing section ${targetSelector}`);
    const distance = Math.max(1, section.offsetHeight - innerHeight);
    scrollTo(0, section.offsetTop + distance * targetProgress);
    await new Promise((resolve) => setTimeout(resolve, 180));
  }, { selector, progress });
}

async function testNormalMotion(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  try {
    await waitForYola(page);

    await scrollSection(page, '[data-yola-collection]', 0.48);
    const focusState = await page.evaluate(() => {
      const cards = [...document.querySelectorAll('.product-card')];
      return cards.map((card) => ({
        focused: card.classList.contains('is-focus'),
        opacity: Number.parseFloat(getComputedStyle(card).opacity),
      }));
    });
    const focused = focusState.filter((item) => item.focused);
    const nonFocused = focusState.filter((item) => !item.focused);
    assert(focused.length === 1, `YOLA: expected one focused product, got ${focused.length}`);
    assert(focused[0].opacity >= 0.95, `YOLA: focused product opacity is ${focused[0].opacity}`);
    assert(nonFocused.every((item) => item.opacity <= 0.55), `YOLA: non-focused product opacity was overridden (${JSON.stringify(nonFocused)})`);

    await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(180);
    await scrollSection(page, '.hero-scroll', 0.99);
    const heroReentry = await page.evaluate(() => ({ section: document.body.dataset.yolaSection, frame: document.body.dataset.yolaKeyframe }));
    assert(heroReentry.section === 'hero' && heroReentry.frame === '14', `YOLA: hero re-entry state is ${JSON.stringify(heroReentry)}`);

    await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(180);
    await scrollSection(page, '[data-yola-collection]', 0.99);
    const collectionReentry = await page.evaluate(() => ({ section: document.body.dataset.yolaSection, frame: document.body.dataset.yolaKeyframe }));
    assert(collectionReentry.section === 'collection' && collectionReentry.frame === 'C08', `YOLA: collection re-entry state is ${JSON.stringify(collectionReentry)}`);

    await page.screenshot({ path: `${outputDir}/${targetName}-normal-motion.png`, fullPage: true });
    results.push({ scenario: 'normal-motion-focus-and-reentry', status: 'passed' });
  } catch (error) {
    await page.screenshot({ path: `${outputDir}/${targetName}-normal-motion-failed.png`, fullPage: true }).catch(() => {});
    results.push({ scenario: 'normal-motion-focus-and-reentry', status: 'failed', error: error instanceof Error ? error.message : String(error) });
  } finally {
    await context.close();
  }
}

async function testReducedMotion(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  try {
    await waitForYola(page);
    await page.locator('.craft-reveal').scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
    const state = await page.locator('.craft-reveal').evaluate((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return {
        opacity: Number.parseFloat(style.opacity),
        visibility: style.visibility,
        width: rect.width,
        height: rect.height,
      };
    });
    assert(state.opacity >= 0.95 && state.visibility !== 'hidden' && state.width > 0 && state.height > 0, `YOLA: reduced-motion craft reveal is not visible (${JSON.stringify(state)})`);
    await page.screenshot({ path: `${outputDir}/${targetName}-reduced-motion.png`, fullPage: true });
    results.push({ scenario: 'reduced-motion-final-craft', status: 'passed' });
  } catch (error) {
    await page.screenshot({ path: `${outputDir}/${targetName}-reduced-motion-failed.png`, fullPage: true }).catch(() => {});
    results.push({ scenario: 'reduced-motion-final-craft', status: 'failed', error: error instanceof Error ? error.message : String(error) });
  } finally {
    await context.close();
  }
}

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
await testNormalMotion(browser);
await testReducedMotion(browser);
await browser.close();

const failed = results.filter((item) => item.status === 'failed');
const report = [
  '# YOLA review regression report',
  '',
  `- Target: ${targetName}`,
  `- Base URL: ${baseURL}`,
  `- Passed: ${results.length - failed.length}/${results.length}`,
  `- Failed: ${failed.length}`,
  '',
  '| Scenario | Status | Error |',
  '|---|---|---|',
  ...results.map((item) => `| ${item.scenario} | ${item.status} | ${(item.error || '').replaceAll('|', '\\|')} |`),
  '',
].join('\n');
await writeFile(`${outputDir}/report.md`, report, 'utf8');
await writeFile(`${outputDir}/report.json`, JSON.stringify({ baseURL, targetName, results }, null, 2), 'utf8');
console.log(report);
if (failed.length) process.exitCode = 1;
