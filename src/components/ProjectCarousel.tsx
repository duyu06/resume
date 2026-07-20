import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Reveal from './Reveal';

const projects = [
  {
    name: '果漾 · AI 多模态内容生产平台',
    role: '项目参与人 / 产品与技术协同',
    tags: ['Go / Gin', 'Vue 3', 'Next.js', 'FFmpeg', 'Redis', 'Docker'],
    desc: '面向短视频与 AI 短剧创作者，打通剧本→角色→分镜→图像/视频生成→FFmpeg 成片合成的端到端链路。接入 OpenAI、Gemini、DALL·E、Kling、Seedance、Veo 等多模型，按效果/速度/成本切换供应商。',
    result: '完成核心链路与多模型接入，具备 MVP 演示能力。',
    img: `${import.meta.env.BASE_URL}assets/projects/proj-01-a.png`,
    link: 'https://guoyang.xin/',
  },
  {
    name: '数字人风格对话模型微调',
    role: '产品负责人 / AI 应用实践 · 2026.04',
    tags: ['Python', 'Hugging Face', 'JSONL', 'Prompt Engineering', 'API'],
    desc: '独立整理清洗 7,328 条历史对话，构建 JSONL 数据集与 26 条测试 Prompt + 25 分制评分卡。端到端跑通「需求定义—数据处理—训练—评测—部署—接口调用」全流程，训练 Loss 正常收敛。',
    result: '全流程不足两周，沉淀数据模板、测试集、评分卡与交付说明。',
  },
  {
    name: 'Open WebUI + 多模型本地化平台',
    role: '项目负责人 · 2025.03 至今',
    tags: ['Ubuntu', 'Ollama / vLLM', 'Docker Compose', 'Prometheus', 'Grafana'],
    desc: 'Docker Compose 封装多模型管理平台，部署时间从 4 小时缩短至 20 分钟。搭建 GPU/显存监控面板，推理吞吐稳定 18+ token/s，显存 < 85%，支持 7×24 小时运行。',
    result: '形成可复用的模型部署、监控、调优和排障方案。',
  },
  {
    name: '叫魂者 · 多 Agent 叙事对话系统',
    role: '技术负责人 · 2025.02—2025.04',
    tags: ['AutoGen 0.7.5', 'Python', 'Groq API', 'Llama-3.1-8B', 'Tkinter'],
    desc: '基于 AutoGen 的多角色协作叙事系统，支持世界状态、真相进度与双解分支剧情。独立完成 prompts.py、world_state.py、main.py 三模块，开发模拟/API 双模式 GUI。',
    result: '完成可演示的 0—1 多 Agent 产品原型。',
  },
];

export default function ProjectCarousel() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [step, setStep] = useState(524);
  const viewportRef = useRef<HTMLDivElement>(null);
  const n = projects.length;

  useEffect(() => {
    const measure = () => {
      const card = viewportRef.current?.querySelector<HTMLElement>('.carousel-card');
      if (card) setStep(card.offsetWidth + 24);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const go = useCallback(
    (next: number) => setIdx(((next % n) + n) % n),
    [n]
  );

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => go(idx + 1), 4500);
    return () => clearInterval(t);
  }, [idx, paused, go]);

  return (
    <section className="w-full py-16 md:py-20 px-6">
      <div className="max-w-5xl mx-auto mb-8">
        <Reveal delay={1}>
          <h2 className="font-serif-accent text-[32px] md:text-[40px] lg:text-[44px] leading-[1.15] text-ink-2 tracking-tight">
            核心 <span className="font-serif-accent">项目</span>
          </h2>
        </Reveal>
      </div>

      <div
        className="relative max-w-5xl mx-auto"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="carousel-viewport" ref={viewportRef}>
          <div
            className="carousel-track"
            style={{ transform: `translate3d(-${idx * step}px, 0, 0)` }}
          >
            {projects.map((p) => (
              <article key={p.name} className="carousel-card bg-white rounded-[32px] md:rounded-[40px] px-6 md:px-10 py-8 shadow-card flex flex-col gap-3">
                <h3 className="font-serif-accent text-xl md:text-2xl text-ink leading-snug">{p.name}</h3>
                <p className="text-xs text-muted font-mono">{p.role}</p>
                {p.img && (
                  <img
                    src={p.img}
                    alt={p.name}
                    className="w-full h-44 md:h-52 object-cover rounded-2xl"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
                <p className="text-sm text-ink/70 leading-relaxed">{p.desc}</p>
                <div className="flex gap-2 flex-wrap">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-3 py-1 rounded-full bg-ink/5 text-ink/60 font-mono"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-auto pt-3 text-xs text-ink font-medium border-t border-ink/10">
                  {p.result}
                </div>
                {p.link && (
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-ink-2 underline underline-offset-2 hover:text-ink transition-colors"
                  >
                    访问官网 →
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>

        <button type="button" className="carousel-nav prev" aria-label="上一项" onClick={() => go(idx - 1)}>
          <ChevronLeft className="w-5 h-5 text-ink-2" />
        </button>
        <button type="button" className="carousel-nav next" aria-label="下一项" onClick={() => go(idx + 1)}>
          <ChevronRight className="w-5 h-5 text-ink-2" />
        </button>

        <div className="flex justify-center gap-2 mt-6">
          {projects.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`第 ${i + 1} 个项目`}
              onClick={() => go(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === idx ? 'w-6 bg-ink' : 'w-1.5 bg-ink/20'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
