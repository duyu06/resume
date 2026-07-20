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
      className={`inline-flex items-center justify-center rounded-full pill-grad px-8 py-3 sm:px-10 sm:py-3.5 md:px-12 md:py-4 text-xs sm:text-sm md:text-base font-medium uppercase tracking-widest text-white transition-transform duration-200 hover:scale-[1.03] ${className}`}
    >
      {label}
    </a>
  );
}
