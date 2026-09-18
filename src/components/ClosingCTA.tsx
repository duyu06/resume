import { ArrowUpRight, Download, FileText, Github, Mail } from 'lucide-react';

const BASE = import.meta.env.BASE_URL;

const actions = [
  { label: 'ONLINE RESUME', href: BASE + 'online-resume/', icon: FileText, external: false },
  { label: 'PDF RESUME', href: BASE + 'resume.pdf', icon: Download, external: false },
  { label: 'GITHUB', href: 'https://github.com/duyu06', icon: Github, external: true },
  { label: 'EMAIL', href: 'mailto:3245485135@qq.com', icon: Mail, external: false },
];

export default function ClosingCTA() {
  return (
    <section id="contact" className="border-t border-ink/8 bg-surface px-5 py-20 sm:px-8 md:px-10 md:py-32">
      <div className="mx-auto max-w-7xl">
        <p className="font-mono text-[0.64rem] uppercase tracking-[0.24em] text-accent">AI PRODUCT · OPEN TO WORK</p>

        <h2 className="mt-4 max-w-6xl font-display text-[clamp(3.2rem,9.7vw,9rem)] font-black uppercase leading-[0.84] tracking-[-0.065em] text-ink">
          LET&apos;S BUILD
          <br />
          SOMETHING
          <br />
          <span className="text-accent">USEFUL WITH AI.</span>
        </h2>

        <div className="mt-10 grid gap-8 border-t border-ink/10 pt-7 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <p className="max-w-2xl text-sm leading-7 text-ink-dim sm:text-base">
              张滨文 · AI 产品经理 / AI 应用产品经理 / 技术产品经理。
              如果岗位需要同时理解业务问题、模型能力与工程实现，可以直接从项目、在线简历或 AI 简历助手开始了解。
            </p>
            <p className="mt-4 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-ink/35">
              YOU DON&apos;T HAVE TO READ EVERYTHING · ASK MY AI ↘
            </p>
          </div>

          <div className="grid gap-px overflow-hidden border border-ink/10 bg-ink/10 sm:grid-cols-2">
            {actions.map(({ label, href, icon: Icon, external }) => (
              <a
                key={label}
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                download={label === 'PDF RESUME' ? true : undefined}
                className="group flex min-h-16 items-center justify-between bg-bg px-4 py-4 text-xs font-semibold tracking-[0.12em] text-ink transition hover:bg-accent hover:text-white"
              >
                <span className="flex items-center gap-3">
                  <Icon size={16} />
                  {label}
                </span>
                <ArrowUpRight size={15} className="opacity-45 transition group-hover:opacity-100" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
