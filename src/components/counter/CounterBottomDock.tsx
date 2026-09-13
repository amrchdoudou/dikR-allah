import React from 'react';
import { RotateCcw, Minus, Plus, List, Settings } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface CounterBottomDockProps {
  onTap: () => void;
  onUndo: () => void;
  onReset: () => void;
  onOpenList: () => void;
  onOpenSettings: () => void;
  canUndo?: boolean;
  disabled?: boolean;
}

export const CounterBottomDock: React.FC<CounterBottomDockProps> = ({
  onTap,
  onUndo,
  onReset,
  onOpenList,
  onOpenSettings,
  canUndo = false,
  disabled = false,
}) => {
  const { lang } = useTranslation();

  return (
    <div className="flex items-center justify-between gap-3 sm:gap-6 px-4 py-2 rounded-3xl bg-zinc-950/85 border border-white/10 backdrop-blur-xl shadow-2xl max-w-sm sm:max-w-md mx-auto select-none">
      {/* Reset */}
      <button
        type="button"
        onClick={onReset}
        title={lang === 'ar' ? 'تصفير' : 'Reset'}
        className="w-10 h-10 rounded-2xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition cursor-pointer"
      >
        <RotateCcw className="w-5 h-5" />
      </button>

      {/* Minus / Undo */}
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        title={lang === 'ar' ? 'إنقاص / تراجع' : 'Minus / Undo'}
        className={`w-10 h-10 rounded-2xl flex items-center justify-center transition ${
          canUndo
            ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/80 cursor-pointer'
            : 'text-zinc-700 cursor-not-allowed'
        }`}
      >
        <Minus className="w-5 h-5" />
      </button>

      {/* Prominent Golden Center Plus Tap Button (Inspired by Counter Easy) */}
      <button
        type="button"
        onClick={onTap}
        disabled={disabled}
        aria-label="Tap count"
        className="w-13 h-13 rounded-full bg-amber-400 hover:bg-amber-300 active:scale-95 text-zinc-950 font-bold flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.45)] transition-all cursor-pointer touch-manipulation"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>

      {/* Counter List */}
      <button
        type="button"
        onClick={onOpenList}
        title={lang === 'ar' ? 'قائمة الأذكار' : 'Counter List'}
        className="w-10 h-10 rounded-2xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition cursor-pointer"
      >
        <List className="w-5 h-5" />
      </button>

      {/* Settings */}
      <button
        type="button"
        onClick={onOpenSettings}
        title={lang === 'ar' ? 'الإعدادات' : 'Settings'}
        className="w-10 h-10 rounded-2xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition cursor-pointer"
      >
        <Settings className="w-5 h-5" />
      </button>
    </div>
  );
};
