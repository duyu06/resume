import FadeIn from './FadeIn';
import ContactButton from './ContactButton';

const profileText = `我是张滨文，一名偏技术型 AI 产品候选人，能够从业务流程和用户问题出发，完成需求拆解、MVP 规划、模型选型、原型开发、接口联调与部署验证。

相比只关注功能清单，我更关注模型能力边界、任务成功率、响应速度、调用成本、异常恢复和最终可交付性。`;

const paragraphs = profileText.split('\n\n');

const capabilities = [
  {
    index: '01',
    title: '产品定义',
    subtitle: 'PRODUCT',
    items: ['用户场景', '需求拆解', 'MVP 与优先级', '验收标准'],
  },
  {
    index: '02',
    title: '模型与效果',
    subtitle: 'MODEL',
    items: ['Prompt 设计', '测试集与评分卡', '模型横向评测', '质量 / 时延 / 成本'],
  },
  {
    index: '03',
    title: '技术协同',
    subtitle: 'ENGINEERING',
    items: ['API 与数据结构', '异步任务', 'WebSocket', '失败重试与日志'],
  },
  {
    index: '04',
    title: '部署与交付',
    subtitle: 'DELIVERY',
    items: ['Linux / Docker', 'vLLM / Ollama', '监控与排障', '交付文档'],
  },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative flex min-h-dvh flex-col items-center justify-center gap-10 overflow-hidden px-5 py-20 sm:gap-14 sm:px-8 md:gap-16 md:px-10"
    >
      <div className="method-grid pointer-events-none absolute inset-0 opacity-45" aria-hidden />

      <FadeIn y={40} className="relative z-10 w-full">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 lg:grid-cols-[34%_66%] lg:gap-16">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.28em] text-accent">Product × System</p>
            <h2 className="hero-heading font-display text-[clamp(2.4rem,8vw,5.5rem)] font-black uppercase leading-none tracking-tight">
              ABOUT
              <br />
              ME
            </h2>
            <p className="mt-4 max-w-sm font-body text-base leading-relaxed text-ink-dim sm:text-lg">
              不只是写 PRD，也能理解模型、接口、任务状态与部署边界。
            </p>
          </div>

          <div className="rounded-[30px] border border-ink/8 bg-white/66 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:p-8">
            <h3 className="max-w-3xl font-display text-[clamp(1.65rem,4vw,3.3rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-ink">
              我不只判断一个 AI 功能能不能做，也会验证它能不能稳定地交付。
            </h3>
            <div className="mt-7 grid gap-4 text-base leading-relaxed text-ink sm:text-lg">
              {paragraphs.map((para) => (
                <p key={para}>{para}</p>
              ))}
            </div>
          </div>
        </div>
      </FadeIn>

      <div className="relative z-10 grid w-full max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {capabilities.map((cap, index) => (
          <FadeIn key={cap.title} delay={0.08 * index} y={24}>
            <article className="glass capability-card flex h-full flex-col rounded-2xl px-5 py-6 sm:px-6 sm:py-7">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-xs tracking-[0.2em] text-ink-dim">{cap.index}</span>
                <span className="font-mono text-[0.58rem] tracking-[0.18em] text-accent/70">{cap.subtitle}</span>
              </div>
              <h3 className="mt-3 font-display text-xl font-bold tracking-wide text-ink sm:text-2xl">{cap.title}</h3>
              <ul className="mt-5 flex flex-col gap-2.5">
                {cap.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-dim">
                    <span className="mt-[0.45rem] inline-block h-1 w-1 shrink-0 rounded-full bg-accent/70" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={0.2} y={20} className="relative z-10">
        <ContactButton href="#contact" label="联系我" />
      </FadeIn>
    </section>
  );
}
