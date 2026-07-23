import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseURL = (process.env.TEST_BASE_URL || 'http://127.0.0.1:4173/resume').replace(/\/$/, '');
const outputDir = process.env.TEST_OUTPUT_DIR || 'test-results/prmpt-review';
const targetName = process.env.TEST_TARGET || 'local-preview';
const results = [];

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

async function waitForPrmpt(page) {
  await page.goto(`${baseURL}/demos/cross-border/#about`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('.prmpt-logo', { timeout: 15000 });
  await page.waitForFunction(() => document.querySelectorAll('#gallery-grid .product-card').length === 10, null, { timeout: 15000 });
}

async function inspectPhase(page, scrollTop) {
  await page.evaluate((value) => scrollTo(0, value), scrollTop);
  await page.waitForTimeout(220);
  return page.evaluate(() => ({
    phase: document.body.dataset.prmptPhase,
    panelTransform: getComputedStyle(document.querySelector('#collection')).transform,
    overlayOpacity: Number.parseFloat(getComputedStyle(document.querySelector('#outro-overlay')).opacity),
    buyTransform: getComputedStyle(document.querySelector('#outro-buy')).transform,
    horizontalOverflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
  }));
}

async function testDesktopMotion(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  try {
    await waitForPrmpt(page);
    const initial = await page.evaluate(() => ({
      title: document.title,
      logo: document.querySelector('.prmpt-logo')?.textContent?.trim(),
      videos: document.querySelectorAll('#main-canvas video').length,
      pageHeight: document.documentElement.scrollHeight,
      viewportHeight: innerHeight,
    }));
    assert(initial.title.includes('prmpt'), `prmpt: stale title ${initial.title}`);
    assert(initial.logo?.includes('prmpt'), 'prmpt: wordmark missing');
    assert(initial.videos === 2, `prmpt: expected two videos, found ${initial.videos}`);
    assert(initial.pageHeight > initial.viewportHeight * 3, `prmpt: scroll scene is too short (${initial.pageHeight})`);

    const hero = await inspectPhase(page, 0);
    assert(hero.phase === 'hero', `prmpt: initial phase is ${hero.phase}`);
    assert(hero.horizontalOverflow <= 2, `prmpt: desktop horizontal overflow ${hero.horizontalOverflow}`);

    const gallery = await inspectPhase(page, 1250);
    assert(['gallery', 'outro'].includes(gallery.phase), `prmpt: gallery phase did not activate (${gallery.phase})`);

    const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    const outro = await inspectPhase(page, maxScroll - 20);
    assert(outro.phase === 'outro', `prmpt: outro phase did not activate (${outro.phase})`);
    assert(outro.overlayOpacity > 0.7, `prmpt: white outro overlay opacity is ${outro.overlayOpacity}`);

    await page.screenshot({ path: `${outputDir}/${targetName}-desktop-prmpt.png`, fullPage: false });
    results.push({ scenario: 'desktop-scroll-phases', status: 'passed' });
  } catch (error) {
    await page.screenshot({ path: `${outputDir}/${targetName}-desktop-prmpt-failed.png`, fullPage: false }).catch(() => {});
    results.push({ scenario: 'desktop-scroll-phases', status: 'failed', error: error instanceof Error ? error.message : String(error) });
  } finally {
    await context.close();
  }
}

async function testMobileLayout(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  try {
    await waitForPrmpt(page);
    const state = await page.evaluate(() => ({
      horizontalOverflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      columns: getComputedStyle(document.querySelector('#gallery-grid')).gridTemplateColumns.split(' ').length,
      cursorDisplay: getComputedStyle(document.querySelector('.custom-cursor')).display,
      videoTop: document.querySelector('#main-canvas').getBoundingClientRect().top,
      cards: document.querySelectorAll('#gallery-grid .product-card').length,
    }));
    assert(state.horizontalOverflow <= 2, `prmpt: mobile horizontal overflow ${state.horizontalOverflow}`);
    assert(state.columns === 2, `prmpt: mobile gallery columns ${state.columns}`);
    assert(state.cursorDisplay === 'none', `prmpt: custom cursor still visible on touch (${state.cursorDisplay})`);
    assert(state.videoTop >= 200, `prmpt: mobile video did not move below header (${state.videoTop})`);
    assert(state.cards === 10, `prmpt: mobile gallery has ${state.cards} cards`);
    await page.screenshot({ path: `${outputDir}/${targetName}-mobile-prmpt.png`, fullPage: false });
    results.push({ scenario: 'mobile-layout-and-reduced-motion', status: 'passed' });
  } catch (error) {
    await page.screenshot({ path: `${outputDir}/${targetName}-mobile-prmpt-failed.png`, fullPage: false }).catch(() => {});
    results.push({ scenario: 'mobile-layout-and-reduced-motion', status: 'failed', error: error instanceof Error ? error.message : String(error) });
  } finally {
    await context.close();
  }
}

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
await testDesktopMotion(browser);
await testMobileLayout(browser);
await browser.close();

const failed = results.filter((item) => item.status === 'failed');
const report = [
  '# prmpt archive regression report',
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
