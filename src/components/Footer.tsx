import { Code, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const links = [
  { icon: Code, href: 'https://github.com/duyu06', label: 'GitHub' },
  { icon: Mail, href: 'mailto:3245485135@qq.com', label: 'Email' },
];

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="border-t border-white/10 bg-black px-6 py-8"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-4 text-sm text-white/50">
            <span className="font-['Noto_Sans_SC'] text-white/60">张滨文 · AI 产品经理</span>
            {links.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target={label === 'GitHub' ? '_blank' : undefined}
                rel={label === 'GitHub' ? 'noopener noreferrer' : undefined}
                aria-label={label}
                className="transition-colors hover:text-white/80"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <span className="text-xs text-white/40">© 2026 · 长沙 · 意向北上广深 / 苏州 / 佛山</span>
        </div>
      </div>
    </motion.footer>
  );
}
