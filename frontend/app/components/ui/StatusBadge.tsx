import React from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type BadgeStatus   = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type BadgeSize     = 'sm' | 'md' | 'lg';
export type BadgeVariant  = 'solid' | 'subtle' | 'outline';

export interface StatusBadgeProps {
  /** Semantic state of the badge. */
  status: BadgeStatus;
  /** Text label displayed inside the badge. */
  label: string;
  /** Size preset. @default 'md' */
  size?: BadgeSize;
  /** Visual fill style. @default 'subtle' */
  variant?: BadgeVariant;
  /** Show a leading status dot. @default true */
  showDot?: boolean;
  /** Animate the dot with a pulse. Useful for live/active states. */
  pulseDot?: boolean;
  /** Additional Tailwind classes. */
  className?: string;
}

// ─── Style Maps ────────────────────────────────────────────────────────────────

const statusConfig: Record<
  BadgeStatus,
  {
    dot:     string;
    solid:   string;
    subtle:  string;
    outline: string;
  }
> = {
  success: {
    dot:     'bg-green',
    solid:   'bg-green       text-[#0A0A0A] font-semibold',
    subtle:  'bg-green/15    text-green     border-green/20',
    outline: 'border border-green text-green',
  },
  warning: {
    dot:     'bg-amber',
    solid:   'bg-amber       text-[#0A0A0A] font-semibold',
    subtle:  'bg-amber/15    text-amber     border-amber/20',
    outline: 'border border-amber text-amber',
  },
  danger: {
    dot:     'bg-red',
    solid:   'bg-red         text-white font-semibold',
    subtle:  'bg-red/15      text-red   border-red/20',
    outline: 'border border-red text-red',
  },
  info: {
    dot:     'bg-blue',
    solid:   'bg-blue        text-white font-semibold',
    subtle:  'bg-blue/15     text-blue  border-blue/20',
    outline: 'border border-blue text-blue',
  },
  neutral: {
    dot:     'bg-textMuted',
    solid:   'bg-surface     text-textSecondary font-medium',
    subtle:  'bg-surface/80  text-textMuted     border-borderLight/30',
    outline: 'border border-borderLight text-textMuted',
  },
};

const sizeClasses: Record<BadgeSize, { badge: string; dot: string; text: string }> = {
  sm: { badge: 'h-5  px-2    gap-1',   dot: 'w-1.5 h-1.5', text: 'text-[10px] tracking-wide' },
  md: { badge: 'h-6  px-2.5  gap-1.5', dot: 'w-2   h-2',   text: 'text-xs     tracking-wide' },
  lg: { badge: 'h-7  px-3    gap-2',   dot: 'w-2.5 h-2.5', text: 'text-sm' },
};

// ─── Component ─────────────────────────────────────────────────────────────────

export function StatusBadge({
  status,
  label,
  size      = 'md',
  variant   = 'subtle',
  showDot   = true,
  pulseDot  = false,
  className = '',
}: StatusBadgeProps) {
  const cfg   = statusConfig[status];
  const sizes = sizeClasses[size];

  return (
    <span
      role="status"
      aria-label={`${status}: ${label}`}
      className={[
        'inline-flex items-center rounded-full font-medium',
        // Variant-based colour
        cfg[variant],
        // Size
        sizes.badge,
        sizes.text,
        // Uppercase label for pill style
        'uppercase tracking-widest',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Status dot */}
      {showDot && (
        <span className="relative inline-flex shrink-0" aria-hidden="true">
          {/* Outer pulse ring */}
          {pulseDot && (
            <span
              className={[
                'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
                cfg.dot,
              ].join(' ')}
            />
          )}
          {/* Inner solid dot */}
          <span
            className={[
              'relative inline-flex rounded-full',
              sizes.dot,
              cfg.dot,
            ].join(' ')}
          />
        </span>
      )}

      {/* Label */}
      <span>{label}</span>
    </span>
  );
}

export default StatusBadge;
