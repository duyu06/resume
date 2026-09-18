import { useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

const BASE = import.meta.env.BASE_URL;

const scenes = [
  {
    n: '01',
    kicker: 'PROBLEM',
    title: 'AI 创作不是“调用一次模型”。',
    body: '真正的产品问题，是如何把剧本、角色、分镜、图片、视频与合成组织成一条可追踪、可恢复的生产链。',
  },
  {
    n: '02',
    kicker: 'WORKFLOW',
    title: '把创作拆成可交付的 AI 能力模块。',
    body: '剧本 → 角色提取 → 四视图 → 分镜 → 首尾帧 → 逐镜头视频 → FFmpeg 合成，每一步都有输入、状态、结果和异常。',
  },
  {
    n: '03',
    kicker: 'PRODUCT',
    title: '模型能力进入产品后，必须可管理。',
    body: '围绕模型路由、异步任务、进度反馈、失败重试、版本留存与调用成本，建立可以持续迭代的产品结构。',
  },
  {
    n: '04',
    kicker: 'RESULT',
    title: 'FROM MODEL CAPABILITY TO PRODUCT CAPABILITY.',
    body: '完成端到端 MVP 与多模型接入方案，并为额度、套餐、计费和后续商业化保留扩展空间。',
  },
];

const workflow = ['剧本', '角色', '四视图', '分镜', '图片', '视频', '成片'];

export default function GuoyangCaseStudy() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 15%', 'end 85%'],
  });

  const productOpacity = useTransform(scrollYProgress, [0.42, 0.58], [0, 1]);
  const productScale = useTransform(scrollYProgress, [0.42, 0.7], [1.035, 1]);
  const imageScale = useTransform(scrollYProgress, [0, 0.9], [1.02, 0.96]);
  const progress = useTransform(scrollYProgress, [0.04, 0.92], [0.04, 1]);

  return (
    <section id="guoyang" ref={ref} className="relative bg-bg px-5 py-20 sm:px-8 md:px-10 md:py-32">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12 grid gap-8 border-b border-ink/10 pb-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="font-mono text-[0.64rem] uppercase tracking-[0.24em] text-accent">CASE 01 / GUOYANG AI</p>
            <h2 className="mt-3 max-w-5xl font-display text-[clamp(3rem,8vw,7.8rem)] font-black leading-[0.86] tracking-[-0.06em] text-ink">
              果漾 AI
              <br />
              多模态内容生产平台
            </h2>
          </div>
          <a
            href="https://guoyang.xin/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-ink transition hover:text-accent"
          >
            LIVE PRODUCT <ExternalLink size={14} />
          </a>
        </header>

        <div className="grid gap-12 lg:grid-cols-[minmax(320px,0.82fr)_minmax(0,1.18fr)] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <motion.div
              className="relative overflow-hidden border border-ink/10 bg-surface"
              style={reduceMotion ? undefined : { scale: imageScale }}
            >
              <img
                src={BASE + 'assets/projects/proj-01-a.png'}
                alt="果漾 AI 产品界面"
                className="aspect-[4/3] w-full object-cover object-top"
                loading="lazy"
              />
              <motion.img
                src={BASE + 'assets/projects/proj-01-b.png'}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover object-top"
                style={reduceMotion ? { opacity: 0 } : { opacity: productOpacity, scale: productScale }}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent px-4 pb-4 pt-16 text-white">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-white/60">PRODUCT SYSTEM</p>
                    <p className="mt-1 text-xs text-white/85">需求 → 模型 → 工作流 → 结果</p>
                  </div>
                  <span className="font-mono text-[0.55rem] uppercase tracking-[0.14em] text-white/55">SCROLL-DRIVEN</span>
                </div>
              </div>
            </motion.div>

            <div className="relative mt-4 overflow-hidden border border-ink/10 bg-bg px-4 py-4">
              <div className="absolute bottom-0 left-0 top-0 w-[2px] bg-ink/8" />
              <motion.div
                className="absolute bottom-0 left-0 top-0 w-[2px] origin-top bg-accent"
                style={reduceMotion ? { scaleY: 1 } : { scaleY: progress }}
              />
              <p className="font-mono text-[0.56rem] uppercase tracking-[0.18em] text-ink/35">WORKFLOW</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {workflow.map((item, index) => (
                  <span key={item} className="flex items-center gap-2 text-xs text-ink-dim">
                    <span className="font-mono text-[0.52rem] text-accent/70">{String(index + 1).padStart(2, '0')}</span>
                    {item}
                    {index < workflow.length - 1 && <span className="text-ink/20">→</span>}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden border border-ink/10 bg-ink/10">
              {[
                ['ROLE', 'Product / Engineering'],
                ['STACK', 'Go / Vue / Next.js'],
                ['SYSTEM', 'Multimodal Workflow'],
                ['FOCUS', 'Quality / Cost / Delivery'],
              ].map(([key, value]) => (
                <div key={key} className="bg-bg p-4">
                  <p className="font-mono text-[0.56rem] tracking-[0.2em] text-ink/35">{key}</p>
                  <p className="mt-1 text-xs leading-5 text-ink">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="divide-y divide-ink/10 border-y border-ink/10">
            {scenes.map((scene, index) => (
              <motion.article
                key={scene.n}
                initial={{ opacity: 0.32, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.62 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="grid min-h-[48vh] content-center gap-5 py-10 sm:min-h-[58vh] md:grid-cols-[72px_1fr] md:gap-7 lg:min-h-[72vh]"
              >
                <span className="font-mono text-xs tracking-[0.2em] text-ink/30">{scene.n}</span>
                <div>
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-accent">{scene.kicker}</p>
                  <h3 className="mt-3 max-w-3xl font-display text-[clamp(1.9rem,4.2vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.045em] text-ink">
                    {scene.title}
                  </h3>
                  <p className="mt-5 max-w-2xl text-sm leading-7 text-ink-dim sm:text-base">{scene.body}</p>
                  {index === 2 && (
                    <div className="mt-7 flex flex-wrap gap-2">
                      {['MODEL ROUTING', 'ASYNC JOB', 'VERSION', 'RETRY', 'COST'].map((tag) => (
                        <span key={tag} className="border border-ink/12 px-3 py-1.5 font-mono text-[0.58rem] tracking-[0.13em] text-ink/55">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {index === 3 && (
                    <div className="mt-8 grid max-w-2xl grid-cols-2 gap-px overflow-hidden border border-ink/10 bg-ink/10 sm:grid-cols-4">
                      {[
                        ['MVP', '端到端'],
                        ['MODEL', '多模型'],
                        ['TASK', '可恢复'],
                        ['BILLING', '可扩展'],
                      ].map(([key, value]) => (
                        <div key={key} className="bg-bg p-3">
                          <p className="font-mono text-[0.52rem] tracking-[0.15em] text-ink/35">{key}</p>
                          <p className="mt-1 text-xs font-medium text-ink">{value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
