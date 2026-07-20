import FadeIn from './FadeIn';
import ContactButton from './ContactButton';

const profileText = `我是张滨文，一名偏技术型 AI 产品候选人。

我能够从业务流程和用户问题出发，完成需求拆解、MVP 规划、模型选型、原型开发、接口联调与部署验证。

相比纯业务型产品候选人，我更关注模型能力边界、任务成功率、响应速度、调用成本和产品可交付性。`;

const paragraphs = profileText.split('\n\n');

const capabilities = [
  {
    index: '01',
    title: '产品',
    items: ['用户流程设计', 'MVP定义', 'PRD撰写', '效果评测'],
  },
  {
    index: '02',
    title: 'AI',
    items: ['RAG架构', 'Agent开发', '多模态生成', '模型微调'],
  },
  {
    index: '03',
    title: '工程交付',
    items: ['Go后端', 'Python脚本', 'Vue前端', 'Docker部署'],
  },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative flex min-h-dvh flex-col items-center justify-center gap-10 px-5 py-20 sm:gap-14 sm:px-8 md:gap-16 md:px-10"
    >
      <FadeIn y={40}>
        <div className="grid w-full max-w-5xl grid-cols-1 gap-10 lg:grid-cols-[40%_60%] lg:gap-16">
          <div>
            <h2 className="hero-heading font-display text-[clamp(2.4rem,8vw,5.5rem)] font-black uppercase leading-none tracking-tight">
              ABOUT
              <br />
              ME
            </h2>
            <p className="mt-4 font-body text-base leading-relaxed text-ink-dim sm:text-lg">
              不只是写 PRD，也能理解模型、接口与部署。
            </p>
          </div>

          <div>
            {paragraphs.map((para, i) => (
              <p
                key={i}
                className={`font-body text-base leading-relaxed text-ink sm:text-lg ${
                  i > 0 ? 'mt-5' : ''
                }`}
              >
                {para}
              </p>
            ))}
          </div>
        </div>
      </FadeIn>

      <div className="grid w-full max-w-5xl grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
        {capabilities.map((cap, i) => (
          <FadeIn key={cap.title} delay={0.1 * i} y={24}>
            <div className="glass flex h-full flex-col rounded-2xl px-5 py-6 sm:px-6 sm:py-7">
              <span className="font-mono text-xs tracking-[0.2em] text-ink-dim">
                {cap.index}
              </span>
              <h3 className="mt-2 font-display text-xl font-bold tracking-wide text-ink sm:text-2xl">
                {cap.title}
              </h3>
              <ul className="mt-5 flex flex-col gap-2.5">
                {cap.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 text-sm text-ink-dim sm:text-base"
                  >
                    <span className="inline-block h-1 w-1 shrink-0 rounded-full bg-ink/40" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={0.2} y={20}>
        <ContactButton href="#contact" label="联系我" />
      </FadeIn>
    </section>
  );
}
