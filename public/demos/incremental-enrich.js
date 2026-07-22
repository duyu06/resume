(() => {
  'use strict';

  const segments = location.pathname.split('/').filter(Boolean);
  const demosIndex = segments.indexOf('demos');
  const slug = demosIndex >= 0 ? segments[demosIndex + 1] : segments.at(-1);

  const configs = {
    'ai-ecommerce': {
      title: 'AI 电商主图生成器',
      type: 'AI E-COMMERCE · CORE CASE',
      status: 'IMAGE PIPELINE · READY',
      steps: ['上传原图', '主体识别', '风格配置', '批量生成', '审核导出'],
      summary: '面向独立站及跨境电商卖家，将商品主体约束、场景生成、版式适配、版本比较和人工审核组织为可追踪的素材生产流程。',
      evidence: [
        '将材质、颜色、视角、Logo、包装文字和禁止修改项结构化为 Prompt 与验收字段。',
        '按商品理解、抠图、背景生成、图像编辑、高清放大和文字排版拆分模型能力。',
        '规划失败重试、版本记录、批量任务和多平台尺寸导出。',
      ],
      boundary: '页面为交互原型，不代表已接入真实商品库或生成模型。最终素材必须经过人工审核，避免商品主体、文字、包装和品牌标识被错误修改。',
      states: {
        normal: ['生成链路可用', '主体约束已锁定，当前批次可以进入平台适配和人工审核。', '#34d399'],
        loading: ['生成队列处理中', '正在执行商品理解、场景生成和高清放大，请保留任务状态与版本记录。', '#fbbf24'],
        empty: ['暂无生成版本', '当前商品尚未提交参考图和平台规格，可从上传原图开始。', '#94a3b8'],
        error: ['主体一致性异常', '检测到商品颜色或包装文字偏移，任务已暂停并等待人工确认。', '#fb7185'],
      },
    },
    digitalhuman: {
      title: '数字人风格对话模型微调',
      type: 'MODEL FINE-TUNING · CORE CASE',
      status: 'STYLE MODEL · EVAL ONLINE',
      steps: ['数据治理', 'Prompt 协议', '模型训练', '标准评测', 'API 交付'],
      summary: '将历史多模态对话转化为结构化训练数据，并用固定测试集和评分卡验证人物一致性、上下文连贯性、自然度、稳定性和格式合规性。',
      evidence: [
        '整理 1W+ 条原始历史多模态对话，形成 7,328 条有效训练数据。',
        '构建 26 条标准测试 Prompt 和 25 分制五维评分卡。',
        '不足两周完成需求、数据、训练、评测、部署和 API 调用闭环。',
      ],
      boundary: '训练前必须确认数据授权并完成脱敏。微调不是默认答案，应先用 Prompt 验证方向，并持续检查过拟合、机械复读、事实混淆和格式异常。',
      states: {
        normal: ['评测基线通过', '角色语气、历史记忆和格式标记已进入固定测试集回归。', '#34d399'],
        loading: ['模型版本评测中', '正在执行 26 条标准 Prompt，并记录五个维度的评分差异。', '#fbbf24'],
        empty: ['暂无可比较版本', '请先完成数据版本、训练参数和测试集绑定。', '#94a3b8'],
        error: ['角色一致性下降', '检测到语气漂移或历史事实混淆，当前版本不进入 API 交付。', '#fb7185'],
      },
    },
    rpa: {
      title: '多账号运营 RPA 自动化系统',
      type: 'RPA ORCHESTRATION · CORE CASE',
      status: 'RPA ORCHESTRATOR · HEALTHY',
      steps: ['环境隔离', '任务读取', '页面执行', '人工确认', '结果回写'],
      summary: '把重复运营步骤转化为可配置任务，同时通过账号环境隔离、显式等待、人工确认、异常中止和审计日志降低自动化风险。',
      evidence: [
        '建立账号、浏览器环境、任务批次和执行记录之间的映射。',
        '关键提交动作保留人工确认，不让自动化越过平台规则和业务边界。',
        '覆盖加载超时、元素变化、登录失效、网络异常、暂停和人工接管。',
      ],
      boundary: '该原型用于展示流程编排和异常治理。真实执行必须遵守平台规则、账号权限和频率限制，不提供规避风控或批量滥用能力。',
      states: {
        normal: ['任务编排健康', '账号环境已隔离，提交节点仍等待人工确认。', '#34d399'],
        loading: ['任务执行中', '正在识别页面状态并填写内容，提交动作尚未触发。', '#fbbf24'],
        empty: ['暂无待执行任务', '任务列表为空，可导入新的批次配置。', '#94a3b8'],
        error: ['登录状态失效', '流程已安全暂停并记录失败原因，需要人工重新认证。', '#fb7185'],
      },
    },
    'cross-border': {
      title: 'YOLA 跨境精品独立站',
      type: 'DTC JEWELRY · CORE CASE',
      status: 'YOLA STOREFRONT · PROTOTYPE',
      steps: ['品牌进入', '浏览系列', '查看商品', '加入购物袋', '订阅复访'],
      summary: '以 YOLA 手工珠宝品牌为载体，展示品牌叙事、商品浏览、快速查看、购物袋反馈和复访入口，并映射商品、库存、订单和埋点的产品设计。',
      evidence: [
        '保留 YOLA 品牌、黑色手工戒指、滚动视频和编辑式产品陈列。',
        '产品设计范围包括 SPU/SKU、库存扣减、支付回调、履约、退款和异常补偿。',
        '行为漏斗覆盖 view_item、add_to_cart、begin_checkout 和 purchase。',
      ],
      boundary: '该页面是品牌与交易链路交互原型。商品价格、库存、购物袋和订阅反馈均为前端演示，不发起真实支付、订单或邮件请求。',
      states: {
        normal: ['品牌体验可用', '商品浏览和购物袋原型处于正常状态。', '#d8c6aa'],
        loading: ['商品资料加载中', '正在读取商品媒体、规格和库存展示字段。', '#fbbf24'],
        empty: ['当前系列尚未上新', '可以保留品牌故事与订阅入口，等待商品上架。', '#94a3b8'],
        error: ['库存状态待确认', '加入购物袋前需要重新校验规格、价格和可售库存。', '#fb7185'],
      },
      productQuickView: true,
    },
    webui: {
      title: 'Open WebUI 多模型本地化平台',
      type: 'LOCAL INFERENCE · LAB CASE',
      status: 'LOCAL INFERENCE · ONLINE',
      steps: ['模型接入', '服务部署', '参数配置', '运行监控', '故障恢复'],
      summary: '围绕统一模型入口、推理服务、参数管理和 GPU 可观测性，展示本地多模型部署、监控、调优与故障排查流程。',
      evidence: [
        '使用 Docker Compose 将单次人工部署时间由约 4 小时缩短至 20 分钟。',
        '典型环境推理吞吐稳定在 50+ token/s，显存利用率控制在 85% 以下。',
        '监控 GPU、CPU、显存、服务健康和 Token 吞吐，并保留版本回滚能力。',
      ],
      boundary: '页面展示的是实验环境和方法，不代表所有硬件与模型都能达到相同吞吐。性能结果必须结合 GPU、量化方式、上下文长度和并发条件解释。',
      states: {
        normal: ['推理服务在线', 'Ollama、vLLM 与监控链路保持健康。', '#34d399'],
        loading: ['模型正在加载', '正在分配显存并完成健康检查，统一入口暂不接收新请求。', '#fbbf24'],
        empty: ['尚未注册模型', '请先添加模型、推理后端和服务参数。', '#94a3b8'],
        error: ['显存资源不足', '模型加载失败，建议降低并发、上下文长度或调整量化方案。', '#fb7185'],
      },
    },
    soulcaller: {
      title: '叫魂者多 Agent 叙事系统',
      type: 'MULTI-AGENT NARRATIVE · LAB CASE',
      status: 'MULTI AGENT · MEMORY SYNCED',
      steps: ['角色 Agent', '记忆 Agent', '世界状态', '导演 Agent', '安全边界'],
      summary: '验证多角色身份、世界状态、真相进度和分支剧情在多 Agent 场景中的协作可行性，并通过信息隔离和状态字段减少角色越界。',
      evidence: [
        '将角色身份、行为边界、叙事规则和状态追踪转化为结构化 Prompt。',
        '支持模拟模式和真实 API 模式切换，先验证业务流程再接入模型。',
        '通过关键事实注入改善代词冲突、角色越界和上下文丢失。',
      ],
      boundary: '这是多 Agent 叙事实验原型，不用于现实决策。剧情事实、角色记忆和世界状态必须由系统字段约束，模型输出不能直接覆盖可信状态。',
      states: {
        normal: ['世界状态已同步', '角色、记忆与导演 Agent 使用同一轮可信状态快照。', '#34d399'],
        loading: ['剧情回合生成中', '导演 Agent 正在汇总角色意图并计算下一轮状态。', '#fbbf24'],
        empty: ['尚未开始剧情', '请选择初始角色、世界设定和第一条关键事实。', '#94a3b8'],
        error: ['角色边界冲突', '检测到角色读取未授权信息，当前回合已中止并回滚。', '#fb7185'],
      },
    },
  };

  const config = configs[slug];
  if (!config) return;

  document.body.dataset.demoEnrich = slug;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const visited = new WeakSet();
  let activeStep = -1;
  let stateTimer = 0;
  let drawerOpen = false;
  let productOpen = false;
  let lastFocus = null;
  let previousOverflow = '';
  let bagCount = 0;

  const escapeHtml = (value) =>
    String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');

  const progress = document.createElement('div');
  progress.className = 'motion-enrich-progress';
  progress.innerHTML = '<span></span>';
  document.body.append(progress);
  const progressBar = progress.firstElementChild;

  const status = document.createElement('div');
  status.className = 'motion-enrich-status';
  status.innerHTML = `<i></i><span>${escapeHtml(config.status)}</span>`;
  document.body.append(status);

  const launcher = document.createElement('button');
  launcher.type = 'button';
  launcher.className = 'motion-enrich-launcher';
  launcher.setAttribute('aria-haspopup', 'dialog');
  launcher.setAttribute('aria-controls', 'motion-enrich-drawer');
  launcher.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
      <path d="M4 6h16M4 12h10M4 18h13" stroke-linecap="round" />
    </svg>
    <span>查看产品逻辑</span>
  `;
  document.body.append(launcher);

  const rail = document.createElement('nav');
  rail.className = 'motion-enrich-rail';
  rail.setAttribute('aria-label', `${config.title} 项目流程`);
  rail.innerHTML = config.steps
    .map((step, index) => `<button type="button" data-step="${index}">${escapeHtml(step)}</button>`)
    .join('');
  document.body.append(rail);
  const railButtons = [...rail.querySelectorAll('button')];

  const scrim = document.createElement('button');
  scrim.type = 'button';
  scrim.className = 'motion-enrich-scrim';
  scrim.setAttribute('aria-label', '关闭产品逻辑面板');
  document.body.append(scrim);

  const drawer = document.createElement('aside');
  drawer.id = 'motion-enrich-drawer';
  drawer.className = 'motion-enrich-drawer';
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-modal', 'true');
  drawer.setAttribute('aria-labelledby', 'motion-enrich-title');
  drawer.innerHTML = `
    <header class="motion-enrich-drawer__header">
      <div>
        <div class="motion-enrich-drawer__eyebrow">${escapeHtml(config.type)}</div>
        <h2 id="motion-enrich-title">${escapeHtml(config.title)}</h2>
      </div>
      <button class="motion-enrich-drawer__close" type="button" aria-label="关闭">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke-linecap="round" /></svg>
      </button>
    </header>
    <div class="motion-enrich-drawer__body">
      <p class="motion-enrich-summary">${escapeHtml(config.summary)}</p>

      <section class="motion-enrich-section">
        <div class="motion-enrich-section-label">核心流程</div>
        <ol class="motion-enrich-workflow">
          ${config.steps.map((step, index) => `<li><span>${String(index + 1).padStart(2, '0')}</span>${escapeHtml(step)}</li>`).join('')}
        </ol>
      </section>

      <section class="motion-enrich-section">
        <div class="motion-enrich-section-label">项目证据</div>
        <ul class="motion-enrich-evidence">
          ${config.evidence.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>
      </section>

      <section class="motion-enrich-section">
        <div class="motion-enrich-section-label">边界与风险</div>
        <div class="motion-enrich-boundary">${escapeHtml(config.boundary)}</div>
      </section>

      <section class="motion-enrich-section">
        <div class="motion-enrich-section-label">原型状态演示</div>
        <div class="motion-enrich-state-buttons">
          <button type="button" data-state="normal">正常状态</button>
          <button type="button" data-state="loading">加载状态</button>
          <button type="button" data-state="empty">空状态</button>
          <button type="button" data-state="error">异常状态</button>
        </div>
      </section>

      <a class="motion-enrich-return" href="/resume/#projects">返回项目作品集</a>
    </div>
  `;
  document.body.append(drawer);

  const drawerClose = drawer.querySelector('.motion-enrich-drawer__close');

  const stateDemo = document.createElement('div');
  stateDemo.className = 'motion-enrich-state-demo';
  stateDemo.setAttribute('role', 'status');
  stateDemo.setAttribute('aria-live', 'polite');
  stateDemo.innerHTML = `
    <div class="motion-enrich-state-demo__top">
      <span class="motion-enrich-state-demo__label">原型状态演示</span>
      <span class="motion-enrich-state-demo__tone"><i></i><span>STATE</span></span>
    </div>
    <h3></h3>
    <p></p>
  `;
  document.body.append(stateDemo);

  const lockScroll = () => {
    previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
  };

  const unlockScroll = () => {
    document.documentElement.style.overflow = previousOverflow;
  };

  const openDrawer = () => {
    if (drawerOpen) return;
    lastFocus = document.activeElement;
    drawerOpen = true;
    launcher.setAttribute('aria-expanded', 'true');
    drawer.classList.add('is-open');
    scrim.classList.add('is-open');
    lockScroll();
    requestAnimationFrame(() => drawerClose.focus());
  };

  const closeDrawer = () => {
    if (!drawerOpen) return;
    drawerOpen = false;
    launcher.setAttribute('aria-expanded', 'false');
    drawer.classList.remove('is-open');
    scrim.classList.remove('is-open');
    unlockScroll();
    if (lastFocus instanceof HTMLElement) lastFocus.focus();
  };

  const showState = (stateKey) => {
    const state = config.states[stateKey];
    if (!state) return;
    const [title, message, color] = state;
    stateDemo.style.setProperty('--state-color', color);
    stateDemo.querySelector('h3').textContent = title;
    stateDemo.querySelector('p').textContent = message;
    stateDemo.querySelector('.motion-enrich-state-demo__tone span').textContent = stateKey.toUpperCase();
    stateDemo.classList.add('is-visible');
    clearTimeout(stateTimer);
    stateTimer = window.setTimeout(() => stateDemo.classList.remove('is-visible'), 3800);
  };

  launcher.addEventListener('click', openDrawer);
  drawerClose.addEventListener('click', closeDrawer);
  scrim.addEventListener('click', closeDrawer);
  stateDemo.addEventListener('click', () => stateDemo.classList.remove('is-visible'));

  drawer.querySelectorAll('[data-state]').forEach((button) => {
    button.addEventListener('click', () => showState(button.dataset.state));
  });

  railButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      const target = config.steps.length === 1 ? 0 : (index / (config.steps.length - 1)) * max;
      scrollTo({ top: target, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  });

  const setActiveStep = (index) => {
    if (index === activeStep) return;
    activeStep = index;
    railButtons.forEach((button, buttonIndex) => {
      const active = buttonIndex === index;
      button.classList.toggle('is-active', active);
      if (active) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
  };

  const updateProgress = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const progressValue = Math.min(1, Math.max(0, scrollY / max));
    progressBar.style.transform = `scaleX(${progressValue})`;
    const stepIndex = Math.min(config.steps.length - 1, Math.floor(progressValue * config.steps.length));
    setActiveStep(stepIndex);
  };

  addEventListener('scroll', updateProgress, { passive: true });
  addEventListener('resize', updateProgress, { passive: true });
  updateProgress();

  if (finePointer && !reducedMotion) {
    let rawX = innerWidth / 2;
    let rawY = innerHeight / 2;
    let smoothX = rawX;
    let smoothY = rawY;
    let pointerFrame = 0;

    addEventListener(
      'pointermove',
      (event) => {
        rawX = event.clientX;
        rawY = event.clientY;
      },
      { passive: true },
    );

    const moveGlow = () => {
      smoothX += (rawX - smoothX) * 0.1;
      smoothY += (rawY - smoothY) * 0.1;
      document.body.style.setProperty('--mx', `${smoothX}px`);
      document.body.style.setProperty('--my', `${smoothY}px`);
      pointerFrame = requestAnimationFrame(moveGlow);
    };

    pointerFrame = requestAnimationFrame(moveGlow);
    addEventListener('pagehide', () => cancelAnimationFrame(pointerFrame), { once: true });
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -4% 0px' },
  );

  const prepareEnhancements = () => {
    const candidates = [
      ...document.querySelectorAll(
        'article,[class*="card"],[class*="panel"],[class*="metric"],[class*="feature"]',
      ),
    ].filter((element) => {
      if (visited.has(element)) return false;
      if (element.closest('.motion-enrich-drawer,.motion-enrich-status,.motion-enrich-rail,.motion-enrich-state-demo,.motion-product-dialog-scrim')) return false;
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return (
        rect.width > 150 &&
        rect.height > 80 &&
        rect.height < innerHeight * 1.4 &&
        style.display !== 'none' &&
        style.visibility !== 'hidden'
      );
    });

    candidates.slice(0, 36).forEach((element, index) => {
      visited.add(element);
      element.classList.add('motion-enrich-card');
      if (!reducedMotion) {
        element.classList.add('motion-enrich-reveal');
        element.style.transitionDelay = `${Math.min(index % 5, 4) * 55}ms`;
        revealObserver.observe(element);
      } else {
        element.classList.add('is-visible');
      }
    });

    document.querySelectorAll('button,a').forEach((element) => {
      if (element.closest('.demo-context-bar,.motion-enrich-drawer,.motion-enrich-status,.motion-enrich-rail,.motion-product-dialog-scrim')) return;
      element.classList.add('motion-enrich-action');
    });

    if (config.productQuickView) prepareProductQuickView();
  };

  let productDialogScrim = null;
  let productDialog = null;
  let productClose = null;
  let productImage = null;
  let productName = null;
  let productPrice = null;
  let productBag = null;

  const ensureProductDialog = () => {
    if (productDialogScrim) return;

    productDialogScrim = document.createElement('div');
    productDialogScrim.className = 'motion-product-dialog-scrim';
    productDialogScrim.innerHTML = `
      <section class="motion-product-dialog" role="dialog" aria-modal="true" aria-labelledby="motion-product-title">
        <button class="motion-product-dialog__close" type="button" aria-label="关闭商品快速查看">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke-linecap="round" /></svg>
        </button>
        <div class="motion-product-dialog__image"><img alt="" /></div>
        <div class="motion-product-dialog__content">
          <small>YOLA · PRODUCT PROTOTYPE</small>
          <h2 id="motion-product-title"></h2>
          <div class="motion-product-dialog__price"></div>
          <p class="motion-product-dialog__copy">商品快速查看用于演示 view_item 与 add_to_cart 交互。规格、库存和价格均需在真实结算前由服务端重新校验。</p>
          <button class="motion-product-dialog__bag" type="button">加入购物袋</button>
        </div>
      </section>
    `;
    document.body.append(productDialogScrim);

    productDialog = productDialogScrim.querySelector('.motion-product-dialog');
    productClose = productDialogScrim.querySelector('.motion-product-dialog__close');
    productImage = productDialogScrim.querySelector('img');
    productName = productDialogScrim.querySelector('h2');
    productPrice = productDialogScrim.querySelector('.motion-product-dialog__price');
    productBag = productDialogScrim.querySelector('.motion-product-dialog__bag');

    productClose.addEventListener('click', closeProductDialog);
    productDialogScrim.addEventListener('click', (event) => {
      if (event.target === productDialogScrim) closeProductDialog();
    });
    productBag.addEventListener('click', () => {
      bagCount += 1;
      const bagButton = document.querySelector('.header-action');
      if (bagButton) bagButton.textContent = `[ BAG · ${bagCount} ]`;
      productBag.textContent = `已加入购物袋 · ${bagCount}`;
      showState('normal');
    });
  };

  function openProductDialog(card) {
    ensureProductDialog();
    const image = card.querySelector('img');
    const name = card.querySelector('.product-name,h2,h3');
    const price = card.querySelector('.product-price,[class*="price"]');
    if (!image || !name) return;

    lastFocus = document.activeElement;
    productOpen = true;
    productImage.src = image.currentSrc || image.src;
    productImage.alt = image.alt || `${name.textContent.trim()} 商品图`;
    productName.textContent = name.textContent.trim();
    productPrice.textContent = price ? price.textContent.trim() : 'Prototype item';
    productBag.textContent = bagCount ? `加入购物袋 · 当前 ${bagCount}` : '加入购物袋';
    productDialogScrim.classList.add('is-open');
    lockScroll();
    requestAnimationFrame(() => productClose.focus());
  }

  function closeProductDialog() {
    if (!productOpen || !productDialogScrim) return;
    productOpen = false;
    productDialogScrim.classList.remove('is-open');
    unlockScroll();
    if (lastFocus instanceof HTMLElement) lastFocus.focus();
  }

  function prepareProductQuickView() {
    document.querySelectorAll('.product-card').forEach((card) => {
      if (card.dataset.motionProductReady === 'true') return;
      card.dataset.motionProductReady = 'true';
      card.classList.add('motion-product-card-ready');
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `快速查看 ${card.querySelector('.product-name')?.textContent?.trim() || '商品'}`);
      card.addEventListener('click', () => openProductDialog(card));
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openProductDialog(card);
        }
      });
    });
  }

  const focusTrap = (event, container) => {
    if (event.key !== 'Tab') return;
    const focusable = [...container.querySelectorAll('button,a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(
      (element) => !element.disabled && element.getAttribute('aria-hidden') !== 'true',
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (productOpen) closeProductDialog();
      else if (drawerOpen) closeDrawer();
      return;
    }
    if (productOpen && productDialog) focusTrap(event, productDialog);
    else if (drawerOpen) focusTrap(event, drawer);
  });

  const schedulePrepare = () => {
    clearTimeout(window.__enrichTimer);
    window.__enrichTimer = setTimeout(prepareEnhancements, 260);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(prepareEnhancements, 500), { once: true });
  } else {
    setTimeout(prepareEnhancements, 500);
  }

  new MutationObserver(schedulePrepare).observe(document.getElementById('root') || document.body, {
    childList: true,
    subtree: true,
  });
})();
