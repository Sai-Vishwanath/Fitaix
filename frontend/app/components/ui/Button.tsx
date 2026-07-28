import React, { forwardRef, ButtonHTMLAttributes } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize    = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style of the button. @default 'primary' */
  variant?: ButtonVariant;
  /** Size preset. @default 'md' */
  size?: ButtonSize;
  /** Whether to render a full-width block button. */
  fullWidth?: boolean;
  /** Show a loading spinner and disable interaction. */
  isLoading?: boolean;
  /** Optional icon rendered before the label. */
  leftIcon?: React.ReactNode;
  /** Optional icon rendered after the label. */
  rightIcon?: React.ReactNode;
}

// ─── Style Maps ────────────────────────────────────────────────────────────────

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    // Gold gradient fill
    'bg-gold-gradient text-textInverse font-semibold',
    // Hover — lighten & elevate
    'hover:brightness-110 hover:shadow-gold-md',
    // Active — press-down feel
    'active:scale-[0.97] active:brightness-95 active:shadow-gold-sm',
    // Focus ring
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
    // Disabled
    'disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none',
  ].join(' '),

  secondary: [
    'bg-transparent border border-gold text-gold font-semibold',
    'hover:bg-gold/10 hover:shadow-gold-sm',
    'active:scale-[0.97] active:bg-gold/5',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
    'disabled:opacity-40 disabled:pointer-events-none',
  ].join(' '),

  ghost: [
    'bg-transparent text-textSecondary font-medium',
    'hover:bg-surface hover:text-textPrimary',
    'active:scale-[0.97] active:bg-overlay',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-borderLight focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
    'disabled:opacity-40 disabled:pointer-events-none',
  ].join(' '),

  danger: [
    'bg-red text-white font-semibold',
    'hover:bg-redDim hover:shadow-[0_0_16px_rgba(239,68,68,0.35)]',
    'active:scale-[0.97]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
    'disabled:opacity-40 disabled:pointer-events-none',
  ].join(' '),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8  px-3.5 text-xs  rounded-xl  gap-1.5',
  md: 'h-11 px-5   text-sm  rounded-2xl gap-2',
  lg: 'h-14 px-7   text-base rounded-3xl gap-2.5',
};

// ─── Loading Spinner ────────────────────────────────────────────────────────────

function Spinner({ size }: { size: ButtonSize }) {
  const dim = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <svg
      className={`${dim} animate-spin`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant    = 'primary',
      size       = 'md',
      fullWidth  = false,
      isLoading  = false,
      leftIcon,
      rightIcon,
      children,
      className  = '',
      disabled,
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={isLoading}
        className={[
          // Base
          'relative inline-flex items-center justify-center',
          'select-none whitespace-nowrap',
          'transition-all duration-150 ease-spring',
          // Variant + size
          variantClasses[variant],
          sizeClasses[size],
          // Full-width
          fullWidth ? 'w-full' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        {/* Shimmer overlay on primary hover */}
        {variant === 'primary' && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100
                       bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.15)_50%,transparent_60%)]
                       bg-[length:200%_100%] transition-opacity duration-300"
          />
        )}

        {/* Left icon or loading spinner */}
        {isLoading ? (
          <Spinner size={size} />
        ) : leftIcon ? (
          <span className="shrink-0" aria-hidden="true">{leftIcon}</span>
        ) : null}

        {/* Label */}
        {children && (
          <span className={isLoading ? 'opacity-0' : undefined}>{children}</span>
        )}

        {/* Right icon */}
        {!isLoading && rightIcon && (
          <span className="shrink-0" aria-hidden="true">{rightIcon}</span>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
