import { useEffect, useRef, useState } from 'react';

const row1 = [
  'https://motionsites.ai/assets/hero-space-voyage-preview-eECLH3Yc.gif',
  'https://motionsites.ai/assets/hero-codenest-preview-Cgppc2qV.gif',
  'https://motionsites.ai/assets/hero-vex-ventures-preview-BczMFIiw.gif',
  'https://motionsites.ai/assets/hero-stellar-ai-v2-preview-DjvxjG3C.gif',
  'https://motionsites.ai/assets/hero-asme-preview-B_nGDnTP.gif',
  'https://motionsites.ai/assets/hero-transform-data-preview-Cx5OU29N.gif',
  'https://motionsites.ai/assets/hero-aethera-preview-DknSlcTa.gif',
  'https://motionsites.ai/assets/hero-xportfolio-preview-D4A8maiC.gif',
];

const row2 = [
  'https://motionsites.ai/assets/hero-orbit-web3-preview-BXt4OttD.gif',
  'https://motionsites.ai/assets/hero-nexora-preview-cx5HmUgo.gif',
  'https://motionsites.ai/assets/hero-evr-ventures-preview-DZxeVFEX.gif',
  'https://motionsites.ai/assets/hero-planet-orbit-preview-DWAP8Z1P.gif',
  'https://motionsites.ai/assets/hero-new-era-preview-CocuDUm9.gif',
  'https://motionsites.ai/assets/hero-luminex-preview-CxOP7ce6.gif',
  'https://motionsites.ai/assets/hero-portfolio-cosmic-preview-BpvWJ3Nc.gif',
  'https://motionsites.ai/assets/hero-skyelite-preview-DHaZIgUv.gif',
];

function Row({
  images,
  dir,
  offset,
}: {
  images: string[];
  dir: 1 | -1;
  offset: number;
}) {
  const tiles = [...images, ...images, ...images];
  return (
    <div
      className="flex w-max gap-3 will-change-transform"
      style={{ transform: `translate3d(${dir * (offset - 200)}px, 0, 0)` }}
    >
      {tiles.map((src, i) => (
        <img
          key={`${src}-${i}`}
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-[180px] w-[280px] shrink-0 rounded-2xl object-cover sm:h-[220px] sm:w-[340px] md:h-[270px] md:w-[420px]"
        />
      ))}
    </div>
  );
}

export default function MarqueeSection() {
  const ref = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const sec = ref.current;
      if (!sec) return;
      const top = sec.offsetTop;
      const next = (window.scrollY - top + window.innerHeight) * 0.3;
      setOffset(next);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section
      ref={ref}
      className="overflow-hidden bg-bg pb-10 pt-20 sm:pt-28 md:pt-36"
      aria-hidden
    >
      <div className="flex flex-col gap-3">
        <Row images={row1} dir={1} offset={offset} />
        <Row images={row2} dir={-1} offset={offset} />
      </div>
    </section>
  );
}
