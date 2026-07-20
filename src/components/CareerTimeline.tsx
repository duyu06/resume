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
    date: '2025.02 — 至今',
    title: '独立 AI 产品与技术实践',
    role: 'AI 产品经理 / 技术产品经理',
    bullets: [
      '持续开展 AI 内容生产、电商素材、独立站和自动化项目，完成需求拆解、MVP 定义、模型评测、原型开发和部署验证全流程',
      '输出 PRD、业务流程文档、技术方案、接口定义、测试用例与交付文档，推动项目从概念到可交付状态',
      '独立完成 Go 后端开发、Vue 前端搭建、Docker 部署与运维监控，形成可复用的项目框架与模板',
    ],
  },
  {
    date: '2024.11 — 2025.06',
    title: '云计算、网络与 AI 部署实践',
    role: '技术方案设计 / 部署验证',
    bullets: [
      '参与 OpenStack、VMware 虚拟化平台部署与网络配置实践，完成资源规划、部署联调与故障排查',
      '完成校园网络设备配置与维护，积累交换机、路由器与网络拓扑设计经验',
      '部署本地模型推理平台（Ollama / vLLM / Open WebUI），搭建 GPU 监控体系（Prometheus + Grafana + DCGM）',
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
