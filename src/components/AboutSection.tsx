import { useEffect, useRef, useState } from 'react';
import FadeIn from './FadeIn';
import ContactButton from './ContactButton';

const TEXT =
  '计算机网络技术专业成绩前 5%，定位为具备「产品设计 + AI 应用落地 + 技术协同 + 部署交付」能力的技术型 AI 产品候选人。能够围绕真实业务场景完成用户流程梳理、需求拆解、MVP 规划、模型选型、Prompt 设计、效果评测、接口联调、部署验证与交付文档沉淀。具备大模型 API、RAG、Agent、多模态生成、模型微调、本地推理及 RPA 流程自动化实践，拥有 AI 内容生产、AI 电商素材生成、购物独立站和运营自动化实践，可将内容生产、商品管理、交易转化、重复任务执行与数据分析串联为完整业务闭环。';

const skills = [
  { t: 'AI 产品规划', d: '场景分析 · 任务流 · MVP · 验收复盘' },
  { t: '模型评测选型', d: 'Prompt · 测试集 · 成本/时延/质量' },
  { t: '技术方案原型', d: 'RAG · Agent · 多模态 · 异步任务' },
  { t: '部署与交付', d: 'Docker · vLLM · 监控 · 交付文档' },
  { t: '电商与增长', d: 'SPU/SKU · 转化漏斗 · 埋点 · 独立站' },
  { t: 'RPA 与流程自动化', d: '流程编排 · 数据驱动 · 异常处理' },
  { t: '商业化意识', d: '调用成本 · 套餐分层 · 可计费能力' },
];

export default function AboutSection() {
  const pRef = useRef<HTMLParagraphElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = pRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const start = window.innerHeight * 0.85;
      const end = window.innerHeight * 0.25;
      const raw = (start - rect.top) / (start - end);
      setProgress(Math.min(1, Math.max(0, raw)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section
      id="about"
      className="relative flex min-h-dvh flex-col items-center justify-center gap-10 px-5 py-20 sm:gap-14 sm:px-8 md:gap-16 md:px-10"
    >
      <FadeIn y={40}>
        <h2 className="hero-heading text-center font-display text-[clamp(3rem,12vw,160px)] font-black uppercase leading-none tracking-tight">
          About
        </h2>
      </FadeIn>

      <p
        ref={pRef}
        className="max-w-[680px] text-center font-medium leading-relaxed text-ink"
        style={{ fontSize: 'clamp(0.95rem, 1.8vw, 1.2rem)' }}
      >
        {TEXT.split('').map((ch, i) => {
          const threshold = i / TEXT.length;
          const op = progress > threshold ? 1 : 0.18;
          return (
            <span key={i} style={{ opacity: op, transition: 'opacity 0.15s linear' }}>
              {ch}
            </span>
          );
        })}
      </p>

      <div className="grid w-full max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {skills.map((s, i) => (
          <FadeIn key={s.t} delay={0.05 * i} y={16}>
            <div className="glass h-full rounded-2xl px-4 py-4">
              <div className="font-display text-sm font-semibold text-ink md:text-base">{s.t}</div>
              <div className="mt-1 text-[0.72rem] leading-relaxed text-ink-dim">{s.d}</div>
            </div>
          </FadeIn>
        ))}
      </div>

      <div className="grid w-full max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
        {[
          { v: '7,328', l: '对话数据' },
          { v: '18+', l: 'token/s' },
          { v: '20min', l: '单次部署' },
          { v: '26+25', l: '评测体系' },
        ].map((s, i) => (
          <FadeIn key={s.l} delay={0.1 * i} y={20}>
            <div className="glass rounded-2xl px-4 py-5 text-center">
              <div className="hero-heading font-display text-2xl font-black md:text-3xl">{s.v}</div>
              <div className="mt-1 text-xs tracking-wide text-ink-dim">{s.l}</div>
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
