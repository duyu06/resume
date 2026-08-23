import { useEffect, useState } from 'react';
import { ArrowRight, ExternalLink, X } from 'lucide-react';

const BASE = `${import.meta.env.BASE_URL}assets/projects/`;

type Project = {
  n: string;
  cat: string;
  nature: string;
  name: string;
  role: string;
  tags: string[];
  desc: string;
  bullets: string[];
  result: string;
  link: string;
  cta?: string;
  imgs: string[];
};

const projects: Project[] = [
  {
    n: '01', cat: 'AI Agent · 企业业务', nature: '完整产品 Demo · 双端适配', name: 'AI 客服数字人工作台',
    role: '产品设计 / AI Agent 集成 / 前端体验重构 · 2026.07',
    tags: ['AI Agent', 'Tool Calling', '业务工具', '风险控制', '人工接管', '服务指标'],
    desc: '将数字人、实时对话、客户洞察、业务工具调用与服务指标整合为企业 AI 客服工作台，覆盖售前咨询、订单物流、库存、退款与人工转接。',
    bullets: ['设计「意图与情绪识别→选择业务工具→验证业务结果→人工安全接管」Agent 工作流', '梳理客服导航、实时会话、客户洞察、服务指标与工具调用轨迹，建立可持续操作的信息架构', '保留订单、退款、情绪识别和人工转接状态机，并支持本地演示、FastAPI 后端和令牌隔离'],
    result: '形成从客户问题、Agent 决策、业务工具执行到服务质量反馈的完整可交互闭环，并通过桌面端、移动端和关键业务链路回归验证。',
    link: `${import.meta.env.BASE_URL}demos/digitalhuman/`, cta: '打开完整数字人工作台', imgs: ['project-digitalhuman-page-a.jpg', 'project-digitalhuman-page-b.jpg'],
  },
  {
    n: '02', cat: 'AI 产品 0→1 · 多模态', nature: '核心 AI 产品实践', name: '果漾 AI · 多模态内容生产平台',
    role: '产品与技术协同 / 核心参与者 · 持续迭代',
    tags: ['AI 产品 0→1', '多模态', '模型编排', '异步任务', '质量/成本', 'Go'],
    desc: '面向短视频、漫画及 AI 短剧创作者，参与定义从剧本输入到成片输出的端到端产品链路，将创作流程拆解为可交付的 AI 能力模块。',
    bullets: ['梳理「剧本→角色提取→四视图→分镜→首尾帧→逐镜头视频→FFmpeg 合成」完整业务流程，明确 MVP 边界', '围绕质量、成功率、时延与调用成本进行多模型选型，并设计异步任务、进度反馈、失败重试与结果留存', '协同 Go 后端、Vue 用户站/管理端与 Next.js AIComicBuilder，推动 AI 能力进入可演示、可迭代产品'],
    result: '完成端到端 MVP 与多模型接入方案，形成从业务需求、AI 能力设计到工程交付的完整产品链路，并为额度、套餐和计费预留扩展空间。',
    link: 'https://guoyang.xin/', imgs: ['project-01-a.png', 'project-01-b.png'],
  },
  {
    n: '03', cat: 'AI 应用产品 · 多模态', nature: '个人产品实践 · 交互原型', name: 'AI 电商素材生成平台',
    role: '产品负责人 / AI 应用与原型设计 · 2026',
    tags: ['AI 应用产品', '多模态', '模型选型', 'Prompt', '质量评测', '商业化'],
    desc: '面向独立站及跨境电商卖家，针对商品素材制作成本高、生产周期长、多平台适配重复与视觉风格不统一问题，设计 AI 商品素材生产链路。',
    bullets: ['规划「上传原图→识别主体→选择平台/风格→生成→批量对比→局部重绘→审核导出」核心流程', '将商品主体、材质、颜色、视角、Logo 与禁止修改项结构化为 Prompt 和验收字段', '按商品理解、抠图、背景生成、图像编辑、高清放大拆分模型能力，并规划失败重试、版本记录与多尺寸导出'],
    result: '完成产品需求、核心流程、Prompt 模板、质量验收标准与商业化方案，形成可演示的 AI 电商素材生产闭环。',
    link: `${import.meta.env.BASE_URL}demos/ai-ecommerce/`, imgs: ['project-ai-ecommerce-page-a.jpg', 'project-ai-ecommerce-page-b.jpg'],
  },
  {
    n: '04', cat: 'AI 平台 / 中台 · 推理服务', nature: '技术产品实践 · 平台原型', name: 'AI 模型服务与推理管理平台',
    role: '项目负责人 · 2025.03—至今',
    tags: ['AI Platform', 'vLLM / Ollama', '模型生命周期', '推理监控', '成本优化', 'Prometheus'],
    desc: '针对多模型部署入口分散、参数不统一、GPU 资源不可见与故障排查成本高等问题，搭建统一的模型服务、推理与监控能力。',
    bullets: ['统一模型部署、启动、参数配置、版本回滚与服务入口，Docker Compose 封装依赖，部署时间由约 4h 降至 20min', '建立 GPU、显存、Token 吞吐与服务状态监控链路，使用 Prometheus、Grafana 与 DCGM 观察运行质量', '围绕 temperature、top-p、repeat_penalty 等参数进行场景化调优，在输出质量、推理时延与资源占用之间权衡'],
    result: '形成可复用的模型部署、推理、监控、调优与故障排查方案；典型测试环境推理吞吐稳定在 50+ token/s，显存利用率控制在 85% 以下。',
    link: `${import.meta.env.BASE_URL}demos/webui/`, imgs: ['project-webui-page-a.jpg', 'project-webui-page-b.jpg'],
  },
  {
    n: '05', cat: '模型生命周期 · 微调与评测', nature: '模型应用实践 · 评测体系', name: '数字人风格对话模型 · 微调与评测',
    role: '产品负责人 / AI 应用实践 · 2026.04',
    tags: ['模型微调', '数据构建', 'Prompt', '标准测试集', '评分卡', 'API'],
    desc: '针对个性化数字人场景中的角色语气漂移、历史记忆缺失与上下文不连贯问题，建立从数据、Prompt、训练到评测和 API 部署的模型迭代流程。',
    bullets: ['清洗标注 7,328 条历史多模态对话，构建 JSONL 数据集及训练/验证集划分', '设计「角色设定 + 上下文 + 历史记忆 + 输出约束」Prompt 结构，支持产品侧格式化标记', '建立 26 条标准测试 Prompt + 25 分制评分卡，对模型版本进行一致性评测并支持后续迭代'],
    result: '不足两周完成需求、数据、训练、评测、部署和 API 调用全流程，沉淀标准测试集与评分卡，使模型迭代具备可比较、可复用的评测基础。',
    link: `${import.meta.env.BASE_URL}demos/model-finetune/`, imgs: ['project-04-a.png', 'project-04-b.png'],
  },
  {
    n: '06', cat: 'Agent · 场景落地', nature: '实验项目 · 产品原型', name: '叫魂者 · Multi-Agent 叙事对话系统',
    role: '技术负责人 / 产品原型设计 · 2025.02—2025.04',
    tags: ['Multi-Agent', 'Agent Orchestration', '状态管理', '信息隔离', 'Prompt', 'Python'],
    desc: '针对单 Agent 难以同时维持多角色身份、世界状态、真相进度与分支剧情的问题，设计多 Agent 协作与状态管理机制，验证复杂交互场景的产品可行性。',
    bullets: ['将角色 Agent、世界状态与剧情推进拆分为独立模块，建立多角色协作与上下文管理机制', '通过角色信息隔离与关键事实注入，降低角色越界、代词冲突与上下文丢失', '采用模拟/API 双模式先验证产品流程，再接入真实模型，降低早期调用成本并加快 0→1 验证'],
    result: '完成可交互 Multi-Agent 产品原型，验证多角色协作与分支叙事的技术可行性，沉淀可复用的 Prompt 与状态管理范式。',
    link: `${import.meta.env.BASE_URL}demos/soulcaller/`, imgs: ['project-soulcaller-page-a.jpg', 'project-soulcaller-page-b.jpg'],
  },
  {
    n: '07', cat: '业务自动化 · RPA', nature: '公司项目 · 交互原型', name: '多账号运营 RPA 自动化系统',
    role: '产品设计 / RPA 流程开发 · 2026',
    tags: ['RPA', '流程编排', '任务调度', '异常处理', '人工接管', '自动化'],
    desc: '针对多账号运营中的重复启动、登录、执行和记录流程，将人工操作拆解为标准化自动化工作流，并设计异常分支与人工接管机制。',
    bullets: ['建立「账号—环境—任务批次—执行记录」映射，定义任务输入、状态、时间和失败原因字段', '编排「读取任务→启动环境→访问页面→识别状态→执行→回写结果」自动化工作流', '覆盖加载超时、元素变化、登录失效、网络异常与人工确认等异常节点，确保流程具备可控退出路径'],
    result: '完成多账号任务导入、独立环境启动、自定义执行与结果回写的完整工作流原型，沉淀流程模板、异常处理和人工接管机制。',
    link: `${import.meta.env.BASE_URL}demos/rpa/`, imgs: ['project-rpa-page-a.jpg', 'project-rpa-page-b.jpg'],
  },
  {
    n: '08', cat: '商业产品 · DTC 电商', nature: '长沙果漾商贸有限公司 · 公司项目', name: '跨境电商购物独立站',
    role: '产品策划 / 技术协同 · 2026',
    tags: ['商业产品', 'SPU / SKU', '交易链路', '数据埋点', '转化漏斗', 'DTC'],
    desc: '围绕 DTC 品牌及跨境零售完成信息架构、核心交易链路、商品与订单模型和 MVP 范围设计，补充商业化产品能力证明。',
    bullets: ['设计「流量→浏览→详情→加购→结算→支付→订单/售后」主链路，并定义角色权限', '规划 SPU/SKU、库存、优惠、支付回调、库存扣减、订单超时、退款售后与异常补偿规则', '建立 view_item / add_to_cart / begin_checkout / purchase 埋点与转化漏斗，并与 AI 电商素材能力联动'],
    result: '完成独立站核心业务架构、用户流程、商品与订单模型、后台清单、交易规则、数据指标与 MVP 迭代规划。',
    link: `${import.meta.env.BASE_URL}demos/cross-border/`, imgs: ['project-yola-page-a.jpg', 'project-yola-page-b.jpg'],
  },
];

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[1200] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="dialog" aria-modal="true">
      <div className="glass relative flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[28px] sm:rounded-3xl">
        <header className="flex shrink-0 items-center justify-between border-b border-white/10 bg-white/90 px-5 py-4 backdrop-blur-xl">
          <div><p className="text-[0.6rem] uppercase tracking-[0.2em] text-accent">Project {project.n}</p><h3 className="mt-1 font-display text-base font-semibold text-ink">{project.name}</h3></div>
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-black text-white" aria-label="关闭项目详情"><X size={18} /></button>
        </header>
        <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-7 sm:py-7">
          <img src={`${BASE}${project.imgs[0]}`} alt={`${project.name} 项目截图`} className="mb-6 aspect-video w-full rounded-2xl object-cover" />
          <div className="mb-3 flex flex-wrap gap-2"><span className="pill-grad rounded-full px-3 py-1 text-xs text-ink-dim">{project.cat}</span><span className="rounded-full border border-ink/10 px-3 py-1 text-xs text-ink/50">{project.nature}</span></div>
          <p className="mb-1 text-sm text-ink-dim">{project.role}</p><p className="mb-6 leading-relaxed text-ink-dim/80">{project.desc}</p>
          <h4 className="mb-3 text-xs uppercase tracking-widest text-ink-dim/50">我的工作</h4>
          <ul className="mb-6 space-y-3">{project.bullets.map((b) => <li key={b} className="flex gap-3 text-sm leading-relaxed text-ink-dim/80"><ArrowRight size={14} className="mt-1 shrink-0 text-accent" />{b}</li>)}</ul>
          <div className="glass mb-6 rounded-2xl p-4"><h4 className="mb-2 text-xs uppercase tracking-widest text-ink-dim/50">项目结果</h4><p className="text-sm leading-relaxed text-ink-dim/90">{project.result}</p></div>
          <div className="flex flex-wrap gap-2">{project.tags.map((tag) => <span key={tag} className="pill-grad rounded-full px-3 py-1.5 text-xs text-ink-dim/70">{tag}</span>)}</div>
        </div>
        <footer className="shrink-0 border-t border-white/10 bg-white/90 p-4"><a href={project.link} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white sm:w-auto">{project.cta ?? '查看交互 Demo'}<ExternalLink size={16} /></a></footer>
      </div>
    </div>
  );
}

export default function ProjectsJdCatalog() {
  const [selected, setSelected] = useState<Project | null>(null);
  return (
    <section id="projects" className="relative w-full bg-black px-5 py-20 text-white sm:px-8 md:px-10 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 md:mb-16"><p className="mb-3 text-xs uppercase tracking-[0.3em] text-ink-dim/50">Selected Work · JD Match</p><h2 className="hero-heading font-display text-4xl md:text-5xl">精选项目</h2><p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink-dim md:text-base">按「AI 产品 0→1 → AI 应用 → AI 平台 → 模型生命周期 → Agent → 自动化 → 商业产品」排序，让每个项目直接回答 JD 的核心要求。</p></div>
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">{['AI 产品 0→1','AI 平台 / 中台','Agent 场景','模型生命周期'].map((x) => <div key={x} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-xs text-ink-dim sm:text-sm">{x}</div>)}</div>
        <div className="grid gap-5 md:grid-cols-2">{projects.map((project, index) => (
          <button key={project.n} onClick={() => setSelected(project)} className="glass group min-w-0 overflow-hidden rounded-2xl text-left transition hover:-translate-y-1 hover:border-white/20">
            <div className="aspect-video overflow-hidden bg-white/[0.03]"><img src={`${BASE}${project.imgs[0]}`} alt={project.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading={index < 2 ? 'eager' : 'lazy'} /></div>
            <div className="p-5 sm:p-6"><div className="mb-3 flex flex-wrap gap-2"><span className="pill-grad rounded-full px-2.5 py-1 text-[0.68rem] text-ink-dim">{project.cat}</span><span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[0.68rem] text-ink/50">{project.nature}</span></div><h3 className="mb-2 break-words font-display text-lg font-semibold text-white sm:text-xl">{project.n}. {project.name}</h3><p className="mb-3 text-xs text-ink-dim">{project.role}</p><p className="line-clamp-3 text-sm leading-relaxed text-ink/55">{project.desc}</p><div className="mt-4 flex flex-wrap gap-1.5">{project.tags.slice(0, 4).map((tag) => <span key={tag} className="rounded-full border border-white/10 px-2 py-0.5 text-[0.62rem] text-ink/45">{tag}</span>)}</div><span className="mt-5 inline-flex items-center gap-2 text-sm text-ink-dim transition group-hover:text-white">查看案例 <ArrowRight size={14} /></span></div>
          </button>
        ))}</div>
      </div>
      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
