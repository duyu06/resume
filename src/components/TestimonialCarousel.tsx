import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    quote:
      "Viktor left Apple to build this. The clarity of thinking shows — every screen earns its place. Rare to see that level of restraint in a portfolio.",
    name: 'Lena R.',
    role: 'Design Lead, former colleague',
    initial: 'L',
  },
  {
    quote:
      "We handed him a vague brief and a tight deadline. He shipped a working product story before we finished the meeting notes. Genuinely the fastest I've seen.",
    name: 'Marcus T.',
    role: 'Founder, evr',
    initial: 'M',
  },
  {
    quote:
      "His automation work cut our release overhead in half. Pragmatic, calm, and obsessively thorough. I'd partner with him again without a second thought.",
    name: 'Priya N.',
    role: 'COO, Automation Machines',
    initial: 'P',
  },
  {
    quote:
      "The portfolio platform he put together made our fund look twice as credible. Clients kept asking who built it. That's the kind of problem you want.",
    name: 'Daniel K.',
    role: 'Partner, xPortfolio',
    initial: 'D',
  },
];

const gradients = [
  'linear-gradient(135deg, #051a24 0%, #000000 100%)',
  'linear-gradient(135deg, #0d212c 0%, #111111 100%)',
  'linear-gradient(135deg, #111111 0%, #0d212c 100%)',
  'linear-gradient(135deg, #000000 0%, #051a24 100%)',
];

export default function TestimonialCarousel() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(560);
  const n = testimonials.length;

  useEffect(() => {
    const measure = () => {
      const card = viewportRef.current?.querySelector<HTMLElement>('.t-card');
      if (card) setStep(card.offsetWidth + 24);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const go = useCallback((next: number) => setIdx(((next % n) + n) % n), [n]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => go(idx + 1), 5000);
    return () => clearInterval(t);
  }, [idx, paused, go]);

  return (
    <section className="w-full py-16 md:py-20 px-6">
      <div className="max-w-5xl mx-auto mb-8">
        <h2 className="font-serif-accent text-[32px] md:text-[40px] lg:text-[44px] leading-[1.15] text-ink-2 tracking-tight">
          What people <span className="font-serif-accent">say</span>
        </h2>
        <p className="text-sm md:text-base text-muted mt-2">
          Viktor leaving Apple was the best thing that could have happened to our roadmap.
        </p>
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
            {testimonials.map((t, i) => (
              <article
                key={t.name}
                className="t-card carousel-card bg-white rounded-[32px] md:rounded-[40px] px-6 md:px-10 py-8 shadow-card flex flex-col gap-4"
              >
                <p className="text-base md:text-lg text-ink leading-relaxed">
                  “{t.quote}”
                </p>
                <div className="flex items-center gap-3 mt-auto pt-3 border-t border-ink/10">
                  <span
                    className="avatar-initial"
                    style={{ background: gradients[i % gradients.length] }}
                  >
                    {t.initial}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">{t.name}</p>
                    <p className="text-xs text-muted">{t.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <button type="button" className="carousel-nav prev" aria-label="上一条" onClick={() => go(idx - 1)}>
          <ChevronLeft className="w-5 h-5 text-ink-2" />
        </button>
        <button type="button" className="carousel-nav next" aria-label="下一条" onClick={() => go(idx + 1)}>
          <ChevronRight className="w-5 h-5 text-ink-2" />
        </button>

        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`第 ${i + 1} 条评价`}
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
