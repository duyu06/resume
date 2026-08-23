import { useState } from 'react';
import { Check, Code, Copy, ExternalLink, FileDown, Mail, MapPin, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } };
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
};

const pdfUrl = `${import.meta.env.BASE_URL}resume.pdf`;
const EMAIL = '3245485135@qq.com';
const PHONE = '18163794793';

const actions = [
  { icon: FileDown, label: '下载 PDF 简历', type: 'link' as const, href: pdfUrl, download: true },
  { icon: Copy, label: '复制邮箱', type: 'copy' as const },
  { icon: Code, label: '查看 GitHub', type: 'link' as const, href: 'https://github.com/duyu06' },
  { icon: ExternalLink, label: '访问果漾 AI', type: 'link' as const, href: 'https://guoyang.xin' },
];

const highlights = [
  'AI 产品 0→1：需求分析、场景拆解、MVP、产品架构、PRD、原型与验收',
  'AI 技术产品化：大模型、多模态、RAG、Agent、Prompt 与模型评测',
  '研发协同：模型/API 接入、异步任务、WebSocket、日志、失败重试与部署验证',
  '产品价值：质量、成功率、时延、稳定性、调用成本、用户体验与商业化',
];

const jdMatch = [
  ['AI 产品规划', '需求调研 → 场景拆解 → MVP → 版本迭代'],
  ['AI 平台 / 中台', '模型服务 → 推理 → 监控 → 参数与任务管理'],
  ['Agent 场景落地', '多 Agent → 工具调用 → 状态管理 → 人工接管'],
  ['模型生命周期', '数据 → Prompt / 微调 → 评测 → 部署 → API'],
  ['跨部门协作', '产品方案 → PRD → 技术联调 → 测试验收 → 交付'],
];

export default function ContactSection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      const input = document.createElement('input');
      input.value = EMAIL;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="contact" className="relative overflow-hidden bg-bg px-5 pb-24 pt-16 sm:px-8 md:px-10 md:pb-32 md:pt-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-px max-w-6xl bg-gradient-to-r from-transparent via-ink/10 to-transparent" aria-hidden />
      <motion.div
        className="relative mx-auto max-w-5xl"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '50px', amount: 0.1 }}
      >
        <motion.div variants={item} className="mb-12 text-center md:mb-20">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.28em] text-accent">AI PRODUCT · OPEN TO WORK</p>
          <h2 className="hero-heading font-display text-3xl font-bold tracking-[0.08em] sm:text-4xl md:text-5xl lg:text-6xl">联系与求职信息</h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-ink-dim md:text-base">
            寻找 AI 产品经理、AI 应用产品经理、技术产品经理及 AI 解决方案产品相关机会。
            <br className="hidden sm:block" />
            重点关注 AI 产品 0→1、Agent、多模态、AI 平台及企业业务场景落地。
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          <motion.div variants={item} className="flex flex-col gap-5">
            <div className="liquid-glass-strong rounded-3xl p-6 sm:p-8">
              <div className="flex flex-wrap gap-2">
                {['AI 产品经理', 'AI 应用产品经理', '技术产品经理'].map((role) => (
                  <span key={role} className="rounded-full border border-accent/15 bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent">
                    {role}
                  </span>
                ))}
              </div>
              <p className="mt-5 font-body text-lg font-medium leading-relaxed text-ink sm:text-xl">
                能够连接业务、产品、模型与工程，把复杂业务痛点转化为可评测、可追踪、可交付的 AI 产品方案。
              </p>
              <p className="mt-3 font-body text-sm leading-relaxed text-ink-dim">
                2026 届毕业生 · 现居长沙 · 意向北京、上海、广州、深圳、苏州、佛山 · 可接受合理出差
              </p>
            </div>

            <div className="liquid-glass-strong rounded-3xl p-6 sm:p-8">
              <p className="mb-4 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-accent">JD MATCH</p>
              <div className="space-y-4">
                {jdMatch.map(([title, detail]) => (
                  <div key={title} className="grid gap-1 border-b border-ink/8 pb-3 last:border-0 last:pb-0 sm:grid-cols-[8.5rem_1fr] sm:gap-3">
                    <span className="text-sm font-medium text-ink">{title}</span>
                    <span className="text-sm leading-relaxed text-ink-dim">{detail}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="liquid-glass-strong rounded-3xl p-6 sm:p-8">
              <p className="mb-4 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-accent">WHY ME</p>
              <ul className="space-y-3">
                {highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-3 text-sm leading-relaxed text-ink-dim">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {actions.map((action) => {
                const Icon = action.type === 'copy' && copied ? Check : action.icon;
                const className = 'liquid-glass-strong flex min-h-12 items-center justify-center gap-2.5 rounded-full px-5 py-3 text-xs font-medium uppercase tracking-widest text-ink transition-all hover:-translate-y-0.5 hover:border-accent/25 hover:bg-accent-soft hover:text-accent sm:text-sm';
                if (action.type === 'copy') {
                  return (
                    <button key="copy" onClick={handleCopy} className={className} type="button">
                      <Icon className="h-4 w-4 shrink-0" />
                      {copied ? '已复制' : action.label}
                    </button>
                  );
                }
                return (
                  <a
                    key={action.label}
                    href={action.href}
                    target={action.download ? undefined : '_blank'}
                    rel={action.download ? undefined : 'noopener noreferrer'}
                    download={action.download || undefined}
                    className={className}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {action.label}
                  </a>
                );
              })}
            </div>
          </motion.div>

          <motion.div variants={item}>
            <div className="liquid-glass-strong flex h-full flex-col gap-6 rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
                </span>
                <span className="font-display text-sm font-bold tracking-[0.15em] text-green-600">OPEN TO WORK</span>
              </div>

              <div>
                <p className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">欢迎聊 AI 产品机会</p>
                <p className="mt-3 text-sm leading-relaxed text-ink-dim">
                  如果岗位需要同时理解业务需求、AI 模型能力和工程实现，我可以从产品方案、模型评测到研发协同一起推进。
                </p>
              </div>

              <div className="space-y-4 border-t border-ink/10 pt-5 font-body text-sm text-ink-dim">
                <div className="flex items-center justify-between gap-4 border-b border-ink/10 pb-3">
                  <span className="flex items-center gap-2 text-ink/45"><MapPin className="h-4 w-4" />意向城市</span>
                  <span className="text-right text-ink">北京 / 上海 / 广州 / 深圳 / 苏州 / 佛山</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-ink/10 pb-3">
                  <span className="text-ink/45">出差</span>
                  <span className="text-right text-ink">可接受合理出差</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-ink/10 pb-3">
                  <span className="flex items-center gap-2 text-ink/45"><Mail className="h-4 w-4" />邮箱</span>
                  <a href={`mailto:${EMAIL}`} className="min-w-0 break-all text-right text-xs text-accent hover:underline sm:text-sm">{EMAIL}</a>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2 text-ink/45"><Phone className="h-4 w-4" />电话</span>
                  <a href={`tel:${PHONE}`} className="text-right text-ink hover:text-accent">181 6379 4793</a>
                </div>
              </div>

              <div className="mt-auto rounded-2xl border border-ink/8 bg-white/55 p-5">
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-accent">PRODUCT · AI · ENGINEERING · DELIVERY</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-dim">
                  需求分析 → 场景拆解 → AI能力选型 → 产品架构 → PRD / 原型 → Agent / 多模态 → 研发协同 → 测试验收 → 部署交付
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
