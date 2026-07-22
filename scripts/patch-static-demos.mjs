import { readFile, writeFile } from 'node:fs/promises';

const stylesheets = [
  'dist/demos/ai-ecommerce/app.css',
  'dist/demos/digitalhuman/app.css',
  'dist/demos/rpa/app.css',
];

const compatibilityRules = '[hidden]{display:none!important}.toast{pointer-events:none!important}';

for (const path of stylesheets) {
  const content = await readFile(path, 'utf8');
  if (content.includes(compatibilityRules)) continue;
  await writeFile(path, `${compatibilityRules}${content}`, 'utf8');
}

console.log(`Patched ${stylesheets.length} static demo stylesheets.`);
