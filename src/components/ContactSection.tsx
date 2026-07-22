import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Code, Copy, ExternalLink, FileDown } from 'lucide-react';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } };
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
};

const pdfUrl = `${import.meta.env.BASE_URL}resume.pdf`;
const EMAIL = '3245485135@qq.com';
const actions = [
  { icon: FileDown, label: '下载 PDF 简历', type: 'link' as const, href: pdfUrl, download: true },
  { icon: Copy, label: '复制邮箱', type: 'copy' as const },
  { icon: Code, label: '查看 GitHub', type: 'link' as const, href: 'https://github.com/duyu06' },
  { icon: ExternalLink, label: '访问果漾 AI', type: 'link' as const, href: 'https://guoyang.xin' },
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
      <motion.div className="relative mx-auto max-w-5xl" variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: '50px', amount: 0.1 }}>
        <motion.div variants={item} className="mb-12 text-center md:mb-20">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.28em] text-accent">Let&apos;s build real AI products</p>
          <h2 className="hero-heading font-display text-3xl font-bold tracking-[0.08em] sm:text-4xl md:text-5xl lg:text-6xl">联系与求职信息</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-ink-dim md:text-base">正在寻找 AI 产品经理、技术产品经理或 AI 解决方案产品相关机会。</p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          <motion.div variants={item} className="flex flex-col gap-5">
            <div className="liquid-glass-strong rounded-3xl p-6 sm:p-8">
              <p className="font-body text-lg leading-relaxed text-ink sm:text-xl">求职方向：AI 产品经理 / 技术产品经理 / AI 解决方案产品经理</p>
              <p className="mt-3 font-body text-sm leading-relaxed text-ink-dim">2026 届毕业生 · 现居长沙 · 意向北京、上海、广州、深圳、苏州、佛山</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {actions.map((action) => {
                const Icon = action.type === 'copy' && copied ? Check : action.icon;
                const className = 'liquid-glass-strong flex min-h-12 items-center justify-center gap-2.5 rounded-full px-5 py-3 text-xs font-medium uppercase tracking-widest text-ink transition-all hover:-translate-y-0.5 hover:border-accent/25 hover:bg-accent-soft hover:text-accent sm:text-sm';
                if (action.type === 'copy') {
                  return <button key="copy" onClick={handleCopy} className={className} type="button"><Icon className="h-4 w-4 shrink-0" />{copied ? '已复制' : action.label}</button>;
                }
                return <a key={action.label} href={action.href} target={action.download ? undefined : '_blank'} rel={action.download ? undefined : 'noopener noreferrer'} download={action.download || undefined} className={className}><Icon className="h-4 w-4 shrink-0" />{action.label}</a>;
              })}
            </div>
          </motion.div>

          <motion.div variants={item}>
            <div className="liquid-glass-strong flex flex-col gap-6 rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-3"><span className="relative flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" /><span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" /></span><span className="font-display text-sm font-bold tracking-[0.15em] text-green-600">OPEN TO WORK</span></div>
              <div className="space-y-4 font-body text-sm text-ink-dim">
                <div className="flex items-center justify-between gap-4 border-b border-ink/10 pb-3"><span className="text-ink/45">到岗时间</span><span className="text-right text-ink">1 周内</span></div>
                <div className="flex items-center justify-between gap-4 border-b border-ink/10 pb-3"><span className="text-ink/45">出差</span><span className="text-right text-ink">可接受合理出差</span></div>
                <div className="flex items-center justify-between gap-4 border-b border-ink/10 pb-3"><span className="text-ink/45">邮箱</span><a href={`mailto:${EMAIL}`} className="min-w-0 break-all text-right text-xs text-accent hover:underline sm:text-sm">{EMAIL}</a></div>
                <div className="flex items-center justify-between gap-4"><span className="text-ink/45">电话</span><a href="tel:18163794793" className="text-right text-ink hover:text-accent">181 6379 4793</a></div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
