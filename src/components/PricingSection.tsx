import Button from './Button';
import { useInViewAnimation } from '../hooks/useInViewAnimation';

function Card({
  variant,
  title,
  desc,
  priceLabel,
  price,
  buttons,
  delay,
}: {
  variant: 'dark' | 'light';
  title: string;
  desc: string;
  priceLabel: string;
  price: string;
  buttons: { label: string; variant: 'primary' | 'secondary' | 'tertiary'; href?: string }[];
  delay: number;
}) {
  const { ref, inView } = useInViewAnimation(0.1);
  const isDark = variant === 'dark';
  return (
    <div
      ref={ref}
      className={`rounded-[40px] pl-10 pr-10 md:pr-24 pt-3 pb-10 flex flex-col gap-4 ${isDark ? 'bg-[#051A24] text-[#F6FCFF]' : 'bg-white text-[#0D212C]'}`}
      style={{
        boxShadow: isDark ? 'inset 0 2px 8px 0 rgba(255,255,255,0.08), 0 4px 16px rgba(0,0,0,0.2)' : '0 4px 16px rgba(0,0,0,0.08)',
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(30px)',
        transition: `all 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
      }}
    >
      <p className="text-[22px] font-medium">{title}</p>
      <p className={`text-sm leading-relaxed ${isDark ? 'text-[#E0EBF0]' : 'text-[#051A24]/70'}`}>
        {desc.split(' / ').map((line, i) => (
          <span key={i}>{line}<br /></span>
        ))}
      </p>
      <div>
        <span className="text-2xl font-medium">{price}</span>
        <span className={`text-sm ml-2 ${isDark ? 'text-[#E0EBF0]' : 'text-[#051A24]/60'}`}>{priceLabel}</span>
      </div>
      <div className="flex gap-3 flex-wrap">
        {buttons.map((b) => (
          <Button key={b.label} variant={b.variant} href={b.href}>
            {b.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default function PricingSection() {
  return (
    <section className="w-full py-12 px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:max-w-4xl md:ml-auto">
        <Card
          variant="dark"
          title="Monthly Partnership"
          desc="A dedicated creative design team. / You work directly with Viktor."
          price="$5,000"
          priceLabel="Monthly"
          delay={0.1}
          buttons={[
            { label: 'Start a chat', variant: 'primary', href: 'https://halaskastudio.com/./book' },
            { label: 'How it works', variant: 'secondary', href: 'https://halaskastudio.com/./book' },
          ]}
        />
        <Card
          variant="light"
          title="Custom Project"
          desc="Fixed scope, fixed timeline. / Same team, same standards."
          price="$5,000"
          priceLabel="Minimum"
          delay={0.2}
          buttons={[
            { label: 'Start a chat', variant: 'tertiary', href: 'https://halaskastudio.com/./book' },
          ]}
        />
      </div>
    </section>
  );
}
