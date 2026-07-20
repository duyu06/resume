import { useEffect, useState } from 'react';

const links = [
  { href: '#hero', label: '首页' },
  { href: '#about', label: '关于' },
  { href: '#guoyang', label: '果漾' },
  { href: '#career', label: '经历' },
  { href: '#projects', label: '项目' },
  { href: '#contact', label: '联系' },
];

export default function DockNav() {
  const [active, setActive] = useState('#hero');

  useEffect(() => {
    const secs = links
      .map((l) => document.querySelector(l.href))
      .filter(Boolean) as HTMLElement[];

    const onScroll = () => {
      const pos = window.scrollY + window.innerHeight * 0.4;
      let cur = secs[0];
      secs.forEach((s) => {
        if (s.offsetTop <= pos) cur = s;
      });
      if (cur) setActive(`#${cur.id}`);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className="fixed bottom-4 left-1/2 z-[900] flex -translate-x-1/2 gap-1 rounded-full border border-ink/15 bg-bg/55 px-2 py-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:bottom-6 sm:gap-1.5 sm:px-2.5 sm:py-2 md:hidden"
      aria-label="页面导航"
    >
      {links.map((l) => {
        const on = active === l.href;
        return (
          <a
            key={l.href}
            href={l.href}
            className={`whitespace-nowrap rounded-full px-2.5 py-2 font-display text-[0.62rem] font-semibold uppercase tracking-[0.12em] transition sm:px-3.5 sm:text-[0.72rem] ${
              on
                ? 'pill-grad text-white shadow-[0_6px_18px_rgba(255,255,255,0.15)]'
                : 'text-ink-dim hover:text-white'
            }`}
          >
            {l.label}
          </a>
        );
      })}
    </nav>
  );
}
