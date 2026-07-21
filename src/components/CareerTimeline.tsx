import FadeIn from './FadeIn';
import { Circle } from 'lucide-react';

interface TimelineItem {
  date: string;
  title: string;
  role: string;
  note?: string;
  bullets: string[];
}

const timelineItems: TimelineItem[] = [
  {
    date: '2025.02 — 至今',
    title: '独立 AI 产品与技术实践',
    role: 'AI 产品经理 / 技术产品经理 / 原型开发',
    note: '公司项目、他人定制项目与个人产品实践；不作为正式全职雇佣经历展示。',
    bullets: [
      '面向 AI 内容生产、电商视觉、跨境独立站和运营自动化场景，完成业务调研、用户流程、需求文档、MVP 规划、原型验证与技术方案设计',
      '负责或核心参与果漾 AI、AI 电商主图生成器、跨境电商购物独立站和多账号运营 RPA 等项目，将模型能力整理为可配置、可追踪、可恢复的工作流',
      '使用 Go、Python、Vue、React 完成产品原型、接口联调和部分核心功能开发，并沉淀 PRD、流程图、接口说明、测试用例与部署文档',
    ],
  },
  {
    date: '2024.11 — 2025.06',
    title: '云计算、网络与 AI 部署实践',
    role: '技术方案设计 / 部署验证',
    bullets: [
      '参与 OpenStack 私有云、VMware 虚拟化、智慧校园网络及本地大模型推理平台的方案设计、部署联调和测试验证',
      '使用 Docker Compose、Open WebUI、Ollama、vLLM、Prometheus、Grafana 和 DCGM 搭建统一模型访问、推理和监控环境',
      '完成 VRRP、MSTP、OSPF、NAT、DHCP Relay、ACL 和 Eth-Trunk 配置验证，并沉淀部署模板、测试记录和排障方案',
    ],
  },
];

export default function CareerTimeline() {
  return (
    <section
      id="career"
      className="relative overflow-hidden bg-bg px-5 py-20 sm:px-8 sm:py-24 md:px-10 md:py-32"
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
          className="absolute bottom-3 left-[11px] top-3 w-px bg-gradient-to-b from-white/20 via-white/12 to-white/5 md:left-[15px]"
          aria-hidden
        />

        <div className="flex flex-col gap-10 md:gap-14">
          {timelineItems.map((item, i) => (
            <FadeIn key={item.title} delay={i * 0.1} y={30}>
              <div className="relative flex gap-5 md:gap-7">
                <div className="relative z-10 flex-shrink-0 pt-1.5">
                  <Circle
                    className="h-2 w-2 text-ink/50 md:h-2.5 md:w-2.5"
                    fill="currentColor"
                    strokeWidth={0}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-display text-[0.7rem] uppercase tracking-[0.15em] text-ink/50 md:text-xs">
                      {item.date}
                    </span>
                    <span className="hidden text-[0.65rem] text-ink/15 sm:inline">|</span>
                    <span className="hidden font-display text-[0.6rem] uppercase tracking-[0.12em] text-ink/35 sm:inline md:text-[0.65rem]">
                      {item.role}
                    </span>
                  </div>

                  <h3 className="mb-3 font-body text-lg font-semibold leading-snug tracking-tight text-ink/90 md:text-xl">
                    {item.title}
                  </h3>

                  {item.note && (
                    <p className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs leading-relaxed text-ink/55">
                      {item.note}
                    </p>
                  )}

                  <ul className="flex flex-col gap-2">
                    {item.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-2.5 text-sm leading-relaxed text-ink/55 md:text-[0.9375rem]"
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
