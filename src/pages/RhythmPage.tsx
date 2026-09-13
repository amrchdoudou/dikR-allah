import React, { useState } from 'react';
import { Sparkles, Trash2, Play, Gauge, Mic, Bookmark } from 'lucide-react';
import { RhythmProfile } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { RhythmRecorder } from '../components/rhythm/RhythmRecorder';
import { RhythmVisualizer } from '../components/rhythm/RhythmVisualizer';

interface RhythmPageProps {
  savedRhythms: RhythmProfile[];
  onSaveRhythm: (profile: RhythmProfile) => void;
  onDeleteRhythm: (id: string) => void;
  onSelectActiveRhythm: (profile: RhythmProfile) => void;
  activeRhythmId?: string;
  defaultBpm: number;
}

export const RhythmPage: React.FC<RhythmPageProps> = ({
  savedRhythms,
  onSaveRhythm,
  onDeleteRhythm,
  onSelectActiveRhythm,
  activeRhythmId,
  defaultBpm,
}) => {
  const { t, lang } = useTranslation();
  const [activeTab, setActiveTab] = useState<'visualizer' | 'recorder' | 'saved'>('visualizer');

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-4 pb-28 space-y-5">
      {/* Title & Introduction */}
      <div>
        <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold block mb-1">
          {lang === 'ar' ? 'التحكم بالإيقاع والمسرع' : 'Pacing & Cadence'}
        </span>
        <h2 className="text-2xl sm:text-3xl font-light text-zinc-100 tracking-tight flex items-center gap-2">
          <span>{t.rhythmHubTitle}</span>
        </h2>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
          {t.rhythmHubSubtitle}
        </p>
      </div>

      {/* Reorganized Segmented Navigation Tabs */}
      <div className="flex p-1 rounded-2xl bg-zinc-950 border border-white/5 text-xs font-medium">
        <button
          onClick={() => setActiveTab('visualizer')}
          className={`flex-1 py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'visualizer'
              ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/10'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Gauge className="w-3.5 h-3.5" />
          <span>{lang === 'ar' ? 'ضابط الإيقاع (حتى 200)' : 'Pacer & BPM (200)'}</span>
        </button>

        <button
          onClick={() => setActiveTab('recorder')}
          className={`flex-1 py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'recorder'
              ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/10'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>{lang === 'ar' ? 'تسجيل إيقاعي' : 'Smart Recorder'}</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex-1 py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'saved'
              ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/10'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>
            {lang === 'ar' ? 'المحفوظة' : 'Saved'}
            {savedRhythms.length > 0 && ` (${savedRhythms.length})`}
          </span>
        </button>
      </div>

      {/* Tab 1: Pacer & BPM Visualizer (Up to 200 BPM with top Apply button) */}
      {activeTab === 'visualizer' && (
        <RhythmVisualizer
          savedProfiles={savedRhythms}
          initialBpm={defaultBpm}
          onApplyRhythm={onSelectActiveRhythm}
        />
      )}

      {/* Tab 2: Natural Rhythm Recorder */}
      {activeTab === 'recorder' && (
        <RhythmRecorder
          onSaveProfile={onSaveRhythm}
          onApplyRhythm={onSelectActiveRhythm}
        />
      )}

      {/* Tab 3: Saved Rhythms Section */}
      {activeTab === 'saved' && (
        <div className="rounded-3xl bg-zinc-900/50 border border-white/5 p-6 shadow-xl space-y-4 animate-in fade-in duration-200">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{t.savedRhythms}</span>
            </h3>
            <p className="text-xs text-zinc-400">
              {lang === 'ar'
                ? 'الملفات الإيقاعية الشخصية المسجلة من وتيرتك الطبيعية'
                : 'Personal rhythm profiles recorded from your natural cadence.'}
            </p>
          </div>

          {savedRhythms.length === 0 ? (
            <div className="text-center py-8 text-xs text-zinc-500">
              {t.noRhythmsSaved}
            </div>
          ) : (
            <div className="space-y-2.5">
              {savedRhythms.map((profile) => {
                const isSelected = activeRhythmId === profile.id;
                return (
                  <div
                    key={profile.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/40 text-white'
                        : 'bg-zinc-900/40 border-white/5 text-zinc-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-200">
                          {profile.name}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-black font-bold">
                            نشط
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-400 font-mono mt-1">
                        {profile.bpm} BPM • {profile.avgInterval}s avg • {profile.consistency}% consistency
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectActiveRhythm(profile)}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>{t.useThisRhythm}</span>
                      </button>

                      <button
                        onClick={() => onDeleteRhythm(profile.id)}
                        className="p-2 text-zinc-500 hover:text-red-400 transition cursor-pointer"
                        title="Delete profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
