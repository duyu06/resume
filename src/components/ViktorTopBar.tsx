import { useEffect, useState } from 'react';
import ContactButton from './ContactButton';

const links = [
  { href: '#hero', label: '首页' },
  { href: '#guoyang', label: '果漾' },
  { href: '#projects', label: '项目' },
  { href: '#career', label: '经历' },
  { href: '#contact', label: '联系' },
];

export default function ViktorTopBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="pointer-events-none fixed left-0 right-0 top-0 z-[950] flex justify-center px-4 pt-4 md:pt-5">
      <div className={`pointer-events-auto flex max-w-full items-center gap-1 rounded-full border border-white/10 bg-bg/70 px-2 py-1.5 backdrop-blur-xl transition-shadow duration-300 sm:gap-2 sm:px-2.5 sm:py-2 ${scrolled ? 'shadow-[0_12px_40px_rgba(0,0,0,0.45)]' : ''}`}>
        <a href="#hero" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black font-display text-[11px] font-bold italic text-white ring-1 ring-white/20 sm:h-10 sm:w-10 sm:text-xs" title="回到顶部">ZB</a>
        <div className="mx-1 hidden h-5 w-px bg-white/15 sm:block" />
        <nav className="hidden items-center md:flex" aria-label="顶部导航">
          {links.map((link) => <a key={link.href} href={link.href} className="rounded-full px-3 py-1.5 text-xs text-ink-dim transition hover:bg-white/8 hover:text-ink sm:px-4 sm:text-sm">{link.label}</a>)}
        </nav>
        <div className="mx-1 hidden h-5 w-px bg-white/15 md:block" />
        <ContactButton href="https://guoyang.xin/" label="果漾 AI ↗" className="!px-4 !py-2 !text-[0.7rem] sm:!px-5 sm:!py-2.5 sm:!text-xs" />
      </div>
    </header>
  );
}
