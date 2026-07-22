import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseURL = (process.env.TEST_BASE_URL || 'http://127.0.0.1:4173/resume').replace(/\/$/, '');
const outputDir = process.env.TEST_OUTPUT_DIR || 'test-results/all-demo-mode';
const targetName = process.env.TEST_TARGET || 'local-preview';
const tinyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nWQAAAAASUVORK5CYII=', 'base64');

const emptyReset = { expectedLocal: {}, absentLocal: [], expectedSession: {}, absentSession: [] };
const projects = [
  { slug: 'guoyang', title: '果漾 AI 多模态平台', timeout: 50000, reset: emptyReset },
  { slug: 'cross-border', title: 'YOLA 珠宝独立站', timeout: 40000, reset: emptyReset },
  {
    slug: 'ai-ecommerce',
    title: 'PrismPix AI 电商',
    timeout: 70000,
    reset: {
      expectedLocal: { prismpix_backend: '', prismpix_real: '0' },
      absentLocal: [],
      expectedSession: {},
      absentSession: [],
      modeSelector: '#mode-badge',
      modeText: '演示模式',
    },
  },
  {
    slug: 'digitalhuman',
    title: 'talk-to-fengge-live 数字人',
    timeout: 50000,
    reset: {
      expectedLocal: { fengge_backend: 'http://127.0.0.1:8791', fengge_region: 'cn', fengge_real: '0' },
      absentLocal: ['fengge_demo_characters', 'fengge_demo_personas'],
      expectedSession: { fengge_api_key: '' },
      absentSession: [],
      modeSelector: '#connection-badge',
      modeText: '演示模式',
    },
  },
  {
    slug: 'rpa',
    title: 'WebRPA 自动化系统',
    timeout: 90000,
    reset: {
      expectedLocal: { webrpa_backend: 'http://127.0.0.1:5921', webrpa_real: '0' },
      absentLocal: ['webrpa_demo_workflow'],
      expectedSession: {},
      absentSession: [],
      modeSelector: '#mode-badge',
      modeText: '浏览器演示',
    },
  },
  { slug: 'webui', title: 'Open WebUI 本地模型平台', timeout: 30000, reset: emptyReset, promiseRun: true },
  { slug: 'soulcaller', title: '叫魂者多 Agent 系统', timeout: 30000, reset: emptyReset, promiseRun: true },
];

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
    html: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  assert(Math.max(dimensions.html, dimensions.body) <= dimensions.innerWidth + 2, `${label}: horizontal overflow`);
}

async function waitForProgress(page, expected, timeout) {
  await page.waitForFunction(
    (value) => Number(document.querySelector('[data-demo-percent]')?.textContent?.replace('%', '')) === value,
    expected,
    { timeout },
  );
}

async function waitForReload(page, action) {
  const before = await page.evaluate(() => performance.timeOrigin);
  await action();
  await page.waitForFunction((origin) => performance.timeOrigin !== origin, before, { timeout: 15000 });
  await page.waitForSelector('.demo-mode-launcher', { timeout: 15000 });
}

async function testProject(browser, device, project) {
  const context = await browser.newContext({
    viewport: device.viewport,
    isMobile: device.isMobile,
    hasTouch: device.hasTouch,
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  const pageErrors = [];
  const sameOriginFailures = [];
  const origin = new URL(baseURL).origin;

  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (url.origin === origin && response.status() >= 400) sameOriginFailures.push(`${response.status()} ${url.pathname}`);
  });

  await page.route('https://raw.githubusercontent.com/keirosang/PrismPix/**', (route) => {
    route.fulfill({ status: 200, contentType: 'image/png', body: tinyPng });
  });

  try {
    await page.goto(`${baseURL}/demos/${project.slug}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('.demo-mode-launcher', { timeout: 20000 });
    await assertNoHorizontalOverflow(page, `${project.title} initial`);

    await page.locator('.demo-mode-launcher').click();
    const panel = page.locator('.demo-mode-panel');
    await panel.waitFor({ state: 'visible' });
    assert((await panel.locator('#demo-mode-title').textContent())?.includes(project.title), `${project.title}: wrong demo panel title`);
    assert((await panel.locator('.demo-mode-boundary').textContent())?.length > 20, `${project.title}: missing demo boundary`);

    if (device.isMobile) {
      const bounds = await panel.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return {
          left: rect.left,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          viewportWidth: window.visualViewport?.width ?? window.innerWidth,
          viewportHeight: window.visualViewport?.height ?? window.innerHeight,
        };
      });
      assert(
        bounds.left >= -2 && bounds.top >= -2 && bounds.right <= bounds.viewportWidth + 2 && bounds.bottom <= bounds.viewportHeight + 2,
        `${project.title}: mobile panel outside viewport (${JSON.stringify(bounds)})`,
      );
    }

    if (project.promiseRun) {
      const resolvedState = await page.evaluate(async () => {
        await window.__portfolioDemoMode.run();
        return window.__portfolioDemoMode.getState();
      });
      assert(resolvedState.progress === 100 && resolvedState.status === '演示完成', `${project.title}: run promise resolved before completion`);
    } else {
      await panel.locator('[data-demo-action="run"]').click();
    }

    await waitForProgress(page, 100, project.timeout);
    const successStatus = await panel.locator('[data-demo-status]').textContent();
    assert(successStatus && !successStatus.includes('失败'), `${project.title}: full demo ended in failure`);
    assert((await panel.locator('.demo-mode-log li.success').count()) > 0, `${project.title}: full demo produced no success log`);

    const runAction = panel.locator('[data-demo-action="run"]');
    await panel.locator('[data-demo-action="error"]').click();
    if (project.promiseRun) {
      await page.waitForFunction(() => document.body.classList.contains('demo-mode-busy'), null, { timeout: 5000 });
      assert(await runAction.isDisabled(), `${project.title}: visible run action stayed enabled during the error scenario`);
      await runAction.evaluate((button) => button.click());
      assert((await panel.locator('[data-demo-status]').textContent()) !== '准备演示', `${project.title}: disabled run action started a concurrent success flow`);
    }
    await page.waitForFunction(() => document.querySelector('[data-demo-status]')?.textContent === '异常已捕获', null, { timeout: 30000 });
    assert((await panel.locator('.demo-mode-log li.error').count()) > 0, `${project.title}: error demo produced no error log`);
    assert(!(await runAction.isDisabled()), `${project.title}: run action remained disabled after the error scenario`);

    if (project.slug === 'rpa') {
      await page.waitForFunction(() => document.querySelector('#log-list')?.textContent?.includes('人工驳回'), null, { timeout: 20000 });
      assert((await page.locator('#failure-count').textContent()) === '1', 'WebRPA: rejection did not increment failure count');
    }

    await assertNoHorizontalOverflow(page, `${project.title} after scenarios`);
    await page.screenshot({ path: `${outputDir}/${targetName}-${device.name}-${project.slug}.png`, fullPage: true });

    await page.evaluate((reset) => {
      const localKeys = [...Object.keys(reset.expectedLocal), ...reset.absentLocal];
      const sessionKeys = [...Object.keys(reset.expectedSession), ...reset.absentSession];
      localKeys.forEach((key) => localStorage.setItem(key, 'E2E_PERSISTED_VALUE'));
      sessionKeys.forEach((key) => sessionStorage.setItem(key, 'E2E_PERSISTED_VALUE'));
    }, project.reset);

    await waitForReload(page, () => panel.locator('[data-demo-action="reset"]').click());
    const resetState = await page.evaluate((reset) => ({
      local: Object.fromEntries([...Object.keys(reset.expectedLocal), ...reset.absentLocal].map((key) => [key, localStorage.getItem(key)])),
      session: Object.fromEntries([...Object.keys(reset.expectedSession), ...reset.absentSession].map((key) => [key, sessionStorage.getItem(key)])),
    }), project.reset);

    for (const [key, expected] of Object.entries(project.reset.expectedLocal)) {
      assert(resetState.local[key] === expected, `${project.title}: localStorage ${key} reset to ${JSON.stringify(resetState.local[key])}, expected ${JSON.stringify(expected)}`);
    }
    for (const key of project.reset.absentLocal) {
      assert(resetState.local[key] === null, `${project.title}: localStorage ${key} should be removed`);
    }
    for (const [key, expected] of Object.entries(project.reset.expectedSession)) {
      assert(resetState.session[key] === expected, `${project.title}: sessionStorage ${key} reset to ${JSON.stringify(resetState.session[key])}, expected ${JSON.stringify(expected)}`);
    }
    for (const key of project.reset.absentSession) {
      assert(resetState.session[key] === null, `${project.title}: sessionStorage ${key} should be removed`);
    }
    if (project.reset.modeSelector) {
      assert((await page.locator(project.reset.modeSelector).textContent())?.includes(project.reset.modeText), `${project.title}: reset did not restore demo mode badge`);
    }

    await page.locator('.demo-mode-launcher').click();
    await waitForProgress(page, 0, 10000);
    assert((await page.locator('[data-demo-status]').textContent()) === '等待开始', `${project.title}: reset did not restore initial state`);
    await assertNoHorizontalOverflow(page, `${project.title} after reset`);

    assert(pageErrors.length === 0, `${project.title}: uncaught errors: ${pageErrors.join(' | ')}`);
    assert(sameOriginFailures.length === 0, `${project.title}: same-origin failures: ${sameOriginFailures.join(' | ')}`);
    results.push({ device: device.name, project: project.slug, status: 'passed' });
  } catch (error) {
    await page.screenshot({ path: `${outputDir}/${targetName}-${device.name}-${project.slug}-failed.png`, fullPage: true }).catch(() => {});
    results.push({ device: device.name, project: project.slug, status: 'failed', error: error instanceof Error ? error.message : String(error) });
  } finally {
    await context.close();
  }
}

async function testCompactVisualViewport(browser, project) {
  const deviceName = 'mobile-visual-568x240';
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();

  try {
    await page.goto(`${baseURL}/demos/${project.slug}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('.demo-mode-launcher', { timeout: 20000 });
    await page.locator('.demo-mode-launcher').click();
    const panel = page.locator('.demo-mode-panel');
    await panel.waitFor({ state: 'visible' });

    await page.setViewportSize({ width: 568, height: 240 });
    await page.waitForFunction(() => {
      const element = document.querySelector('.demo-mode-panel');
      if (!element) return false;
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      return rect.top >= -2 && rect.bottom <= viewportHeight + 2;
    }, null, { timeout: 5000 });

    const bounds = await panel.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      return {
        top: rect.top,
        bottom: rect.bottom,
        height: rect.height,
        maxHeight: Number.parseFloat(getComputedStyle(element).maxHeight),
        viewportHeight,
      };
    });
    assert(bounds.top >= -2 && bounds.bottom <= bounds.viewportHeight + 2, `${project.title}: compact viewport panel is inaccessible (${JSON.stringify(bounds)})`);
    assert(bounds.maxHeight <= bounds.viewportHeight + 0.5, `${project.title}: max-height exceeds the visual viewport (${JSON.stringify(bounds)})`);
    await page.screenshot({ path: `${outputDir}/${targetName}-${deviceName}-${project.slug}.png`, fullPage: true });
    results.push({ device: deviceName, project: project.slug, status: 'passed' });
  } catch (error) {
    await page.screenshot({ path: `${outputDir}/${targetName}-${deviceName}-${project.slug}-failed.png`, fullPage: true }).catch(() => {});
    results.push({ device: deviceName, project: project.slug, status: 'failed', error: error instanceof Error ? error.message : String(error) });
  } finally {
    await context.close();
  }
}

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
for (const device of devices) {
  for (const project of projects) await testProject(browser, device, project);
}
for (const project of projects.filter((item) => item.promiseRun)) {
  await testCompactVisualViewport(browser, project);
}
await browser.close();

const passed = results.filter((item) => item.status === 'passed').length;
const failed = results.length - passed;
const report = [
  '# All-project demo mode end-to-end report',
  '',
  `- Target: ${targetName}`,
  `- Base URL: ${baseURL}`,
  `- Passed: ${passed}/${results.length}`,
  `- Failed: ${failed}`,
  '',
  '| Device | Project | Status | Error |',
  '|---|---|---|---|',
  ...results.map((item) => `| ${item.device} | ${item.project} | ${item.status} | ${(item.error || '').replaceAll('|', '\\|')} |`),
  '',
].join('\n');
await writeFile(`${outputDir}/report.md`, report, 'utf8');
await writeFile(`${outputDir}/report.json`, JSON.stringify({ baseURL, targetName, passed, failed, results }, null, 2), 'utf8');
console.log(report);
if (failed) process.exitCode = 1;