import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ExternalLink, X } from 'lucide-react';
import './ProjectModalMobile.css';

type ProjectGroup = '核心案例' | '实验与补充';

type Project = {
  n: string;
  group: ProjectGroup;
  cat: string;
  nature: string;
  name: string;
  role: string;
  tags: string[];
  desc: string;
  bullets: string[];
  result: string;
  proof?: string[];
  link: string;
  cta?: string;
  imgs: string[];
};

const IMG_BASE = `${import.meta.env.BASE_URL}assets/projects/`;

const projects: Project[] = [
  {
    n: '01',
    group: '核心案例',
    cat: 'AI 电商',
    nature: '个人产品实践 · 交互原型',
    name: 'AI 电商主图生成器',
    role: '产品负责人 / AI 应用与原型设计 · 2026',
    tags: ['多模态图像', 'Prompt 模板', '参考图控制', '异步任务', '批量导出'],
    desc: '面向独立站及跨境电商卖家，解决商品图制作成本高、周期长、多渠道尺寸重复适配和风格不统一问题。',
    bullets: [
      '规划「上传原图—识别主体与卖点—选择平台/类目/风格—生成场景与版式—批量对比—局部重绘—审核导出」流程',
      '将商品主体、材质、颜色、视角、Logo、包装文字和禁止修改项结构化为 Prompt 与验收字段',
      '按商品理解、抠图、背景生成、图像编辑、高清放大和文字排版拆分模型能力，规划失败重试、版本记录和多尺寸导出',
    ],
    result: '完成产品需求、核心流程、Prompt 模板、质量验收标准和商业化方案，形成可演示的 AI 电商素材生产闭环。',
    link: `${import.meta.env.BASE_URL}demos/ai-ecommerce/`,
    imgs: ['project-ai-ecommerce-page-a.jpg', 'project-ai-ecommerce-page-b.jpg'],
  },
  {
    n: '02',
    group: '核心案例',
    cat: 'AI 客服数字人',
    nature: '完整产品 Demo · 双端适配',
    name: 'AI 客服数字人工作台',
    role: '产品设计 / AI Agent 集成 / 前端体验重构 · 2026.07',
    tags: ['FastAPI', 'Tool Calling', 'GSAP / ScrollTrigger', '情绪与风险识别', '人工安全接管'],
    desc: '将数字人舞台、实时对话、客户洞察、业务工具调用和服务指标整合为一套分层 AI 客服工作台，覆盖售前咨询、订单与物流、库存、退款及人工转接。',
    bullets: [
      '重构左侧客服导航、AI 数字人舞台、实时会话、客户洞察、服务指标与工具调用轨迹，形成可持续操作的客服工作台信息架构',
      '设计「意图与情绪识别—选择业务工具—验证业务结果—人工安全接管」四阶段 Agent 工作流，覆盖订单、库存、退款预申请、正式退款与人工转接',
      '使用 GSAP 与 ScrollTrigger 完成分阶段入场、数字人呼吸与浮动、智能光环、语音波形、光晕跟随、轻量视差、消息与工具卡动效，并提供 prefers-reduced-motion 降级',
      '保留原有订单、退款、情绪识别和人工转接业务状态机，支持本地无密钥演示模式、FastAPI 真实后端模式及 sessionStorage 令牌隔离',
    ],
    result: '完成桌面端与移动端 AI 客服数字人工作台，形成从客户问题、Agent 决策、业务工具执行到服务质量反馈的完整可交互闭环。',
    proof: [
      'npm ci、生产构建、GSAP 脚本语法检查与 Chromium 生产预览通过',
      '桌面端、移动端、全项目演示模式及横向溢出专项回归通过',
      '订单、退款、人工转接和真实后端模拟链路通过，动画未改写业务状态机',
    ],
    link: `${import.meta.env.BASE_URL}demos/digitalhuman/`,
    cta: '打开完整数字人工作台',
    imgs: ['project-digitalhuman-page-a.jpg', 'project-digitalhuman-page-b.jpg'],
  },
  {
    n: '03',
    group: '核心案例',
    cat: 'RPA 自动化',
    nature: '公司项目 · 交互原型',
    name: '多账号运营 RPA 自动化系统',
    role: '产品设计 / RPA 流程开发 · 2026',
    tags: ['隐刀 RPA', '多环境账号隔离', 'Excel / CSV', '流程编排', '人工审核'],
    desc: '将重复运营步骤转化为可配置任务流程，并通过频率控制、人工确认、异常中止和日志回传降低自动化执行风险。',
    bullets: [
      '建立「账号—浏览器环境—任务批次—执行记录」映射，定义任务编号、目标页面、内容、状态、时间和失败原因字段',
      '编排「任务读取—启动环境—访问页面—识别状态—填写内容—人工确认—提交操作—结果回写」流程',
      '针对加载超时、元素变化、登录失效、网络异常和任务中断配置显式等待、条件判断、失败重试、暂停和人工接管',
    ],
    result: '完成多账号环境启动、自定义任务执行和结果回写原型，沉淀流程模板、异常处理和审计日志规范。',
    link: `${import.meta.env.BASE_URL}demos/rpa/`,
    imgs: ['project-rpa-page-a.jpg', 'project-rpa-page-b.jpg'],
  },
  {
    n: '04',
    group: '核心案例',
    cat: '电商产品',
    nature: '长沙果漾商贸有限公司 · 公司项目',
    name: '跨境电商购物独立站',
    role: '产品策划 / 技术协同 · 2026',
    tags: ['SPU / SKU', '购物车结算', '订单履约', '埋点漏斗', 'AI 素材'],
    desc: '围绕 DTC 品牌及跨境零售完成信息架构、核心交易链路、商品与订单模型和 MVP 范围设计，并将 AI 主图生成能力嵌入商品建档和素材迭代流程。',
    bullets: [
      '梳理「流量进入—商品浏览—详情页—购物车—结算—支付—订单查询/售后」交易链路及角色权限',
      '规划 SPU/SKU、规格属性、价格、库存、媒体、上下架、分类标签、订单和售后数据模型',
      '设计优惠、运费、支付回调、库存扣减、订单超时、退款售后和异常补偿规则，以及 view_item 至 purchase 转化漏斗',
    ],
    result: '完成独立站 MVP、后台功能清单、交易规则、行为埋点和版本规划，并形成 AI 素材与商品后台联动方案。',
    link: `${import.meta.env.BASE_URL}demos/cross-border/`,
    imgs: ['project-yola-page-a.jpg', 'project-yola-page-b.jpg'],
  },
  {
    n: '05',
    group: '实验与补充',
    cat: '本地部署',
    nature: '技术实践 · 交互原型',
    name: 'Open WebUI + 多模型本地化平台',
    role: '项目负责人 · 2025.03—至今',
    tags: ['Ubuntu', 'Ollama / vLLM', 'Docker Compose', 'Prometheus', 'Grafana'],
    desc: '围绕统一模型入口、服务部署、参数管理和 GPU 资源可观测性，搭建本地多模型访问、推理与监控环境。',
    bullets: [
      '接入 Llama、Gemma、DeepSeek 等模型，配置 Ollama / vLLM 推理服务和 Open WebUI 统一入口',
      '使用 Docker Compose 封装服务依赖，支持一键启停、版本回滚和部署模板复用，将单次人工部署由约 4 小时缩短至 20 分钟',
      '基于 Prometheus、Grafana 和 DCGM 监控 GPU、CPU、显存、服务状态与 Token 吞吐，并开展参数场景化测试',
    ],
    result: '在典型测试环境中推理吞吐稳定在 50+ token/s、显存利用率控制在 85% 以下，形成可复用的部署、监控和故障排查方案。',
    link: `${import.meta.env.BASE_URL}demos/webui/`,
    imgs: ['project-webui-page-a.jpg', 'project-webui-page-b.jpg'],
  },
  {
    n: '06',
    group: '实验与补充',
    cat: '多 Agent',
    nature: '实验项目 · 交互原型',
    name: '叫魂者 · 多 Agent 叙事对话系统',
    role: '技术负责人 / 产品原型设计 · 2025.02—2025.04',
    tags: ['AutoGen', 'Python', '状态管理', '信息隔离', 'Tkinter'],
    desc: '验证多角色身份、世界状态、真相进度和分支剧情在多 Agent 叙事场景中的协同可行性。',
    bullets: [
      '基于 AutoGen 设计多 Agent 协作框架，将角色身份、行为边界、叙事规则和状态追踪转化为结构化 Prompt',
      '通过角色信息隔离、状态字段约束和关键事实注入改善角色越界、代词冲突和上下文丢失',
      '完成支持模拟模式与真实 API 模式切换的 Tkinter GUI 原型，用于验证消息流和剧情分支',
    ],
    result: '完成可交互的多 Agent 产品原型，验证多角色协作与分支叙事的技术可行性，并沉淀 Prompt 与状态管理范式。',
    link: `${import.meta.env.BASE_URL}demos/soulcaller/`,
    imgs: ['project-soulcaller-page-a.jpg', 'project-soulcaller-page-b.jpg'],
  },
];

function ProjectDetailModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const [imgIdx, setImgIdx] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const lockedScrollY = useRef(0);

  const onKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key === 'ArrowLeft') {
        setImgIdx((index) => (index > 0 ? index - 1 : project.imgs.length - 1));
        return;
      }

      if (event.key === 'ArrowRight') {
        setImgIdx((index) => (index < project.imgs.length - 1 ? index + 1 : 0));
        return;
      }

      if (event.key !== 'Tab' || !modalRef.current) return;

      const focusable = [...modalRef.current.querySelectorAll<HTMLElement>('button,a[href],[tabindex]:not([tabindex="-1"])')].filter(
        (element) => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true',
      );

      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose, project.imgs.length],
  );

  useEffect(() => {
    lockedScrollY.current = window.scrollY;
    const body = document.body;
    const previousStyles = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    };
    const scrollbarGap = window.innerWidth - document.documentElement.clientWidth;

    document.addEventListener('keydown', onKey);
    body.classList.add('project-modal-open');
    body.style.position = 'fixed';
    body.style.top = `-${lockedScrollY.current}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    if (scrollbarGap > 0) body.style.paddingRight = `${scrollbarGap}px`;
    closeRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      body.classList.remove('project-modal-open');
      body.style.position = previousStyles.position;
      body.style.top = previousStyles.top;
      body.style.left = previousStyles.left;
      body.style.right = previousStyles.right;
      body.style.width = previousStyles.width;
      body.style.overflow = previousStyles.overflow;
      body.style.paddingRight = previousStyles.paddingRight;
      window.scrollTo(0, lockedScrollY.current);
    };
  }, [onKey]);

  return (
    <motion.div
      className="fixed inset-0 z-[1200] flex items-end justify-center overflow-hidden p-0 sm:items-center sm:p-4 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      aria-describedby="project-modal-description"
    >
      <button className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} aria-label="关闭项目详情" />

      <motion.div
        ref={modalRef}
        className="project-modal-shell glass relative z-10 flex h-[94dvh] max-h-[94dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] sm:h-[min(90dvh,820px)] sm:max-h-[90dvh] sm:rounded-2xl"
        initial={{ opacity: 0, scale: 0.97, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 24 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <header className="relative z-30 flex shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-white/88 px-4 pb-3 pt-[max(0.85rem,env(safe-area-inset-top))] shadow-[0_8px_28px_rgba(15,23,42,0.06)] backdrop-blur-2xl sm:bg-white/82 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <p className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-accent/75">Project {project.n}</p>
            <p className="mt-1 truncate font-display text-sm font-semibold text-ink sm:text-base">{project.name}</p>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-ink/10 bg-black/75 text-white shadow-[0_10px_28px_rgba(15,23,42,0.18)] transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            aria-label="关闭项目详情"
          >
            <X size={20} />
          </button>
        </header>

        <div className="project-modal-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6">
          <div className="group relative mb-6 aspect-video overflow-hidden rounded-xl bg-white/5">
            <img src={`${IMG_BASE}${project.imgs[imgIdx]}`} alt={`${project.name} 截图 ${imgIdx + 1}`} className="h-full w-full object-cover" />
            {project.imgs.length > 1 && (
              <>
                <button
                  onClick={() => setImgIdx((index) => (index > 0 ? index - 1 : project.imgs.length - 1))}
                  className="absolute left-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/65 text-white opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
                  aria-label="上一张"
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  onClick={() => setImgIdx((index) => (index < project.imgs.length - 1 ? index + 1 : 0))}
                  className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/65 text-white opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
                  aria-label="下一张"
                >
                  <ArrowRight size={18} />
                </button>
                <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-2">
                  {project.imgs.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setImgIdx(index)}
                      className={`h-3 w-3 rounded-full border border-black/20 ${index === imgIdx ? 'bg-white' : 'bg-white/40'}`}
                      aria-label={`第 ${index + 1} 张`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            <span className="pill-grad rounded-full px-3 py-1 text-xs text-ink-dim">{project.group}</span>
            <span className="pill-grad rounded-full px-3 py-1 text-xs text-ink-dim">{project.cat}</span>
            <span className="rounded-full border border-ink/10 bg-white/55 px-3 py-1 text-xs text-ink/55">{project.nature}</span>
          </div>

          <h3 id="project-modal-title" className="hero-heading mb-2 break-words font-display text-2xl md:text-3xl">{project.name}</h3>
          <p className="mb-4 text-sm text-ink-dim">{project.role}</p>
          <p id="project-modal-description" className="mb-6 leading-relaxed text-ink-dim/80">{project.desc}</p>

          <div className="mb-6">
            <h4 className="mb-3 text-xs uppercase tracking-widest text-ink-dim/50">我的工作</h4>
            <ul className="space-y-3">
              {project.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 text-sm leading-relaxed text-ink-dim/80">
                  <ArrowRight size={14} className="mt-1 shrink-0 text-ink-dim/30" />
                  <span className="min-w-0 break-words">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass mb-6 rounded-xl p-4 sm:p-5">
            <h4 className="mb-2 text-xs uppercase tracking-widest text-ink-dim/50">项目结果</h4>
            <p className="text-sm leading-relaxed text-ink-dim/90">{project.result}</p>
          </div>

          {project.proof && (
            <div className="mb-6 rounded-xl border border-ink/10 bg-white/45 p-4 sm:p-5">
              <h4 className="mb-3 text-xs uppercase tracking-widest text-ink-dim/50">交付与验证</h4>
              <ul className="space-y-2.5">
                {project.proof.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-ink-dim/80">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span className="min-w-0 break-words">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span key={tag} className="pill-grad rounded-full px-3 py-1.5 text-xs text-ink-dim/70">{tag}</span>
            ))}
          </div>
        </div>

        <footer className="relative z-30 shrink-0 border-t border-white/10 bg-white/90 px-4 pb-[max(0.8rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_34px_rgba(15,23,42,0.08)] backdrop-blur-2xl sm:bg-white/84 sm:px-6 sm:pb-4 md:px-8">
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.28)] transition hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 sm:w-auto"
          >
            {project.cta ?? '查看交互 Demo'}
            <ExternalLink size={16} />
          </a>
        </footer>
      </motion.div>
    </motion.div>
  );
}

function ProjectGroupSection({ title, items, onSelect }: { title: ProjectGroup; items: Project[]; onSelect: (project: Project) => void }) {
  return (
    <div className="mb-16 last:mb-0">
      <div className="mb-6 flex items-center gap-4">
        <h3 className="font-display text-xl font-semibold text-white sm:text-2xl">{title}</h3>
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-ink-dim">{items.length} 个项目</span>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {items.map((project, index) => (
          <motion.button
            key={project.name}
            onClick={() => onSelect(project)}
            className="glass group min-w-0 overflow-hidden rounded-2xl text-left transition hover:-translate-y-1 hover:border-white/20"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '40px' }}
            transition={{ delay: index * 0.06, duration: 0.45 }}
          >
            <div className="aspect-video overflow-hidden bg-white/[0.03]">
              <img src={`${IMG_BASE}${project.imgs[0]}`} alt={project.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" />
            </div>
            <div className="p-5 sm:p-6">
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="pill-grad rounded-full px-2.5 py-1 text-[0.68rem] text-ink-dim">{project.cat}</span>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[0.68rem] text-ink/50">{project.nature}</span>
              </div>
              <h4 className="mb-2 break-words font-display text-lg font-semibold text-white sm:text-xl">{project.name}</h4>
              <p className="mb-3 text-xs text-ink-dim">{project.role}</p>
              <p className="line-clamp-3 text-sm leading-relaxed text-ink/55">{project.desc}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm text-ink-dim transition group-hover:text-white">查看案例 <ArrowRight size={14} /></span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default function ProjectsCatalog() {
  const [selected, setSelected] = useState<Project | null>(null);
  const core = projects.filter((project) => project.group === '核心案例');
  const labs = projects.filter((project) => project.group === '实验与补充');

  return (
    <section id="projects" className="relative w-full bg-black px-5 py-20 text-white sm:px-8 md:px-10 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 md:mb-16">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-ink-dim/50">Selected Work</p>
          <h2 className="hero-heading font-display text-4xl md:text-5xl">精选项目</h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-dim md:text-base">果漾 AI 已在上方作为代表项目单独展示；这里按核心案例与实验项目分组，明确项目性质、个人职责和可验证交付。</p>
        </div>

        <ProjectGroupSection title="核心案例" items={core} onSelect={setSelected} />
        <ProjectGroupSection title="实验与补充" items={labs} onSelect={setSelected} />
      </div>

      <AnimatePresence>{selected && <ProjectDetailModal project={selected} onClose={() => setSelected(null)} />}</AnimatePresence>
    </section>
  );
}
