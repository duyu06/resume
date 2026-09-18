import { useRef } from 'react';
import { motion, useReducedMotion, useScroll } from 'framer-motion';

const steps = [
  ['PROBLEM', '业务场景', '目标用户、业务问题、关键指标'],
  ['SCOPE', '需求与 MVP', '用户任务、角色权限、优先级、验收标准'],
  ['MODEL', '模型评测', '测试集、质量、时延、成本、稳定性'],
  ['PRODUCT', '产品原型', '页面结构、任务状态、人工审核、版本设计'],
  ['ENGINEERING', '技术协同', 'API、异步任务、WebSocket、失败重试'],
  ['DELIVERY', '部署验证', 'Docker、模型服务、监控、排障、交付文档'],
  ['ITERATE', '复盘与迭代', '效果复盘、成本核算、版本优先级、商业化'],
];

export default function ProductMethod() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 70%', 'end 70%'],
  });

  return (
    <section id="method" ref={ref} className="bg-bg px-5 py-20 sm:px-8 md:px-10 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
        <header className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-mono text-[0.64rem] uppercase tracking-[0.24em] text-accent">FROM PROBLEM TO PRODUCT</p>
          <h2 className="mt-3 font-display text-[clamp(3rem,7.4vw,7rem)] font-black uppercase leading-[0.88] tracking-[-0.06em] text-ink">
            HOW
            <br />
            I WORK.
          </h2>
          <p className="mt-6 max-w-md text-sm leading-7 text-ink-dim sm:text-base">
            先定义问题和验收标准，再进入模型、产品和工程；动效只是把这条工作路径解释清楚。
          </p>
        </header>

        <div className="relative">
          <div className="absolute bottom-0 left-[7px] top-0 w-px bg-ink/10" />
          <motion.div
            className="absolute bottom-0 left-[7px] top-0 w-px origin-top bg-accent"
            style={reduceMotion ? { scaleY: 1 } : { scaleY: scrollYProgress }}
          />
          <div className="space-y-0">
            {steps.map(([english, title, detail], index) => (
              <motion.article
                key={english}
                initial={{ opacity: 0.42 }}
                whileInView={{ opacity: 1 }}
                viewport={{ amount: 0.7 }}
                transition={{ duration: 0.35 }}
                className="relative grid min-h-[32vh] grid-cols-[30px_1fr] gap-5 border-b border-ink/10 py-8 last:border-b-0 sm:min-h-[36vh] sm:gap-7"
              >
                <span className="relative z-10 mt-1 h-[15px] w-[15px] rounded-full border-[3px] border-bg bg-accent" />
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-accent">{english}</p>
                    <span className="font-mono text-[0.58rem] tracking-[0.16em] text-ink/30">
                      {String(index + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-[clamp(1.9rem,4.2vw,4.3rem)] font-bold leading-none tracking-[-0.045em] text-ink">
                    {title}
                  </h3>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-dim sm:text-base">{detail}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
