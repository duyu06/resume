import FadeIn from './FadeIn';

const works = [
  {
    title: '果漾 AI',
    tag: 'Live Product',
    href: 'https://guoyang.xin/',
    img: `${import.meta.env.BASE_URL}assets/projects/proj-01-a.png`,
    span: 'md:col-span-7',
  },
  {
    title: 'AI 电商主图',
    tag: 'E-commerce AI',
    href: '#projects',
    img: `${import.meta.env.BASE_URL}assets/projects/proj-02-a.png`,
    span: 'md:col-span-5',
  },
  {
    title: '跨境购物独立站',
    tag: 'DTC Store',
    href: '#projects',
    img: `${import.meta.env.BASE_URL}assets/projects/proj-03-a.png`,
    span: 'md:col-span-5',
  },
  {
    title: '数字人微调',
    tag: 'Fine-tune',
    href: '#projects',
    img: `${import.meta.env.BASE_URL}assets/projects/proj-04-a.png`,
    span: 'md:col-span-7',
  },
  {
    title: 'RPA 运营自动化',
    tag: 'Process Automation',
    href: '#projects',
    img: `${import.meta.env.BASE_URL}assets/projects/proj-07-a.png`,
    span: 'md:col-span-5',
  },
];

export default function ViktorWorkStrip() {
  return (
    <section id="work" className="bg-bg px-5 py-16 sm:px-8 md:px-10 md:py-24">
      <div className="mx-auto max-w-6xl">
        <FadeIn y={28}>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <span className="h-px w-8 bg-ink/30" />
                <span className="text-xs uppercase tracking-[0.3em] text-ink-dim">Selected Work</span>
              </div>
              <h2 className="font-display text-[clamp(1.8rem,5vw,3.2rem)] font-bold leading-tight text-ink">
                Featured <span className="hero-heading italic">projects</span>
              </h2>
              <p className="mt-2 max-w-md text-sm text-ink-dim">
                内容生产 · AI 电商 · 独立站 · 模型微调 · RPA 自动化 — 从概念到闭环。
              </p>
            </div>
            <a
              href="#projects"
              className="rounded-full border border-ink/25 px-5 py-2.5 text-xs font-medium uppercase tracking-widest text-ink transition hover:bg-ink/10"
            >
              View all →
            </a>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-6">
          {works.map((w, i) => (
            <FadeIn key={w.title} delay={i * 0.08} y={32} className={w.span}>
              <a
                href={w.href}
                target={w.href.startsWith('http') ? '_blank' : undefined}
                rel={w.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="group relative block aspect-[16/11] overflow-hidden rounded-[28px] border border-ink/12 bg-[#111] sm:rounded-[32px]"
              >
                <img
                  src={w.img}
                  alt={w.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition group-hover:opacity-100" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 sm:p-6">
                  <div>
                    <span className="text-[0.65rem] uppercase tracking-[0.2em] text-ink/70">
                      {w.tag}
                    </span>
                    <h3 className="mt-1 font-display text-xl font-semibold text-white sm:text-2xl">
                      {w.title}
                    </h3>
                  </div>
                  <span className="translate-y-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[0.7rem] text-white opacity-0 backdrop-blur-md transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    View —
                  </span>
                </div>
              </a>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
