import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseURL = (process.env.TEST_BASE_URL || 'http://127.0.0.1:4173/resume').replace(/\/$/, '');
const outputDir = path.resolve('public/assets/projects');
const catalogPath = path.resolve('src/components/ProjectsCatalog.tsx');

const projects = [
  {
    slug: 'ai-ecommerce',
    asset: 'ai-ecommerce',
    detail: { selector: '#stage-images', fraction: 0.58 },
    previous: ['proj-02-a.png', 'proj-02-b.png'],
  },
  {
    slug: 'digitalhuman',
    asset: 'digitalhuman',
    detail: { selector: '#dashboard', fraction: 0.72 },
    previous: ['proj-customer-agent-a.svg', 'proj-customer-agent-b.svg'],
  },
  {
    slug: 'rpa',
    asset: 'rpa',
    detail: { selector: '#canvas', fraction: 0.62 },
    previous: ['proj-07-a.png', 'proj-07-b.png'],
  },
  {
    slug: 'cross-border',
    asset: 'yola',
    detail: { selector: '#collection', fraction: 0.52 },
    previous: ['proj-03-a.png', 'proj-03-b.png'],
  },
  {
    slug: 'webui',
    asset: 'webui',
    detail: { fraction: 0.47, action: /快速部署|进入平台|开始使用|体验平台/i },
    previous: ['proj-05-a.png', 'proj-05-b.png'],
  },
  {
    slug: 'soulcaller',
    asset: 'soulcaller',
    detail: { fraction: 0.3, action: /进入|开始体验|启动模拟|体验系统/i },
    previous: ['proj-06-a.png', 'proj-06-b.png'],
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
    scrollHeight: document.documentElement.scrollHeight,
  }));
  if (dimensions.width !== 1440 || dimensions.height !== 810) {
    throw new Error(`${project.slug}: unexpected viewport ${dimensions.width}x${dimensions.height}`);
  }
  if (pageErrors.length) {
    console.warn(`${project.slug}: browser errors during capture: ${pageErrors.join('; ')}`);
  }
  await context.close();
}

async function updateCatalog() {
  let source = await readFile(catalogPath, 'utf8');
  for (const project of projects) {
    const before = `imgs: ['${project.previous[0]}', '${project.previous[1]}']`;
    const after = `imgs: ['${imageName(project.asset, 0)}', '${imageName(project.asset, 1)}']`;
    if (source.includes(after)) continue;
    if (!source.includes(before)) throw new Error(`ProjectsCatalog mapping not found: ${before}`);
    source = source.replace(before, after);
  }
  await writeFile(catalogPath, source, 'utf8');
}

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
try {
  for (const project of projects) await captureProject(browser, project);
} finally {
  await browser.close();
}
await updateCatalog();
console.log(`Captured ${projects.length * 2} project page images and updated ProjectsCatalog.tsx.`);
