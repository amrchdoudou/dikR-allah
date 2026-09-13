import React, { useState } from 'react';
import { X, Plus, Check, Trash2, RotateCcw } from 'lucide-react';
import { Dhikr, DhikrMetric } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { storageService } from '../../services/storageService';

interface DhikrSelectorModalProps {
  adhkar: Dhikr[];
  selectedId: string;
  onSelect: (dhikr: Dhikr) => void;
  onClose: () => void;
  onOpenCreateCustom: () => void;
  onDeleteCustom?: (id: string) => void;
}

export const DhikrSelectorModal: React.FC<DhikrSelectorModalProps> = ({
  adhkar,
  selectedId,
  onSelect,
  onClose,
  onOpenCreateCustom,
  onDeleteCustom,
}) => {
  const { t, lang } = useTranslation();
  const [search, setSearch] = useState('');
  const [metrics, setMetrics] = useState<Record<string, DhikrMetric>>(() =>
    storageService.getDhikrMetrics()
  );

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  const handleResetMetric = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    storageService.resetDhikrMetric(id);
    setMetrics(storageService.getDhikrMetrics());
  };

  const filtered = adhkar.filter(
    (d) =>
      d.arabic.includes(search) ||
      d.transliteration.toLowerCase().includes(search.toLowerCase()) ||
      d.translation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-[#0c2a27]/95 border border-amber-500/20 flex flex-col max-h-[85vh] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 px-5 border-b border-white/10 flex items-center justify-between bg-zinc-950/40">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-zinc-100">
              {lang === 'ar' ? 'قائمة الأذكار والعدادات' : 'Counter List'}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono">
              {adhkar.length}
            </span>
          </div>
          <button
            onClick={onClose}
            id="btn-close-dhikr-selector"
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input & Add button */}
        <div className="p-4 pb-2 flex gap-2">
          <input
            type="text"
            placeholder={lang === 'ar' ? 'بحث في الأذكار...' : 'Search Adhkar...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900/90 border border-white/10 text-zinc-200 text-sm placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
          />
          <button
            onClick={() => {
              onClose();
              onOpenCreateCustom();
            }}
            className="px-3 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs flex items-center gap-1 hover:bg-amber-400 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === 'ar' ? 'ذكر جديد' : 'New'}</span>
          </button>
        </div>

        {/* List of Adhkar Cards (Inspired by Counter Easy Image 2) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.map((item) => {
            const isSelected = item.id === selectedId;
            const m = metrics[item.id] || { totalCount: 0, laps: 0, timeSeconds: 0 };
            return (
              <div
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col gap-2 group ${
                  isSelected
                    ? 'bg-zinc-900/90 border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/50'
                    : 'bg-zinc-900/40 border-white/5 hover:border-amber-500/30 hover:bg-zinc-900/70'
                }`}
              >
                {/* Top Row: Arabic title prominent & selection indicator */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 text-right" dir="rtl">
                    <div className="font-arabic text-xl sm:text-2xl text-amber-400 font-medium leading-snug">
                      {item.arabic}
                    </div>
                    <div className="text-xs text-zinc-300 mt-0.5 text-left font-sans" dir="ltr">
                      {item.transliteration}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-zinc-950 shrink-0 mt-1 shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Metrics Stats Row (Directly inspired by Counter Easy) */}
                <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-zinc-400 gap-2">
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-zinc-200 font-semibold">
                      {lang === 'ar' ? 'العدد:' : 'Count:'} <strong className="text-amber-400">{m.totalCount}</strong>
                    </span>
                    <span>•</span>
                    <span className="text-zinc-300">
                      {lang === 'ar' ? 'الدورات:' : 'Lap:'} <strong className="text-zinc-100">{m.laps}</strong>
                    </span>
                    <span>•</span>
                    <span className="text-zinc-400">
                      {lang === 'ar' ? 'الهدف:' : 'Limit:'} {item.defaultTarget}
                    </span>
                  </div>

                  {/* Secondary timer info & reset button */}
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-zinc-500">
                      ⏱ {formatTimer(m.timeSeconds)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleResetMetric(e, item.id)}
                      className="p-1 text-zinc-500 hover:text-amber-400 hover:bg-white/5 rounded-lg transition"
                      title={lang === 'ar' ? 'تصفير عدادات هذا الذكر' : 'Reset metrics for this Dhikr'}
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                    {item.isCustom && onDeleteCustom && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCustom(item.id);
                        }}
                        className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                        title={lang === 'ar' ? 'حذف هذا الذكر المخصص' : 'Delete custom Dhikr'}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
