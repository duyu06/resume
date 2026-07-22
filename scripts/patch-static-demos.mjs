import { readFile, writeFile } from 'node:fs/promises';

const stylesheets = [
  'dist/demos/ai-ecommerce/app.css',
  'dist/demos/digitalhuman/app.css',
  'dist/demos/rpa/app.css',
];

const hiddenRule = '[hidden]{display:none!important}';

for (const path of stylesheets) {
  const content = await readFile(path, 'utf8');
  if (content.includes(hiddenRule)) continue;
  await writeFile(path, `${hiddenRule}${content}`, 'utf8');
}

console.log(`Patched ${stylesheets.length} static demo stylesheets.`);
