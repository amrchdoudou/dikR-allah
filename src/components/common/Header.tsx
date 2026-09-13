import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({ soundEnabled, onToggleSound }) => {
  const { t, lang, changeLanguage } = useTranslation();

  return (
    <header className="w-full max-w-5xl mx-auto px-6 sm:px-10 py-5 sm:py-6 border-b border-white/5 flex items-center justify-between">
      <div className="flex flex-col">
        <h1 className={`text-xl sm:text-2xl font-semibold tracking-tight text-amber-500 ${lang === 'ar' ? 'font-arabic' : ''}`}>
          {t.appName}
        </h1>
        <p className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-[0.2em] font-medium mt-0.5">
          {t.tagline}
        </p>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        <PWAInstallButton />

        {/* Language switch pill */}
        <div className="flex bg-zinc-900 rounded-full p-1 border border-white/10">
          <button
            onClick={() => changeLanguage('en')}
            id="btn-header-lang-en"
            className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
              lang === 'en'
                ? 'bg-amber-500 text-black shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => changeLanguage('ar')}
            id="btn-header-lang-ar"
            className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-colors font-arabic ${
              lang === 'ar'
                ? 'bg-amber-500 text-black shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            AR
          </button>
        </div>

        {/* Quick Audio Toggle */}
        <button
          onClick={onToggleSound}
          id="btn-header-sound-toggle"
          aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
          className="p-2 sm:p-2.5 rounded-full bg-zinc-900 border border-white/10 hover:bg-zinc-800 transition-colors"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
          ) : (
            <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500" />
          )}
        </button>
      </div>
    </header>
  );
};
