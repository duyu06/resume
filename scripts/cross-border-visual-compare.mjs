import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const beforeURL = process.env.COMPARE_BEFORE_URL || 'https://duyu06.github.io/resume/demos/cross-border/#about';
const afterURL = process.env.COMPARE_AFTER_URL || 'http://127.0.0.1:4173/resume/demos/cross-border/#about';
const outputDir = process.env.COMPARE_OUTPUT_DIR || 'test-results/cross-border-visual-compare';

const devices = [
  { name: 'desktop-1440', viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false },
  { name: 'mobile-390', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
];

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const results = [];

for (const device of devices) {
  for (const [label, url] of [['before', beforeURL], ['after', afterURL]]) {
    const context = await browser.newContext({
      viewport: device.viewport,
      isMobile: device.isMobile,
      hasTouch: device.hasTouch,
      reducedMotion: 'no-preference',
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(1500);
      if (label === 'after') {
        await page.waitForSelector('.yola-logo', { timeout: 15000 });
        await page.waitForFunction(() => document.querySelectorAll('.awards-grid .product-card').length === 6, null, { timeout: 15000 });
        await page.waitForFunction(() => {
          const hero = document.querySelector('#hero-video source')?.getAttribute('src') || '';
          const reveal = document.querySelector('#collection-video source')?.getAttribute('src') || '';
          return hero.startsWith('./assets/videos/') && reveal.startsWith('./assets/videos/');
        }, null, { timeout: 15000 });
      }
      const overflow = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth);
      if (overflow > 2) throw new Error(`${label} horizontal overflow: ${overflow}px`);
      await page.screenshot({ path: `${outputDir}/${device.name}-${label}.png`, fullPage: false });
      results.push({ device: device.name, label, status: 'passed', errors });
    } catch (error) {
      await page.screenshot({ path: `${outputDir}/${device.name}-${label}-failed.png`, fullPage: false }).catch(() => {});
      results.push({ device: device.name, label, status: 'failed', error: error instanceof Error ? error.message : String(error), errors });
    } finally {
      await context.close();
    }
  }
}

await browser.close();

const html = `<!doctype html><meta charset="utf-8"><title>Cross-border visual comparison</title><style>body{font-family:Arial,sans-serif;margin:24px;background:#f3f3f3;color:#111}section{margin-bottom:40px}div{display:grid;grid-template-columns:1fr 1fr;gap:16px}figure{margin:0;background:#fff;padding:12px;border-radius:12px}img{width:100%;display:block}figcaption{margin-top:8px;font-weight:700}</style>${devices.map((device) => `<section><h1>${device.name}</h1><div><figure><img src="${device.name}-before.png"><figcaption>Before · preserved baseline</figcaption></figure><figure><img src="${device.name}-after.png"><figcaption>After · YOLA jewelry</figcaption></figure></div></section>`).join('')}`;
await writeFile(`${outputDir}/comparison.html`, html, 'utf8');
await writeFile(`${outputDir}/report.json`, JSON.stringify({ beforeURL, afterURL, results }, null, 2), 'utf8');

const failed = results.filter((item) => item.status === 'failed');
console.log(JSON.stringify({ beforeURL, afterURL, passed: results.length - failed.length, failed: failed.length, results }, null, 2));
if (failed.length) process.exitCode = 1;
