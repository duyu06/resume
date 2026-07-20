import { Award, BookOpen, GraduationCap, Medal, Shield } from 'lucide-react';
import FadeIn from './FadeIn';

const school = {
  icon: GraduationCap,
  name: '湖南大众传媒职业技术学院',
  major: '计算机网络技术',
  level: '大专',
  period: '2023.09 — 2026.06',
  highlight: '专业成绩前 5%',
};

const certs = [
  { icon: Award, label: 'Elements of AI' },
  { icon: Shield, label: 'NISP 国家信息安全水平考试' },
  { icon: BookOpen, label: '阿里云 RAG 应用认证' },
  { icon: Medal, label: 'AI 编码应用认证' },
  { icon: Award, label: '校园荣誉及奖项' },
];

export default function EducationSection() {
  return (
    <section className="relative bg-bg px-5 py-20 sm:px-8 md:px-10 md:py-28">
      <div className="mx-auto max-w-5xl">
        <FadeIn y={30}>
          <div className="mb-14 flex items-center gap-5">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-ink/20 to-transparent" />
            <h2 className="hero-heading shrink-0 text-center font-display text-[clamp(2rem,7vw,4.8rem)] font-black uppercase leading-none tracking-tight">
              教育 & 认证
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-ink/20 to-transparent" />
          </div>
        </FadeIn>

        <div className="grid gap-6 md:grid-cols-2">
          <FadeIn y={30}>
            <div className="glass rounded-2xl p-6 sm:rounded-[24px] sm:p-7 h-full">
              <div className="pill-grad mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl">
                <school.icon className="h-[18px] w-[18px] text-ink" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-xl font-bold tracking-wide text-ink sm:text-2xl">
                {school.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-dim">
                {school.major} · {school.level}
              </p>
              <p className="mt-1 text-xs tracking-[0.15em] uppercase text-ink/50">
                {school.period}
              </p>
              <div className="mt-4 inline-block pill-grad rounded-full px-3 py-1 text-xs text-ink-dim">
                {school.highlight}
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.15} y={30}>
            <div className="glass rounded-2xl p-6 sm:rounded-[24px] sm:p-7 h-full">
              <h3 className="font-display text-xl font-bold tracking-wide text-ink sm:text-2xl mb-5">
                认证 & 荣誉
              </h3>
              <div className="flex flex-col gap-3">
                {certs.map((c, i) => {
                  const Icon = c.icon;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
                        <Icon className="h-4 w-4 text-ink-dim" strokeWidth={1.5} />
                      </div>
                      <span className="text-sm text-ink-dim/90">{c.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
