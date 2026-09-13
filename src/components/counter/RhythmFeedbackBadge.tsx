import React from 'react';
import { Activity, Zap, Hand } from 'lucide-react';
import { RhythmTimingFeedback } from '../../hooks/useRhythmEngine';
import { useTranslation } from '../../hooks/useTranslation';

interface RhythmFeedbackBadgeProps {
  isActive: boolean;
  bpm: number;
  isPulse: boolean;
  feedback: RhythmTimingFeedback | null;
  onToggleAssist: () => void;
  profileName?: string;
  isAutoCounting?: boolean;
  onToggleAutoCount?: () => void;
}

export const RhythmFeedbackBadge: React.FC<RhythmFeedbackBadgeProps> = ({
  isActive,
  bpm,
  isPulse,
  feedback,
  onToggleAssist,
  profileName,
  isAutoCounting = false,
  onToggleAutoCount,
}) => {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-sm mx-auto my-2">
      {isActive ? (
        <div className="bg-zinc-900/50 p-4 sm:p-5 rounded-3xl border border-white/5 space-y-3 transition-all">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-300">{t.rhythmAssist}</span>
              {profileName && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-medium line-clamp-1 max-w-[110px]">
                  {profileName}
                </span>
              )}
            </div>
            <button
              onClick={onToggleAssist}
              id="btn-rhythm-assist-toggle"
              className="px-2.5 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-bold rounded-full uppercase tracking-wider hover:bg-amber-500/20 transition cursor-pointer"
            >
              {t.tapToStop}
            </button>
          </div>

          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-11 h-11 rounded-full border-2 border-amber-500/80 flex items-center justify-center shrink-0">
              <div
                className={`rounded-full transition-all duration-100 ${
                  isPulse
                    ? 'w-4 h-4 bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.9)] scale-110'
                    : 'w-3 h-3 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] scale-100'
                }`}
              />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-medium text-white tracking-tight">
                  {bpm} BPM
                </span>
                {isAutoCounting && (
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    {t.autoCounting}
                  </span>
                )}
              </div>
              <div className="text-xs text-zinc-400 truncate mt-0.5">
                {isAutoCounting ? (
                  <span className="text-amber-300/90 text-[11px] font-medium">
                    {t.autoCountDesc}
                  </span>
                ) : feedback ? (
                  <span
                    className={`font-mono ${
                      feedback.status === 'perfect' ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {feedback.status === 'perfect' ? t.timingGreat : feedback.status === 'early' ? t.timingEarly : t.timingLate}{' '}
                    • {feedback.delta > 0 ? `+${feedback.delta}s` : `${feedback.delta}s`}
                  </span>
                ) : (
                  <span className="text-zinc-500 text-[11px]">{t.manualTapDesc}</span>
                )}
              </div>
            </div>
          </div>

          {/* Mode Switcher: Auto-Count with Cadence vs Manual Tap Guide */}
          {onToggleAutoCount && (
            <div className="pt-1 flex items-center gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/5">
              <button
                type="button"
                onClick={onToggleAutoCount}
                className={`flex-1 py-1.5 px-2.5 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isAutoCounting
                    ? 'bg-amber-500 text-black shadow-sm font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>{t.autoCount}</span>
              </button>

              <button
                type="button"
                onClick={onToggleAutoCount}
                className={`flex-1 py-1.5 px-2.5 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  !isAutoCounting
                    ? 'bg-zinc-800 text-white shadow-sm font-bold border border-white/10'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Hand className="w-3.5 h-3.5" />
                <span>{t.manualTap}</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={onToggleAssist}
          id="btn-rhythm-assist-toggle"
          className="w-full flex items-center justify-between p-3 px-4 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-white/10 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition group"
        >
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-zinc-500 group-hover:text-amber-500 transition-colors" />
            <span>{t.rhythmAssist}</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 group-hover:text-amber-400">
            {t.tapToStart}
          </span>
        </button>
      )}
    </div>
  );
};
