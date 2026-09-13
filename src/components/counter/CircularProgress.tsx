import React from 'react';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  isCompleted?: boolean;
  showPercentageBadge?: boolean;
  children?: React.ReactNode;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 310,
  strokeWidth = 3,
  isCompleted = false,
  showPercentageBadge = true,
  children,
}) => {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percentage));
  const offset = circumference - (clamped / 100) * circumference;

  // Calculate coordinates for the percentage bubble on the arc (starting from 12 o'clock / -90deg)
  const angle = (clamped / 100) * 2 * Math.PI - Math.PI / 2;
  const badgeX = size / 2 + radius * Math.cos(angle);
  const badgeY = size / 2 + radius * Math.sin(angle);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Ambient gold aura blur */}
      <div className="absolute inset-0 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />

      <svg
        className="absolute inset-0 -rotate-90 pointer-events-none transform"
        width={size}
        height={size}
      >
        {/* Subtle background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#27272a"
          strokeWidth={1.5}
        />

        {/* Active progress stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isCompleted ? '#10b981' : '#f59e0b'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-300 ease-out"
        />
      </svg>

      {/* Percentage Pill Badge on the Progress Arc (Inspired by Counter Easy) */}
      {showPercentageBadge && clamped > 0 && (
        <div
          className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out"
          style={{ left: badgeX, top: badgeY }}
        >
          <div className="px-2 py-0.5 rounded-full bg-amber-400 text-zinc-950 font-bold text-[10px] tracking-tight font-mono shadow-[0_0_12px_rgba(245,158,11,0.5)] border border-amber-300/80 flex items-center justify-center animate-in zoom-in-75 duration-200">
            {Math.round(clamped)}%
          </div>
        </div>
      )}

      {/* Embedded Central Tap Content */}
      <div className="relative z-10 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};
