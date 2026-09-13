import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { RhythmTimingFeedback } from '../../hooks/useRhythmEngine';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface TapButtonProps {
  onTap: () => void;
  count: number;
  target: number;
  totalCount?: number;
  rounds?: number;
  displayMode?: 'total' | 'lap';
  isDigitalFont?: boolean;
  onToggleDisplayMode?: () => void;
  arabicText?: string;
  isCompleted?: boolean;
  disabled?: boolean;
  isRhythmActive?: boolean;
  isPulse?: boolean;
  rhythmFeedback?: RhythmTimingFeedback | null;
  rhythmBpm?: number;
  isAutoCounting?: boolean;
  onStopAutoCount?: () => void;
}

export const TapButton: React.FC<TapButtonProps> = ({
  onTap,
  count,
  target,
  totalCount = count,
  rounds = 0,
  displayMode = 'total',
  isDigitalFont = true,
  onToggleDisplayMode,
  arabicText,
  isCompleted = false,
  disabled = false,
  isRhythmActive = false,
  isPulse = false,
  rhythmFeedback = null,
  rhythmBpm = 60,
  isAutoCounting = false,
  onStopAutoCount,
}) => {
  const { t, lang } = useTranslation();
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [isPressed, setIsPressed] = useState<boolean>(false);
  const lastTapTimeRef = useRef<number>(0);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      if (e.code === 'Space' || e.code === 'Enter') {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
          return;
        }
        e.preventDefault();
        triggerTap(120, 120);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, count, target]);

  const triggerTap = (clientX?: number, clientY?: number) => {
    if (disabled) return;
    onTap();

    // Create ripple effect
    const newRipple: Ripple = {
      id: Date.now() + Math.random(),
      x: clientX ?? 120,
      y: clientY ?? 120,
    };
    setRipples((prev) => [...prev.slice(-3), newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 550);
  };

  const handleTapAction = (clientX?: number, clientY?: number) => {
    if (disabled) return;
    const now = performance.now();
    if (now - lastTapTimeRef.current < 70) return; // Prevent double-fire between pointerdown and click
    lastTapTimeRef.current = now;
    triggerTap(clientX, clientY);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled) return;
    setIsPressed(true);
    const rect = e.currentTarget.getBoundingClientRect();
    handleTapAction(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    handleTapAction(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handlePointerUp = () => {
    setIsPressed(false);
  };

  return (
    <button
      id="btn-main-tap"
      type="button"
      aria-label={`${t.tapPrompt}: count ${count} of ${target}`}
      disabled={disabled}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className={`relative w-60 h-60 sm:w-68 sm:h-68 md:w-76 md:h-76 rounded-full flex flex-col items-center justify-center select-none overflow-hidden outline-none touch-manipulation cursor-pointer transition-all duration-150 ${
        isPressed ? 'scale-95' : isRhythmActive && isPulse ? 'scale-[1.02]' : 'scale-100'
      } ${
        isCompleted
          ? 'bg-zinc-900/40 border border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.15)]'
          : isRhythmActive
          ? isPulse
            ? 'bg-zinc-900/30 backdrop-blur-sm border-2 border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.45),0_10px_40px_rgba(0,0,0,0.8)]'
            : 'bg-zinc-900/20 backdrop-blur-sm border border-amber-500/30 hover:border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.12),0_10px_40px_rgba(0,0,0,0.8)]'
          : 'bg-zinc-900/20 backdrop-blur-sm border border-white/10 hover:border-amber-500/30 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.05)]'
      }`}
    >
      {/* Concentric subtle tasbih rings */}
      <div className="absolute inset-3 rounded-full border border-white/5 pointer-events-none" />

      {/* Rhythmic Breathing Pulse Halo when Rhythm Assist is active */}
      {isRhythmActive && (
        <div
          className={`absolute inset-0 rounded-full transition-all duration-200 pointer-events-none ${
            isPulse
              ? 'border-2 border-amber-400 bg-amber-500/15 shadow-[inset_0_0_30px_rgba(245,158,11,0.3)] opacity-100 scale-100'
              : 'border border-amber-500/20 bg-transparent opacity-40 scale-95'
          }`}
        />
      )}

      {/* Ripple elements */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-amber-500/20 pointer-events-none animate-ping duration-500"
          style={{
            width: 140,
            height: 140,
            left: ripple.x - 70,
            top: ripple.y - 70,
          }}
        />
      ))}

      {/* Button Content (pointer-events-none to prevent intercepting clicks) */}
      <div className="pointer-events-none flex flex-col items-center justify-center select-none w-full px-4">
        {arabicText && (
          <div
            className={`font-arabic text-amber-400/90 leading-tight rtl px-3 text-center select-none drop-shadow-sm mb-1 ${
              arabicText.length > 30
                ? 'text-lg sm:text-xl line-clamp-2'
                : arabicText.length > 18
                ? 'text-xl sm:text-2xl line-clamp-1'
                : 'text-3xl sm:text-4xl line-clamp-1'
            }`}
            dir="rtl"
          >
            {arabicText}
          </div>
        )}

        <div className="flex flex-col items-center my-1">
          {/* Main Large Count Number */}
          <span
            className={`text-5xl sm:text-6xl md:text-7xl font-light leading-none tracking-tight transition-all duration-200 ${
              isDigitalFont
                ? 'font-["Share_Tech_Mono",monospace] text-amber-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.35)] tracking-wider'
                : 'font-mono text-zinc-100'
            }`}
          >
            {displayMode === 'total' ? totalCount : count}
          </span>

          {/* Sub-label showing current lap vs total, with mode toggle indicator */}
          <div className="flex items-center gap-1 mt-2 text-xs font-mono">
            {displayMode === 'total' ? (
              <span className="text-zinc-400 bg-zinc-950/60 px-2 py-0.5 rounded-full border border-white/5">
                {lang === 'ar' ? `الدورة: ${count} / ${target}` : `Lap: ${count} / ${target}`}
              </span>
            ) : (
              <span className="text-zinc-400 bg-zinc-950/60 px-2 py-0.5 rounded-full border border-white/5">
                / {target} <span className="text-amber-500/80">• {lang === 'ar' ? 'الإجمالي:' : 'Total:'} {totalCount}</span>
              </span>
            )}
          </div>
        </div>

        {/* Rhythm Assist Status & Feedback Indicator */}
        {isRhythmActive && (
          <div
            onClick={(e) => {
              if (onStopAutoCount) {
                e.stopPropagation();
                onStopAutoCount();
              }
            }}
            title={lang === 'ar' ? 'انقر لإيقاف الصوت والعد التلقائي' : 'Click to stop sound & auto-count'}
            className="pointer-events-auto cursor-pointer mt-2 flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 hover:bg-red-500/20 border border-amber-500/25 hover:border-red-500/40 text-[10px] font-mono transition-all group"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full transition-transform ${
                isPulse ? 'bg-amber-400 scale-150 shadow-[0_0_6px_#f59e0b]' : 'bg-amber-500/50 scale-100'
              }`}
            />
            <span className="text-amber-400/90 font-medium group-hover:hidden">{rhythmBpm} BPM</span>
            {isAutoCounting ? (
              <span className="text-amber-300 font-bold ml-0.5 group-hover:hidden">⚡ {lang === 'ar' ? 'تلقائي' : 'Auto'}</span>
            ) : rhythmFeedback ? (
              <span
                className={`font-semibold ml-0.5 group-hover:hidden ${
                  rhythmFeedback.status === 'perfect'
                    ? 'text-emerald-400'
                    : 'text-amber-300'
                }`}
              >
                • {rhythmFeedback.status === 'perfect' ? t.timingGreat : rhythmFeedback.status === 'early' ? t.timingEarly : t.timingLate}
              </span>
            ) : null}
            <span className="hidden group-hover:inline text-red-400 font-bold">
              ⏹ {lang === 'ar' ? 'إيقاف' : 'Stop'}
            </span>
          </div>
        )}

        {isCompleted ? (
          <div className="text-emerald-400 font-semibold tracking-wider text-[10px] sm:text-xs uppercase mt-2">
            {t.targetReached}
          </div>
        ) : isRhythmActive && isAutoCounting ? (
          <div className="text-amber-400 text-[10px] sm:text-xs tracking-[0.18em] uppercase font-bold mt-2 flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full bg-amber-400 ${isPulse ? 'scale-150 shadow-[0_0_8px_#f59e0b]' : 'scale-90 opacity-70'} transition-transform`} />
            <span>{t.autoCounting}</span>
          </div>
        ) : (
          <div className="text-zinc-500 text-[10px] sm:text-xs tracking-[0.25em] uppercase font-medium mt-2">
            {t.tapPrompt}
          </div>
        )}
      </div>
    </button>
  );
};
