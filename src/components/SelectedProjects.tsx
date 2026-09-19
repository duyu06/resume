import { ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import MoreSystems from './MoreSystems';

const BASE = import.meta.env.BASE_URL;

const projects = [
  {
    n: '01',
    title: '果漾 AI',
    subtitle: '多模态内容生产系统',
    category: 'AI PRODUCT 0→1',
    summary: '把剧本、角色、分镜、图片、视频与合成组织成可追踪的 AI 生产工作流。',
    tags: ['Multimodal', 'Workflow', 'Go'],
    image: BASE + 'assets/projects/proj-01-a.png',
    link: 'https://guoyang.xin/',
  },
  {
    n: '02',
    title: 'AI 电商素材生成平台',
    subtitle: '商品 → 策略 → Prompt → 图像 → 版本',
    category: 'AI APPLICATION',
    summary: '围绕商品一致性、场景生成、局部重绘、批量对比与版本记录构建素材生产闭环。',
    tags: ['Prompt', 'Image', 'Evaluation'],
    image: BASE + 'assets/projects/project-ai-ecommerce-page-a.jpg',
    link: BASE + 'demos/ai-ecommerce/',
  },
  {
    n: '03',
    title: '数字人模型微调',
    subtitle: 'Data → Fine-tune → Eval → API',
    category: 'MODEL LIFECYCLE',
    summary: '清洗 7,328 条有效训练数据，建立 26 条标准测试 Prompt 与 25 分制评分卡。',
    tags: ['Dataset', 'Fine-tune', 'Eval'],
    image: BASE + 'assets/projects/proj-04-a.png',
    link: 'https://github.com/duyu06/resume',
  },
  {
    n: '04',
    title: 'yaoke 企业 AI 知识中台',
    subtitle: 'Retrieve → Rerank → Cite → Control',
    category: 'RAG / PLATFORM',
    summary: 'Next.js + FastAPI + Qdrant + BGE + BM25 + Cross-Encoder，覆盖混合检索、重排、引用溯源和 RBAC。',
    tags: ['RAG', 'Qdrant', 'Rerank'],
    image: BASE + 'assets/projects/project-yaoke-rag-page-a.svg',
    link: 'https://github.com/duyu06/rag',
  },
];

export default function SelectedProjects() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="projects" className="bg-ink px-5 py-20 text-white sm:px-8 md:px-10 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 grid gap-5 md:grid-cols-[1fr_0.75fr] md:items-end">
          <div>
            <p className="font-mono text-[0.64rem] uppercase tracking-[0.24em] text-blue-300">SELECTED SYSTEMS</p>
            <h2 className="mt-3 font-display text-[clamp(3rem,8vw,7.6rem)] font-black uppercase leading-[0.86] tracking-[-0.06em]">
              WORK,
              <br />
              NOT CARDS.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-white/55 md:justify-self-end md:text-base">
            主页面只保留最能证明“业务 × 模型 × 工程 × 交付”的项目，其他实验和二开项目继续保留在仓库与完整简历中。
          </p>
        </div>

        <div className="divide-y divide-white/12 border-y border-white/12">
          {projects.map((project, index) => {
            const external = project.link.startsWith('http');
            return (
              <motion.a
                key={project.n}
                data-project-system={project.n}
                href={project.link}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                data-motion-reveal
                initial={reduceMotion ? false : { opacity: 0, y: 22 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-5% 0px -5% 0px' }}
                transition={{ duration: 0.55, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
                className="group grid gap-5 py-7 sm:py-9 md:grid-cols-[64px_minmax(0,0.9fr)_minmax(260px,0.58fr)] md:items-center md:gap-8"
              >
                <span className="font-mono text-xs tracking-[0.2em] text-white/28">{project.n}</span>
                <div>
                  <p className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-blue-300/85">{project.category}</p>
                  <h3 className="mt-2 font-display text-[clamp(1.8rem,4vw,4.2rem)] font-bold leading-none tracking-[-0.045em]">
                    {project.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/45">{project.subtitle}</p>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-white/58">{project.summary}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span key={tag} className="border border-white/14 px-2.5 py-1 font-mono text-[0.56rem] tracking-[0.12em] text-white/45">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="relative overflow-hidden border border-white/12 bg-white/[0.035]">
                  <img
                    src={project.image}
                    alt={project.title + ' 项目界面'}
                    loading="lazy"
                    className="aspect-[16/10] w-full object-cover object-top opacity-78 transition duration-500 group-hover:scale-[1.025] group-hover:opacity-100"
                  />
                  <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center bg-black/55 text-white backdrop-blur">
                    <ArrowUpRight size={16} />
                  </span>
                </div>
              </motion.a>
            );
          })}
        </div>
        <MoreSystems />
      </div>
    </section>
  );
}
