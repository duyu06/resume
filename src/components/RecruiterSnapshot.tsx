import { ArrowDownRight, Code2, FileText } from 'lucide-react';

const BASE = import.meta.env.BASE_URL;

const facts = [
  {
    label: '目标岗位',
    value: 'AI 产品经理 / AI 应用产品经理 / 技术产品经理',
  },
  {
    label: '核心链路',
    value: '业务问题 → 模型评测 → 产品设计 → 工程协同 → 部署交付',
  },
  {
    label: '技术边界',
    value: 'Go · Python · Vue · React · Docker · RAG · Agent · Multimodal',
  },
  {
    label: '代表证据',
    value: '7,328 条训练数据 · 4h→20min 部署 · 50+ token/s · 26 条标准评测 Prompt',
  },
];

const actions = [
  { label: '看代表项目', href: '#guoyang', icon: ArrowDownRight, external: false },
  { label: '在线简历', href: BASE + 'online-resume/', icon: FileText, external: false },
  { label: 'GitHub', href: 'https://github.com/duyu06', icon: Code2, external: true },
];

export default function RecruiterSnapshot() {
  return (
    <section
      id="snapshot"
      aria-labelledby="snapshot-title"
      className="border-y border-ink/10 bg-ink px-5 py-12 text-white sm:px-8 md:px-10 md:py-16"
    >
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
        <div>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-blue-300">60-SECOND BRIEF</p>
          <h2
            id="snapshot-title"
            className="mt-3 max-w-xl font-display text-[clamp(2.2rem,5vw,4.8rem)] font-black leading-[0.92] tracking-[-0.045em]"
          >
            如果你只有 60 秒，
            <br />
            先看这里。
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-7 text-white/58 sm:text-base">
            我的定位不是单点调用模型，而是把业务目标、模型能力、产品流程和工程交付连成一条可验收的 AI 产品链路。
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            {actions.map(({ label, href, icon: Icon, external }) => (
              <a
                key={label}
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className="inline-flex min-h-11 items-center gap-2 border border-white/15 px-4 py-2.5 text-xs font-semibold tracking-[0.08em] text-white transition hover:border-blue-300/55 hover:bg-white/[0.06]"
              >
                <Icon size={15} />
                {label}
              </a>
            ))}
          </div>
        </div>

        <dl className="divide-y divide-white/12 border-y border-white/12">
          {facts.map((fact, index) => (
            <div
              key={fact.label}
              className="grid gap-2 py-5 sm:grid-cols-[120px_1fr] sm:items-start sm:gap-7 md:py-6"
            >
              <dt className="flex items-center gap-3 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-white/38">
                <span className="text-blue-300/75">{String(index + 1).padStart(2, '0')}</span>
                {fact.label}
              </dt>
              <dd className="text-sm leading-7 text-white/78 sm:text-base">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
