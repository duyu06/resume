import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseURL = (process.env.TEST_BASE_URL || 'http://127.0.0.1:4173/resume').replace(/\/$/, '');
const outputDir = process.env.TEST_OUTPUT_DIR || 'test-results/full-e2e';
const targetName = process.env.TEST_TARGET || 'local-preview';
const baseOrigin = new URL(baseURL).origin;
const tinyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nWQAAAAASUVORK5CYII=', 'base64');

const devices = [
  { name: 'desktop-1440', viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false },
  { name: 'mobile-390', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
];

const results = [];
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function assertNoHorizontalOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
  }));
  const widest = Math.max(dimensions.documentWidth, dimensions.bodyWidth);
  assert(widest <= dimensions.innerWidth + 2, `${label}: horizontal overflow ${widest}px > ${dimensions.innerWidth}px`);
}

async function assertPanelHidden(page, selector, label) {
  const hidden = await page.locator(selector).evaluate((element) => element.hidden && getComputedStyle(element).display === 'none');
  assert(hidden, `${label}: panel with hidden attribute is still visible`);
}

async function waitButtonEnabled(page, selector, timeout = 15000) {
  await page.waitForFunction((value) => !document.querySelector(value)?.disabled, selector, { timeout });
}

async function readDownloadJson(download) {
  const path = await download.path();
  assert(path, 'Download did not produce a local file');
  return JSON.parse(await readFile(path, 'utf8'));
}

async function installStableRoutes(page) {
  await page.route('https://raw.githubusercontent.com/keirosang/PrismPix/**', (route) => {
    route.fulfill({ status: 200, contentType: 'image/png', body: tinyPng });
  });
}

async function testPortfolio(page, device) {
  await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#projects', { timeout: 20000 });
  await page.locator('#projects').scrollIntoViewIfNeeded();
  await assertNoHorizontalOverflow(page, 'Portfolio');

  const cases = [
    ['AI 电商主图生成器', '/demos/ai-ecommerce/'],
    ['数字人风格对话模型微调', '/demos/digitalhuman/'],
    ['多账号运营 RPA 自动化系统', '/demos/rpa/'],
  ];

  for (const [name, hrefPart] of cases) {
    const card = page.locator('#projects button').filter({ hasText: name }).first();
    await card.scrollIntoViewIfNeeded();
    await card.click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible' });
    assert((await dialog.locator('#project-modal-title').textContent())?.includes(name), `Portfolio: wrong modal opened for ${name}`);
    const demoLink = dialog.getByRole('link', { name: /查看交互 Demo/ });
    assert((await demoLink.getAttribute('href'))?.includes(hrefPart), `Portfolio: ${name} demo link is incorrect`);

    const image = dialog.locator('img').first();
    const before = await image.getAttribute('src');
    await dialog.getByRole('button', { name: '下一张' }).click();
    const after = await image.getAttribute('src');
    assert(before !== after, `Portfolio: ${name} image carousel did not advance`);

    if (device.isMobile) {
      await dialog.locator('.project-modal-scroll').evaluate((element) => { element.scrollTop = element.scrollHeight; });
      const ctaBox = await demoLink.boundingBox();
      const closeBox = await dialog.getByRole('button', { name: '关闭项目详情' }).boundingBox();
      assert(ctaBox && ctaBox.bottom <= device.viewport.height + 1, `Portfolio mobile: ${name} CTA is obscured`);
      assert(closeBox && closeBox.top >= 0 && closeBox.bottom <= device.viewport.height, `Portfolio mobile: ${name} close button left viewport`);
    }

    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'detached' });
    const unlocked = await page.evaluate(() => !document.body.classList.contains('project-modal-open') && document.body.style.position !== 'fixed');
    assert(unlocked, `Portfolio: body scroll remained locked after closing ${name}`);
  }
}

async function testPrismPix(page, device) {
  await installStableRoutes(page);
  await page.goto(`${baseURL}/demos/ai-ecommerce/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#analyze');
  await assertPanelHidden(page, '#connection-panel', 'PrismPix');
  await assertNoHorizontalOverflow(page, 'PrismPix');

  await page.locator('#connection-toggle').click();
  await page.locator('#backend-url').fill('https://mock.prismpix.test');
  await page.locator('#backend-url').press('Tab');
  assert(await page.evaluate(() => localStorage.getItem('prismpix_backend') === 'https://mock.prismpix.test'), 'PrismPix: backend URL was not persisted');
  await page.locator('#connection-toggle').click();

  await page.locator('#image-file').setInputFiles({
    name: 'e2e-product.png',
    mimeType: 'image/png',
    buffer: tinyPng,
  });
  assert((await page.locator('#file-label').textContent())?.includes('e2e-product.png'), 'PrismPix: uploaded file was not reflected in UI');

  await page.locator('#sku').fill('E2E-SKU');
  await page.locator('#category').selectOption({ label: '美妆/护肤' });
  await page.locator('#style').selectOption('科技 tech');
  await page.locator('#platform').selectOption('Shopify');
  await page.locator('#language').selectOption('en');
  await page.locator('#requirements').fill('E2E requirement: preserve label and leave CTA space.');

  await page.locator('#analyze').click();
  await page.waitForFunction(() => document.querySelector('#analysis-state')?.textContent === '分析完成', null, { timeout: 10000 });
  assert((await page.locator('#product-facts').textContent())?.includes('E2E-SKU'), 'PrismPix: SKU did not reach analysis output');
  assert((await page.locator('#campaign-copy').textContent())?.includes('Shopify'), 'PrismPix: platform did not reach campaign output');

  await page.locator('#generate-prompts').click();
  await page.waitForFunction(() => document.querySelectorAll('.prompt-item').length === 14, null, { timeout: 10000 });
  await page.locator('#expand-prompts').click();
  assert((await page.locator('.prompt-item.open').count()) === 14, 'PrismPix: expand-all did not open all prompts');
  const firstPrompt = page.locator('.prompt-body textarea').first();
  await firstPrompt.fill(`${await firstPrompt.inputValue()} E2E_MARKER`);

  const promptDownloadPromise = page.waitForEvent('download');
  await page.locator('#download-prompts').click();
  const promptDownload = await promptDownloadPromise;
  assert(promptDownload.suggestedFilename() === 'E2E-SKU-prompts.json', 'PrismPix: prompt export filename is wrong');
  const promptJson = await readDownloadJson(promptDownload);
  assert(promptJson.length === 14 && promptJson[0].prompt.includes('E2E_MARKER'), 'PrismPix: edited prompt was not exported');

  await page.locator('#generate-images').click();
  await page.waitForFunction(() => document.querySelector('#stage-images')?.classList.contains('active'), null, { timeout: 12000 });
  assert((await page.locator('.image-card').count()) === 14, 'PrismPix: full mode did not render 14 modules');
  await page.locator('.module-filter [data-prefix="H"]').click();
  assert(await page.locator('.image-card').evaluateAll((cards) => cards.filter((card) => !card.hidden).length) === 5, 'PrismPix: H filter did not show 5 main images');
  await page.locator('.module-filter [data-prefix="D"]').click();
  assert(await page.locator('.image-card').evaluateAll((cards) => cards.filter((card) => !card.hidden).length) === 9, 'PrismPix: D filter did not show 9 detail images');
  await page.locator('.module-filter [data-prefix="all"]').click();

  if (!device.isMobile) {
    let analysisStatusCalls = 0;
    let promptStatusCalls = 0;
    let imageStatusCalls = 0;
    await page.route('https://mock.prismpix.test/**', async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname === '/') return route.fulfill({ status: 200, body: 'PrismPix mock' });
      if (url.pathname === '/api/generate') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ task_id: 'analysis-task' }) });
      if (url.pathname === '/api/generate-prompts') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ task_id: 'prompt-task' }) });
      if (url.pathname === '/api/generate-images') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ task_id: 'image-task' }) });
      if (url.pathname === '/api/status/analysis-task') {
        analysisStatusCalls += 1;
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'done', progress: [{ stage: 'done' }], result: { workspace: 'output/E2E' } }) });
      }
      if (url.pathname === '/api/status/prompt-task') {
        promptStatusCalls += 1;
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'done', progress: [{ stage: 'stage3' }], result: { workspace: 'output/E2E' } }) });
      }
      if (url.pathname === '/api/status/image-task') {
        imageStatusCalls += 1;
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'done', progress: [{ stage: 'image_done' }], result: { workspace: 'output/E2E' } }) });
      }
      if (url.pathname === '/api/prompts') {
        const prompts = Object.fromEntries(Array.from({ length: 14 }, (_, index) => {
          const code = index < 5 ? `H${index + 1}` : `D${index - 4}`;
          return [code, `Mock ${code} prompt`];
        }));
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(prompts) });
      }
      if (url.pathname === '/api/image') return route.fulfill({ status: 200, contentType: 'image/png', body: tinyPng });
      return route.fulfill({ status: 404, body: 'not found' });
    });

    await page.locator('#connection-toggle').click();
    await page.locator('#real-mode').check();
    await page.locator('#test-backend').click();
    await page.waitForFunction(() => document.querySelector('#toast')?.textContent?.includes('连接成功'));
    await page.locator('#connection-toggle').click();
    await page.locator('#analyze').click();
    await page.waitForFunction(() => document.querySelector('#analysis-state')?.textContent === '分析完成', null, { timeout: 10000 });
    await page.locator('#generate-prompts').click();
    await page.waitForFunction(() => document.querySelectorAll('.prompt-item').length === 14, null, { timeout: 10000 });
    await page.locator('#generate-images').click();
    await page.waitForFunction(() => document.querySelector('#stage-images')?.classList.contains('active'), null, { timeout: 10000 });
    assert(analysisStatusCalls > 0 && promptStatusCalls > 0 && imageStatusCalls > 0, 'PrismPix: real-backend adapter did not poll all task types');
    await page.locator('#connection-toggle').click();
    await page.locator('#real-mode').uncheck();
    await page.locator('#connection-toggle').click();
  }

  await page.reload({ waitUntil: 'domcontentloaded' });
  assert((await page.locator('#backend-url').inputValue()) === 'https://mock.prismpix.test', 'PrismPix: backend setting did not survive reload');
  assert((await page.locator('#mode-badge').textContent()) === '演示模式', 'PrismPix: mode did not reset to demo after unchecking real mode');
  await assertNoHorizontalOverflow(page, 'PrismPix after reload');
}

async function testDigitalHuman(page, device, context) {
  await page.goto(`${baseURL}/demos/digitalhuman/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.character-card', { timeout: 10000 });
  await assertPanelHidden(page, '#settings-panel', 'Digital human');
  await assertNoHorizontalOverflow(page, 'Digital human');

  await page.locator('#settings-toggle').click();
  await page.locator('#backend-url').fill('https://mock.fengge.test');
  await page.locator('#region').selectOption('global');
  await page.locator('#api-key').fill('e2e_session_key');
  await page.locator('#api-key').press('Tab');
  assert(await page.evaluate(() => sessionStorage.getItem('fengge_api_key') === 'e2e_session_key'), 'Digital human: API key was not stored in sessionStorage');
  assert(await page.evaluate(() => localStorage.getItem('fengge_api_key') === null), 'Digital human: API key leaked into localStorage');
  await page.locator('#settings-toggle').click();

  await page.locator('#new-character').click();
  await page.waitForSelector('#view-editor.active');
  await page.locator('#character-name').fill('E2E 数字人');
  await page.locator('#avatar-url').fill('https://example.com/e2e-avatar.png');
  await page.locator('#voice').selectOption('__custom__');
  await page.locator('#custom-voice').fill('e2e_custom_voice');
  await page.locator('#call-mode').selectOption('audio');
  await page.locator('#persona-preset').selectOption('product');
  assert((await page.locator('#persona').inputValue()).includes('AI 产品顾问'), 'Digital human: persona preset was not applied');
  await page.locator('#character-form button[type="submit"]').click();
  await page.waitForSelector('#view-library.active');
  assert((await page.locator('.character-card').filter({ hasText: 'E2E 数字人' }).count()) === 1, 'Digital human: new character was not saved');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.character-card');
  const savedCard = page.locator('.character-card').filter({ hasText: 'E2E 数字人' });
  assert((await savedCard.count()) === 1, 'Digital human: character did not persist after reload');
  await savedCard.locator('.edit').click();
  await page.locator('#character-name').fill('E2E 数字人已编辑');
  const details = page.locator('.voice-clone');
  await details.locator('summary').click();
  await page.locator('#audio-url').fill('https://example.com/authorized-reference.mp3');
  await page.locator('#clone-name').fill('e2evoice');
  await page.locator('#clone-voice').click();
  await page.waitForFunction(() => document.querySelector('#clone-status')?.textContent?.includes('已克隆'), null, { timeout: 5000 });
  await page.locator('#save-call').click();
  await page.waitForSelector('#view-call.active');
  await waitButtonEnabled(page, '#hangup', 12000);
  assert((await page.locator('#stepper li.done').count()) === 5, 'Digital human: demo connection stepper did not complete');
  assert((await page.locator('#live-id').textContent())?.startsWith('live_demo_'), 'Digital human: demo live ID was not created');
  assert(await page.locator('#cam-toggle').isDisabled(), 'Digital human: camera should be disabled for audio-only role');
  await page.locator('#mic-toggle').click();
  assert((await page.locator('#mic-toggle').textContent())?.includes('已关闭'), 'Digital human: microphone toggle state did not change');
  await page.locator('#query-live').click();
  assert((await page.locator('#live-status').textContent()) === 'active', 'Digital human: query did not update status to active');
  await delay(1100);
  assert((await page.locator('#call-timer').textContent()) !== '00:00', 'Digital human: call timer did not advance');
  await page.locator('#hangup').click();
  assert((await page.locator('#live-status').textContent()) === 'ended', 'Digital human: hangup did not end session');

  await page.locator('.view-tabs [data-view="diagnostics"]').click();
  await page.waitForSelector('#view-diagnostics.active');
  await context.grantPermissions(['camera', 'microphone'], { origin: baseOrigin });
  await page.locator('#device-check').click();
  await page.waitForFunction(() => document.querySelector('#device-result')?.textContent !== '尚未检测', null, { timeout: 10000 });
  assert(!(await page.locator('#device-result').textContent())?.includes('失败'), 'Digital human: fake camera/microphone device check failed');
  await page.locator('#clear-log').click();
  assert((await page.locator('#log .log-row').count()) === 0, 'Digital human: diagnostics log did not clear');

  if (!device.isMobile) {
    await page.route('https://mock.fengge.test/**', async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname === '/api/config') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ has_key: true, avatar: {}, default_voice: 'Raymond', call_mode: 'video' }) });
      if (url.pathname === '/api/characters' && route.request().method() === 'GET') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ characters: [{ id: 'server-e2e', name: '服务端数字人', image_uri: '', voice: 'Raymond', call_mode: 'video', persona: '服务端人格' }] }) });
      if (url.pathname === '/api/personas') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ personas: [{ id: 'server-persona', name: '服务端人格', persona: '服务端人格内容' }] }) });
      if (url.pathname === '/api/live' && route.request().method() === 'POST') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ live: { id: 'live_mock_e2e', status: 'created' }, rtc: { channel_name: 'rtc_mock', user_id: 'user_mock' }, ws: { url: 'wss://mock' } }) });
      if (url.pathname === '/api/live' && route.request().method() === 'GET') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ live: { id: 'live_mock_e2e', status: 'active' } }) });
      if (url.pathname === '/api/voice/clone') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ voice: 'server_voice' }) });
      if (url.pathname === '/api/characters' && route.request().method() === 'POST') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ character: JSON.parse(route.request().postData() || '{}') }) });
      return route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ error: 'not found' }) });
    });
    await page.locator('#settings-toggle').click();
    await page.locator('#real-mode').check();
    await page.locator('#connect-backend').click();
    await page.waitForFunction(() => document.querySelector('#connection-badge')?.textContent?.includes('后端已连接'), null, { timeout: 10000 });
    await page.locator('#settings-toggle').click();
    const serverCard = page.locator('.character-card').filter({ hasText: '服务端数字人' });
    await serverCard.locator('.call').click();
    await waitButtonEnabled(page, '#hangup', 10000);
    assert((await page.locator('#live-id').textContent()) === 'live_mock_e2e', 'Digital human: real-backend adapter did not use mocked live session');
    await page.locator('#hangup').click();
    await page.locator('#settings-toggle').click();
    await page.locator('#real-mode').uncheck();
    await page.locator('#settings-toggle').click();
  }

  await assertNoHorizontalOverflow(page, 'Digital human final');
}

async function waitWorkflowStopped(page, timeout = 20000) {
  await page.waitForFunction(() => !document.querySelector('#run')?.disabled, null, { timeout });
}

async function resumeBreakpointIfNeeded(page) {
  await page.waitForFunction(() => {
    const run = document.querySelector('#run');
    const pause = document.querySelector('#pause');
    return !run?.disabled || pause?.textContent?.includes('继续');
  }, null, { timeout: 15000 });
  if ((await page.locator('#pause').textContent())?.includes('继续')) await page.locator('#pause').click();
}

async function testWebRPA(page, device) {
  await page.goto(`${baseURL}/demos/rpa/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.node-card');
  await assertPanelHidden(page, '#backend-panel', 'WebRPA');
  await assertNoHorizontalOverflow(page, 'WebRPA');

  await page.locator('#backend-toggle').click();
  await page.locator('#backend-url').fill('https://mock.webrpa.test');
  await page.locator('#backend-url').press('Tab');
  await page.locator('#real-mode').check();
  assert((await page.locator('#mode-badge').textContent()) === '本地执行器模式', 'WebRPA: local-executor mode badge did not update');
  await page.locator('#real-mode').uncheck();
  await page.locator('#backend-toggle').click();

  await page.locator('#module-search').fill('HTTP');
  assert((await page.locator('.module').count()) === 1, 'WebRPA: module search did not isolate HTTP module');
  await page.locator('#module-search').fill('');
  await page.locator('.category-tabs [data-category="web"]').click();
  assert((await page.locator('.module').count()) >= 4, 'WebRPA: web category filter returned too few modules');
  await page.locator('.category-tabs [data-category="all"]').click();

  const initialNodes = await page.locator('.node-card').count();
  await page.locator('.module').filter({ hasText: 'HTTP 请求' }).click();
  await page.waitForFunction((count) => document.querySelectorAll('.node-card').length === count + 1, initialNodes);
  if (!device.isMobile) {
    const beforeDrag = await page.locator('.node-card').count();
    await page.locator('.module').filter({ hasText: '显式等待' }).dragTo(page.locator('#canvas'), { targetPosition: { x: 500, y: 280 } });
    await page.waitForFunction((count) => document.querySelectorAll('.node-card').length === count + 1, beforeDrag);
  }

  const firstNode = page.locator('.node-card').first();
  await firstNode.click();
  await page.locator('#node-params').fill('{bad json');
  await page.locator('#node-form button[type="submit"]').click();
  await page.waitForFunction(() => document.querySelector('#toast')?.textContent?.includes('JSON 无效'));
  await page.locator('#node-name').fill('E2E 测试触发器');
  await page.locator('#node-params').fill('{"cron":"0 9 * * *","e2e":true}');
  await page.locator('#node-retry').check();
  await page.locator('#node-form button[type="submit"]').click();
  assert((await firstNode.textContent())?.includes('E2E 测试触发器'), 'WebRPA: valid node edit was not applied');

  if (!device.isMobile) {
    const oldLeft = Number.parseFloat((await firstNode.evaluate((element) => element.style.left)) || '0');
    const header = firstNode.locator('.node-head');
    const box = await header.boundingBox();
    assert(box, 'WebRPA: node header has no bounding box');
    await page.mouse.move(box.x + 20, box.y + 20);
    await page.mouse.down();
    await page.mouse.move(box.x + 120, box.y + 70, { steps: 5 });
    await page.mouse.up();
    const newLeft = Number.parseFloat((await firstNode.evaluate((element) => element.style.left)) || '0');
    assert(newLeft > oldLeft + 50, 'WebRPA: node drag did not change position');
  }

  await page.locator('#zoom-in').click();
  assert((await page.locator('#zoom-value').textContent()) === '110%', 'WebRPA: zoom-in failed');
  await page.locator('#fit').click();
  assert((await page.locator('#zoom-value').textContent()) === '100%', 'WebRPA: fit did not reset zoom');

  await page.locator('#save-local').click();
  assert((await page.locator('#workflow-state').textContent()) === '已保存', 'WebRPA: save did not update workflow state');
  const exportPromise = page.waitForEvent('download');
  await page.locator('#export-json').click();
  const exported = await readDownloadJson(await exportPromise);
  assert(exported.nodes.some((node) => node.name === 'E2E 测试触发器'), 'WebRPA: exported JSON missed edited node');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.node-card');
  assert((await page.locator('.node-card').filter({ hasText: 'E2E 测试触发器' }).count()) === 1, 'WebRPA: saved workflow did not persist after reload');

  await page.locator('#run').click();
  await page.waitForFunction(() => !document.querySelector('#approval-card')?.hidden, null, { timeout: 20000 });
  assert((await page.locator('#current-node').textContent()) === '人工审批', 'WebRPA: workflow did not pause at human approval');
  await page.locator('#approve').click();
  await resumeBreakpointIfNeeded(page);
  await waitWorkflowStopped(page, 22000);
  assert(Number(await page.locator('#success-count').textContent()) >= 7, 'WebRPA: approved workflow did not complete successfully');
  assert((await page.locator('#failure-count').textContent()) === '0', 'WebRPA: approved workflow unexpectedly recorded failures');

  await page.locator('#run').click();
  await page.waitForFunction(() => !document.querySelector('#approval-card')?.hidden, null, { timeout: 20000 });
  await page.locator('#reject').click();
  await waitWorkflowStopped(page, 10000);
  assert((await page.locator('#failure-count').textContent()) === '1', 'WebRPA: rejected approval did not record one failure');
  assert((await page.locator('#log-list').textContent())?.includes('人工驳回'), 'WebRPA: rejection was not written to audit log');

  await page.locator('#step').click();
  await waitWorkflowStopped(page, 10000);
  assert((await page.locator('#success-count').textContent()) === '1', 'WebRPA: single-step execution did not complete exactly one node');

  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('#new-workflow').click();
  assert((await page.locator('.node-card').count()) === 0, 'WebRPA: new workflow did not clear canvas');
  const importedWorkflow = {
    version: 1,
    name: 'E2E Imported',
    nodes: [
      { id: 'i1', type: 'trigger', name: '导入触发器', x: 60, y: 120, params: { cron: '* * * * *' }, breakpoint: false, retry: false },
      { id: 'i2', type: 'writeback', name: '导入回写', x: 300, y: 120, params: { target: 'e2e.csv' }, breakpoint: false, retry: true },
    ],
  };
  await page.locator('#import-json').setInputFiles({ name: 'workflow.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(importedWorkflow)) });
  await page.waitForFunction(() => document.querySelectorAll('.node-card').length === 2);
  assert((await page.locator('.node-card').last().textContent())?.includes('导入回写'), 'WebRPA: JSON import did not render imported nodes');
  await assertNoHorizontalOverflow(page, 'WebRPA final');
}

async function runCase(browser, device, slug, label, test) {
  const context = await browser.newContext({ ...device, reducedMotion: 'reduce', acceptDownloads: true });
  const page = await context.newPage();
  const pageErrors = [];
  const failedSameOriginResponses = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('response', (response) => {
    if (response.url().startsWith(baseOrigin) && response.status() >= 400) failedSameOriginResponses.push(`${response.status()} ${response.url()}`);
  });

  const started = Date.now();
  try {
    await test(page, device, context);
    await assertNoHorizontalOverflow(page, label);
    assert(pageErrors.length === 0, `${label}: uncaught page errors: ${pageErrors.join(' | ')}`);
    assert(failedSameOriginResponses.length === 0, `${label}: failed same-origin responses: ${failedSameOriginResponses.join(' | ')}`);
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      document.querySelectorAll('.toast').forEach((element) => element.classList.remove('show'));
    });
    await delay(150);
    await page.screenshot({ path: `${outputDir}/${targetName}-${device.name}-${slug}.png`, fullPage: false });
    results.push({ target: targetName, device: device.name, scenario: label, status: 'passed', duration_ms: Date.now() - started });
  } catch (error) {
    await page.screenshot({ path: `${outputDir}/${targetName}-${device.name}-${slug}-failed.png`, fullPage: false }).catch(() => {});
    results.push({ target: targetName, device: device.name, scenario: label, status: 'failed', duration_ms: Date.now() - started, error: error.message, page_errors: pageErrors, failed_responses: failedSameOriginResponses });
  } finally {
    await context.close();
  }
}

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', '--autoplay-policy=no-user-gesture-required'],
});

try {
  for (const device of devices) {
    await runCase(browser, device, 'portfolio', 'Portfolio navigation and modal', testPortfolio);
    await runCase(browser, device, 'prismpix', 'PrismPix complete workflow', testPrismPix);
    await runCase(browser, device, 'digitalhuman', 'Digital human complete workflow', testDigitalHuman);
    await runCase(browser, device, 'webrpa', 'WebRPA complete workflow', testWebRPA);
  }
} finally {
  await browser.close();
}

const summary = {
  target: targetName,
  base_url: baseURL,
  generated_at: new Date().toISOString(),
  passed: results.filter((result) => result.status === 'passed').length,
  failed: results.filter((result) => result.status === 'failed').length,
  total: results.length,
  results,
};
await writeFile(`${outputDir}/report.json`, JSON.stringify(summary, null, 2));
await writeFile(`${outputDir}/report.md`, [
  `# End-to-end test report — ${targetName}`,
  '',
  `- Base URL: ${baseURL}`,
  `- Passed: ${summary.passed}/${summary.total}`,
  `- Failed: ${summary.failed}`,
  '',
  '| Device | Scenario | Status | Duration |',
  '|---|---|---:|---:|',
  ...results.map((result) => `| ${result.device} | ${result.scenario} | ${result.status} | ${result.duration_ms} ms |`),
  '',
  ...results.filter((result) => result.status === 'failed').map((result) => `## Failure: ${result.device} / ${result.scenario}\n\n${result.error}\n`),
].join('\n'));

console.table(results);
console.log(`E2E report: ${outputDir}/report.json`);
if (summary.failed > 0) process.exit(1);
