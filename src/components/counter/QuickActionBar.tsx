import React from 'react';
import { Volume2, VolumeX, Smartphone, Percent, Zap, Hash } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface QuickActionBarProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  hapticEnabled: boolean;
  onToggleHaptic: () => void;
  autoCountActive: boolean;
  onToggleAutoCount: () => void;
  showPercentage: boolean;
  onTogglePercentage: () => void;
  isDigitalFont: boolean;
  onToggleDigitalFont: () => void;
  displayMode: 'total' | 'lap';
  onToggleDisplayMode: () => void;
}

export const QuickActionBar: React.FC<QuickActionBarProps> = ({
  soundEnabled,
  onToggleSound,
  hapticEnabled,
  onToggleHaptic,
  autoCountActive,
  onToggleAutoCount,
  showPercentage,
  onTogglePercentage,
  isDigitalFont,
  onToggleDigitalFont,
  displayMode,
  onToggleDisplayMode,
}) => {
  const { lang } = useTranslation();

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 p-1 rounded-2xl bg-zinc-900/60 border border-white/5 backdrop-blur-sm select-none">
      {/* Auto Count (A) */}
      <button
        type="button"
        onClick={onToggleAutoCount}
        title={lang === 'ar' ? 'العد الذاتي التلقائي' : 'Auto-Count'}
        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition cursor-pointer ${
          autoCountActive
            ? 'bg-amber-500 text-zinc-950 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
        }`}
      >
        <span className="font-mono text-[11px] flex items-center gap-0.5">
          <Zap className="w-3 h-3" />
        </span>
      </button>

      {/* Percentage Toggle (%) */}
      <button
        type="button"
        onClick={onTogglePercentage}
        title={lang === 'ar' ? 'إظهار / إخفاء النسبة المئوية' : 'Toggle Percentage'}
        className={`w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer ${
          showPercentage
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
        }`}
      >
        <Percent className="w-3.5 h-3.5" />
      </button>

      {/* Vibration / Haptics Toggle */}
      <button
        type="button"
        onClick={onToggleHaptic}
        title={lang === 'ar' ? 'الاهتزاز اللمسي' : 'Haptic Vibration'}
        className={`w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer ${
          hapticEnabled
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
        }`}
      >
        <Smartphone className="w-3.5 h-3.5" />
      </button>

      {/* Sound Mute / Unmute */}
      <button
        type="button"
        onClick={onToggleSound}
        title={lang === 'ar' ? 'المؤثرات الصوتية' : 'Sound Effects'}
        className={`w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer ${
          soundEnabled
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
        }`}
      >
        {soundEnabled ? (
          <Volume2 className="w-3.5 h-3.5" />
        ) : (
          <VolumeX className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Digital LCD Font Toggle */}
      <button
        type="button"
        onClick={onToggleDigitalFont}
        title={lang === 'ar' ? 'خط الشاشة الرقمية LCD' : 'Digital LCD Display'}
        className={`w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer ${
          isDigitalFont
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
        }`}
      >
        <span className="font-['Share_Tech_Mono',monospace] text-[11px] font-bold">LCD</span>
      </button>

      {/* Total Count vs Lap Count Display Toggle */}
      <button
        type="button"
        onClick={onToggleDisplayMode}
        title={lang === 'ar' ? 'التبديل بين العد الإجمالي وعد الدورة' : 'Toggle Total / Lap Display'}
        className="px-2 h-8 rounded-xl text-[10px] font-mono font-semibold flex items-center gap-1 text-zinc-300 hover:text-amber-400 hover:bg-zinc-800 transition cursor-pointer"
      >
        <Hash className="w-3 h-3 text-amber-500" />
        <span>{displayMode === 'total' ? (lang === 'ar' ? 'إجمالي' : 'Total') : (lang === 'ar' ? 'دورة' : 'Lap')}</span>
      </button>
    </div>
  );
};
