(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('.hero');
  const splitLines = document.querySelectorAll('[data-split]');

  splitLines.forEach((line) => {
    const text = line.dataset.split || '';
    const lineDelay = Number(line.dataset.lineDelay || 0);
    line.style.setProperty('--line-delay', `${lineDelay}ms`);
    line.textContent = '';
    [...text].forEach((char, index) => {
      const span = document.createElement('span');
      span.className = 'title-char';
      span.style.setProperty('--char-index', index);
      span.textContent = char === ' ' ? '\u00a0' : char;
      line.appendChild(span);
    });
  });

  requestAnimationFrame(() => hero?.classList.add('is-visible'));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      });
    },
    { threshold: 0.14, rootMargin: '0px 0px -8% 0px' },
  );
  document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

  const navMark = document.querySelector('.nav-mark');
  navMark?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  const story = document.querySelector('.interface-story');
  const stageElement = document.querySelector('.interface-stage');
  const stageCopies = [...document.querySelectorAll('[data-stage-copy]')];
  const stageButtons = [...document.querySelectorAll('[data-stage-button]')];
  const coreValue = document.getElementById('core-value');
  const coreLabel = document.getElementById('core-label');
  const mobileTitle = document.getElementById('mobile-stage-title');
  const mobileDesc = document.getElementById('mobile-stage-desc');

  const stageData = [
    { value: '1W+', label: 'Raw dialogues', title: 'Data Layer', desc: '1W+ 原始记录 → 7,328 条有效数据' },
    { value: '4', label: 'Prompt layers', title: 'Memory Protocol', desc: '角色 · 上下文 · 历史 · 输出约束' },
    { value: '2', label: 'Dataset splits', title: 'Training Loop', desc: '训练集 / 验证集 / 异常样本检查' },
    { value: '26', label: 'Test prompts', title: 'Evaluation Layer', desc: '26 Prompts · 25 分制 · 五维评测' },
    { value: 'API', label: 'Delivery loop', title: 'Product Delivery', desc: '部署调用 · 版本记录 · 回归评测' },
  ];

  let activeStage = -1;
  let ticking = false;

  function setStage(stage, progress) {
    if (!stageElement) return;
    stageElement.dataset.stage = String(stage);
    stageElement.style.setProperty('--stage-progress', String(progress));

    if (stage !== activeStage) {
      activeStage = stage;
      stageCopies.forEach((copy, index) => {
        copy.classList.toggle('is-active', index === stage);
        copy.classList.toggle('is-before', index < stage);
      });
      stageButtons.forEach((button, index) => button.setAttribute('aria-current', index === stage ? 'true' : 'false'));

      const data = stageData[stage];
      if (data) {
        if (coreValue) coreValue.textContent = data.value;
        if (coreLabel) coreLabel.textContent = data.label;
        if (mobileTitle) mobileTitle.textContent = data.title;
        if (mobileDesc) mobileDesc.textContent = data.desc;
      }
    }
  }

  function updateStory() {
    ticking = false;
    if (!story || !stageElement) return;
    const rect = story.getBoundingClientRect();
    const scrollable = Math.max(1, story.offsetHeight - window.innerHeight);
    const progress = Math.max(0, Math.min(1, -rect.top / scrollable));
    const stage = Math.min(stageData.length - 1, Math.floor(progress * stageData.length));
    setStage(stage, progress);
  }

  function requestStoryUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateStory);
  }

  window.addEventListener('scroll', requestStoryUpdate, { passive: true });
  window.addEventListener('resize', requestStoryUpdate, { passive: true });
  requestStoryUpdate();

  stageButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      if (!story) return;
      const scrollable = Math.max(1, story.offsetHeight - window.innerHeight);
      const target = story.offsetTop + (index / (stageData.length - 1)) * scrollable;
      window.scrollTo({ top: target, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...document.querySelectorAll('.nav-links a')];
  const navObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => link.setAttribute('aria-current', link.getAttribute('href') === `#${visible.target.id}` ? 'true' : 'false'));
    },
    { threshold: [0.2, 0.45, 0.7] },
  );
  sections.forEach((section) => navObserver.observe(section));

  const canvas = document.getElementById('neural-background');
  const context = canvas?.getContext('2d');
  if (!canvas || !context) return;

  let width = 0;
  let height = 0;
  let particles = [];
  let pointerX = 0;
  let pointerY = 0;
  let animationFrame = 0;

  function makeParticles() {
    const count = window.innerWidth < 720 ? 24 : 52;
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      radius: Math.random() * 1.35 + 0.45,
    }));
  }

  function resizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    makeParticles();
  }

  function drawNetwork() {
    context.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i += 1) {
      const particle = particles[i];
      if (!reduceMotion) {
        particle.x += particle.vx + pointerX * 0.00004;
        particle.y += particle.vy + pointerY * 0.00004;
        if (particle.x < -10) particle.x = width + 10;
        if (particle.x > width + 10) particle.x = -10;
        if (particle.y < -10) particle.y = height + 10;
        if (particle.y > height + 10) particle.y = -10;
      }

      context.beginPath();
      context.fillStyle = 'rgba(170, 237, 255, 0.72)';
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();

      for (let j = i + 1; j < particles.length; j += 1) {
        const other = particles[j];
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 135) {
          context.beginPath();
          context.strokeStyle = `rgba(128, 231, 255, ${(1 - distance / 135) * 0.16})`;
          context.lineWidth = 0.7;
          context.moveTo(particle.x, particle.y);
          context.lineTo(other.x, other.y);
          context.stroke();
        }
      }
    }
    if (!reduceMotion) animationFrame = requestAnimationFrame(drawNetwork);
  }

  window.addEventListener('pointermove', (event) => {
    pointerX = event.clientX - width / 2;
    pointerY = event.clientY - height / 2;
  }, { passive: true });

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animationFrame);
    resizeCanvas();
    drawNetwork();
  }, { passive: true });

  resizeCanvas();
  drawNetwork();
})();
