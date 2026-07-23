(() => {
  'use strict';

  const segments = location.pathname.split('/').filter(Boolean);
  const demosIndex = segments.indexOf('demos');
  const slug = demosIndex >= 0 ? segments[demosIndex + 1] : '';

  const themes = {
    guoyang: {
      kicker: 'AI CONTENT WORKFLOW',
      launcher: '演示控制',
    },
    'cross-border': {
      kicker: 'YOLA / ATELIER EXPERIENCE',
      launcher: '体验控制',
    },
    'ai-ecommerce': {
      kicker: 'VISUAL PRODUCTION LAB',
      launcher: '演示控制',
    },
    digitalhuman: {
      kicker: 'CUSTOMER SERVICE AGENT',
      launcher: '客服演示',
    },
    rpa: {
      kicker: 'AUTOMATION RUNBOOK',
      launcher: '运行演示',
    },
    webui: {
      kicker: 'LOCAL INFERENCE CONSOLE',
      launcher: '演示控制',
    },
    soulcaller: {
      kicker: 'NARRATIVE ORCHESTRATION',
      launcher: '演示控制',
    },
  };

  const theme = themes[slug];
  if (!theme) return;

  document.body.dataset.demoModeTheme = slug;

  const applyTheme = () => {
    const launcher = document.querySelector('.demo-mode-launcher');
    const panel = document.querySelector('.demo-mode-panel');
    if (!launcher || !panel) return false;

    const launcherLabel = launcher.querySelector('span');
    const kicker = panel.querySelector('.demo-mode-kicker');
    const logicLauncher = document.querySelector('.motion-enrich-launcher span');

    if (launcherLabel) launcherLabel.textContent = theme.launcher;
    if (kicker) kicker.textContent = theme.kicker;
    if (logicLauncher) logicLauncher.textContent = '产品逻辑';

    launcher.setAttribute('aria-label', `${theme.launcher}：打开${panel.querySelector('h2')?.textContent || '项目'}面板`);
    panel.dataset.demoProject = slug;
    return true;
  };

  if (applyTheme()) return;

  const observer = new MutationObserver(() => {
    if (!applyTheme()) return;
    observer.disconnect();
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
