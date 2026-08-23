import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import FadeIn from './FadeIn';

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
  imgs: [string, string];
};

const projects: Project[] = [
  {
    n: '01',
    cat: 'AI 产品 0→1 · 多模态平台',
    name: '果漾 AI · 多模态内容生产平台',
    role: '产品与技术协同 / 核心参与者 · 持续迭代',
    tags: ['AI 产品 0→1', '多模态', '模型编排', '异步任务', '质量/成本', 'Go'],
    desc: '面向短视频、漫画及 AI 短剧创作者，参与定义从剧本输入到成片输出的端到端产品链路，将创作流程拆解为可交付的 AI 能力模块，并推动模型接入、任务系统与前后端协同落地。',
    bullets: [
      '梳理「剧本导入—角色提取—四视图—智能分镜—首尾帧—逐镜头视频—FFmpeg 合成」完整业务流程，明确 MVP 范围与模块边界',
      '异步任务队列 + WebSocket 实时进度 + 失败重试 + 结果留存；围绕质量、成功率、时延与成本进行多模型选型',
      '协同 Go 后端、Vue 用户站/管理端与 Next.js AIComicBuilder，推动 AI 能力从方案验证进入可演示、可迭代产品',
    ],
    result: '完成端到端 MVP 与多模型接入方案，形成从业务需求、AI 能力设计到工程交付的完整产品链路，并为额度、套餐与计费预留扩展空间。',
    link: 'https://guoyang.xin/',
    imgs: [
      `${import.meta.env.BASE_URL}assets/projects/proj-01-a.png`,
      `${import.meta.env.BASE_URL}assets/projects/proj-01-b.png`,
    ],
  },
  {
    n: '02',
    cat: 'AI 应用产品 · 多模态',
    name: 'AI 电商素材生成平台',
    role: '产品负责人 / AI 应用与原型设计 · 持续迭代',
    tags: ['AI 应用产品', '多模态', '模型选型', 'Prompt', '质量评测', '商业化'],
    desc: '面向独立站、TEMU、TikTok Shop、Shopee 卖家，针对商品素材制作成本高、生产周期长、多平台适配重复及视觉风格不统一等问题，设计 AI 商品素材生产链路。',
    bullets: [
      '设计「上传原图—识别主体卖点—选平台/风格—生成场景版式—批量对比—局部重绘—审核导出」核心用户流程',
      '通过主体锁定、参考图约束、负向提示词等机制保护商品结构、颜色与 Logo，并将质量要求转化为验收标准',
      '按商品理解、抠图、背景生成、图像编辑、高清放大拆分模型能力，规划异步任务、套餐与商业化链路',
    ],
    result: '完成产品需求、核心流程、Prompt 模板、模型能力拆分与质量验收标准，形成可联动独立站商品后台的 AI 电商素材生产闭环。',
    imgs: [
      `${import.meta.env.BASE_URL}assets/projects/proj-02-a.png`,
      `${import.meta.env.BASE_URL}assets/projects/proj-02-b.png`,
    ],
  },
  {
    n: '03',
    cat: 'AI 平台 / 中台 · 推理服务',
    name: 'AI 模型服务与推理管理平台',
    role: '项目负责人 · 2025.03 至今',
    tags: ['AI Platform', 'vLLM / Ollama', '模型生命周期', '推理监控', '成本优化', 'Prometheus'],
    desc: '针对团队内部多模型部署入口分散、参数不统一、GPU 资源不可见与故障排查成本高等问题，搭建统一的模型服务、推理与监控能力。',
    bullets: [
      '将模型部署、启动、参数配置、版本回滚与服务入口统一，Docker Compose 封装依赖，部署时间由 4h 降至 20min',
      '建立 GPU / 显存 / Token 吞吐监控链路，使用 Prometheus + Grafana + DCGM 观察推理资源与服务状态',
      '围绕 temperature、top-p、repeat_penalty 等参数进行场景化调优，在输出质量、推理时延与资源占用之间进行权衡',
    ],
    result: '形成可复用的模型部署、推理、监控、调优与故障排查方案；推理吞吐稳定 18+ token/s，显存控制在 85% 以下并支持持续运行。',
    imgs: [
      `${import.meta.env.BASE_URL}assets/projects/proj-05-a.png`,
      `${import.meta.env.BASE_URL}assets/projects/proj-05-b.png`,
    ],
  },
  {
    n: '04',
    cat: '模型生命周期 · 微调与评测',
    name: '数字人风格对话模型 · 微调与评测',
    role: '产品负责人 / AI 应用实践 · 2026.04',
    tags: ['模型微调', '数据构建', 'Prompt', '模型评测', '版本迭代', 'API'],
    desc: '针对通用大模型在个性化数字人场景中的角色语气漂移、历史记忆缺失与上下文不连贯问题，建立从数据、Prompt、训练到评测和 API 部署的模型迭代流程。',
    bullets: [
      '清洗标注 7,328 条历史多模态对话，构建 JSONL 数据集及训练/验证集划分，形成可重复的数据处理模板',
      '设计「角色设定 + 上下文 + 历史记忆 + 输出约束」Prompt 结构，支持 [emoji] / [voice] 等产品侧格式化标记',
      '建立 26 条标准测试 Prompt + 25 分制评分卡，从多个维度对模型版本进行一致性评测，为后续迭代提供依据',
    ],
    result: '不足两周完成需求、数据、训练、评测、部署和 API 调用全流程，沉淀标准测试集与评分卡，使模型迭代具备可比较、可复用的评测基础。',
    imgs: [
      `${import.meta.env.BASE_URL}assets/projects/proj-04-a.png`,
      `${import.meta.env.BASE_URL}assets/projects/proj-04-b.png`,
    ],
  },
  {
    n: '05',
    cat: 'Agent · 场景落地',
    name: '叫魂者 · Multi-Agent 叙事对话系统',
    role: '技术负责人 / 产品原型设计 · 2025.02—2025.04',
    tags: ['Multi-Agent', 'Agent Orchestration', '状态管理', 'Tool Calling', 'Prompt', 'Python'],
    desc: '针对单 Agent 难以同时维持多角色身份、世界状态、真相进度与分支剧情的问题，设计多 Agent 协作与状态管理机制，验证复杂交互场景的产品可行性。',
    bullets: [
      '将角色 Agent、世界状态与剧情推进拆分为独立模块，建立多角色协作与上下文管理机制',
      '通过角色信息隔离与关键事实注入，降低角色越界、代词冲突与上下文丢失，明确 Agent 的职责边界',
      '采用模拟/API 双模式先验证产品流程，再接入真实模型，降低早期模型调用成本并加快 0→1 验证',
    ],
    result: '完成可交互 0→1 Multi-Agent 产品原型，验证多角色协作与分支叙事的技术可行性，沉淀可复用的 Prompt 与状态管理范式。',
    imgs: [
      `${import.meta.env.BASE_URL}assets/projects/proj-06-a.png`,
      `${import.meta.env.BASE_URL}assets/projects/proj-06-b.png`,
    ],
  },
  {
    n: '06',
    cat: '业务自动化 · RPA',
    name: '多账号运营 RPA 自动化系统',
    role: '产品设计 / RPA 流程开发 · 持续迭代',
    tags: ['RPA', '流程编排', '任务调度', '异常处理', '人工接管', '自动化'],
    desc: '针对网页版视频平台多账号运营中重复启动环境、登录、执行任务和记录结果的问题，将人工操作拆解为标准化自动化流程，并设计异常分支与人工接管机制。',
    bullets: [
      '建立「账号—环境—任务批次—执行记录」映射，以 Excel / CSV 定义任务输入与结果字段',
      '编排「读取任务—启动环境—访问页面—识别状态—填写提交—回写结果」完整自动化工作流',
      '覆盖加载超时、元素变化、登录失效、频率控制与人工确认等异常节点，保证自动化流程具备可控退出路径',
    ],
    result: '完成多账号任务导入、独立环境启动、自定义执行与结果回写的完整工作流原型，沉淀流程模板、异常处理和人工接管机制。',
    imgs: [
      `${import.meta.env.BASE_URL}assets/projects/proj-07-a.png`,
      `${import.meta.env.BASE_URL}assets/projects/proj-07-b.png`,
    ],
  },
  {
    n: '07',
    cat: '商业产品 · DTC 电商',
    name: '跨境电商购物独立站',
    role: '产品策划 / 技术协同 · 持续迭代',
    tags: ['商业产品', '用户流程', '交易链路', '数据埋点', '转化漏斗', 'DTC'],
    desc: '面向 DTC 品牌及跨境零售，完成信息架构、核心交易链路与 MVP 范围设计，建立从流量进入到支付、履约与售后的完整产品闭环。',
    bullets: [
      '设计「流量→浏览→详情→加购→结算→支付→订单/售后」主链路，并定义访客、用户、运营与管理员权限',
      '设计 SPU/SKU、库存、优惠、支付回调、库存扣减、订单超时、退款售后与异常补偿规则',
      '建立 view_item / add_to_cart / begin_checkout / purchase 埋点与转化漏斗，并与 AI 电商素材生成能力联动',
    ],
    result: '完成独立站核心业务架构、用户流程、商品与订单模型、后台清单、交易规则、数据指标与 MVP 迭代规划，补充商业化产品能力证明。',
    imgs: [
      `${import.meta.env.BASE_URL}assets/projects/proj-03-a.png`,
      `${import.meta.env.BASE_URL}assets/projects/proj-03-b.png`,
    ],
  },
];

function ProjectCard({
  project,
  index,
  total,
  progress,
}: {
  project: Project;
  index: number;
  total: number;
  progress: ReturnType<typeof useScroll>['scrollYProgress'];
}) {
  const targetScale = 1 - (total - 1 - index) * 0.025;
  const rangeStart = index / total;
  const scale = useTransform(progress, [rangeStart, 1], [1, targetScale]);

  return (
    <div
      className="sticky flex h-[min(88vh,820px)] items-start justify-center"
      style={{ top: `calc(4.5rem + ${index * 22}px)` }}
    >
      <motion.article
        style={{ scale }}
        className="relative flex h-auto max-h-[min(82vh,760px)] w-full max-w-5xl flex-col gap-3 overflow-hidden rounded-[36px] border-2 border-ink bg-bg p-4 sm:rounded-[48px] sm:p-6 md:gap-4 md:p-8"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-start gap-3 md:gap-6">
            <span
              className="hero-heading font-display font-black leading-none"
              style={{ fontSize: 'clamp(2.2rem, 7vw, 88px)' }}
            >
              {project.n}
            </span>
            <div className="pt-1">
              <div className="text-[0.65rem] uppercase tracking-[0.18em] text-accent sm:text-xs">
                {project.cat}
              </div>
              <h3
                className="mt-1 max-w-lg font-display font-semibold leading-snug text-ink"
                style={{ fontSize: 'clamp(1rem, 2.2vw, 1.7rem)' }}
              >
                {project.name}
              </h3>
              <p className="mt-1 text-[0.7rem] text-ink-dim sm:text-xs">{project.role}</p>
            </div>
          </div>
          {project.link ? (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border-2 border-ink px-5 py-2 text-xs font-medium uppercase tracking-widest text-ink transition hover:bg-ink/10 sm:px-7 sm:py-2.5 sm:text-sm"
            >
              Live Project
            </a>
          ) : (
            <span className="rounded-full border-2 border-ink/40 px-5 py-2 text-xs font-medium uppercase tracking-widest text-ink/50 sm:px-7 sm:py-2.5 sm:text-sm">
              Case Study
            </span>
          )}
        </div>

        <p className="max-w-3xl text-xs leading-relaxed text-ink-dim sm:text-sm md:text-base">
          {project.desc}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {project.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-ink/20 px-2.5 py-0.5 text-[0.65rem] text-ink-dim"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-auto grid min-h-0 flex-1 grid-cols-1 gap-3 md:grid-cols-5 md:gap-4">
          <div className="hidden md:col-span-2 md:block">
            <img
              src={project.imgs[0]}
              alt=""
              className="h-full max-h-[320px] w-full rounded-[24px] object-cover md:rounded-[40px]"
              loading="lazy"
            />
          </div>
          <div className="relative min-h-[180px] md:col-span-3 md:min-h-0">
            <img
              src={project.imgs[1]}
              alt=""
              className="absolute inset-0 h-full w-full rounded-[24px] object-cover md:rounded-[40px]"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 rounded-b-[24px] bg-gradient-to-t from-bg via-bg/80 to-transparent p-4 pt-14 md:rounded-b-[40px] md:p-5">
              <ul className="mb-2 hidden flex-col gap-1 text-[0.7rem] text-ink/90 sm:flex md:text-xs">
                {project.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="rounded-xl border border-accent/30 bg-accent/10 px-3 py-2 text-[0.7rem] leading-relaxed text-ink md:text-xs">
                {project.result}
              </div>
            </div>
          </div>
        </div>
      </motion.article>
    </div>
  );
}

export default function ProjectsSection() {
  const container = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  });

  return (
    <section
      id="projects"
      ref={container}
      className="relative z-10 -mt-10 rounded-t-[40px] bg-bg px-4 pb-20 pt-16 sm:-mt-12 sm:rounded-t-[50px] sm:px-6 sm:pt-20 md:-mt-14 md:rounded-t-[60px] md:px-8 md:pt-24"
    >
      <FadeIn y={40}>
        <h2
          className="hero-heading mb-10 text-center font-display font-black uppercase leading-none tracking-tight sm:mb-14 md:mb-16"
          style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
        >
          Project
        </h2>
      </FadeIn>

      <div className="relative">
        {projects.map((p, i) => (
          <ProjectCard
            key={p.n}
            project={p}
            index={i}
            total={projects.length}
            progress={scrollYProgress}
          />
        ))}
      </div>
    </section>
  );
}
