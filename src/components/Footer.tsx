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
      className="border-t border-ink/10 bg-surface px-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-8 md:pb-8"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-4 text-sm text-ink/45">
            <span className="font-['Noto_Sans_SC'] text-ink/60">© 2026 张滨文 · AI 产品经理</span>
            {links.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target={label === 'GitHub' ? '_blank' : undefined}
                rel={label === 'GitHub' ? 'noopener noreferrer' : undefined}
                aria-label={label}
                className="transition-colors hover:text-accent"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <span className="text-xs text-ink/35">Designed & Built by Zhang Binwen</span>
        </div>
      </div>
    </motion.footer>
  );
}
