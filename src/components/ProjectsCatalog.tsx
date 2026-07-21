import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ExternalLink, X } from 'lucide-react';

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
  link: string;
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
    imgs: ['proj-02-a.png', 'proj-02-b.png'],
  },
  {
    n: '02',
    group: '核心案例',
    cat: '模型微调',
    nature: '个人 AI 应用实践 · 交互原型',
    name: '数字人风格对话模型微调',
    role: '产品负责人 / AI 应用实践 · 2026.04',
    tags: ['Python', 'Hugging Face', 'JSONL', 'Prompt', '模型评测'],
    desc: '针对通用模型在个性化数字人对话中的角色语气漂移、历史记忆缺失、上下文不连贯和格式不稳定问题，完成数据、训练、评测与 API 调用闭环。',
    bullets: [
      '整理 1W+ 条原始历史多模态对话，经清洗、去重、标注与格式化后形成 7,328 条有效训练数据',
      '设计「角色设定 + 当前上下文 + 历史记忆 + 输出约束」Prompt 结构，支持 [emoji]、[voice] 等格式标记',
      '构建 26 条标准测试 Prompt 与 25 分制评分卡，评估人物一致性、上下文连贯性、自然度、稳定性和格式合规性',
    ],
    result: '不足两周完成需求、数据、训练、评测、部署和 API 调用闭环，沉淀角色数据模板、标准测试集、评分卡和交付说明。',
    link: `${import.meta.env.BASE_URL}demos/digitalhuman/`,
    imgs: ['proj-04-a.png', 'proj-04-b.png'],
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
    imgs: ['proj-07-a.png', 'proj-07-b.png'],
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
    imgs: ['proj-03-a.png', 'proj-03-b.png'],
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
    imgs: ['proj-05-a.png', 'proj-05-b.png'],
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
    imgs: ['proj-06-a.png', 'proj-06-b.png'],
  },
];

function ProjectDetailModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const [imgIdx, setImgIdx] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setImgIdx((i) => (i > 0 ? i - 1 : project.imgs.length - 1));
      if (e.key === 'ArrowRight') setImgIdx((i) => (i < project.imgs.length - 1 ? i + 1 : 0));
    },
    [onClose, project.imgs.length],
  );

  useEffect(() => {
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onKey]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <button className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} aria-label="关闭项目详情" />
      <motion.div
        className="glass relative max-h-[92svh] w-full max-w-2xl overflow-y-auto rounded-t-3xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:max-h-[90vh] sm:rounded-2xl sm:p-6 md:p-8"
        initial={{ opacity: 0, scale: 0.97, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 24 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <button
          ref={closeRef}
          onClick={onClose}
          className="absolute right-3 top-3 z-20 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80 sm:right-4 sm:top-4"
          aria-label="关闭项目详情"
        >
          <X size={20} />
        </button>

        <div className="group relative mb-6 aspect-video overflow-hidden rounded-xl bg-white/5">
          <img src={`${IMG_BASE}${project.imgs[imgIdx]}`} alt={`${project.name} 截图 ${imgIdx + 1}`} className="h-full w-full object-cover" />
          {project.imgs.length > 1 && (
            <>
              <button
                onClick={() => setImgIdx((i) => (i > 0 ? i - 1 : project.imgs.length - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2.5 text-white opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
                aria-label="上一张"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                onClick={() => setImgIdx((i) => (i < project.imgs.length - 1 ? i + 1 : 0))}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2.5 text-white opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
                aria-label="下一张"
              >
                <ArrowRight size={18} />
              </button>
              <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-2">
                {project.imgs.map((_, i) => (
                  <button key={i} onClick={() => setImgIdx(i)} className={`h-2.5 w-2.5 rounded-full ${i === imgIdx ? 'bg-white' : 'bg-white/40'}`} aria-label={`第 ${i + 1} 张`} />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          <span className="pill-grad rounded-full px-3 py-1 text-xs text-ink-dim">{project.group}</span>
          <span className="pill-grad rounded-full px-3 py-1 text-xs text-ink-dim">{project.cat}</span>
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-ink/55">{project.nature}</span>
        </div>

        <h3 id="modal-title" className="hero-heading mb-2 pr-10 font-display text-2xl md:text-3xl">{project.name}</h3>
        <p className="mb-4 text-sm text-ink-dim">{project.role}</p>
        <p className="mb-6 leading-relaxed text-ink-dim/80">{project.desc}</p>

        <div className="mb-6">
          <h4 className="mb-3 text-xs uppercase tracking-widest text-ink-dim/50">我的工作</h4>
          <ul className="space-y-2">
            {project.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3 text-sm leading-relaxed text-ink-dim/80">
                <ArrowRight size={14} className="mt-1 shrink-0 text-ink-dim/30" />
                <span className="min-w-0 break-words">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass mb-6 rounded-xl p-4">
          <h4 className="mb-2 text-xs uppercase tracking-widest text-ink-dim/50">项目结果</h4>
          <p className="text-sm leading-relaxed text-ink-dim/90">{project.result}</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span key={tag} className="pill-grad rounded-full px-3 py-1 text-xs text-ink-dim/70">{tag}</span>
          ))}
        </div>

        <a href={project.link} target="_blank" rel="noopener noreferrer" className="pill-grad inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm transition-colors hover:bg-white/[0.12]">
          查看交互 Demo
          <ExternalLink size={14} />
        </a>
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
