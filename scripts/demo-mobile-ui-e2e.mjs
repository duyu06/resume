import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseURL = (process.env.TEST_BASE_URL || 'http://127.0.0.1:4173/resume').replace(/\/$/, '');
const outputDir = process.env.TEST_OUTPUT_DIR || 'test-results/demo-mobile-ui';
const targetName = process.env.TEST_TARGET || 'local-preview';

const projects = [
  { slug: 'guoyang', kicker: 'AI CONTENT WORKFLOW', logic: false },
  { slug: 'cross-border', kicker: 'YOLA / ATELIER EXPERIENCE', logic: true },
  { slug: 'ai-ecommerce', kicker: 'VISUAL PRODUCTION LAB', logic: false },
  { slug: 'digitalhuman', kicker: 'REALTIME CHARACTER LAB', logic: false },
  { slug: 'rpa', kicker: 'AUTOMATION RUNBOOK', logic: false },
  { slug: 'webui', kicker: 'LOCAL INFERENCE CONSOLE', logic: true },
  { slug: 'soulcaller', kicker: 'NARRATIVE ORCHESTRATION', logic: true },
];

const results = [];
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const overlaps = (a, b) => !(
  a.right <= b.left ||
  b.right <= a.left ||
  a.bottom <= b.top ||
  b.bottom <= a.top
);

async function visibleProvenanceMarkers(page) {
  return page.evaluate(() => {
    const pattern = /\b(?:ADAPTER|UPSTREAM|COMPATIBLE|COMPATIBILITY\s+DEMO)\b/i;
    return [...document.querySelectorAll('body *')]
      .filter((element) => {
        if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(element.tagName)) return false;
        if (element.children.length > 0) return false;
        const text = element.textContent?.trim() || '';
        if (!text || text.length > 180 || !pattern.test(text)) return false;
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && Number.parseFloat(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
      })
      .map((element) => ({ tag: element.tagName, className: element.className, text: element.textContent?.trim() }));
  });
}

async function testProject(browser, project) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();

  try {
    await page.goto(`${baseURL}/demos/${project.slug}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForFunction(
      (slug) => document.body.dataset.demoModeTheme === slug && Boolean(document.querySelector('.demo-mode-launcher')),
      project.slug,
      { timeout: 20000 },
    );

    if (project.logic) {
      await page.waitForSelector('.motion-enrich-launcher', { timeout: 15000 });
    }

    const markers = await visibleProvenanceMarkers(page);
    assert(markers.length === 0, `${project.slug}: provenance markers remain ${JSON.stringify(markers)}`);

    const controls = await page.evaluate((hasLogic) => {
      const read = (selector) => {
        const element = document.querySelector(selector);
        if (!element) return null;
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
          display: style.display,
          visibility: style.visibility,
        };
      };
      return {
        viewport: { width: innerWidth, height: innerHeight },
        demo: read('.demo-mode-launcher'),
        logic: hasLogic ? read('.motion-enrich-launcher') : null,
        status: read('.motion-enrich-status'),
        yolaCta: read('.hero-content .capsule-button'),
      };
    }, project.logic);

    assert(controls.demo, `${project.slug}: demo launcher missing`);
    assert(controls.demo.top >= 58 && controls.demo.bottom <= 180, `${project.slug}: demo launcher not in the mobile top utility row ${JSON.stringify(controls.demo)}`);
    assert(controls.demo.bottom < controls.viewport.height - 180, `${project.slug}: demo launcher still occupies the bottom content area`);

    if (project.logic) {
      assert(controls.logic, `${project.slug}: product logic launcher missing`);
      assert(controls.logic.top >= 58 && controls.logic.bottom <= 180, `${project.slug}: logic launcher not in the mobile top utility row ${JSON.stringify(controls.logic)}`);
      assert(!overlaps(controls.demo, controls.logic), `${project.slug}: mobile utility controls overlap`);
    }

    if (controls.status) {
      assert(controls.status.display === 'none' || controls.status.visibility === 'hidden', `${project.slug}: redundant mobile status pill is still visible`);
    }

    if (project.slug === 'cross-border') {
      assert(
        controls.yolaCta &&
          !overlaps(controls.demo, controls.yolaCta) &&
          (!controls.logic || !overlaps(controls.logic, controls.yolaCta)),
        `cross-border: utility controls overlap the YOLA hero CTA (${JSON.stringify(controls)})`,
      );
    }

    await page.locator('.demo-mode-launcher').click();
    const panel = page.locator('.demo-mode-panel');
    await panel.waitFor({ state: 'visible', timeout: 10000 });

    const panelState = await panel.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const bodyStyle = getComputedStyle(document.body);
      return {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        viewportWidth: innerWidth,
        viewportHeight: innerHeight,
        kicker: element.querySelector('.demo-mode-kicker')?.textContent?.trim() || '',
        theme: document.body.dataset.demoModeTheme || '',
        accent: bodyStyle.getPropertyValue('--demo-accent').trim(),
        background: getComputedStyle(element).backgroundColor,
      };
    });

    assert(panelState.theme === project.slug, `${project.slug}: wrong panel theme ${panelState.theme}`);
    assert(panelState.kicker === project.kicker, `${project.slug}: wrong panel kicker ${panelState.kicker}`);
    assert(panelState.accent.length > 0, `${project.slug}: missing project accent`);
    assert(panelState.left >= -1 && panelState.right <= panelState.viewportWidth + 1, `${project.slug}: themed panel exceeds viewport width`);
    assert(panelState.top >= -1 && panelState.bottom <= panelState.viewportHeight + 1, `${project.slug}: themed panel exceeds viewport height`);

    await page.screenshot({ path: `${outputDir}/${targetName}-mobile-${project.slug}.png`, fullPage: true });
    results.push({ project: project.slug, status: 'passed', theme: panelState.theme, kicker: panelState.kicker });
  } catch (error) {
    await page.screenshot({ path: `${outputDir}/${targetName}-mobile-${project.slug}-failed.png`, fullPage: true }).catch(() => {});
    results.push({ project: project.slug, status: 'failed', error: error instanceof Error ? error.message : String(error) });
  } finally {
    await context.close();
  }
}

async function testYolaMobileSnap(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();

  try {
    await page.goto(`${baseURL}/demos/cross-border/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('.awards-grid .product-card', { timeout: 15000 });
    const grid = page.locator('.awards-grid');
    await grid.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);

    const snapCss = await grid.evaluate((element) => ({
      type: getComputedStyle(element).scrollSnapType,
      aligns: [...element.querySelectorAll('.product-card')].map((card) => getComputedStyle(card).scrollSnapAlign),
    }));
    assert(snapCss.type.includes('x') && snapCss.type.includes('mandatory'), `YOLA: missing mandatory horizontal snap (${snapCss.type})`);
    assert(snapCss.aligns.every((value) => value.includes('center')), `YOLA: product cards do not use center snap (${snapCss.aligns.join(', ')})`);

    const box = await grid.boundingBox();
    assert(box && box.width > 0 && box.height > 0, 'YOLA: mobile product rail has no interactive geometry');
    await page.mouse.move(box.x + box.width / 2, box.y + Math.min(box.height / 2, 280));

    const observed = [];
    let previousScrollLeft = -1;
    for (let step = 0; step < 4; step += 1) {
      await page.mouse.wheel(360, 0);
      await page.waitForTimeout(850);
      const state = await grid.evaluate((element) => {
        const railRect = element.getBoundingClientRect();
        const railCenter = railRect.left + railRect.width / 2;
        const cards = [...element.querySelectorAll('.product-card')].map((card, index) => {
          const rect = card.getBoundingClientRect();
          return {
            index,
            distance: Math.abs(rect.left + rect.width / 2 - railCenter),
          };
        });
        cards.sort((a, b) => a.distance - b.distance);
        return {
          scrollLeft: element.scrollLeft,
          nearest: cards[0],
        };
      });

      assert(state.scrollLeft >= previousScrollLeft, `YOLA: horizontal wheel input moved backwards (${previousScrollLeft} -> ${state.scrollLeft})`);
      assert(state.nearest.distance <= 18, `YOLA: rail did not settle on a card center (${JSON.stringify(state)})`);
      previousScrollLeft = state.scrollLeft;
      observed.push(state.nearest.index);
    }

    const unique = [...new Set(observed)];
    assert(unique.length >= 3, `YOLA: real horizontal wheel input reached too few snapped cards (${unique.join(', ')})`);
    await page.screenshot({ path: `${outputDir}/${targetName}-mobile-cross-border-scroll-snap.png`, fullPage: true });
    results.push({ project: 'cross-border-scroll-snap', status: 'passed', theme: 'cross-border', kicker: 'REAL WHEEL INPUT' });
  } catch (error) {
    await page.screenshot({ path: `${outputDir}/${targetName}-mobile-cross-border-scroll-snap-failed.png`, fullPage: true }).catch(() => {});
    results.push({ project: 'cross-border-scroll-snap', status: 'failed', error: error instanceof Error ? error.message : String(error) });
  } finally {
    await context.close();
  }
}

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
for (const project of projects) await testProject(browser, project);
await testYolaMobileSnap(browser);
await browser.close();

const failed = results.filter((item) => item.status === 'failed');
const report = [
  '# Mobile demo UI report',
  '',
  `- Target: ${targetName}`,
  `- Base URL: ${baseURL}`,
  `- Passed: ${results.length - failed.length}/${results.length}`,
  `- Failed: ${failed.length}`,
  '',
  '| Project | Status | Theme | Kicker | Error |',
  '|---|---|---|---|---|',
  ...results.map((item) => `| ${item.project} | ${item.status} | ${item.theme || ''} | ${item.kicker || ''} | ${(item.error || '').replaceAll('|', '\\|')} |`),
  '',
].join('\n');

await writeFile(`${outputDir}/report.md`, report, 'utf8');
await writeFile(`${outputDir}/report.json`, JSON.stringify({ baseURL, targetName, results }, null, 2), 'utf8');
console.log(report);
if (failed.length) process.exitCode = 1;
