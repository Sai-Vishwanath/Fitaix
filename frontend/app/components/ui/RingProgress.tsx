'use client';

import { useEffect, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RingProgressProps {
  /** Progress value between 0 and 1 */
  progress: number;
  /** Diameter of the ring in px. @default 46 */
  size?: number;
  /** Stroke thickness in px. @default 5 */
  strokeWidth?: number;
  /** CSS color string for the progress arc */
  color: string;
  /** CSS color string for the background track. @default '#241F14' */
  trackColor?: string;
  /** Short label rendered in the centre of the ring */
  label?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RingProgress({
  progress,
  size        = 46,
  strokeWidth = 5,
  color,
  trackColor  = '#241F14',
  label,
}: RingProgressProps) {
  const center       = size / 2;
  const radius       = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  // Start fully offset (empty), then animate to target after mount
  const [dashOffset, setDashOffset] = useState(circumference);

  useEffect(() => {
    const id = setTimeout(() => {
      const clamped = Math.min(1, Math.max(0, progress));
      setDashOffset(circumference * (1 - clamped));
    }, 150);
    return () => clearTimeout(id);
  }, [progress, circumference]);

  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ? `${label} progress` : 'Ring progress'}
    >
      {/* SVG rotated so 12 o'clock is the start point */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
        aria-hidden="true"
      >
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(0.3, 0.8, 0.3, 1)',
          }}
        />
      </svg>

      {/* Centre label */}
      {label && (
        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-extrabold text-text-primary leading-none">
          {label}
        </span>
      )}
    </div>
  );
}

export default RingProgress;
