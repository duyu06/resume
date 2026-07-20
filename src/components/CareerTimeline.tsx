import FadeIn from './FadeIn';
import { Circle } from 'lucide-react';

interface TimelineItem {
  date: string;
  title: string;
  role: string;
  bullets: string[];
}

const timelineItems: TimelineItem[] = [
  {
    date: '2025.03 — 至今',
    title: '果漾 AI · 多模态内容生产平台',
    role: '产品与技术协同',
    bullets: [
      '参与端到端MVP定义，完成剧本导入→角色四视图→智能分镜→视频合成全链路',
      '多模型接入方案设计（按质量/时延/成功率/成本选型）',
      'Go后端 + Vue用户站 + Next.js AIComicBuilder 多前端架构',
    ],
  },
  {
    date: '2026.01 — 2026.04',
    title: '数字人风格对话模型微调',
    role: '产品负责人',
    bullets: [
      '独立清洗标注 7,328 条多模态对话数据，构建 JSONL 训练集',
      '设计角色设定+上下文+记忆+输出约束的四层 Prompt 结构',
      '构建 26 条标准测试 Prompt + 5 维 25 分制评分卡',
    ],
  },
  {
    date: '2025.03 — 至今',
    title: 'Open WebUI + 多模型本地化平台',
    role: '项目负责人',
    bullets: [
      'Docker Compose 封装服务，部署时间从 4h 缩短至 20min',
      'Prometheus + Grafana + DCGM 构建 GPU 监控体系',
      '推理吞吐稳定 18+ token/s，7×24h 运行',
    ],
  },
  {
    date: '2025.02 — 2025.04',
    title: '叫魂者 · 多 Agent 叙事对话系统',
    role: '技术负责人',
    bullets: [
      '独立完成 prompts.py、world_state.py、main.py 核心代码',
      '实现多角色信息隔离与关键事实注入，解决角色越界问题',
      'AutoGen 0.7.5 + Groq API + Llama-3.1-8B 技术栈',
    ],
  },
];

export default function CareerTimeline() {
  return (
    <section
      id="career"
      className="relative bg-bg px-5 py-20 sm:px-8 sm:py-24 md:px-10 md:py-32 overflow-hidden"
    >
      <FadeIn y={40}>
        <h2
          className="hero-heading mb-14 text-center font-display font-black uppercase leading-none tracking-tight sm:mb-18 md:mb-24"
          style={{ fontSize: 'clamp(2.5rem, 10vw, 120px)' }}
        >
          实践经历
        </h2>
      </FadeIn>

      <div className="relative mx-auto max-w-3xl">
        <div
          className="absolute left-[11px] top-3 bottom-3 w-px bg-gradient-to-b from-white/20 via-white/12 to-white/5 md:left-[15px]"
          aria-hidden
        />

        <div className="flex flex-col gap-10 md:gap-14">
          {timelineItems.map((item, i) => (
            <FadeIn key={i} delay={i * 0.1} y={30}>
              <div className="relative flex gap-5 md:gap-7">
                <div className="relative z-10 flex-shrink-0 pt-1.5">
                  <Circle
                    className="w-2 h-2 md:w-2.5 md:h-2.5 text-ink/50"
                    fill="currentColor"
                    strokeWidth={0}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2.5">
                    <span className="font-display text-[0.7rem] md:text-xs tracking-[0.15em] uppercase text-ink/50">
                      {item.date}
                    </span>
                    <span className="hidden sm:inline text-ink/15 text-[0.65rem]">|</span>
                    <span className="hidden sm:inline font-display text-[0.6rem] md:text-[0.65rem] tracking-[0.12em] uppercase text-ink/35">
                      {item.role}
                    </span>
                  </div>

                  <h3 className="font-body text-lg md:text-xl font-semibold text-ink/90 mb-3 leading-snug tracking-tight">
                    {item.title}
                  </h3>

                  <ul className="flex flex-col gap-2">
                    {item.bullets.map((b, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2.5 text-sm md:text-[0.9375rem] leading-relaxed text-ink/55"
                      >
                        <span className="mt-[0.6em] h-1 w-1 flex-shrink-0 rounded-full bg-ink/25" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
