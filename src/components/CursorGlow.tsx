import { useEffect, useRef } from 'react';

export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return;
    const el = ref.current;
    if (!el) return;
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let cx = mx;
    let cy = my;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const loop = () => {
      cx += (mx - cx) * 0.12;
      cy += (my - cy) * 0.12;
      el.style.transform = `translate3d(${cx - 210}px, ${cy - 210}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[1] hidden h-[420px] w-[420px] rounded-full mix-blend-screen md:block"
      style={{
        background: 'radial-gradient(circle, rgba(255,255,255,0.08), transparent 65%)',
      }}
    />
  );
}
