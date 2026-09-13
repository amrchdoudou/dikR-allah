import React, { useState, useRef } from 'react';
import {
  Volume2,
  Smartphone,
  Globe,
  SunMoon,
  Sliders,
  Database,
  Download,
  Upload,
  Trash2,
  Eye,
  Check,
} from 'lucide-react';
import { Settings, SoundType } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { storageService } from '../services/storageService';
import { audioService } from '../services/audioService';
import { hapticService } from '../services/hapticService';
import { wakeLockService } from '../services/wakeLockService';

interface SettingsPageProps {
  settings: Settings;
  onUpdateSettings: (newSettings: Settings) => void;
  onDataReset: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onUpdateSettings,
  onDataReset,
}) => {
  const { t, lang, changeLanguage } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleUpdate = (updates: Partial<Settings>) => {
    const updated = { ...settings, ...updates };
    onUpdateSettings(updated);
    storageService.saveSettings(updated);

    // Apply side effects
    if ('soundEnabled' in updates || 'volume' in updates || 'soundType' in updates) {
      audioService.setEnabled(updated.soundEnabled);
      audioService.setVolume(updated.volume);
      audioService.setSoundType(updated.soundType);
    }
    if ('hapticEnabled' in updates) {
      hapticService.setEnabled(updated.hapticEnabled);
    }
    if ('keepScreenAwake' in updates) {
      if (updated.keepScreenAwake) {
        wakeLockService.request();
      } else {
        wakeLockService.release();
      }
    }
  };

  const handleSoundTypeChange = (st: SoundType) => {
    handleUpdate({ soundType: st, soundEnabled: true });
    audioService.setEnabled(true);
    audioService.setSoundType(st);
    audioService.playTap(st);
  };

  const soundList: { id: SoundType; nameKey: string; enName: string; arName: string; icon: string }[] = [
    { id: 'soft-bell', nameKey: 'soundSoftBell', enName: 'Soft Bell', arName: 'جرس هادئ', icon: '🔔' },
    { id: 'wood-click', nameKey: 'soundWoodClick', enName: 'Wood Beads', arName: 'مسبحة خشب', icon: '🪵' },
    { id: 'water-drop', nameKey: 'soundWaterDrop', enName: 'Water Drop', arName: 'قطرة ماء', icon: '💧' },
    { id: 'crystal', nameKey: 'soundCrystal', enName: 'Crystal Chime', arName: 'بلور نقي', icon: '✨' },
    { id: 'tibetan-bowl', nameKey: 'soundTibetanBowl', enName: 'Singing Bowl', arName: 'طاسة تأمل', icon: '🥣' },
    { id: 'bamboo', nameKey: 'soundBamboo', enName: 'Bamboo Knock', arName: 'طرق خيزران', icon: '🎋' },
    { id: 'ceramic', nameKey: 'soundCeramic', enName: 'Ceramic Bead', arName: 'خرز خزفي', icon: '⚪' },
    { id: 'gentle-pulse', nameKey: 'soundGentlePulse', enName: 'Heartbeat Pulse', arName: 'نبض هادئ', icon: '💓' },
    { id: 'reed-pipe', nameKey: 'soundReedPipe', enName: 'Soft Flute', arName: 'نغمة ناي', icon: '🪈' },
    { id: 'stone-pebble', nameKey: 'soundStonePebble', enName: 'River Pebble', arName: 'حجر أملس', icon: '🪨' },
    { id: 'silent', nameKey: 'soundSilent', enName: 'Silent', arName: 'صامت', icon: '🔕' },
  ];

  const handleExportData = () => {
    const jsonStr = storageService.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dhikrflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const success = storageService.importData(content);
      if (success) {
        setImportStatus(t.importSuccess);
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setImportStatus(t.importFailed);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-4 pb-28 space-y-6">
      <div>
        <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold block mb-1">
          Preferences & Config
        </span>
        <h2 className="text-2xl sm:text-3xl font-light text-zinc-100 tracking-tight">
          {t.settingsTitle}
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Customize your sensory feedback, cadence defaults, and local data
        </p>
      </div>

      {/* Language & Appearance */}
      <div className="rounded-3xl bg-zinc-900/50 border border-white/5 p-6 space-y-4">
        <h3 className="text-xs uppercase tracking-wider text-amber-500 font-bold flex items-center gap-1.5">
          <Globe className="w-4 h-4" />
          <span>{t.navSettings}</span>
        </h3>

        {/* Language Selection */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-300 font-medium">{t.language}</span>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-white/10">
            <button
              onClick={() => {
                changeLanguage('en');
                handleUpdate({ language: 'en' });
              }}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition cursor-pointer ${
                lang === 'en'
                  ? 'bg-amber-500 text-black font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              English
            </button>
            <button
              onClick={() => {
                changeLanguage('ar');
                handleUpdate({ language: 'ar' });
              }}
              className={`px-3 py-1 text-xs rounded-lg font-arabic font-medium transition cursor-pointer ${
                lang === 'ar'
                  ? 'bg-amber-500 text-black font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              العربية
            </button>
          </div>
        </div>

        {/* Theme Selection: Emerald, Dark, Light */}
        <div className="flex flex-col gap-2 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between text-xs text-zinc-300">
            <div className="flex items-center gap-2">
              <SunMoon className="w-4 h-4 text-amber-500" />
              <span>{t.appearance}</span>
            </div>
            <span className="text-[11px] text-amber-500 font-mono">
              {settings.appearance === 'emerald'
                ? (lang === 'ar' ? 'الزمرد الإسلامي' : 'Islamic Emerald')
                : settings.appearance === 'light'
                ? (lang === 'ar' ? 'النهاري' : 'Light')
                : (lang === 'ar' ? 'الليلي' : 'Dark')}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-zinc-950/80 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => handleUpdate({ appearance: 'emerald' })}
              className={`py-2 px-2.5 rounded-xl text-center font-medium transition cursor-pointer flex flex-col items-center gap-1 ${
                settings.appearance === 'emerald'
                  ? 'bg-[#0f403c] text-amber-300 border border-amber-500/50 shadow-md font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>🕌</span>
              <span className="text-[10px]">{lang === 'ar' ? 'زمرد إسلامي' : 'Emerald'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleUpdate({ appearance: 'dark' })}
              className={`py-2 px-2.5 rounded-xl text-center font-medium transition cursor-pointer flex flex-col items-center gap-1 ${
                settings.appearance === 'dark' || !settings.appearance
                  ? 'bg-zinc-800 text-white border border-white/20 shadow-md font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>🌙</span>
              <span className="text-[10px]">{lang === 'ar' ? 'ليلي هادئ' : 'Onyx Dark'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleUpdate({ appearance: 'light' })}
              className={`py-2 px-2.5 rounded-xl text-center font-medium transition cursor-pointer flex flex-col items-center gap-1 ${
                settings.appearance === 'light'
                  ? 'bg-zinc-200 text-zinc-900 border border-white/40 shadow-md font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>☀️</span>
              <span className="text-[10px]">{lang === 'ar' ? 'نهاري' : 'Light'}</span>
            </button>
          </div>
        </div>

        {/* Digital LCD Font Display Option */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <span className="font-['Share_Tech_Mono',monospace] text-amber-400 font-bold text-sm">78</span>
            <span>{lang === 'ar' ? 'شاشة الأرقام الرقمية LCD' : 'Digital LCD Numbers'}</span>
          </div>
          <input
            type="checkbox"
            checked={settings.digitalDisplay !== false}
            onChange={(e) => handleUpdate({ digitalDisplay: e.target.checked })}
            className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
          />
        </div>

        {/* Percentage Bubble on Circle */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <span className="text-amber-400 font-bold text-xs">%</span>
            <span>{lang === 'ar' ? 'فقاعة النسبة المئوية على الحلقة' : 'Percentage Bubble on Ring'}</span>
          </div>
          <input
            type="checkbox"
            checked={settings.showPercentageBubble !== false}
            onChange={(e) => handleUpdate({ showPercentageBubble: e.target.checked })}
            className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
          />
        </div>

        {/* Keep Screen Awake (Wake Lock) */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <Eye className="w-4 h-4 text-zinc-500" />
            <span>{t.keepScreenAwake}</span>
          </div>
          <input
            type="checkbox"
            checked={settings.keepScreenAwake}
            onChange={(e) => handleUpdate({ keepScreenAwake: e.target.checked })}
            className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
          />
        </div>
      </div>

      {/* Audio & Haptics Feedback */}
      <div className="rounded-3xl bg-zinc-900/50 border border-white/5 p-6 space-y-4">
        <h3 className="text-xs uppercase tracking-wider text-amber-500 font-bold flex items-center gap-1.5">
          <Volume2 className="w-4 h-4" />
          <span>Sensory Feedback</span>
        </h3>

        {/* Sound toggle */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-300 font-medium">{t.soundEnabled}</span>
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={(e) => handleUpdate({ soundEnabled: e.target.checked })}
            className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
          />
        </div>

        {/* Sound Type Selection */}
        {settings.soundEnabled && (
          <div className="space-y-3 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-medium">{t.soundType}</span>
              <span className="text-[11px] text-amber-500 font-mono">10 أصوات</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {soundList.map((item) => {
                const isSelected = settings.soundType === item.id;
                const label = settings.language === 'ar' ? item.arName : item.enName;
                return (
                  <button
                    key={item.id}
                    id={`btn-sound-${item.id}`}
                    onClick={() => handleSoundTypeChange(item.id)}
                    className={`p-2.5 rounded-xl text-xs transition flex items-center justify-between gap-2 border cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-semibold shadow-sm shadow-amber-500/10'
                        : 'bg-zinc-900/80 border-white/5 text-zinc-300 hover:border-white/15 hover:text-zinc-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base">{item.icon}</span>
                      <span className="truncate">{label}</span>
                    </div>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 shadow-[0_0_6px_#f59e0b]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Volume slider */}
            <div className="pt-2">
              <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                <span>{t.soundVolume}</span>
                <span className="font-mono text-amber-500 font-semibold">{Math.round(settings.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={settings.volume}
                onChange={(e) => handleUpdate({ volume: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Haptics toggle */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <Smartphone className="w-4 h-4 text-zinc-500" />
            <span>{t.hapticsEnabled}</span>
          </div>
          <input
            type="checkbox"
            checked={settings.hapticEnabled}
            onChange={(e) => handleUpdate({ hapticEnabled: e.target.checked })}
            className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
          />
        </div>
      </div>

      {/* Rhythm & Cadence Preferences */}
      <div className="rounded-3xl bg-zinc-900/50 border border-white/5 p-6 space-y-4">
        <h3 className="text-xs uppercase tracking-wider text-amber-500 font-bold flex items-center gap-1.5">
          <Sliders className="w-4 h-4" />
          <span>Cadence & Progression</span>
        </h3>

        {/* Default BPM */}
        <div>
          <div className="flex justify-between text-xs text-zinc-300 mb-1.5">
            <span>{t.defaultBpm}</span>
            <span className="font-mono text-amber-500 font-semibold">{settings.defaultBpm} BPM</span>
          </div>
          <input
            type="range"
            min="30"
            max="120"
            value={settings.defaultBpm}
            onChange={(e) => handleUpdate({ defaultBpm: parseInt(e.target.value, 10) })}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        {/* Auto Advance toggle */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div>
            <span className="text-xs text-zinc-300 block font-medium">{t.autoAdvance}</span>
            <span className="text-[11px] text-zinc-500">Automatically switch to next Dhikr upon target completion</span>
          </div>
          <input
            type="checkbox"
            checked={settings.autoAdvance}
            onChange={(e) => handleUpdate({ autoAdvance: e.target.checked })}
            className="rounded accent-amber-500 w-4 h-4 cursor-pointer ml-3"
          />
        </div>
      </div>

      {/* Local Storage & Data Privacy */}
      <div className="rounded-3xl bg-zinc-900/50 border border-white/5 p-6 space-y-4">
        <h3 className="text-xs uppercase tracking-wider text-amber-500 font-bold flex items-center gap-1.5">
          <Database className="w-4 h-4" />
          <span>Local Storage & Backup</span>
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          DhikrFlow works 100% offline. All sessions, learned rhythms, and statistics are stored privately in your device's browser localStorage.
        </p>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleExportData}
            id="btn-export-data"
            className="p-3.5 rounded-2xl bg-zinc-900 border border-white/10 hover:border-amber-500/50 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-500" />
            <span>{t.exportData}</span>
          </button>

          <button
            onClick={handleImportClick}
            id="btn-import-data"
            className="p-3.5 rounded-2xl bg-zinc-900 border border-white/10 hover:border-amber-500/50 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Upload className="w-4 h-4 text-amber-500" />
            <span>{t.importData}</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>

        {importStatus && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs text-center">
            {importStatus}
          </div>
        )}

        {/* Clear Data Danger Action */}
        <div className="pt-3 border-t border-white/5">
          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              id="btn-request-clear-data"
              className="w-full py-2.5 text-xs text-red-400/80 hover:text-red-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.clearAllData}</span>
            </button>
          ) : (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-center space-y-2.5">
              <p className="text-xs text-red-300">{t.confirmClear}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2 rounded-xl bg-zinc-900 text-xs text-zinc-300 hover:text-white border border-white/10 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={() => {
                    storageService.clearAllData();
                    onDataReset();
                    window.location.reload();
                  }}
                  id="btn-confirm-clear-data"
                  className="flex-1 py-2 rounded-xl bg-red-600 text-xs text-white font-bold hover:bg-red-500 cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
