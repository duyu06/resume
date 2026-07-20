import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Database, Gauge, Timer, FileCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import FadeIn from './FadeIn';

type Card = {
  icon: LucideIcon;
  stat: string;
  label: string;
  desc: string;
};

const cards: Card[] = [
  {
    icon: Database,
    stat: '7,328',
    label: '条多模态对话数据',
    desc: '完成清洗、标注与训练集构建',
  },
  {
    icon: Timer,
    stat: '4h→20min',
    label: '模型平台单次部署时间',
    desc: '通过 Docker Compose 标准化部署',
  },
  {
    icon: Gauge,
    stat: '18+',
    label: 'token/s 本地模型推理吞吐',
    desc: '建立 GPU 与服务监控',
  },
  {
    icon: FileCheck,
    stat: '26+25',
    label: '标准测试 Prompt 与评分体系',
    desc: '形成模型横向评测方法',
  },
];

function TiltCard({ icon: Icon, stat, label, desc, index }: Card & { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), {
    stiffness: 200,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), {
    stiffness: 200,
    damping: 22,
  });

  const handleMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className="cursor-default"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '80px' }}
      transition={{
        delay: 0.08 * index,
        duration: 0.65,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <div className="glass rounded-2xl p-6 transition-[border-color] duration-400 hover:border-ink/25 sm:rounded-[24px] sm:p-7">
        <div className="pill-grad mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl">
          <Icon className="h-[18px] w-[18px] text-ink" strokeWidth={1.5} />
        </div>

        <motion.div
          className="hero-heading font-display text-[2.4rem] font-black leading-none tracking-tight sm:text-[3rem]"
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '60px' }}
          transition={{
            delay: 0.08 * index + 0.15,
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          {stat}
        </motion.div>

        <div className="mt-3 font-display text-sm font-semibold text-ink sm:text-[0.95rem]">
          {label}
        </div>
        <div className="mt-2 text-[0.75rem] leading-relaxed text-ink-dim sm:text-[0.8rem]">
          {desc}
        </div>
      </div>
    </motion.div>
  );
}

export default function ImpactCards() {
  return (
    <section className="relative bg-bg px-5 py-20 sm:px-8 md:px-10 md:py-28">
      <div className="mx-auto max-w-6xl">
        <FadeIn y={30}>
          <div className="mb-14 flex items-center gap-5">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-ink/20 to-transparent" />
            <h2 className="hero-heading shrink-0 text-center font-display text-[clamp(2rem,7vw,4.8rem)] font-black uppercase leading-none tracking-tight">
              CORE IMPACT
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-ink/20 to-transparent" />
          </div>
        </FadeIn>

        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6"
          style={{ perspective: '1200px' }}
        >
          {cards.map((card, i) => (
            <TiltCard key={card.label} {...card} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
