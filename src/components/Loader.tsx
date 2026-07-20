import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Props = { onDone: () => void };

export default function Loader({ onDone }: Props) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onDone();
      return;
    }
    let p = 0;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 300);
      p = Math.floor(t * 100);
      setPct(p);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setTimeout(onDone, 100);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-7 bg-bg"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.3 } }}
      >
        <div className="h-16 w-16 rounded-full border-[3px] border-ink/15 border-t-accent animate-spin" />
        <div className="h-[3px] w-[min(180px,50vw)] overflow-hidden rounded-full bg-ink/15">
          <div
            className="h-full rounded-full pill-grad transition-[width] duration-75"
            style={{ width: `${pct}%` }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
