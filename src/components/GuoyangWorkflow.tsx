import { ArrowDown, ArrowRight, Clapperboard, FileText, Film, Image, LayoutGrid, UserRound, Video } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import FadeIn from './FadeIn';

type BadgeKey = 'input' | 'model' | 'output' | 'decision' | 'evaluation' | 'exception';

const badgeLabel: Record<BadgeKey, string> = {
  input: '输入', model: '模型', output: '输出', decision: '决策', evaluation: '评测', exception: '异常',
};

interface StepField { key: BadgeKey; value: string }
interface Step { icon: LucideIcon; title: string; subtitle: string; fields: StepField[] }

const steps: Step[] = [
  { icon: FileText, title: '剧本导入', subtitle: 'Script Import', fields: [
    { key: 'input', value: '原始剧本、角色描述' }, { key: 'output', value: '结构化剧本数据' },
    { key: 'decision', value: '支持多种剧本格式，解析角色关系与场景信息' },
  ] },
  { icon: UserRound, title: '角色提取与设定', subtitle: 'Character', fields: [
    { key: 'input', value: '结构化剧本' }, { key: 'model', value: 'LLM + 规则引擎' },
    { key: 'output', value: '角色画像 JSON' }, { key: 'decision', value: '识别主角、配角与路人，提取年龄、外貌和性格' },
  ] },
  { icon: LayoutGrid, title: '四视图生成', subtitle: '4-View', fields: [
    { key: 'input', value: '角色画像' }, { key: 'model', value: '图片生成与编辑模型' },
    { key: 'output', value: '正面、侧面、背面与 3/4 视图' }, { key: 'evaluation', value: '角色一致性、服装与细节完整度' },
    { key: 'exception', value: '失败重试、版本保留与人工重选' },
  ] },
  { icon: Film, title: '智能分镜', subtitle: 'Storyboard', fields: [
    { key: 'input', value: '剧本 + 角色设定' }, { key: 'model', value: '大语言模型 + 规则引擎' },
    { key: 'output', value: '分镜脚本 JSON' }, { key: 'decision', value: '运镜、景别、时长、动作与转场' },
  ] },
  { icon: Image, title: '参考帧 / 首尾帧', subtitle: 'Keyframe', fields: [
    { key: 'input', value: '分镜脚本与角色参考图' }, { key: 'model', value: '多供应商图片模型' },
    { key: 'output', value: '镜头参考帧与首尾帧' }, { key: 'evaluation', value: '角色一致性、构图和动作幅度' },
    { key: 'exception', value: '超时重试、备用模型切换与结果留存' },
  ] },
  { icon: Video, title: '视频生成', subtitle: 'Generation', fields: [
    { key: 'input', value: '分镜 + 参考帧 + 动作描述' }, { key: 'model', value: 'Kling / Seedance / Veo 等视频服务' },
    { key: 'output', value: '逐镜头视频' }, { key: 'evaluation', value: '动作自然度、成功率、时延与成本' },
    { key: 'exception', value: '超时重试、模型切换和失败状态回传' },
  ] },
  { icon: Clapperboard, title: 'FFmpeg 合成', subtitle: 'Compose', fields: [
    { key: 'input', value: '镜头视频、音频和字幕' }, { key: 'output', value: '成品视频' },
    { key: 'decision', value: '合成字幕、转场、片头片尾并导出' },
  ] },
];

function NodeCard({ step, index, active, onClick, onFocus }: { step: Step; index: number; active: boolean; onClick: () => void; onFocus: () => void }) {
  const Icon = step.icon;
  return (
    <div className="group relative flex flex-col items-center">
      <button className="glass flex w-[130px] flex-col items-center gap-2 rounded-2xl px-3 py-4 transition-colors duration-300 hover:border-accent/35" onClick={onClick} onFocus={onFocus} aria-expanded={active} aria-label={`${step.title}: ${step.subtitle}`}>
        <motion.div whileHover={{ y: -4 }}><div className="rounded-xl bg-gradient-to-br from-accent/25 to-accent-3/10 p-2.5"><Icon className="h-5 w-5 text-ink" strokeWidth={1.75} /></div></motion.div>
        <span className="font-mono text-[0.6rem] uppercase tracking-widest text-ink-dim">{String(index + 1).padStart(2, '0')}</span>
        <span className="text-center font-display text-[0.8rem] font-semibold leading-tight text-ink">{step.title}</span>
        <span className="-mt-1 text-[0.6rem] uppercase tracking-widest text-ink-dim">{step.subtitle}</span>
      </button>
      <AnimatePresence>{active && (
        <motion.div initial={{ opacity: 0, y: -6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.96 }} transition={{ duration: 0.22 }} className="glass absolute top-full z-30 mt-3 w-60 rounded-2xl p-4">
          <div className="mb-2 flex items-center gap-2"><Icon className="h-4 w-4" /><span className="font-display text-sm font-semibold">{step.title}</span><span className="ml-auto font-mono text-[0.6rem] text-ink-dim">{String(index + 1).padStart(2, '0')}/07</span></div>
          <div className="flex flex-col gap-1.5">{step.fields.map((field) => <div key={`${field.key}-${field.value}`} className="flex min-w-0 items-start gap-2"><span className="pill-grad shrink-0 rounded-md px-1.5 py-0.5 text-[0.6rem]">{badgeLabel[field.key]}</span><span className="min-w-0 break-words text-[0.72rem] leading-relaxed text-ink/80">{field.value}</span></div>)}</div>
        </motion.div>
      )}</AnimatePresence>
    </div>
  );
}

function MobileCard({ step, index }: { step: Step; index: number }) {
  const Icon = step.icon;
  return (
    <FadeIn delay={index * 0.06} y={20} className="w-full">
      <div className="glass flex w-full min-w-0 flex-col gap-3 rounded-2xl p-4 sm:p-5">
        <div className="flex min-w-0 items-center gap-3"><div className="shrink-0 rounded-xl bg-gradient-to-br from-accent/25 to-accent-3/10 p-2.5"><Icon className="h-5 w-5" /></div><div className="min-w-0"><span className="font-mono text-[0.6rem] uppercase tracking-widest text-ink-dim">{String(index + 1).padStart(2, '0')}</span><h3 className="break-words font-display text-base font-semibold">{step.title}</h3><span className="text-[0.65rem] uppercase tracking-wider text-ink-dim">{step.subtitle}</span></div></div>
        <div className="flex min-w-0 flex-col gap-1.5">{step.fields.map((field) => <div key={`${field.key}-${field.value}`} className="flex min-w-0 items-start gap-2.5"><span className="pill-grad shrink-0 rounded-md px-2 py-0.5 text-[0.65rem]">{badgeLabel[field.key]}</span><span className="min-w-0 break-words text-sm leading-relaxed text-ink/75">{field.value}</span></div>)}</div>
      </div>
    </FadeIn>
  );
}

export default function GuoyangWorkflow() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  return (
    <section id="guoyang-workflow" className="relative bg-bg px-5 py-20 sm:px-8 md:px-10 md:py-28">
      <div className="mx-auto max-w-6xl">
        <FadeIn y={30}><div className="mb-12 md:mb-16"><div className="mb-2 flex items-center gap-3"><span className="h-px w-8 bg-ink/30" /><span className="text-xs uppercase tracking-[0.3em] text-ink-dim">Workflow</span></div><h2 className="hero-heading font-display font-black uppercase leading-none tracking-tight" style={{ fontSize: 'clamp(2.2rem, 8vw, 5.5rem)' }}>生产流程</h2><p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-dim md:text-base">从剧本到成片的七步产品工作流，覆盖输入、模型、输出、评测与异常处理。</p></div></FadeIn>
        <div className="hidden xl:flex xl:items-start xl:justify-center xl:gap-1.5">{steps.map((step, index) => <div key={step.title} className="flex items-start"><FadeIn delay={index * 0.07} y={24}><NodeCard step={step} index={index} active={activeStep === index} onFocus={() => setActiveStep(index)} onClick={() => setActiveStep(activeStep === index ? null : index)} /></FadeIn>{index < steps.length - 1 && <div className="flex shrink-0 items-center pt-12"><ArrowRight className="h-5 w-5 text-ink/30" /></div>}</div>)}</div>
        <div className="flex w-full flex-col items-stretch gap-3 xl:hidden">{steps.map((step, index) => <div key={step.title} className="flex w-full min-w-0 flex-col items-center"><MobileCard step={step} index={index} />{index < steps.length - 1 && <div className="py-1"><ArrowDown className="h-5 w-5 text-ink/25" /></div>}</div>)}</div>
      </div>
    </section>
  );
}
