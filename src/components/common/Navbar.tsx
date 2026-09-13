import React from 'react';
import { CircleDot, Activity, Layers, History, BarChart3, Settings as SettingsIcon } from 'lucide-react';
import { ActivePage } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface NavbarProps {
  activePage: ActivePage;
  onSelectPage: (page: ActivePage) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activePage, onSelectPage }) => {
  const { t } = useTranslation();

  const navItems: { id: ActivePage; label: string; icon: React.ReactNode }[] = [
    { id: 'counter', label: t.navCounter, icon: <CircleDot className="w-5 h-5" /> },
    { id: 'rhythm', label: t.navRhythm, icon: <Activity className="w-5 h-5" /> },
    { id: 'sessions', label: t.navSessions, icon: <Layers className="w-5 h-5" /> },
    { id: 'history', label: t.navHistory, icon: <History className="w-5 h-5" /> },
    { id: 'statistics', label: t.navStats, icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'settings', label: t.navSettings, icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-900/60 backdrop-blur-xl border-t border-white/5 py-2 sm:py-3 px-3 sm:px-12 pb-safe">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onSelectPage(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 sm:px-4 rounded-xl transition-all relative ${
                isActive
                  ? 'text-amber-500 font-bold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className={`transition-transform duration-150 ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase mt-1 leading-none">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
