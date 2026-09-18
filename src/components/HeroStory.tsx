import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

const systemSteps = ['BUSINESS', 'PRODUCT', 'MODEL', 'ENGINEERING', 'DELIVERY'];

export default function HeroStory() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [desktopMotion, setDesktopMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)');
    const sync = () => setDesktopMotion(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  const line2Opacity = useTransform(scrollYProgress, [0.1, 0.28], [0, 1]);
  const line2Y = useTransform(scrollYProgress, [0.1, 0.28], [36, 0]);
  const line3Opacity = useTransform(scrollYProgress, [0.32, 0.52], [0, 1]);
  const line3Y = useTransform(scrollYProgress, [0.32, 0.52], [42, 0]);
  const systemProgress = useTransform(scrollYProgress, [0.06, 0.76], [0.08, 1]);
  const eyebrowOpacity = useTransform(scrollYProgress, [0, 0.14, 0.76, 0.92], [1, 0.55, 0.55, 0]);
  const shouldAnimate = desktopMotion && !reduceMotion;

  return (
    <section id="hero" ref={ref} className="relative min-h-svh bg-bg md:min-h-[220vh]">
      <div className="relative flex min-h-svh items-center overflow-hidden px-5 pb-16 pt-24 sm:px-8 md:sticky md:top-0 md:px-10 md:pb-12">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-x-0 top-0 h-px bg-ink/8" />
          <div className="absolute bottom-[12%] left-[8%] h-40 w-40 rounded-full bg-accent/8 blur-3xl" />
          <div className="absolute right-[10%] top-[18%] hidden h-28 w-28 rounded-full border border-accent/10 md:block" />
        </div>

        <div className="relative mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.65fr)] lg:items-end">
          <div>
            <motion.div
              className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-ink/45"
              style={shouldAnimate ? { opacity: eyebrowOpacity } : undefined}
            >
              <span>ZHANG BINWEN / 2026</span>
              <span className="h-px w-10 bg-ink/20" />
              <span>AI PRODUCT PORTFOLIO</span>
            </motion.div>

            <h1 className="font-display text-[clamp(3.4rem,11.8vw,10.5rem)] font-black leading-[0.82] tracking-[-0.065em] text-ink">
              <span className="block">我把 AI</span>
              <motion.span
                className="block"
                style={shouldAnimate ? { opacity: line2Opacity, y: line2Y } : undefined}
              >
                从 Demo
              </motion.span>
              <motion.span
                className="block text-accent"
                style={shouldAnimate ? { opacity: line3Opacity, y: line3Y } : undefined}
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
              <div className="absolute bottom-2 left-[5px] top-2 w-px bg-ink/10" />
              <motion.div
                className="absolute bottom-2 left-[5px] top-2 w-px origin-top bg-accent"
                style={shouldAnimate ? { scaleY: systemProgress } : { scaleY: 1 }}
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

        <div className="pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-3 md:flex" aria-hidden>
          <span className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-ink/30">SCROLL</span>
          <span className="h-px w-12 bg-ink/15" />
        </div>
      </div>
    </section>
  );
}
