import { useState } from 'react';
import FadeIn from './FadeIn';

const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;

const certs = [
  {
    title: '阿里云 Clouder · AI 编码',
    id: 'CLDM07260702723117 · 有效期至 2028.07.05',
    img: asset('assets/cert-aliyun-coding.jpg'),
  },
  {
    title: '阿里云 Clouder · RAG 应用',
    id: 'CLDM04260702723118 · 有效期至 2028.07.05',
    img: asset('assets/cert-aliyun-rag.jpg'),
  },
  {
    title: 'Elements of AI · Helsinki',
    id: '2 ECTS · 2026.07 · 可在线验证',
    img: asset('assets/cert-elements-of-ai.jpg'),
    link: 'https://certificates.mooc.fi/validate/dnpaia4614t',
  },
  {
    title: 'NISP',
    id: '国家信息安全专业人员认证',
    note: '另持 C1 驾驶证',
  },
];

export default function CertGallery() {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <section id="certs" className="bg-bg px-5 py-20 sm:px-8 md:px-10 md:py-28">
      <FadeIn y={40}>
        <h2
          className="hero-heading mb-12 text-center font-display font-black uppercase leading-none tracking-tight sm:mb-16"
          style={{ fontSize: 'clamp(2.5rem, 10vw, 120px)' }}
        >
          Certs
        </h2>
      </FadeIn>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8">
        {certs.map((c, i) => (
          <FadeIn key={c.title} delay={i * 0.08} y={28}>
            <div
              className={`glass overflow-hidden rounded-[28px] transition-transform duration-300 hover:-translate-y-1 ${
                i % 2 === 1 ? 'md:translate-y-8' : ''
              }`}
            >
              {c.img ? (
                <button
                  type="button"
                  className="block w-full cursor-zoom-in text-left"
                  onClick={() => setLightbox(c.img!)}
                >
                  <img
                    src={c.img}
                    alt={c.title}
                    className="w-full object-cover"
                    loading="lazy"
                  />
                </button>
              ) : (
                <div className="flex min-h-[220px] flex-col justify-center gap-2 bg-gradient-to-br from-white/5 to-accent/10 px-8 py-12">
                  <span className="hero-heading font-display text-4xl font-black">NISP</span>
                  <span className="text-sm text-ink-dim">{c.id}</span>
                  {c.note && <span className="text-xs text-ink-dim">{c.note}</span>}
                </div>
              )}
              <div className="border-t border-ink/10 px-5 py-4">
                <h3 className="font-display text-lg font-semibold text-ink">{c.title}</h3>
                <p className="mt-1 text-xs text-ink-dim">{c.id}</p>
                {c.link && (
                  <a
                    href={c.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs text-accent underline underline-offset-4"
                  >
                    验证证书 →
                  </a>
                )}
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center bg-black/85 p-6 backdrop-blur-md"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
        >
          <img
            src={lightbox}
            alt="证书原件"
            className="max-h-[88vh] max-w-[min(1100px,94vw)] rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            className="absolute right-6 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white"
            onClick={() => setLightbox(null)}
            aria-label="关闭"
          >
            ✕
          </button>
        </div>
      )}
    </section>
  );
}
