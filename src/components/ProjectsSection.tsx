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
    imgs: [
      `${import.meta.env.BASE_URL}assets/projects/proj-01-a.png`,
      `${import.meta.env.BASE_URL}assets/projects/proj-01-b.png`,
    ],
  },
  {
    n: '02',
    cat: 'AI 电商 · 新增',
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
    link: 'http://127.0.0.1:8323/',
    imgs: [
      `${import.meta.env.BASE_URL}assets/projects/proj-02-a.png`,
      `${import.meta.env.BASE_URL}assets/projects/proj-02-b.png`,
    ],
  },
  {
    n: '03',
    cat: '电商独立站 · 新增',
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
    link: 'http://127.0.0.1:8324/',
    imgs: [
      `${import.meta.env.BASE_URL}assets/projects/proj-03-a.png`,
      `${import.meta.env.BASE_URL}assets/projects/proj-03-b.png`,
    ],
  },
  {
    n: '04',
    cat: 'RPA 自动化 · 新增',
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
    link: 'http://127.0.0.1:8325/',
    imgs: [
      `${import.meta.env.BASE_URL}assets/projects/proj-07-a.png`,
      `${import.meta.env.BASE_URL}assets/projects/proj-07-b.png`,
    ],
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
    link: 'http://127.0.0.1:8327/',
    imgs: [
      `${import.meta.env.BASE_URL}assets/projects/proj-04-a.png`,
      `${import.meta.env.BASE_URL}assets/projects/proj-04-b.png`,
    ],
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
    link: 'http://127.0.0.1:8328/',
    imgs: [
      `${import.meta.env.BASE_URL}assets/projects/proj-05-a.png`,
      `${import.meta.env.BASE_URL}assets/projects/proj-05-b.png`,
    ],
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
    link: 'http://127.0.0.1:8326/',
    imgs: [
      `${import.meta.env.BASE_URL}assets/projects/proj-06-a.png`,
      `${import.meta.env.BASE_URL}assets/projects/proj-06-b.png`,
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
