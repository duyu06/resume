import { useCallback, useRef } from 'react';
import FadeIn from './FadeIn';
import ContactButton from './ContactButton';

export default function ContactSection() {
  const layerRef = useRef<HTMLDivElement>(null);
  const lastSpawn = useRef(0);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const layer = layerRef.current;
    if (!layer) return;
    const now = Date.now();
    if (now - lastSpawn.current < 90) return;
    lastSpawn.current = now;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rot = (Math.random() - 0.5) * 24;

    const node = document.createElement('div');
    node.className = 'viktor-ghost';
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    node.style.setProperty('--rot', `${rot}deg`);
    layer.appendChild(node);
    window.setTimeout(() => node.remove(), 900);
  }, []);

  return (
    <section id="contact" className="bg-bg px-5 pb-36 pt-16 sm:px-8 md:px-10 md:pb-40 md:pt-24">
      <FadeIn y={30}>
        <div
          className="relative mx-auto max-w-5xl cursor-crosshair overflow-hidden rounded-[40px] border border-ink/15 bg-white select-none sm:rounded-[48px]"
          onMouseMove={onMove}
        >
          <div ref={layerRef} className="pointer-events-none absolute inset-0 z-0 overflow-hidden" />

          <div className="relative z-10 flex min-h-[380px] flex-col items-center justify-center gap-4 px-6 py-20 text-center md:min-h-[460px] md:py-28">
            <div className="rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-[0.7rem] uppercase tracking-[0.2em] text-black/50">
              Viktor · Contact
            </div>
            <h2
              className="font-display font-black leading-none tracking-tight text-[#0c0c0c]"
              style={{ fontSize: 'clamp(2.4rem, 9vw, 5.5rem)' }}
            >
              一起做点东西
            </h2>
            <p className="max-w-md text-sm text-black/55 md:text-base">
              AI 产品 / 技术产品 / AI 解决方案方向岗位，欢迎随时联系。
              <br />
              也可以先看看我的线上项目{' '}
              <a
                href="https://guoyang.xin/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent underline underline-offset-4"
              >
                guoyang.xin
              </a>
            </p>
            <div className="mt-3 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <ContactButton href="tel:18163794793" label="181 6379 4793" />
              <a
                href="mailto:3245485135@qq.com"
                className="inline-flex items-center justify-center rounded-full border-2 border-[#0c0c0c] px-8 py-3 text-xs font-medium uppercase tracking-widest text-[#0c0c0c] transition hover:bg-black/5 sm:px-10 sm:py-3.5 sm:text-sm md:px-12 md:py-4 md:text-base"
              >
                3245485135@qq.com
              </a>
            </div>
          </div>
        </div>
      </FadeIn>

      <footer className="mt-12 text-center text-xs tracking-wide text-ink-dim">
        © 2026 张滨文 · AI 产品经理 · Viktor Oddy × Layered Depth × 3D Jack
      </footer>
    </section>
  );
}
