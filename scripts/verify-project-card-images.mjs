import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseURL = (process.env.TEST_BASE_URL || 'http://127.0.0.1:4173/resume').replace(/\/$/, '');
const outputDir = process.env.TEST_OUTPUT_DIR || 'test-results/project-card-images';
const expected = [
  'project-ai-ecommerce-page-a.jpg',
  'project-digitalhuman-page-a.jpg',
  'project-rpa-page-a.jpg',
  'project-yola-page-a.jpg',
  'project-webui-page-a.jpg',
  'project-soulcaller-page-a.jpg',
];

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
  await page.locator('#projects').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);

  const cards = page.locator('#projects button').filter({ has: page.locator('img') });
  if (await cards.count() !== 6) throw new Error(`Expected 6 project cards, found ${await cards.count()}`);

  const images = await cards.locator('img').evaluateAll((nodes) => nodes.map((image) => ({
    src: image.getAttribute('src') || '',
    naturalWidth: image.naturalWidth,
    naturalHeight: image.naturalHeight,
  })));

  for (const name of expected) {
    const image = images.find((item) => item.src.includes(name));
    if (!image) throw new Error(`Missing project card image ${name}`);
    if (image.naturalWidth < 1000 || image.naturalHeight < 500) {
      throw new Error(`Project image ${name} did not load at screenshot resolution: ${image.naturalWidth}x${image.naturalHeight}`);
    }
  }

  if (new Set(images.map((item) => item.src)).size !== expected.length) {
    throw new Error('Each project card must use its own corresponding subproject screenshot');
  }

  const geometry = await cards.evaluateAll((nodes) => nodes.map((card) => {
    const imagePanel = card.firstElementChild;
    const cardRect = card.getBoundingClientRect();
    const imageRect = imagePanel?.getBoundingClientRect();
    return {
      cardWidth: cardRect.width,
      cardHeight: cardRect.height,
      cardLeft: cardRect.left,
      imageWidth: imageRect?.width || 0,
      imageHeight: imageRect?.height || 0,
      imageLeft: imageRect?.left || 0,
    };
  }));

  for (const [index, item] of geometry.entries()) {
    if (item.cardWidth < 1000) throw new Error(`Card ${index + 1} is not full-width (${item.cardWidth}px)`);
    const imageRatio = item.imageWidth / item.cardWidth;
    if (imageRatio < 0.55 || imageRatio > 0.7) {
      throw new Error(`Card ${index + 1} screenshot panel ratio is ${imageRatio.toFixed(2)}, expected 0.55–0.70`);
    }
    if (Math.abs(item.cardLeft - item.imageLeft) > 2) throw new Error(`Card ${index + 1} screenshot is not positioned on the left`);
    if (item.imageHeight < item.cardHeight - 4) throw new Error(`Card ${index + 1} screenshot does not fill the card height`);
  }

  if (failedResponses.length) throw new Error(`Project image responses failed: ${failedResponses.join('; ')}`);

  await page.screenshot({ path: `${outputDir}/portfolio-project-cards.jpg`, type: 'jpeg', quality: 88, fullPage: true });
  await writeFile(`${outputDir}/report.md`, [
    '# Project card screenshot verification',
    '',
    '- Project cards: 6/6',
    '- Captured subproject images: 12',
    '- Unique primary project screenshots: 6/6',
    '- Full-width horizontal card layout: 6/6',
    '- Screenshot panels positioned on the left: 6/6',
    '- Missing/failed project image responses: 0',
    '',
  ].join('\n'), 'utf8');
} finally {
  await context.close();
  await browser.close();
}
