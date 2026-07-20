import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Props = { onDone: () => void };

export default function Loader({ onDone }: Props) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let p = 0;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1800);
      p = Math.floor(t * 100);
      setPct(p);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setTimeout(onDone, 350);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-7 bg-bg"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.5 } }}
      >
        <div className="h-20 w-20 rounded-full border-[3px] border-ink/15 border-t-accent animate-spin" />
        <div className="hero-heading font-display text-[clamp(2rem,8vw,4rem)] font-black tracking-wide">
          张滨文
        </div>
        <div className="h-[3px] w-[min(240px,60vw)] overflow-hidden rounded-full bg-ink/15">
          <div
            className="h-full rounded-full pill-grad transition-[width] duration-150"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="font-display text-sm tracking-[0.3em] text-ink-dim">
          LOADING {String(pct).padStart(3, '0')}%
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
