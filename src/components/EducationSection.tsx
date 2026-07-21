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
  { icon: Award, label: 'Elements of AI — Certificate of Completion', meta: 'University of Helsinki × MinnaLearn · 2026.07' },
  { icon: BookOpen, label: 'RAG 应用构建及优化', meta: 'Alibaba Cloud Apsara Clouder · 有效期至 2028.07.05' },
  { icon: Medal, label: '基于通义灵码实现高效 AI 编码实践', meta: 'Alibaba Cloud Apsara Clouder · 有效期至 2028.07.05' },
  { icon: Shield, label: 'NISP 国家信息安全专业人员', meta: '专业认证' },
  { icon: Award, label: '易班优秀委员；思政课研究性学习竞赛二等奖', meta: '2024 · 第十、十一届' },
];

export default function EducationSection() {
  return (
    <section className="relative bg-bg px-5 py-20 sm:px-8 md:px-10 md:py-28">
      <div className="mx-auto max-w-5xl">
        <FadeIn y={30}><div className="mb-14 flex items-center gap-5"><div className="h-px flex-1 bg-gradient-to-r from-transparent via-ink/20 to-transparent" /><h2 className="hero-heading shrink-0 text-center font-display text-[clamp(2rem,7vw,4.8rem)] font-black uppercase leading-none tracking-tight">教育与认证</h2><div className="h-px flex-1 bg-gradient-to-r from-transparent via-ink/20 to-transparent" /></div></FadeIn>
        <div className="grid gap-6 md:grid-cols-2">
          <FadeIn y={30}><div className="glass h-full rounded-2xl p-6 sm:rounded-[24px] sm:p-7"><div className="pill-grad mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl"><school.icon className="h-[18px] w-[18px]" strokeWidth={1.5} /></div><h3 className="font-display text-xl font-bold tracking-wide sm:text-2xl">{school.name}</h3><p className="mt-2 text-sm leading-relaxed text-ink-dim">{school.major} · {school.level}</p><p className="mt-1 text-xs uppercase tracking-[0.15em] text-ink/50">{school.period}</p><div className="pill-grad mt-4 inline-block rounded-full px-3 py-1 text-xs text-ink-dim">{school.highlight}</div><p className="mt-5 text-sm leading-relaxed text-ink/55">主修计算机网络、Linux 系统管理、路由交换、Windows Server 与程序设计基础。</p></div></FadeIn>
          <FadeIn delay={0.15} y={30}><div className="glass h-full rounded-2xl p-6 sm:rounded-[24px] sm:p-7"><h3 className="mb-5 font-display text-xl font-bold tracking-wide sm:text-2xl">认证与荣誉</h3><div className="flex flex-col gap-4">{certs.map((cert) => { const Icon = cert.icon; return <div key={cert.label} className="flex min-w-0 items-start gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5"><Icon className="h-4 w-4 text-ink-dim" strokeWidth={1.5} /></div><div className="min-w-0"><p className="break-words text-sm text-ink-dim/90">{cert.label}</p><p className="mt-1 text-xs leading-relaxed text-ink/40">{cert.meta}</p></div></div>; })}</div></div></FadeIn>
        </div>
      </div>
    </section>
  );
}
