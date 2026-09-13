import React, { useState } from 'react';
import { X, Plus, Trash2, ArrowUp, ArrowDown, Volume2, Smartphone } from 'lucide-react';
import { Session, SessionItem, Dhikr } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface SessionBuilderModalProps {
  allAdhkar: Dhikr[];
  onSaveSession: (session: Omit<Session, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export const SessionBuilderModal: React.FC<SessionBuilderModalProps> = ({
  allAdhkar,
  onSaveSession,
  onClose,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [items, setItems] = useState<SessionItem[]>([
    {
      dhikrId: allAdhkar[0]?.id || 'subhanallah',
      arabic: allAdhkar[0]?.arabic || 'سُبْحَانَ اللهِ',
      transliteration: allAdhkar[0]?.transliteration || 'Subḥān Allāh',
      translation: allAdhkar[0]?.translation,
      target: 33,
    },
    {
      dhikrId: allAdhkar[1]?.id || 'alhamdulillah',
      arabic: allAdhkar[1]?.arabic || 'الْحَمْدُ لِلَّهِ',
      transliteration: allAdhkar[1]?.transliteration || 'Al-ḥamdu lillāh',
      translation: allAdhkar[1]?.translation,
      target: 33,
    },
  ]);

  const [bpm, setBpm] = useState<number>(65);
  const [enableSound, setEnableSound] = useState<boolean>(false);
  const [enableHaptic, setEnableHaptic] = useState<boolean>(true);

  const handleAddItem = (dhikr: Dhikr) => {
    setItems((prev) => [
      ...prev,
      {
        dhikrId: dhikr.id,
        arabic: dhikr.arabic,
        transliteration: dhikr.transliteration,
        translation: dhikr.translation,
        target: dhikr.defaultTarget || 33,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setItems((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    setItems((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleTargetChange = (index: number, newTarget: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, target: Math.max(1, newTarget) } : item))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || items.length === 0) return;

    onSaveSession({
      name: name.trim(),
      items,
      bpm,
      rhythmMode: 'bpm',
      enableSound,
      enableHaptic,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-[#0d0d0d] border border-white/10 flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 px-5 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-100">
            {t.newSessionTitle}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Session Name */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              {t.sessionName} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.sessionNamePlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-100 text-sm focus:border-amber-500/50 focus:outline-none"
            />
          </div>

          {/* Adhkar Items in Session */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-zinc-400">
                Adhkar in Session ({items.length})
              </label>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={`${item.dhikrId}-${index}`}
                  className="p-3 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveUp(index)}
                      className="p-1 rounded text-zinc-500 hover:text-zinc-300 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === items.length - 1}
                      onClick={() => handleMoveDown(index)}
                      className="p-1 rounded text-zinc-500 hover:text-zinc-300 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-xs text-zinc-500 w-4">
                      {index + 1}.
                    </span>
                  </div>

                  <div className="flex-1 px-2">
                    <div className="font-arabic text-sm text-amber-500 text-right" dir="rtl">
                      {item.arabic}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {item.transliteration}
                    </div>
                  </div>

                  {/* Target input */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-zinc-500">×</span>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={item.target}
                      onChange={(e) => handleTargetChange(index, parseInt(e.target.value, 10))}
                      className="w-16 px-2 py-1 text-center bg-zinc-800 rounded-lg text-white font-mono text-xs border border-white/10 focus:border-amber-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 transition ml-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Add Dhikr Dropdown */}
            <div className="mt-3">
              <label className="block text-[11px] uppercase tracking-wider text-zinc-500 mb-1.5 font-medium">
                + {t.addDhikrToSession}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {allAdhkar.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handleAddItem(d)}
                    className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-white/10 hover:border-amber-500/40 text-zinc-300 hover:text-amber-400 text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span className="font-arabic text-sm">{d.arabic}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Session Rhythm & Feedback Preferences */}
          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-zinc-300">Session Cadence (BPM)</span>
                <span className="font-mono text-amber-500 font-semibold">{bpm} BPM</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableSound}
                  onChange={(e) => setEnableSound(e.target.checked)}
                  className="rounded accent-amber-500 w-4 h-4"
                />
                <Volume2 className="w-3.5 h-3.5 text-zinc-500" />
                <span>Play Soft Beat Sound</span>
              </label>

              <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableHaptic}
                  onChange={(e) => setEnableHaptic(e.target.checked)}
                  className="rounded accent-amber-500 w-4 h-4"
                />
                <Smartphone className="w-3.5 h-3.5 text-zinc-500" />
                <span>Tactile Haptics</span>
              </label>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-400 hover:text-white text-sm font-medium transition cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              id="btn-submit-save-session"
              className="flex-1 py-3 rounded-xl bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition cursor-pointer"
            >
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
