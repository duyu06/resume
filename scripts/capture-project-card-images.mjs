import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseURL = (process.env.TEST_BASE_URL || 'http://127.0.0.1:4173/resume').replace(/\/$/, '');
const outputDir = path.resolve('public/assets/projects');

const projects = [
  {
    slug: 'ai-ecommerce',
    asset: 'ai-ecommerce',
    detail: { selector: '#stage-images', fraction: 0.58 },
  },
  {
    slug: 'digitalhuman',
    asset: 'digitalhuman',
    detail: { selector: '#dashboard', fraction: 0.72 },
  },
  {
    slug: 'rpa',
    asset: 'rpa',
    detail: { selector: '#canvas', fraction: 0.62 },
  },
  {
    slug: 'cross-border',
    asset: 'yola',
    detail: { selector: '#collection', fraction: 0.52 },
  },
  {
    slug: 'webui',
    asset: 'webui',
    detail: { fraction: 0.47, action: /快速部署|进入平台|开始使用|体验平台/i },
  },
  {
    slug: 'soulcaller',
    asset: 'soulcaller',
    detail: { fraction: 0.3, action: /进入|开始体验|启动模拟|体验系统/i },
  },
];

const imageName = (asset, index) => `project-${asset}-page-${index === 0 ? 'a' : 'b'}.jpg`;

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts?.ready;
    document.documentElement.style.scrollBehavior = 'auto';
    const style = document.createElement('style');
    style.dataset.captureCleanup = 'true';
    style.textContent = `
      .demo-mode-launcher,
      .demo-mode-panel,
      .demo-mode-overlay,
      [data-demo-mode-root] { display: none !important; }
      html, body { scroll-behavior: auto !important; }
    `;
    document.head.appendChild(style);
  });
  await page.waitForTimeout(900);
}

async function scrollToDetail(page, detail) {
  if (detail.action) {
    const actions = page.getByRole('button', { name: detail.action }).or(page.getByRole('link', { name: detail.action }));
    if (await actions.count()) {
      await actions.first().click({ timeout: 2500 }).catch(() => {});
      await page.waitForTimeout(900);
    }
  }

  if (detail.selector && await page.locator(detail.selector).count()) {
    await page.locator(detail.selector).first().scrollIntoViewIfNeeded().catch(() => {});
  } else {
    await page.evaluate((fraction) => {
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      scrollTo(0, maxScroll * fraction);
    }, detail.fraction ?? 0.5);
  }
  await page.waitForTimeout(1100);
}

async function captureProject(browser, project) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 810 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto(`${baseURL}/demos/${project.slug}/`, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  await settle(page);
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(500);

  const firstPath = path.join(outputDir, imageName(project.asset, 0));
  await page.screenshot({ path: firstPath, type: 'jpeg', quality: 86, fullPage: false });

  await scrollToDetail(page, project.detail);
  await settle(page);
  const secondPath = path.join(outputDir, imageName(project.asset, 1));
  await page.screenshot({ path: secondPath, type: 'jpeg', quality: 86, fullPage: false });

  const dimensions = await page.evaluate(() => ({
    width: innerWidth,
    height: innerHeight,
  }));
  if (dimensions.width !== 1440 || dimensions.height !== 810) {
    throw new Error(`${project.slug}: unexpected viewport ${dimensions.width}x${dimensions.height}`);
  }
  if (pageErrors.length) {
    console.warn(`${project.slug}: browser errors during capture: ${pageErrors.join('; ')}`);
  }
  await context.close();
}

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
try {
  for (const project of projects) await captureProject(browser, project);
} finally {
  await browser.close();
}
console.log(`Captured ${projects.length * 2} archive demo page images for portfolio assets.`);
