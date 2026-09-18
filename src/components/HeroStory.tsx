import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

const systemSteps = ['BUSINESS', 'PRODUCT', 'MODEL', 'ENGINEERING', 'DELIVERY'];

export default function HeroStory() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  const line2Opacity = useTransform(scrollYProgress, [0.12, 0.3], [0, 1]);
  const line2Y = useTransform(scrollYProgress, [0.12, 0.3], [36, 0]);
  const line3Opacity = useTransform(scrollYProgress, [0.34, 0.56], [0, 1]);
  const line3Y = useTransform(scrollYProgress, [0.34, 0.56], [42, 0]);
  const systemProgress = useTransform(scrollYProgress, [0.08, 0.78], [0.08, 1]);

  return (
    <section
      id="hero"
      ref={ref}
      className="relative min-h-[185svh] bg-bg md:min-h-[220vh]"
    >
      <div className="sticky top-0 flex min-h-svh items-center overflow-hidden px-5 pb-16 pt-24 sm:px-8 md:px-10 md:pb-12">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-x-0 top-0 h-px bg-ink/8" />
          <div className="absolute bottom-[12%] left-[8%] h-40 w-40 rounded-full bg-accent/8 blur-3xl" />
        </div>

        <div className="relative mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.65fr)] lg:items-end">
          <div>
            <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-ink/45">
              <span>ZHANG BINWEN / 2026</span>
              <span className="h-px w-10 bg-ink/20" />
              <span>AI PRODUCT PORTFOLIO</span>
            </div>

            <h1 className="font-display text-[clamp(3.4rem,11.8vw,10.5rem)] font-black leading-[0.82] tracking-[-0.065em] text-ink">
              <span className="block">我把 AI</span>
              <motion.span
                className="block"
                style={reduceMotion ? undefined : { opacity: line2Opacity, y: line2Y }}
              >
                从 Demo
              </motion.span>
              <motion.span
                className="block text-accent"
                style={reduceMotion ? undefined : { opacity: line3Opacity, y: line3Y }}
              >
                推进到产品。
              </motion.span>
            </h1>

            <div className="mt-9 grid max-w-3xl gap-5 border-t border-ink/10 pt-5 sm:grid-cols-[1fr_auto] sm:items-end">
              <p className="max-w-2xl text-sm leading-7 text-ink-dim sm:text-base">
                从业务问题、AI 能力选型和模型评测，到产品架构、研发协同、部署验证与交付，
                把模型能力变成可使用、可评测、可追踪的产品能力。
              </p>
              <a
                href="#evidence"
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-ink transition hover:text-accent"
              >
                EXPLORE MY WORK
                <span aria-hidden>↓</span>
              </a>
            </div>
          </div>

          <aside className="border-l border-ink/10 pl-5 sm:pl-7 lg:mb-3">
            <p className="mb-5 font-mono text-[0.62rem] uppercase tracking-[0.24em] text-accent">
              AI PRODUCT SYSTEM
            </p>
            <div className="relative">
              <div className="absolute bottom-2 left-[5px] top-2 w-px origin-top bg-ink/10" />
              <motion.div
                className="absolute bottom-2 left-[5px] top-2 w-px origin-top bg-accent"
                style={reduceMotion ? { scaleY: 1 } : { scaleY: systemProgress }}
              />
              <div className="space-y-5">
                {systemSteps.map((step, index) => (
                  <div key={step} className="relative flex items-center gap-4">
                    <span className="relative z-10 h-[11px] w-[11px] rounded-full border-2 border-bg bg-accent shadow-[0_0_0_1px_rgba(37,99,235,0.28)]" />
                    <div>
                      <span className="font-mono text-[0.58rem] text-ink/35">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <p className="font-display text-sm font-semibold tracking-[0.08em] text-ink sm:text-base">
                        {step}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
