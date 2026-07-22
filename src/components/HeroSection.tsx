import FadeIn from './FadeIn';
import ContactButton from './ContactButton';
import LayeredIntelligence from './LayeredIntelligence';

const tags = ['AI 产品规划', '模型评测与选型', '多模态工作流', '原型开发与部署交付'];

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative isolate flex min-h-[100svh] flex-col justify-between overflow-hidden bg-bg px-5 pb-28 pt-20 sm:px-8 md:min-h-dvh md:px-10 md:pb-32 md:pt-24"
    >
      <div className="pointer-events-none absolute inset-0 -z-20" aria-hidden>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.045)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_86%)]" />
        <div className="absolute left-[-12rem] top-[8%] h-[32rem] w-[32rem] rounded-full bg-accent/6 blur-3xl" />
        <div className="absolute right-[-10rem] top-[20%] h-[28rem] w-[28rem] rounded-full bg-accent-2/8 blur-3xl" />
      </div>

      <LayeredIntelligence />

      <FadeIn
        delay={0}
        y={-20}
        className="relative z-30 flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between"
      >
        <div className="font-display text-sm font-extrabold tracking-wide text-ink sm:text-base md:text-lg">
          ZHANG<span className="text-accent">.</span>BINWEN
        </div>
        <div className="glass inline-flex max-w-full items-center gap-2 rounded-full px-3 py-2 text-[0.65rem] leading-relaxed tracking-wide text-ink-dim sm:whitespace-nowrap sm:text-[0.72rem]">
          <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#22c55e] shadow-[0_0_12px_rgba(34,197,94,0.65)]" />
          <span>2026 届毕业生 · 现居长沙 · 意向北上广深、苏州、佛山</span>
        </div>
      </FadeIn>

      <div className="relative z-20 flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
        <FadeIn delay={0.12} y={18} className="mb-1">
          <span className="rounded-full border border-accent/15 bg-white/65 px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-accent shadow-[0_8px_24px_rgba(37,99,235,0.05)] backdrop-blur-xl sm:text-[0.68rem]">
            Layered Intelligence · AI Product × Technology
          </span>
        </FadeIn>

        <FadeIn delay={0.2} y={40} className="w-full overflow-hidden">
          <h1 className="hero-heading font-display text-[14vw] font-black uppercase leading-none tracking-tight sm:text-[15vw] md:text-[16vw] lg:text-[12vw]">
            张滨文
          </h1>
        </FadeIn>

        <FadeIn delay={0.32} y={24}>
          <p className="font-display text-[clamp(0.95rem,2.8vw,1.75rem)] font-medium tracking-wide text-ink">
            AI 产品经理 · 技术产品经理 · AI 解决方案产品经理
          </p>
        </FadeIn>

        <FadeIn delay={0.4} y={20}>
          <div className="mt-1 max-w-2xl rounded-[28px] border border-white/70 bg-white/62 px-5 py-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl sm:px-7 sm:py-5">
            <p className="font-body text-base font-medium leading-relaxed text-ink md:text-lg">
              将模型能力转化为可评测、可追踪、可交付的 AI 产品。
            </p>
            <p className="mt-2 font-body text-sm leading-relaxed text-ink-dim md:text-base">
              从业务场景、需求拆解、模型选型和 Prompt 设计，到产品原型、接口联调、部署验证与交付文档，在产品、模型与工程之间建立完整连接。
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.48} y={20}>
          <div className="mt-2 flex max-w-2xl flex-wrap justify-center gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-ink/10 bg-white/75 px-3 py-1.5 text-[0.72rem] tracking-wide text-ink-dim shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-md transition-colors duration-300 hover:border-accent/30 hover:bg-accent-soft hover:text-accent"
              >
                {tag}
              </span>
            ))}
          </div>
        </FadeIn>
      </div>

      <div className="relative z-30 flex flex-wrap items-end justify-between gap-5">
        <FadeIn delay={0.56} y={20}>
          <div>
            <p className="max-w-[420px] font-display text-[clamp(0.75rem,1.4vw,1.05rem)] font-light uppercase leading-snug tracking-wide text-ink">
              产品设计 + AI 应用落地 + 技术协同 + 原型开发与部署验证
            </p>
            <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-ink/40">
              PRODUCT · MODEL · ENGINEERING · DELIVERY
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={0.64} y={20}>
          <ContactButton href="#projects" label="查看精选项目" />
        </FadeIn>
      </div>
    </section>
  );
}
