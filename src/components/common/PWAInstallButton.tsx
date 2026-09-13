import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useTranslation } from '../../hooks/useTranslation';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { t } = useTranslation();

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        id="btn-pwa-install"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 transition text-xs font-medium"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{t.installApp}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          id="btn-pwa-ios-install"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-stone-800 bg-stone-900/60 text-xs font-medium text-stone-300 hover:text-amber-300 transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="text-[11px]">{t.installIOS}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#12141c] border border-stone-800 p-6 shadow-2xl text-stone-200">
              <h3 className="text-base font-semibold text-white">
                {t.installIOS}
              </h3>
              <p className="mt-3 text-sm text-stone-300 leading-relaxed">
                1. Tap the <strong className="text-amber-400">Share</strong> button in Safari's bottom toolbar.
                <br />
                2. Scroll down and tap <strong className="text-amber-400">Add to Home Screen</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-amber-500 py-2.5 text-sm font-medium text-stone-950 hover:bg-amber-400 transition"
              >
                {t.close}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
