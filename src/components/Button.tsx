import type { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'tertiary';

type BaseProps = {
  variant?: Variant;
  children: ReactNode;
  className?: string;
};

type ButtonProps = BaseProps &
  (
    | ({ href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>)
    | ({ href: string } & AnchorHTMLAttributes<HTMLAnchorElement>)
  );

const variants: Record<Variant, string> = {
  primary: 'bg-[#051A24] text-white shadow-btn-primary hover:scale-[1.02] active:scale-[0.99]',
  secondary: 'bg-white text-[#051A24] shadow-btn-secondary hover:scale-[1.02] active:scale-[0.99]',
  tertiary: 'bg-white text-[#051A24] shadow-btn-secondary hover:scale-[1.02] active:scale-[0.99]',
};

const base =
  'inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-medium transition-transform duration-300 cursor-pointer select-none whitespace-nowrap no-underline';

export default function Button({ variant = 'primary', children, className = '', ...rest }: ButtonProps) {
  const cls = `${base} ${variants[variant]} ${className}`;

  if ('href' in rest && rest.href) {
    const { href, ...anchorRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
    return (
      <a href={href} className={cls} {...anchorRest}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
