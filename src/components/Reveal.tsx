import type { ReactNode } from 'react';
import { useInViewAnimation } from '../hooks/useInViewAnimation';

const delayMap = {
  1: 'reveal-d1',
  2: 'reveal-d2',
  3: 'reveal-d3',
  4: 'reveal-d4',
  5: 'reveal-d5',
} as const;

type Props = {
  children: ReactNode;
  delay?: 1 | 2 | 3 | 4 | 5;
  className?: string;
  as?: 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'section' | 'article';
};

export default function Reveal({ children, delay, className = '', as = 'div' }: Props) {
  const { ref, className: revealCls } = useInViewAnimation(0.12);
  const delayCls = delay ? delayMap[delay] : '';
  const cls = `${revealCls} ${delayCls} ${className}`.trim();

  switch (as) {
    case 'p':
      return <p ref={ref} className={cls}>{children}</p>;
    case 'h1':
      return <h1 ref={ref} className={cls}>{children}</h1>;
    case 'h2':
      return <h2 ref={ref} className={cls}>{children}</h2>;
    case 'h3':
      return <h3 ref={ref} className={cls}>{children}</h3>;
    case 'section':
      return <section ref={ref} className={cls}>{children}</section>;
    case 'article':
      return <article ref={ref} className={cls}>{children}</article>;
    default:
      return <div ref={ref} className={cls}>{children}</div>;
  }
}
