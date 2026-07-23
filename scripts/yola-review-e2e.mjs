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
  await page.waitForSelector('.yola-logo', { timeout: 15000 });
  await page.waitForSelector('.product-card', { timeout: 15000 });
  await page.waitForFunction(() => document.documentElement.classList.contains('yola-ready'), null, { timeout: 15000 }).catch(() => {});
}

async function testDesktop(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  try {
    await waitForYola(page);
    const initial = await page.evaluate(() => ({
      title: document.title,
      products: document.querySelectorAll('.product-card').length,
      pageHeight: document.documentElement.scrollHeight,
      viewportHeight: innerHeight,
      heroVideo: document.querySelector('#hero-video source')?.getAttribute('src'),
      collectionVideo: document.querySelector('#collection-video source')?.getAttribute('src'),
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
    }));
    assert(initial.title.includes('YOLA'), `stale title: ${initial.title}`);
    assert(initial.products === 6, `expected 6 products, found ${initial.products}`);
    assert(initial.pageHeight > initial.viewportHeight * 7, `scroll experience is too short: ${initial.pageHeight}`);
    assert(initial.heroVideo?.startsWith('./assets/videos/'), `hero video is not local: ${initial.heroVideo}`);
    assert(initial.collectionVideo?.startsWith('./assets/videos/'), `collection video is not local: ${initial.collectionVideo}`);
    assert(initial.overflow <= 2, `desktop horizontal overflow ${initial.overflow}`);
    await page.screenshot({ path: `${outputDir}/${targetName}-01-desktop-hero.png`, fullPage: false });

    const heroHeight = await page.locator('.hero-scroll').evaluate((element) => element.offsetHeight);
    await page.evaluate((value) => scrollTo(0, value), Math.round(heroHeight * 0.52));
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${outputDir}/${targetName}-02-desktop-hero-scrub.png`, fullPage: false });

    await page.locator('#collection').scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${outputDir}/${targetName}-03-desktop-collection.png`, fullPage: false });

    await page.locator('#about').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    assert(await page.locator('.stat-card').count() === 4, 'stats section is incomplete');
    await page.screenshot({ path: `${outputDir}/${targetName}-04-desktop-about.png`, fullPage: false });

    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(500);
    const footerState = await page.evaluate(() => ({
      footerBottom: Math.round(document.querySelector('.site-footer').getBoundingClientRect().bottom),
      viewport: innerHeight,
      spacer: Math.round(document.querySelector('.footer-spacer').getBoundingClientRect().height),
    }));
    assert(Math.abs(footerState.footerBottom - footerState.viewport) <= 2, `footer is not fixed to viewport: ${JSON.stringify(footerState)}`);
    assert(footerState.spacer > 200, `footer spacer is too short: ${footerState.spacer}`);
    await page.screenshot({ path: `${outputDir}/${targetName}-05-desktop-footer.png`, fullPage: false });
    assert(pageErrors.length === 0, `page errors: ${pageErrors.join('; ')}`);
    results.push({ scenario: 'desktop-yola-scenes', status: 'passed' });
  } catch (error) {
    await page.screenshot({ path: `${outputDir}/${targetName}-desktop-failed.png`, fullPage: false }).catch(() => {});
    results.push({ scenario: 'desktop-yola-scenes', status: 'failed', error: error instanceof Error ? error.message : String(error), pageErrors });
  } finally {
    await context.close();
  }
}

async function testMobile(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  try {
    await waitForYola(page);
    const state = await page.evaluate(() => ({
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      cardWidth: Math.round(document.querySelector('.product-card').getBoundingClientRect().width),
      viewport: innerWidth,
      craftColumns: getComputedStyle(document.querySelector('.craft-section')).gridTemplateColumns,
      headerTop: Math.round(document.querySelector('.site-header').getBoundingClientRect().top),
    }));
    assert(state.overflow <= 2, `mobile horizontal overflow ${state.overflow}`);
    assert(state.cardWidth >= state.viewport * 0.8 && state.cardWidth <= state.viewport * 0.9, `mobile card width ${state.cardWidth}/${state.viewport}`);
    assert(!state.craftColumns.includes(' '), `mobile craft section did not collapse: ${state.craftColumns}`);
    assert(state.headerTop >= 14, `mobile header safe area ${state.headerTop}`);
    await page.screenshot({ path: `${outputDir}/${targetName}-06-mobile-hero.png`, fullPage: false });

    await page.locator('#about').scrollIntoViewIfNeeded();
    await page.waitForTimeout(350);
    await page.screenshot({ path: `${outputDir}/${targetName}-07-mobile-about.png`, fullPage: false });

    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(350);
    await page.screenshot({ path: `${outputDir}/${targetName}-08-mobile-footer.png`, fullPage: false });
    results.push({ scenario: 'mobile-yola-layout', status: 'passed' });
  } catch (error) {
    await page.screenshot({ path: `${outputDir}/${targetName}-mobile-failed.png`, fullPage: false }).catch(() => {});
    results.push({ scenario: 'mobile-yola-layout', status: 'failed', error: error instanceof Error ? error.message : String(error) });
  } finally {
    await context.close();
  }
}

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
await testDesktop(browser);
await testMobile(browser);
await browser.close();

const failed = results.filter((item) => item.status === 'failed');
const report = [
  '# YOLA jewelry regression report',
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
