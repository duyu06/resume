import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, ExternalLink, X } from 'lucide-react';

type Project = {
  n: string;
  cat: string;
  name: string;
  role: string;
  tags: string[];
  desc: string;
  bullets: string[];
  result: string;
  link?: string;
  imgs: string[];
};

const IMG_BASE = `${import.meta.env.BASE_URL}assets/projects/`;

const projects: Project[] = [
  {
    n: '01',
    cat: '平台产品 · Live',
    name: '果漾 AI · 多模态内容生产平台',
    role: '产品与技术协同 / 核心参与者 · 持续迭代',
    tags: ['Go / Gin', 'Vue 3', 'Next.js', 'FFmpeg', 'Redis', 'WebSocket'],
    desc: '面向短视频、漫画及 AI 短剧创作者，参与定义从剧本输入到成片输出的端到端 MVP，完成业务模块拆分、多模型能力接入、异步生成任务设计及前后端协同。线上产品：guoyang.xin',
    bullets: [
      '梳理落地「剧本导入—角色提取—四视图—智能分镜—首尾帧—逐镜头视频—FFmpeg 合成」链路',
      '异步任务队列 + WebSocket 实时进度 + 失败重试 + 结果留存；多模型按质量/时延/成功率/成本选型',
      'Go 后端 + Vue 用户站/管理端 + Next.js AIComicBuilder 多前端架构',
    ],
    result: '完成端到端 MVP 与多模型接入方案，系统具备产品演示和持续迭代基础，为额度管理、套餐分层及计费预留扩展空间。',
    link: 'https://guoyang.xin/',
    imgs: ['proj-01-a.png', 'proj-01-b.png'],
  },
  {
    n: '02',
    cat: 'AI 电商',
    name: 'AI 电商主图生成器',
    role: '产品负责人 / AI 应用与原型设计 · 持续迭代',
    tags: ['多模态生图', 'Prompt 模板', '参考图控制', '异步任务', '批量导出'],
    desc: '面向独立站、TEMU、TikTok Shop、Shopee 卖家，解决商品图成本高、周期长、多渠道尺寸重复适配与风格不统一问题。',
    bullets: [
      '设计「上传原图—识别主体卖点—选平台/风格—生成场景版式—批量对比—局部重绘—审核导出」流程',
      '主体锁定、参考图约束、负向提示词；将商品结构/颜色/Logo 保护纳入验收标准',
      '按商品理解/抠图/背景生成/图像编辑/高清放大拆分模型能力，规划异步任务与套餐商业化',
    ],
    result: '完成产品需求、核心流程、Prompt 模板体系、模型能力拆分和质量验收标准，形成可联动独立站商品后台的 AI 电商素材生产闭环。',
    imgs: ['proj-02-a.png', 'proj-02-b.png'],
  },
  {
    n: '03',
    cat: '电商独立站',
    name: '跨境电商购物独立站',
    role: '产品策划 / 技术协同 · 持续迭代',
    tags: ['SPU / SKU', '购物车结算', '订单履约', '埋点漏斗', 'DTC'],
    desc: '面向 DTC 品牌及跨境零售，完成信息架构、核心交易链路与 MVP 范围设计，降低对第三方平台依赖。',
    bullets: [
      '主链路：流量→浏览→详情→加购→结算→支付→订单/售后，含访客/用户/运营/管理员权限',
      '商品中心 SPU/SKU、库存、优惠、支付回调、库存扣减、订单超时、退款售后与异常补偿规则',
      'view_item / add_to_cart / begin_checkout / purchase 埋点及转化漏斗；联动 AI 主图生成器',
    ],
    result: '完成独立站核心业务架构、用户流程、商品与订单模型、后台清单、交易规则、埋点指标和 MVP 迭代规划。',
    imgs: ['proj-03-a.png', 'proj-03-b.png'],
  },
  {
    n: '04',
    cat: 'RPA 自动化',
    name: '多账号运营 RPA 自动化系统',
    role: '产品设计 / RPA 流程开发 · 持续迭代',
    tags: ['隐刀 RPA', '指纹浏览器', 'Excel / CSV', '流程编排', '异常处理'],
    desc: '网页版视频平台多账号运营需要人工逐个启动环境、登录平台、填写私信并记录结果，操作重复易漏，缺少统一管理。',
    bullets: [
      '指纹浏览器建立「账号—环境—任务批次—执行记录」映射；Excel/CSV 定义任务字段',
      '编排「读取任务—启动环境—访问页面—识别状态—填写提交—回写结果」自动化流程',
      '加载超时/元素变化/登录失效/频率控制/人工确认等异常处理与风险管控节点',
    ],
    result: '完成多账号任务导入、独立环境启动、自定义执行和结果回写的完整工作流原型，沉淀流程模板与异常处理机制。',
    imgs: ['proj-07-a.png', 'proj-07-b.png'],
  },
  {
    n: '05',
    cat: '模型微调',
    name: '数字人风格对话模型微调',
    role: '产品负责人 / AI 应用实践 · 2026.04',
    tags: ['Python', 'Hugging Face', 'JSONL', 'Prompt', 'API'],
    desc: '通用大模型在个性化数字人对话中容易出现角色语气漂移、历史记忆缺失、上下文不连贯等问题。',
    bullets: [
      '独立清洗标注 7,328 条历史多模态对话，构建 JSONL 数据集及训练/验证集划分',
      '设计「角色设定 + 上下文 + 历史记忆 + 输出约束」Prompt 结构，支持 [emoji]/[voice] 格式化标记',
      '构建 26 条标准测试 Prompt + 25 分制评分卡，五维评测模型版本',
    ],
    result: '不足两周完成需求、数据、训练、评测、部署和 API 调用全流程，Loss 正常收敛；沉淀数据模板、标准测试集与评分卡。',
    imgs: ['proj-04-a.png', 'proj-04-b.png'],
  },
  {
    n: '06',
    cat: '本地部署',
    name: 'Open WebUI + 多模型本地化平台',
    role: '项目负责人 · 2025.03 至今',
    tags: ['Ubuntu', 'Ollama / vLLM', 'Docker Compose', 'Prometheus', 'Grafana'],
    desc: '团队内部使用多个开源模型时，存在部署繁琐、入口分散、参数不统一、GPU 资源不可见等问题。',
    bullets: [
      'Docker Compose 封装服务依赖，一键启停与版本回滚，部署 4h → 20min',
      'GPU/显存/Token 吞吐监控（Prometheus + Grafana + DCGM）',
      'temperature、top-p、repeat_penalty 等场景化调参，输出质量与资源占用平衡',
    ],
    result: '推理吞吐稳定 18+ token/s，显存 < 85%，7×24 小时运行；形成可复用的部署、监控、调优和故障排查方案。',
    imgs: ['proj-05-a.png', 'proj-05-b.png'],
  },
  {
    n: '07',
    cat: 'Agent',
    name: '叫魂者 · 多 Agent 叙事对话系统',
    role: '技术负责人 / 产品原型设计 · 2025.02—2025.04',
    tags: ['AutoGen 0.7.5', 'Python', 'Groq API', 'Llama-3.1-8B'],
    desc: '传统单 Agent 互动叙事难以同时维持多角色身份、世界状态、真相进度和分支剧情。',
    bullets: [
      '独立完成 prompts.py、world_state.py、main.py，实现多角色协作与状态管理',
      '角色信息隔离与关键事实注入，改善角色越界、代词冲突与上下文丢失',
      '模拟/API 双模式 Tkinter GUI，先验证流程再接入真实模型',
    ],
    result: '完成可交互 0—1 多 Agent 产品原型，验证多角色协作与分支叙事技术可行性，沉淀可复用 Prompt 与状态管理范式。',
    imgs: ['proj-06-a.png', 'proj-06-b.png'],
  },
];

function ProjectDetailModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const [imgIdx, setImgIdx] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const prevRef = useRef<HTMLButtonElement>(null);

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
    prevRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onKey]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        ref={dialogRef}
        className="relative glass w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 md:p-8"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
          aria-label="关闭项目详情"
        >
          <X size={20} />
        </button>

        {/* Image gallery */}
        <div className="relative aspect-video rounded-xl overflow-hidden mb-6 bg-white/5 group">
          <img
            src={`${IMG_BASE}${project.imgs[imgIdx]}`}
            alt={`${project.name} 截图 ${imgIdx + 1}`}
            className="w-full h-full object-cover"
          />

          {project.imgs.length > 1 && (
            <>
              <button
                ref={prevRef}
                onClick={() => setImgIdx((i) => (i > 0 ? i - 1 : project.imgs.length - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white/80 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity hover:bg-black/70"
                aria-label="上一张"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                onClick={() => setImgIdx((i) => (i < project.imgs.length - 1 ? i + 1 : 0))}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white/80 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity hover:bg-black/70"
                aria-label="下一张"
              >
                <ArrowRight size={18} />
              </button>

              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {project.imgs.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      i === imgIdx ? 'bg-white' : 'bg-white/40'
                    }`}
                    aria-label={`第 ${i + 1} 张`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <span className="pill-grad inline-block rounded-full px-3 py-1 text-xs text-ink-dim mb-3">
          {project.cat}
        </span>

        <h3
          id="modal-title"
          className="hero-heading text-2xl md:text-3xl mb-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {project.name}
        </h3>

        <p className="text-ink-dim text-sm mb-4">{project.role}</p>

        <p className="text-ink-dim/80 leading-relaxed mb-6">{project.desc}</p>

        <div className="mb-6">
          <h4 className="text-xs uppercase tracking-widest text-ink-dim/50 mb-3">
            Highlights
          </h4>
          <ul className="space-y-2">
            {project.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-ink-dim/80">
                <ArrowRight size={14} className="mt-0.5 shrink-0 text-ink-dim/30" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass rounded-xl p-4 mb-6">
          <h4 className="text-xs uppercase tracking-widest text-ink-dim/50 mb-2">
            Result
          </h4>
          <p className="text-sm text-ink-dim/90">{project.result}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {project.tags.map((t) => (
            <span
              key={t}
              className="pill-grad rounded-full px-3 py-1 text-xs text-ink-dim/70"
            >
              {t}
            </span>
          ))}
        </div>

        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 pill-grad rounded-full px-5 py-2.5 text-sm hover:bg-white/[0.12] transition-colors group"
          >
            访问产品
            <ExternalLink
              size={14}
              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            />
          </a>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function ProjectsCatalog() {
  const [hovered, setHovered] = useState<number>(0);
  const [selected, setSelected] = useState<Project | null>(null);

  const activeIdx = hovered;
  const active = projects[activeIdx];

  return (
    <section id="projects" className="relative w-full min-h-screen bg-black text-white py-20 md:py-32 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 md:mb-16">
          <p
            className="text-xs uppercase tracking-[0.3em] text-ink-dim/50 mb-3"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Projects
          </p>
          <h2
            className="hero-heading text-4xl md:text-5xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Featured Work
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-0">
          {/* Left panel — project list */}
          <div className="lg:w-[35%] lg:pr-8">
            {/* Mobile: horizontal scrollable tabs */}
            <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none">
              {projects.map((p, i) => (
                <motion.button
                  key={p.n}
                  onClick={() => setSelected(p)}
                  onMouseEnter={() => setHovered(i)}
                  onFocus={() => setHovered(i)}
                  className={`group flex shrink-0 lg:shrink items-center gap-4 px-4 py-3 rounded-xl text-left transition-colors cursor-pointer ${
                    activeIdx === i
                      ? 'bg-white/[0.08]'
                      : 'hover:bg-white/[0.04]'
                  }`}
                >
                  <span
                    className="text-2xl md:text-3xl w-10 shrink-0 tabular-nums"
                    style={{
                      fontFamily: 'var(--font-display)',
                      color:
                        activeIdx === i
                          ? 'var(--color-ink)'
                          : 'var(--color-ink-dim)',
                      opacity: activeIdx === i ? 1 : 0.4,
                    }}
                  >
                    {p.n}
                  </span>
                  <div className="min-w-0">
                    <h3
                      className={`text-sm md:text-base truncate ${
                        activeIdx === i ? 'text-ink' : 'text-ink-dim/70'
                      }`}
                    >
                      {p.name}
                    </h3>
                    <span className="inline-block pill-grad rounded-full px-2 py-0.5 text-[10px] text-ink-dim/50 mt-1">
                      {p.cat}
                    </span>
                  </div>
                  <motion.span
                    className="hidden lg:block ml-auto"
                    initial={{ opacity: 0, x: -4 }}
                    animate={{
                      opacity: activeIdx === i ? 1 : 0,
                      x: activeIdx === i ? 0 : -4,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRight size={16} className="text-ink-dim/40" />
                  </motion.span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Right panel — preview */}
          <div className="lg:w-[65%] lg:pl-12 lg:border-l border-white/[0.08]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.n}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="h-full"
              >
                <div className="aspect-video rounded-xl overflow-hidden mb-6 bg-white/[0.03] border border-white/[0.06]">
                  <img
                    src={`${IMG_BASE}${active.imgs[0]}`}
                    alt={active.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                <span className="pill-grad inline-block rounded-full px-3 py-1 text-xs text-ink-dim mb-3">
                  {active.cat}
                </span>

                <h3
                  className="hero-heading text-xl md:text-2xl mb-2"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {active.name}
                </h3>

                <p className="text-ink-dim/70 text-sm mb-4">{active.role}</p>

                <p className="text-ink-dim/60 text-sm line-clamp-3 leading-relaxed mb-4">
                  {active.desc}
                </p>

                <p className="text-ink-dim/80 text-sm leading-relaxed">
                  {active.result}
                </p>

                <button
                  onClick={() => setSelected(active)}
                  className="mt-6 inline-flex items-center gap-2 text-sm text-ink-dim/60 hover:text-ink transition-colors group"
                >
                  View details
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <ProjectDetailModal
            project={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
