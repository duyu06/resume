import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseURL = (process.env.TEST_BASE_URL || 'http://127.0.0.1:4173/resume').replace(/\/$/, '');
const outputDir = process.env.TEST_OUTPUT_DIR || 'test-results/project-card-images';

const expectedSystems = [
  { id: '01', name: '果漾 AI', image: 'proj-01-a.png', captured: false, imageSide: 'right' },
  { id: '02', name: 'AI 电商素材生成平台', image: 'project-ai-ecommerce-page-a.jpg', captured: true, imageSide: 'right' },
  { id: '03', name: '数字人模型微调', image: 'proj-04-a.png', captured: false, imageSide: 'right' },
  { id: '04', name: 'yaoke 企业 AI 知识中台', image: 'project-yaoke-rag-page-a.svg', captured: false, imageSide: 'right' },
  { id: 'more', name: 'AI 客服数字人工作台', image: 'project-digitalhuman-page-a.jpg', captured: true, imageSide: 'left' },
];

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

async function ensureImageLoaded(image) {
  await image.scrollIntoViewIfNeeded();
  const state = await image.evaluate((element) =>
    new Promise((resolve) => {
      const target = element;
      const finish = () => resolve({
        src: target.getAttribute('src') || '',
        naturalWidth: target.naturalWidth,
        naturalHeight: target.naturalHeight,
      });
      if (target.complete) {
        finish();
        return;
      }
      target.addEventListener('load', finish, { once: true });
      target.addEventListener('error', finish, { once: true });
    }),
  );
  return state;
}

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const failedResponses = [];

page.on('response', (response) => {
  if (response.url().includes('/assets/projects/') && response.status() >= 400) {
    failedResponses.push(`${response.status()} ${response.url()}`);
  }
});

try {
  await page.goto(`${baseURL}/#projects`, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  const section = page.locator('#projects');
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  const systems = section.locator('[data-project-system]');
  assert(await systems.count() === expectedSystems.length, `Expected ${expectedSystems.length} project systems, found ${await systems.count()}`);

  const seenSources = [];
  for (const expected of expectedSystems) {
    const system = section.locator(`[data-project-system="${expected.id}"]`);
    assert(await system.count() === 1, `Missing project system ${expected.id}: ${expected.name}`);
    await system.scrollIntoViewIfNeeded();

    const text = (await system.textContent()) || '';
    assert(text.includes(expected.name), `Project system ${expected.id} lost title: ${expected.name}`);

    const image = system.locator('img').first();
    assert(await image.count() === 1, `Project system ${expected.id} has no primary image`);
    const state = await ensureImageLoaded(image);
    assert(state.src.includes(expected.image), `Project system ${expected.id} uses unexpected image: ${state.src}`);
    assert(state.naturalWidth > 0 && state.naturalHeight > 0, `Project image failed to load: ${state.src}`);
    if (expected.captured) {
      assert(
        state.naturalWidth >= 1000 && state.naturalHeight >= 500,
        `Captured project image ${expected.image} is below screenshot resolution: ${state.naturalWidth}x${state.naturalHeight}`,
      );
    }
    seenSources.push(state.src);

    const systemBox = await system.boundingBox();
    const imageBox = await image.boundingBox();
    assert(systemBox && systemBox.width >= 1000, `Project system ${expected.id} is not a full-width row`);
    assert(imageBox && imageBox.width >= 170, `Project system ${expected.id} image panel is too narrow`);

    const imageCenter = imageBox.x + imageBox.width / 2;
    const systemCenter = systemBox.x + systemBox.width / 2;
    if (expected.imageSide === 'right') {
      assert(imageCenter > systemCenter, `Project system ${expected.id} image is not positioned on the right`);
    } else {
      assert(imageCenter < systemCenter, `Project system ${expected.id} image is not positioned on the left`);
    }
  }

  assert(new Set(seenSources).size === expectedSystems.length, 'Each visible project system must use its own primary visual');
  assert(failedResponses.length === 0, `Project image responses failed: ${failedResponses.join('; ')}`);

  await section.screenshot({ path: `${outputDir}/portfolio-project-systems.jpg`, type: 'jpeg', quality: 88 });

  const capturedCount = expectedSystems.filter((item) => item.captured).length;
  await writeFile(`${outputDir}/report.md`, [
    '# Project visual verification',
    '',
    `- Visible project systems: ${expectedSystems.length}/${expectedSystems.length}`,
    `- Live-captured primary visuals in current portfolio: ${capturedCount}/${capturedCount}`,
    '- Unique primary visuals: 5/5',
    '- Selected Systems rows keep visuals on the right: 4/4',
    '- More Systems row keeps its visual on the left: 1/1',
    '- Missing/failed project image responses: 0',
    '',
  ].join('\n'), 'utf8');
} finally {
  await context.close();
  await browser.close();
}
