import { ChevronRight, ExternalLink, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const BASE = import.meta.env.BASE_URL;
const project = {
  name: 'AI 客服数字人工作台',
  category: 'AI AGENT · ENTERPRISE',
  summary: '数字人、实时对话、客户洞察、业务工具调用、风险控制与人工接管。',
  images: [
    BASE + 'assets/projects/project-digitalhuman-page-a.jpg',
    BASE + 'assets/projects/project-digitalhuman-page-b.jpg',
  ],
  link: BASE + 'demos/digitalhuman/',
};

export default function MoreSystems() {
  const [open, setOpen] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusFrame = requestAnimationFrame(() => closeRef.current?.focus());
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [open]);

  const show = () => {
    setImageIndex(0);
    setOpen(true);
  };

  return (
    <div className="mt-14 border-t border-white/12 pt-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-blue-300/75">MORE SYSTEMS</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
            主叙事之外保留可交互的业务系统 Demo，避免丢失既有项目入口与验收链路。
          </p>
        </div>
        <a
          href={BASE + 'online-resume/'}
          className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-white/50 transition hover:text-white"
        >
          FULL ARCHIVE ↗
        </a>
      </div>

      <button
        ref={triggerRef}
        type="button"
        onClick={show}
        className="group grid w-full gap-4 border border-white/12 bg-white/[0.025] p-3 text-left transition hover:border-blue-300/45 hover:bg-white/[0.045] sm:grid-cols-[180px_1fr_auto] sm:items-center sm:p-4"
      >
        <img
          src={project.images[0]}
          alt={project.name + ' 项目预览'}
          loading="lazy"
          className="aspect-[16/10] w-full object-cover object-top opacity-80 transition duration-500 group-hover:opacity-100"
        />
        <span>
          <span className="font-mono text-[0.56rem] uppercase tracking-[0.18em] text-blue-300/75">{project.category}</span>
          <span className="mt-1 block font-display text-lg font-semibold text-white sm:text-xl">{project.name}</span>
          <span className="mt-2 block text-xs leading-5 text-white/45 sm:text-sm">{project.summary}</span>
        </span>
        <span className="hidden h-10 w-10 place-items-center border border-white/15 text-white/65 transition group-hover:border-blue-300/45 group-hover:text-white sm:grid">
          <ChevronRight size={17} />
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[1200] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0"
            onClick={() => setOpen(false)}
            aria-label="关闭项目详情"
          />
          <section className="relative z-10 w-full max-w-4xl overflow-hidden rounded-t-[28px] border border-white/12 bg-[#0b1020] text-white shadow-2xl sm:rounded-[28px]">
            <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="font-mono text-[0.56rem] uppercase tracking-[0.18em] text-blue-300">{project.category}</p>
                <h3 id="project-modal-title" className="mt-1 font-display text-lg font-semibold">{project.name}</h3>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 place-items-center border border-white/12 text-white/65 transition hover:text-white"
                aria-label="关闭"
              >
                <X size={18} />
              </button>
            </header>

            <div className="project-modal-scroll max-h-[calc(92svh-76px)] overflow-y-auto p-4 sm:max-h-[calc(88vh-76px)] sm:p-6">
              <img
                src={project.images[imageIndex]}
                alt={project.name + ' 项目截图'}
                className="aspect-video w-full border border-white/10 object-cover object-top"
              />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-[0.58rem] tracking-[0.16em] text-white/40">
                  {String(imageIndex + 1).padStart(2, '0')} / {String(project.images.length).padStart(2, '0')}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setImageIndex((value) => (value + 1) % project.images.length)}
                    className="inline-flex min-h-10 items-center gap-2 border border-white/15 px-4 text-xs font-medium text-white transition hover:border-blue-300/45"
                    aria-label="下一张"
                  >
                    下一张 <ChevronRight size={15} />
                  </button>
                  <a
                    href={project.link}
                    className="inline-flex min-h-10 items-center gap-2 bg-white px-4 text-xs font-semibold text-ink transition hover:bg-blue-100"
                  >
                    打开 Demo <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
