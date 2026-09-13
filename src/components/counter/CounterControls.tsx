import React, { useState, useEffect } from 'react';
import { RotateCcw, Undo2, Play, Pause, Target, X } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface CounterControlsProps {
  onReset: () => void;
  onUndo: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  target: number;
  onSelectTarget: (target: number) => void;
  canUndo: boolean;
}

export const CounterControls: React.FC<CounterControlsProps> = ({
  onReset,
  onUndo,
  isPaused,
  onTogglePause,
  target,
  onSelectTarget,
  canUndo,
}) => {
  const { t } = useTranslation();
  const [showTargetPicker, setShowTargetPicker] = useState(false);
  const [customValue, setCustomValue] = useState(String(target));

  useEffect(() => {
    setCustomValue(String(target));
  }, [target]);

  const targets = [33, 99, 100];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(customValue, 10);
    if (!isNaN(num) && num > 0) {
      onSelectTarget(num);
      setShowTargetPicker(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-4 flex flex-col items-center gap-3">
      {/* Target selector pills */}
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-zinc-900 border border-white/10">
        {targets.map((tgt) => (
          <button
            key={tgt}
            id={`target-preset-${tgt}`}
            onClick={() => {
              onSelectTarget(tgt);
              setShowTargetPicker(false);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
              target === tgt
                ? 'bg-amber-500 text-black font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tgt}
          </button>
        ))}
        <button
          onClick={() => setShowTargetPicker(!showTargetPicker)}
          id="btn-custom-target"
          className={`px-3 py-1.5 rounded-full text-xs flex items-center gap-1 transition-all cursor-pointer ${
            !targets.includes(target)
              ? 'bg-amber-500 text-black font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Target className="w-3 h-3" />
          <span>{!targets.includes(target) ? target : '...'}</span>
        </button>
      </div>

      {showTargetPicker && (
        <form onSubmit={handleCustomSubmit} className="flex items-center gap-2 p-2 rounded-2xl bg-zinc-900 border border-white/10 animate-in fade-in zoom-in-95 duration-200">
          <input
            type="number"
            min="1"
            max="10000"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            className="w-24 px-2 py-1 text-center bg-zinc-800 rounded-xl text-white font-mono text-sm outline-none border border-white/10 focus:border-amber-500"
            placeholder={t.customTarget}
            autoFocus
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-amber-500 text-black text-xs font-bold rounded-xl hover:bg-amber-400 transition cursor-pointer"
          >
            {t.save}
          </button>
          <button
            type="button"
            onClick={() => setShowTargetPicker(false)}
            className="p-1.5 text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Main control action buttons: Reset, Undo, Pause */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full">
        {/* Reset button */}
        <button
          onClick={onReset}
          id="btn-counter-reset"
          title={t.reset}
          aria-label={t.reset}
          className="py-3 px-3 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-2xl flex items-center justify-center gap-2 text-zinc-300 hover:text-white transition-colors active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-amber-500" />
          <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">{t.reset}</span>
        </button>

        {/* Pause/Resume button */}
        <button
          onClick={onTogglePause}
          id="btn-counter-pause"
          title={isPaused ? t.resume : t.pause}
          aria-label={isPaused ? t.resume : t.pause}
          className={`py-3 px-3 border rounded-2xl flex items-center justify-center gap-2 transition-colors active:scale-95 cursor-pointer ${
            isPaused
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm'
              : 'bg-zinc-900 hover:bg-zinc-800 border-white/10 text-zinc-300 hover:text-white'
          }`}
        >
          {isPaused ? (
            <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
          ) : (
            <Pause className="w-4 h-4 text-amber-500" />
          )}
          <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">
            {isPaused ? t.resume : t.pause}
          </span>
        </button>

        {/* Undo button */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          id="btn-counter-undo"
          title={t.undo}
          aria-label={t.undo}
          className={`py-3 px-3 rounded-2xl border flex items-center justify-center gap-2 transition-colors ${
            canUndo
              ? 'bg-zinc-900 hover:bg-zinc-800 border-white/10 text-zinc-300 hover:text-white active:scale-95 cursor-pointer'
              : 'bg-zinc-900/30 border-white/5 text-zinc-600 cursor-not-allowed'
          }`}
        >
          <Undo2 className={`w-4 h-4 ${canUndo ? 'text-amber-500' : 'text-zinc-600'}`} />
          <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">{t.undo}</span>
        </button>
      </div>
    </div>
  );
};
