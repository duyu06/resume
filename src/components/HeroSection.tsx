import { useEffect, useRef } from 'react';
import FadeIn from './FadeIn';
import ContactButton from './ContactButton';

const tags = ['AI 产品规划', '模型评测与选型', '多模态应用', '原型与交付'];

export default function HeroSection() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return;
    const el = root.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - window.innerWidth / 2;
      const dy = e.clientY - window.innerHeight / 2;
      el.querySelectorAll<HTMLElement>('[data-depth]').forEach((node) => {
        const d = parseFloat(node.dataset.depth || '0');
        node.style.transform = `translate3d(${dx * d}px, ${dy * d}px, 0)`;
      });
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <section
      id="hero"
      ref={root}
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden px-5 pb-28 pt-20 sm:px-8 md:min-h-dvh md:px-10 md:pb-32 md:pt-24"
    >
      <div className="depth-layer pointer-events-none absolute inset-0" data-depth="0.05" aria-hidden>
        <div className="absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.03]" />
        <div className="absolute left-1/2 top-1/2 h-[90vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.015]" />
      </div>

      <FadeIn
        delay={0}
        y={-20}
        className="relative z-30 flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between"
      >
        <div className="font-display text-sm font-extrabold tracking-wide sm:text-base md:text-lg">
          ZHANG<span className="text-accent">.</span>BINWEN
        </div>
        <div className="glass inline-flex max-w-full items-center gap-2 rounded-full px-3 py-2 text-[0.65rem] leading-relaxed tracking-wide sm:whitespace-nowrap sm:text-[0.72rem]">
          <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#51e08a] shadow-[0_0_12px_#51e08a]" />
          <span>2026 届毕业生 · 现居长沙 · 意向北上广深、苏州、佛山</span>
        </div>
      </FadeIn>

      <div className="relative z-20 flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
        <FadeIn delay={0.15} y={40} className="w-full overflow-hidden">
          <h1
            className="hero-heading font-display text-[14vw] font-black uppercase leading-none tracking-tight sm:text-[15vw] md:text-[16vw] lg:text-[12vw]"
            data-depth="0.12"
          >
            张滨文
          </h1>
        </FadeIn>
        <FadeIn delay={0.28} y={24}>
          <p className="font-display text-[clamp(0.95rem,2.8vw,1.75rem)] font-medium tracking-wide text-ink">
            AI 产品经理 · 技术产品经理 · AI 解决方案产品经理
          </p>
        </FadeIn>
        <FadeIn delay={0.34} y={20}>
          <p className="mt-1 max-w-2xl font-body text-sm leading-relaxed text-ink-dim md:text-base">
            聚焦 AI 内容生产、电商与自动化场景，将模型能力转化为可使用、可评测、可追踪、可交付的产品流程。
          </p>
        </FadeIn>
        <FadeIn delay={0.4} y={20}>
          <div className="mt-2 flex max-w-2xl flex-wrap justify-center gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-ink/15 bg-white/5 px-3 py-1.5 text-[0.72rem] tracking-wide backdrop-blur-md transition-colors duration-300 hover:border-white/30 hover:bg-white/10"
              >
                {t}
              </span>
            ))}
          </div>
        </FadeIn>
      </div>

      <div className="relative z-30 flex flex-wrap items-end justify-between gap-5">
        <FadeIn delay={0.5} y={20}>
          <p className="max-w-[360px] font-display text-[clamp(0.75rem,1.4vw,1.05rem)] font-light uppercase leading-snug tracking-wide text-ink">
            产品设计 + AI 应用落地 + 技术协同 + 原型开发与部署验证
          </p>
        </FadeIn>
        <FadeIn delay={0.6} y={20}>
          <ContactButton href="#projects" label="查看作品集" />
        </FadeIn>
      </div>
    </section>
  );
}
