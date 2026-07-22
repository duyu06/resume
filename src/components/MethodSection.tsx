import {
  Activity,
  Boxes,
  Braces,
  ChartNoAxesCombined,
  ClipboardCheck,
  FlaskConical,
  Route,
  UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import FadeIn from './FadeIn';

type MethodStep = {
  icon: LucideIcon;
  index: string;
  title: string;
  english: string;
  outputs: string[];
};

const steps: MethodStep[] = [
  {
    icon: UsersRound,
    index: '01',
    title: '业务场景',
    english: 'CONTEXT',
    outputs: ['目标用户', '业务问题', '关键指标'],
  },
  {
    icon: Route,
    index: '02',
    title: '用户任务流',
    english: 'JOURNEY',
    outputs: ['角色权限', '正常流程', '异常分支'],
  },
  {
    icon: ClipboardCheck,
    index: '03',
    title: 'MVP 定义',
    english: 'SCOPE',
    outputs: ['功能边界', '优先级', '验收标准'],
  },
  {
    icon: FlaskConical,
    index: '04',
    title: '模型评测',
    english: 'EVALUATION',
    outputs: ['测试集', '质量 / 时延', '成本 / 稳定性'],
  },
  {
    icon: Boxes,
    index: '05',
    title: '产品原型',
    english: 'PROTOTYPE',
    outputs: ['页面结构', '任务状态', '人工审核'],
  },
  {
    icon: Braces,
    index: '06',
    title: '技术协同',
    english: 'DELIVERY',
    outputs: ['API', '异步任务', '失败重试'],
  },
  {
    icon: Activity,
    index: '07',
    title: '部署验证',
    english: 'VALIDATION',
    outputs: ['容器部署', '资源监控', '故障排查'],
  },
  {
    icon: ChartNoAxesCombined,
    index: '08',
    title: '迭代与商业化',
    english: 'GROWTH',
    outputs: ['版本复盘', '额度套餐', '成本核算'],
  },
];

export default function MethodSection() {
  return (
    <section id="method" className="relative overflow-hidden bg-surface px-5 py-20 sm:px-8 md:px-10 md:py-28">
      <div className="method-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div className="relative mx-auto max-w-6xl">
        <FadeIn y={30}>
          <div className="mb-12 grid gap-5 md:mb-16 md:grid-cols-[1fr_0.8fr] md:items-end">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="h-px w-8 bg-accent/50" />
                <span className="font-mono text-xs uppercase tracking-[0.28em] text-accent">From Problem to Product</span>
              </div>
              <h2 className="hero-heading font-display text-[clamp(2.3rem,7vw,5.2rem)] font-black uppercase leading-none tracking-tight">
                从问题到产品
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-ink-dim md:justify-self-end md:text-base">
              我习惯先定义用户、目标和验收标准，再推进模型评测、产品原型、工程协同与部署验证，确保方案不仅能生成，也能稳定交付。
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <FadeIn key={step.title} delay={index * 0.055} y={24}>
                <article className="method-card group relative h-full overflow-hidden rounded-[24px] border border-ink/10 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:border-accent/35 hover:shadow-[0_24px_70px_rgba(37,99,235,0.12)] sm:p-6">
                  <div className="mb-7 flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent transition-transform duration-300 group-hover:scale-105">
                      <Icon className="h-5 w-5" strokeWidth={1.7} />
                    </div>
                    <span className="font-mono text-xs tracking-[0.18em] text-ink/35">{step.index}</span>
                  </div>
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-accent/75">{step.english}</p>
                  <h3 className="mt-1.5 font-display text-lg font-bold tracking-tight text-ink sm:text-xl">{step.title}</h3>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {step.outputs.map((output) => (
                      <span key={output} className="rounded-full border border-ink/10 bg-surface px-2.5 py-1 text-[0.68rem] text-ink-dim">
                        {output}
                      </span>
                    ))}
                  </div>
                </article>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
