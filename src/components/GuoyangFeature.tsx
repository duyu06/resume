import { ExternalLink, Image, MessageSquare, Package, Sparkles, Video } from 'lucide-react';
import FadeIn from './FadeIn';
import ContactButton from './ContactButton';

const features = [
  { icon: Image, title: 'AI 图片生成', desc: '支持多模型图片生成、参考图控制与 2K/4K 高清输出' },
  { icon: Video, title: 'AI 视频生成', desc: '支持文生视频、图生视频及首尾帧控制' },
  { icon: Package, title: '商品组图', desc: '面向电商场景进行产品图生成与批量产出' },
  { icon: MessageSquare, title: '对话式创作', desc: '通过多轮对话和版本记录持续迭代生成结果' },
];

const models = ['OpenAI', 'Gemini', 'Kling', 'Seedream', 'Seedance', 'Veo'];

const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;

export default function GuoyangFeature() {
  return (
    <section id="guoyang" className="relative bg-bg px-5 py-20 sm:px-8 md:px-10 md:py-28">
      <div className="mx-auto max-w-6xl">
        <FadeIn y={30}>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[0.7rem] uppercase tracking-[0.18em] text-accent">
                <Sparkles className="h-3.5 w-3.5" />
                公司项目 · 线上产品
              </div>
              <h2
                className="hero-heading font-display font-black uppercase leading-none tracking-tight"
                style={{ fontSize: 'clamp(2.2rem, 8vw, 5.5rem)' }}
              >
                果漾 AI
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-dim md:text-base">
                剧本导入 → 角色四视图 → 智能分镜 → 参考帧 / 首尾帧 → 视频生成 → FFmpeg 成片
              </p>
              <p className="mt-1.5 max-w-xl text-sm text-ink/80 md:text-base">
                长沙果漾商贸有限公司 · 产品与技术协同 / 核心参与者 · 2025—至今
              </p>
            </div>
            <ContactButton
              href="https://guoyang.xin/"
              label="访问官网 ↗"
              className="shrink-0"
            />
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <FadeIn delay={0.1} y={40} className="lg:col-span-7">
            <a
              href="https://guoyang.xin/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block overflow-hidden rounded-[32px] border border-ink/15 bg-[#111] shadow-[0_30px_80px_rgba(0,0,0,0.55)] transition duration-500 hover:-translate-y-1 hover:border-accent/40 sm:rounded-[40px]"
            >
              <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-2 border-b border-white/8 bg-black/40 px-4 py-3 backdrop-blur-md">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-2 truncate font-mono text-[0.7rem] text-ink-dim">
                  https://guoyang.xin/
                </span>
                <ExternalLink className="ml-auto h-3.5 w-3.5 text-ink-dim opacity-0 transition group-hover:opacity-100" />
              </div>
              <img
                src={asset('assets/projects/proj-01-a.png')}
                alt="果漾 AI 官网截图"
                className="aspect-[16/10] w-full object-cover object-top pt-10 transition duration-700 group-hover:scale-[1.03]"
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg via-bg/70 to-transparent p-5 pt-16 sm:p-6">
                <div className="flex flex-wrap gap-2">
                  {models.map((m) => (
                    <span
                      key={m}
                      className="rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[0.68rem] text-ink backdrop-blur-md"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </a>
          </FadeIn>

          <div className="flex flex-col gap-4 lg:col-span-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <FadeIn key={f.title} delay={0.12 + i * 0.06} y={24} className="w-full">
                  <div className="glass group flex w-full min-w-0 gap-4 rounded-[22px] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-accent/35 sm:p-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/30 to-accent-3/20 text-ink">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-base font-semibold text-ink sm:text-lg">
                        {f.title}
                      </h3>
                      <p className="mt-1 break-words text-sm leading-relaxed text-ink-dim">{f.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              );
            })}

            <FadeIn delay={0.4} y={20} className="w-full">
              <div className="w-full rounded-[22px] border border-dashed border-ink/20 bg-white/[0.03] px-5 py-4 text-sm leading-relaxed text-ink-dim">
                <span className="font-medium text-ink">我的角色：</span>
                参与端到端任务流、异步任务、WebSocket 状态回传、失败重试、结果留存及多模型接口统一设计，并为额度、套餐、成本核算和计费体系预留扩展能力。
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
