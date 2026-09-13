import React from 'react';
import { History as HistoryIcon, Trash2, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { HistoryEntry } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface HistoryPageProps {
  history: HistoryEntry[];
  onClearHistory: () => void;
  onDeleteEntry: (id: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  history,
  onClearHistory,
  onDeleteEntry,
}) => {
  const { t, lang } = useTranslation();

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-4 pb-28 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold block mb-1">
            Journal & Logs
          </span>
          <h2 className="text-2xl sm:text-3xl font-light text-zinc-100 tracking-tight flex items-center gap-2">
            <span>{t.historyTitle}</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Log of your completed Adhkar and mindful moments
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            id="btn-clear-history"
            className="text-xs text-zinc-500 hover:text-red-400 flex items-center gap-1 transition px-3 py-1.5 rounded-xl hover:bg-zinc-900 border border-transparent hover:border-white/5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.clearHistory}</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="rounded-3xl bg-zinc-900/50 border border-white/5 p-10 text-center text-zinc-400 space-y-2">
          <HistoryIcon className="w-10 h-10 mx-auto text-zinc-600 mb-2" />
          <p className="text-sm font-medium text-zinc-300">{t.noHistory}</p>
          <p className="text-xs text-zinc-500">
            Complete a counter target or a session to record your flow.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-white/10 transition flex items-center justify-between gap-3"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-zinc-100">
                    {lang === 'ar' && entry.titleAr ? entry.titleAr : entry.title}
                  </span>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 font-medium">
                    {entry.completedCount} / {entry.targetCount}
                  </span>
                </div>

                <div className="text-xs text-zinc-400 flex items-center gap-2">
                  <span className="font-arabic text-amber-500/90 text-sm" dir="rtl">
                    {entry.dhikrArabic}
                  </span>
                  {entry.bpm && (
                    <>
                      <span className="text-zinc-600">•</span>
                      <span className="font-mono text-zinc-400">{entry.bpm} BPM</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-zinc-500" />
                    {formatDate(entry.timestamp)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    {formatDuration(entry.durationSeconds)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onDeleteEntry(entry.id)}
                className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-xl transition cursor-pointer"
                title="Delete entry"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
