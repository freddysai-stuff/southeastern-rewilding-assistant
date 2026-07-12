import type { ButtonHTMLAttributes } from 'react';
import './Button.css';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ variant = 'primary', className, children, ...rest }: ButtonProps) {
  return (
    <button className={`sera-button sera-button--${variant} ${className ?? ''}`.trim()} {...rest}>
      {children}
    </button>
  );
}
