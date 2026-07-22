import { useEffect, useState } from 'react';

const links = [
  { href: '#hero', label: '首页' },
  { href: '#method', label: '方法' },
  { href: '#projects', label: '项目' },
  { href: '#career', label: '经历' },
  { href: '#contact', label: '联系' },
];

export default function DockNav() {
  const [active, setActive] = useState('#hero');

  useEffect(() => {
    const sections = links.map((link) => document.querySelector(link.href)).filter(Boolean) as HTMLElement[];
    const onScroll = () => {
      const position = window.scrollY + window.innerHeight * 0.4;
      let current = sections[0];
      sections.forEach((section) => {
        if (section.offsetTop <= position) current = section;
      });
      if (current) setActive(`#${current.id}`);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className="mobile-dock-nav fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 right-3 z-[900] flex justify-between gap-0.5 rounded-full border border-ink/10 bg-white/88 px-1.5 py-1.5 shadow-[0_18px_40px_rgba(15,23,42,0.14)] backdrop-blur-xl transition-[opacity,visibility,transform] duration-300 md:hidden"
      aria-label="页面导航"
    >
      {links.map((link) => {
        const selected = active === link.href;
        return (
          <a
            key={link.href}
            href={link.href}
            className={`flex-1 whitespace-nowrap rounded-full px-1.5 py-2 text-center font-display text-[0.58rem] font-semibold tracking-[0.06em] transition sm:text-[0.68rem] ${selected ? 'bg-accent text-white shadow-[0_8px_22px_rgba(37,99,235,0.25)]' : 'text-ink-dim hover:bg-accent-soft hover:text-accent'}`}
          >
            {link.label}
          </a>
        );
      })}
    </nav>
  );
}
