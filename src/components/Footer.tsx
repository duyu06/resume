import { ArrowUpRight } from 'lucide-react';
import Button from './Button';

export default function Footer() {
  return (
    <footer className="w-full py-12 px-6">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-start gap-10">
        <Button variant="primary" href="tel:18163794793">
          联系我
        </Button>

        <div className="flex items-start gap-12">
          <div className="flex flex-col gap-3">
            {[
              { label: '项目', href: '#projects' },
              { label: '经历', href: '#exp' },
              { label: '认证', href: '#certs' },
            ].map((l) => (
              <a key={l.label} href={l.href} className="text-base text-ink hover:opacity-70 transition-opacity">
                {l.label}
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <span className="inline-flex items-center text-ink">
              <ArrowUpRight className="w-4 h-4" />
            </span>
            {[
              { label: '邮箱', href: 'mailto:3245485135@qq.com' },
              { label: '电话', href: 'tel:18163794793' },
            ].map((l) => (
              <a key={l.label} href={l.href} className="text-base text-ink hover:opacity-70 transition-opacity">
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto mt-10 pt-6 border-t border-ink/10 flex justify-between text-sm text-ink/70">
        <span>© 2026 张滨文</span>
        <span>长沙 · 意向北上广深</span>
      </div>
    </footer>
  );
}
