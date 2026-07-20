import { ArrowRight, Clapperboard, FileText, Film, Image, LayoutGrid, UserRound, Video } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import FadeIn from './FadeIn';

type BadgeKey = 'input' | 'model' | 'output' | 'decision' | 'evaluation' | 'exception';

const badgeLabel: Record<BadgeKey, string> = {
  input: '输入',
  model: '模型',
  output: '输出',
  decision: '决策',
  evaluation: '评测',
  exception: '异常',
};

interface StepField {
  key: BadgeKey;
  value: string;
}

interface Step {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  fields: StepField[];
}

const steps: Step[] = [
  {
    icon: FileText,
    title: '剧本导入',
    subtitle: 'Script Import',
    fields: [
      { key: 'input', value: '原始剧本、角色描述' },
      { key: 'output', value: '结构化剧本数据' },
      { key: 'decision', value: '支持多种剧本格式，自动解析角色关系' },
    ],
  },
  {
    icon: UserRound,
    title: '角色提取与设定',
    subtitle: 'Character',
    fields: [
      { key: 'input', value: '结构化剧本' },
      { key: 'model', value: 'LLM + 规则引擎' },
      { key: 'output', value: '角色画像 JSON' },
      { key: 'decision', value: '自动识别主角/配角/路人，提取年龄/性别/外貌/性格' },
    ],
  },
  {
    icon: LayoutGrid,
    title: '四视图生成',
    subtitle: '4-View',
    fields: [
      { key: 'input', value: '角色画像' },
      { key: 'model', value: 'FLUX / Kling' },
      { key: 'output', value: '正面/侧面/背面/3/4视图' },
      { key: 'evaluation', value: '角色一致性、服装细节' },
      { key: 'exception', value: '生成失败自动重试3次' },
    ],
  },
  {
    icon: Film,
    title: '智能分镜',
    subtitle: 'Storyboard',
    fields: [
      { key: 'input', value: '剧本 + 角色设定' },
      { key: 'model', value: 'GPT-4o + 规则引擎' },
      { key: 'output', value: '分镜脚本 JSON' },
      { key: 'decision', value: '运镜类型、景别、时长、转场' },
    ],
  },
  {
    icon: Image,
    title: '首尾帧生成',
    subtitle: 'Keyframe',
    fields: [
      { key: 'input', value: '分镜脚本' },
      { key: 'model', value: 'Kling / Seedance' },
      { key: 'output', value: '关键帧图片' },
      { key: 'evaluation', value: '动作幅度、角色一致性' },
      { key: 'exception', value: '超时切换备用模型' },
    ],
  },
  {
    icon: Video,
    title: '视频生成',
    subtitle: 'Generation',
    fields: [
      { key: 'input', value: '分镜 + 首尾帧 + 动作描述' },
      { key: 'model', value: 'Kling / Seedance / Veo' },
      { key: 'output', value: '逐镜头视频' },
      { key: 'evaluation', value: '动作自然度、生成时长、成本' },
      { key: 'exception', value: '超时重试、模型切换、结果留存' },
    ],
  },
  {
    icon: Clapperboard,
    title: 'FFmpeg合成',
    subtitle: 'Compose',
    fields: [
      { key: 'input', value: '所有镜头视频 + 音频' },
      { key: 'output', value: '成品视频' },
      { key: 'decision', value: '自动添加字幕/转场/片头片尾' },
    ],
  },
];

function NodeCard({ step, index }: { step: Step; index: number }) {
  const [hovered, setHovered] = useState(false);
  const Icon = step.icon;

  return (
    <div
      className="group relative flex flex-col items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        className="glass flex w-[130px] cursor-default flex-col items-center gap-2 rounded-2xl px-3 py-4 transition-colors duration-300 hover:border-accent/35"
        whileHover={{ y: -4 }}
      >
        <div className="rounded-xl bg-gradient-to-br from-accent/25 to-accent-3/10 p-2.5">
          <Icon className="h-5 w-5 text-ink" strokeWidth={1.75} />
        </div>
        <span className="font-mono text-[0.6rem] uppercase tracking-widest text-ink-dim">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="text-center font-display text-[0.8rem] font-semibold leading-tight text-ink">
          {step.title}
        </span>
        <span className="-mt-1 text-[0.6rem] uppercase tracking-widest text-ink-dim">
          {step.subtitle}
        </span>
      </motion.div>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute top-full z-30 mt-3 w-60 glass rounded-2xl p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <Icon className="h-4 w-4 text-ink" strokeWidth={1.75} />
              <span className="font-display text-sm font-semibold text-ink">{step.title}</span>
              <span className="ml-auto font-mono text-[0.6rem] text-ink-dim">
                {String(index + 1).padStart(2, '0')}/07
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              {step.fields.map((f) => (
                <div key={f.key} className="flex items-start gap-2">
                  <span className="pill-grad shrink-0 rounded-md px-1.5 py-0.5 text-[0.6rem] font-medium uppercase tracking-wider text-ink/80">
                    {badgeLabel[f.key]}
                  </span>
                  <span className="text-[0.72rem] leading-relaxed text-ink/80">{f.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileCard({ step, index }: { step: Step; index: number }) {
  const Icon = step.icon;

  return (
    <FadeIn delay={index * 0.06} y={20}>
      <div className="glass flex flex-col gap-3 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-accent/25 to-accent-3/10 p-2.5">
            <Icon className="h-5 w-5 text-ink" strokeWidth={1.75} />
          </div>
          <div>
            <span className="font-mono text-[0.6rem] uppercase tracking-widest text-ink-dim">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="font-display text-base font-semibold leading-tight text-ink">
              {step.title}
            </h3>
            <span className="text-[0.65rem] uppercase tracking-wider text-ink-dim">
              {step.subtitle}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          {step.fields.map((f) => (
            <div key={f.key} className="flex items-start gap-2.5">
              <span className="pill-grad shrink-0 rounded-md px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wider text-ink/80">
                {badgeLabel[f.key]}
              </span>
              <span className="text-sm leading-relaxed text-ink/75">{f.value}</span>
            </div>
          ))}
        </div>
      </div>
    </FadeIn>
  );
}

export default function GuoyangWorkflow() {
  return (
    <section id="guoyang-workflow" className="relative bg-bg px-5 py-20 sm:px-8 md:px-10 md:py-28">
      <div className="mx-auto max-w-6xl">
        <FadeIn y={30}>
          <div className="mb-12 md:mb-16">
            <div className="mb-2 flex items-center gap-3">
              <span className="h-px w-8 bg-ink/30" />
              <span className="text-xs uppercase tracking-[0.3em] text-ink-dim">Workflow</span>
            </div>
            <h2
              className="hero-heading font-display font-black uppercase leading-none tracking-tight"
              style={{ fontSize: 'clamp(2.2rem, 8vw, 5.5rem)' }}
            >
              生产流程
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-dim md:text-base">
              端到端 AI 视频生成管线 — 从剧本到成品，七步闭环
            </p>
          </div>
        </FadeIn>

        <div className="hidden md:flex md:items-start md:justify-center md:gap-1.5 lg:gap-2">
          {steps.map((step, i) => (
            <div key={step.title} className="flex items-start">
              <FadeIn delay={i * 0.07} y={24}>
                <NodeCard step={step} index={i} />
              </FadeIn>
              {i < steps.length - 1 && (
                <div className="flex shrink-0 items-center pt-12">
                  <ArrowRight className="h-5 w-5 text-ink/30" strokeWidth={2} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3 md:hidden">
          {steps.map((step, i) => (
            <div key={step.title} className="flex w-full flex-col items-center">
              <MobileCard step={step} index={i} />
              {i < steps.length - 1 && (
                <div className="py-1">
                  <ArrowRight className="h-5 w-5 text-ink/25" strokeWidth={2} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
