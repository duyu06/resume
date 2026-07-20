import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileDown, Copy, Code, ExternalLink, Check } from 'lucide-react';

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  },
};

const pdfUrl = `${import.meta.env.BASE_URL}resume.pdf`;

const actions = [
  { icon: FileDown, label: '下载 PDF 简历', type: 'link' as const, href: pdfUrl, download: true },
  { icon: Copy, label: '复制邮箱', type: 'copy' as const },
  { icon: Code, label: '查看 GitHub', type: 'link' as const, href: 'https://github.com/duyu06' },
  { icon: ExternalLink, label: '访问 果漾 AI', type: 'link' as const, href: 'https://guoyang.xin' },
];

const EMAIL = '3245485135@qq.com';

export default function ContactSection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = EMAIL;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section id="contact" className="bg-bg px-5 pb-24 pt-16 sm:px-8 md:px-10 md:pb-32 md:pt-28">
      <motion.div
        className="mx-auto max-w-5xl"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '50px', amount: 0.1 }}
      >
        <motion.div variants={item} className="mb-12 text-center md:mb-20">
          <h2
            className="font-display text-3xl font-bold tracking-[0.15em] text-white sm:text-4xl md:text-5xl lg:text-6xl"
            style={{ textTransform: 'uppercase' }}
          >
            LET'S WORK TOGETHER
          </h2>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          {/* Left Column */}
          <motion.div variants={item} className="flex flex-col gap-5">
            <div className="rounded-3xl p-6 sm:p-8 liquid-glass-strong">
              <p className="font-body text-lg leading-relaxed text-ink-dim sm:text-xl">
                正在寻找：AI 产品经理 / 技术产品经理 / AI 解决方案产品经理
              </p>
              <p className="mt-3 font-body text-sm leading-relaxed text-ink/50">
                2026 届毕业生 · 现居长沙 · 意向北上广深
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {actions.map((act) => {
                const Icon = act.type === 'copy' && copied ? Check : act.icon;

                if (act.type === 'copy') {
                  return (
                    <button
                      key="copy"
                      onClick={handleCopy}
                      className="liquid-glass-strong flex items-center justify-center gap-2.5 rounded-full px-5 py-3 text-xs font-medium text-white uppercase tracking-widest transition-all hover:bg-white/[0.06] sm:text-sm"
                      type="button"
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {copied ? '已复制' : act.label}
                    </button>
                  );
                }

                return (
                  <a
                    key={act.label}
                    href={act.href}
                    target={act.download ? undefined : '_blank'}
                    rel={act.download ? undefined : 'noopener noreferrer'}
                    download={act.download || undefined}
                    className="liquid-glass-strong flex items-center justify-center gap-2.5 rounded-full px-5 py-3 text-xs font-medium text-white uppercase tracking-widest transition-all hover:bg-white/[0.06] sm:text-sm"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {act.label}
                  </a>
                );
              })}
            </div>
          </motion.div>

          {/* Right Column */}
          <motion.div variants={item}>
            <div className="rounded-3xl p-6 sm:p-8 liquid-glass-strong flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
                </span>
                <span className="font-display text-sm font-bold tracking-[0.15em] text-green-400">
                  OPEN TO WORK
                </span>
              </div>

              <div className="space-y-4 font-body text-sm text-ink-dim">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-ink/50">最快到岗</span>
                  <span>1 周内到岗</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-ink/50">出差</span>
                  <span>可接受</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-ink/50">邮箱</span>
                  <span className="text-right text-xs sm:text-sm">{EMAIL}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink/50">电话</span>
                  <span>181 6379 4793</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
