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

async function replaceRequired(path, replacements) {
  let content = await readFile(path, 'utf8');
  for (const [search, replacement, label] of replacements) {
    if (!content.includes(search)) throw new Error(`${path}: required patch target missing: ${label}`);
    content = content.replace(search, replacement);
  }
  await writeFile(path, content, 'utf8');
}

await replaceRequired('dist/demos/ai-ecommerce/app.js', [
  [
    "$('#analysis-state').textContent = '分析中';",
    "setStage('analysis'); $('#analysis-state').textContent = '分析中';",
    'return to analysis stage when starting a new analysis',
  ],
]);

await replaceRequired('dist/demos/digitalhuman/app.js', [
  [
    "renderAll();\n      $('#connection-badge').textContent = config.has_key || state.apiKey ? '后端已连接' : '后端已连接 · 缺少 Key';",
    "renderAll();\n      setView('library');\n      $('#connection-badge').textContent = config.has_key || state.apiKey ? '后端已连接' : '后端已连接 · 缺少 Key';",
    'show synchronized character library after backend connection',
  ],
]);

await replaceRequired('dist/demos/rpa/app.js', [
  [
    'async function executeNode(node, index) {',
    'async function executeNode(node, index, ignoreBreakpoint = false) {',
    'allow explicit single-step breakpoint bypass',
  ],
  [
    'if (node.breakpoint) {',
    'if (node.breakpoint && !ignoreBreakpoint) {',
    'skip breakpoint during explicit single-step execution',
  ],
  [
    'const ok = await executeNode(state.nodes[index], index);',
    'const ok = await executeNode(state.nodes[index], index, oneStep);',
    'pass single-step state into node execution',
  ],
]);

const demoIndexes = [
  'dist/demos/guoyang/index.html',
  'dist/demos/cross-border/index.html',
  'dist/demos/ai-ecommerce/index.html',
  'dist/demos/digitalhuman/index.html',
  'dist/demos/rpa/index.html',
  'dist/demos/webui/index.html',
  'dist/demos/soulcaller/index.html',
];

const demoStyle = '<link rel="stylesheet" href="/resume/demos/demo-mode.css" />';
const demoScript = '<script defer src="/resume/demos/demo-mode.js"></script>';

for (const path of demoIndexes) {
  let content = await readFile(path, 'utf8');
  if (!content.includes('/resume/demos/demo-mode.css')) {
    if (!content.includes('</head>')) throw new Error(`${path}: missing </head>`);
    content = content.replace('</head>', `  ${demoStyle}\n</head>`);
  }
  if (!content.includes('/resume/demos/demo-mode.js')) {
    if (!content.includes('</body>')) throw new Error(`${path}: missing </body>`);
    content = content.replace('</body>', `  ${demoScript}\n</body>`);
  }
  await writeFile(path, content, 'utf8');
}

console.log(`Patched ${stylesheets.length} static demo stylesheets, 3 demo scripts, and ${demoIndexes.length} demo pages.`);
