type Props = {
  href?: string;
  label?: string;
  className?: string;
};

export default function ContactButton({
  href = '#contact',
  label = '联系我',
  className = '',
}: Props) {
  const isExternal = href.startsWith('http');
  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className={`cta-primary inline-flex items-center justify-center rounded-full px-8 py-3 text-xs font-medium uppercase tracking-widest transition duration-200 hover:-translate-y-0.5 hover:scale-[1.02] sm:px-10 sm:py-3.5 sm:text-sm md:px-12 md:py-4 md:text-base ${className}`}
    >
      {label}
    </a>
  );
}
