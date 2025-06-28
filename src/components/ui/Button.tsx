import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    const variants = {
      primary:
        'bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)] focus-visible:ring-[var(--accent)] font-semibold',
      secondary:
        'bg-[var(--secondary)] text-[var(--text)] hover:bg-[var(--border)] focus-visible:ring-[var(--accent)] border border-[var(--border)]',
      outline:
        'border border-[var(--accent)] bg-transparent text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black focus-visible:ring-[var(--accent)]',
      ghost:
        'hover:bg-[var(--muted)] text-[var(--text-light)] hover:text-[var(--text)] focus-visible:ring-[var(--accent)]',
      danger:
        'bg-[var(--error)] text-white hover:bg-red-600 focus-visible:ring-[var(--error)]',
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4',
      lg: 'h-12 px-6 text-lg',
    };

    return (
      <button
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
