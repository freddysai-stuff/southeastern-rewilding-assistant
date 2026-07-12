import type { ReactNode, HTMLAttributes } from 'react';
import './Card.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  children: ReactNode;
}

export function Card({ interactive = false, className, children, ...rest }: CardProps) {
  return (
    <div
      className={`sera-card${interactive ? ' sera-card--interactive' : ''} ${className ?? ''}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}
