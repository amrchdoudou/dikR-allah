import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Dhikr } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface CustomDhikrModalProps {
  onSave: (dhikr: Omit<Dhikr, 'id'>) => void;
  onClose: () => void;
}

export const CustomDhikrModal: React.FC<CustomDhikrModalProps> = ({ onSave, onClose }) => {
  const { t } = useTranslation();
  const [arabic, setArabic] = useState('');
  const [transliteration, setTransliteration] = useState('');
  const [translation, setTranslation] = useState('');
  const [defaultTarget, setDefaultTarget] = useState('33');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!arabic.trim()) return;

    onSave({
      arabic: arabic.trim(),
      transliteration: transliteration.trim() || arabic.trim(),
      translation: translation.trim(),
      defaultTarget: parseInt(defaultTarget, 10) || 33,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-[#0d0d0d] border border-white/10 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <h2 className="text-base font-semibold text-zinc-100">
            {t.createNewDhikr}
          </h2>
          <button
            onClick={onClose}
            id="btn-close-custom-dhikr-modal"
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Arabic Text (النص العربي) *
            </label>
            <input
              type="text"
              required
              dir="rtl"
              value={arabic}
              onChange={(e) => setArabic(e.target.value)}
              placeholder="مثال: لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-100 font-arabic text-xl focus:border-amber-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Transliteration
            </label>
            <input
              type="text"
              value={transliteration}
              onChange={(e) => setTransliteration(e.target.value)}
              placeholder="e.g. La hawla wa la quwwata illa billah"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-100 text-sm focus:border-amber-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Meaning / Translation
            </label>
            <input
              type="text"
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              placeholder="e.g. There is no power or might except with Allah"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-100 text-sm focus:border-amber-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Default Target Repetitions
            </label>
            <input
              type="number"
              min="1"
              max="10000"
              value={defaultTarget}
              onChange={(e) => setDefaultTarget(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-100 font-mono text-sm focus:border-amber-500/50 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white text-sm font-medium transition cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              id="btn-save-custom-dhikr"
              className="flex-1 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition cursor-pointer"
            >
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
