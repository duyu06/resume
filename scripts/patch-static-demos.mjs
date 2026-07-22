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

await replaceRequired('dist/demos/cross-border/cross-border.js', [
  [
    'if (!video || reducedMotion || document.hidden) return;',
    'if (!video || reducedMotion || document.hidden || !video.paused) return;',
    'avoid repeated play calls while YOLA video is already running',
  ],
]);

const yolaMotionCssPath = 'dist/demos/cross-border/cross-border-motion.css';
const yolaRuntimeRules = `
@media (min-width:769px){.awards-pin{position:sticky;top:0}}
body[data-demo-enrich='cross-border'] .yola-story-frame.motion-enrich-reveal{
  opacity:0!important;
  transform:translate3d(0,34px,0) rotateX(-7deg)!important;
  filter:none!important;
  translate:none!important;
}
body[data-demo-enrich='cross-border'] .yola-story-frame.motion-enrich-reveal.is-active{
  opacity:1!important;
  transform:translate3d(0,0,0) rotateX(0deg)!important;
}
`;
let yolaMotionCss = await readFile(yolaMotionCssPath, 'utf8');
if (!yolaMotionCss.includes(".yola-story-frame.motion-enrich-reveal.is-active")) {
  yolaMotionCss += yolaRuntimeRules;
  await writeFile(yolaMotionCssPath, yolaMotionCss, 'utf8');
}

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
const demoFitStyle = '<link rel="stylesheet" href="/resume/demos/demo-mode-fit.css" />';
const demoScript = '<script defer src="/resume/demos/demo-mode.js"></script>';
const demoFixScript = '<script defer src="/resume/demos/demo-mode-review-fixes.js"></script>';
const upstreamSourceAnchorPattern = /<a\b[^>]*>\s*[^<]*上游源码[^<]*<\/a>/giu;
const yolaMarkerTemplate = Array.from(
  { length: 14 },
  (_, index) => `<i data-yola-marker="${String(index + 1).padStart(2, '0')}"></i>`,
).join('');
const unresolvedYolaMarkerTemplate = '${Array.from({length:14},(_,index)=>`<i data-yola-marker="${String(index+1).padStart(2,\'0\')}"></i>`).join(\'\')}';

for (const path of demoIndexes) {
  let content = await readFile(path, 'utf8');

  // Public demo UI should focus on the product experience. Attribution and
  // licensing remain documented in the repository, but source links are not
  // rendered inside the portfolio demos.
  content = content.replace(upstreamSourceAnchorPattern, '');

  if (path.endsWith('/cross-border/index.html')) {
    content = content.replace(unresolvedYolaMarkerTemplate, yolaMarkerTemplate);
  }

  if (!content.includes('/resume/demos/demo-mode.css')) {
    if (!content.includes('</head>')) throw new Error(`${path}: missing </head>`);
    content = content.replace('</head>', `  ${demoStyle}\n</head>`);
  }
  if (!content.includes('/resume/demos/demo-mode-fit.css')) {
    if (!content.includes('</head>')) throw new Error(`${path}: missing </head>`);
    content = content.replace('</head>', `  ${demoFitStyle}\n</head>`);
  }
  if (!content.includes('/resume/demos/demo-mode.js')) {
    if (!content.includes('</body>')) throw new Error(`${path}: missing </body>`);
    content = content.replace('</body>', `  ${demoScript}\n</body>`);
  }
  if (!content.includes('/resume/demos/demo-mode-review-fixes.js')) {
    if (!content.includes('</body>')) throw new Error(`${path}: missing </body>`);
    content = content.replace('</body>', `  ${demoFixScript}\n</body>`);
  }

  if (/<a\b[^>]*>\s*[^<]*上游源码/iu.test(content)) {
    throw new Error(`${path}: visible upstream source link survived sanitization`);
  }
  if (path.endsWith('/cross-border/index.html')) {
    const markerCount = (content.match(/data-yola-marker=/g) || []).length;
    if (markerCount !== 14) throw new Error(`${path}: expected 14 YOLA keyframe markers, found ${markerCount}`);
  }

  await writeFile(path, content, 'utf8');
}

const deploymentRevision = process.env.GITHUB_SHA || 'local-build';
await writeFile('dist/deploy-revision.txt', `${deploymentRevision}\n`, 'utf8');

console.log(`Patched ${stylesheets.length} static demo stylesheets, 4 demo scripts, ${demoIndexes.length} clean demo pages, and revision ${deploymentRevision}.`);
