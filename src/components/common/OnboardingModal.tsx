import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Dhikr } from '../../types';

interface OnboardingModalProps {
  adhkar: Dhikr[];
  onComplete: (selectedDhikr: Dhikr) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ adhkar, onComplete }) => {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState<string>(adhkar[0]?.id || 'subhanallah');

  const startingOptions = adhkar.slice(0, 3); // SubhanAllah, Alhamdulillah, Allahu Akbar

  const handleStart = () => {
    const chosen = adhkar.find(d => d.id === selectedId) || adhkar[0];
    onComplete(chosen);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md rounded-3xl bg-[#11131b] border border-amber-500/25 p-7 shadow-2xl text-center relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-5 shadow-inner">
          <svg className="w-9 h-9 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14a6 6 0 100 12 6 6 0 000-12zm0 9.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z"/>
          </svg>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
          {t.onboardingTitle}
        </h2>
        <p className="text-sm text-stone-300 italic mb-6 leading-relaxed">
          “{t.onboardingTagline}”
        </p>

        <div className="text-xs uppercase tracking-wider text-amber-400/90 font-medium mb-3">
          {t.onboardingPrompt}
        </div>

        <div className="space-y-2.5 mb-7">
          {startingOptions.map((item) => {
            const isSelected = selectedId === item.id;
            return (
              <button
                key={item.id}
                id={`onboarding-choice-${item.id}`}
                onClick={() => setSelectedId(item.id)}
                className={`w-full p-3.5 rounded-2xl border text-center transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)] text-white'
                    : 'bg-stone-900/40 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                <div className="text-left">
                  <div className="text-xs text-stone-400">{item.transliteration}</div>
                  <div className="text-[11px] text-amber-500/80">{item.defaultTarget} {t.repetitions}</div>
                </div>
                <div className="font-arabic text-xl text-amber-200" dir="rtl">
                  {item.arabic}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleStart}
          id="btn-onboarding-start"
          className="w-full py-3.5 rounded-2xl bg-amber-500 text-stone-950 font-semibold text-sm hover:bg-amber-400 transition-transform active:scale-[0.98] shadow-lg shadow-amber-500/20"
        >
          {t.onboardingStart}
        </button>
      </div>
    </div>
  );
};
