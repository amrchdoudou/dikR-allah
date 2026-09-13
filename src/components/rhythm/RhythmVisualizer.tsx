import React, { useState } from 'react';
import { Play, Square, Sliders, Sparkles } from 'lucide-react';
import { useRhythmEngine } from '../../hooks/useRhythmEngine';
import { useTranslation } from '../../hooks/useTranslation';
import { RhythmProfile } from '../../types';

interface RhythmVisualizerProps {
  savedProfiles: RhythmProfile[];
  initialBpm?: number;
  onApplyRhythm?: (profile: RhythmProfile) => void;
}

export const RhythmVisualizer: React.FC<RhythmVisualizerProps> = ({
  savedProfiles,
  initialBpm = 60,
  onApplyRhythm,
}) => {
  const { t } = useTranslation();
  const presets = [40, 60, 80, 100, 120, 150, 180, 200];

  const [selectedPreset, setSelectedPreset] = useState<number>(initialBpm);
  const [selectedCustomProfileId, setSelectedCustomProfileId] = useState<string>('');

  const {
    isPlaying,
    bpm,
    setBpm,
    mode,
    setMode,
    setCustomProfile,
    beatCount,
    isPulseActive,
    toggle,
  } = useRhythmEngine({ bpm: initialBpm, mode: 'bpm' });

  const handleSelectPreset = (p: number) => {
    setSelectedPreset(p);
    setBpm(p);
    setMode('bpm');
    setSelectedCustomProfileId('');
  };

  const handleCustomSlider = (val: number) => {
    setSelectedPreset(val);
    setBpm(val);
    setMode('bpm');
    setSelectedCustomProfileId('');
  };

  const handleSelectSavedProfile = (profileId: string) => {
    const found = savedProfiles.find(p => p.id === profileId);
    if (found) {
      setSelectedCustomProfileId(profileId);
      setCustomProfile(found);
      setMode('custom');
      setBpm(found.bpm);
    }
  };

  const handleApplyToCounter = () => {
    if (!onApplyRhythm) return;
    const selectedProfile = mode === 'custom' && selectedCustomProfileId
      ? savedProfiles.find(p => p.id === selectedCustomProfileId)
      : null;

    const profileToApply: RhythmProfile = selectedProfile
      ? { ...selectedProfile, appliedAt: Date.now() }
      : {
          id: `bpm-${bpm}-${Date.now()}`,
          name: `${bpm} BPM Steady Cadence`,
          recordedAt: Date.now(),
          tapCount: 10,
          avgInterval: Number((60 / bpm).toFixed(2)),
          medianInterval: Number((60 / bpm).toFixed(2)),
          minInterval: Number((60 / bpm).toFixed(2)),
          maxInterval: Number((60 / bpm).toFixed(2)),
          bpm,
          consistency: 100,
          intervals: [Number((60 / bpm).toFixed(2))],
          appliedAt: Date.now(),
        };

    onApplyRhythm(profileToApply);
  };

  return (
    <div className="rounded-3xl bg-zinc-900/50 border border-white/5 p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
          <h3 className="text-base font-semibold text-zinc-100">{t.mode2Title}</h3>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
          حتى 200 BPM
        </span>
      </div>
      <p className="text-xs text-zinc-400 leading-relaxed">
        {t.mode2Desc}
      </p>

      {/* Visual Pulse Stage */}
      <div className="flex flex-col items-center justify-center py-7 px-4 rounded-2xl bg-zinc-950/70 border border-white/5 relative overflow-hidden">
        {/* Subtle decorative concentric circles */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-52 h-52 rounded-full border border-amber-500/20" />
          <div className="w-36 h-36 rounded-full border border-amber-500/20" />
        </div>

        {/* The Visual Pulse ● */}
        <div className="relative flex items-center justify-center w-28 h-28 my-2">
          {/* Animated pulse halo */}
          <div
            className={`absolute rounded-full transition-all duration-100 ease-out ${
              isPulseActive
                ? 'w-24 h-24 bg-amber-500/30 blur-md scale-125'
                : 'w-12 h-12 bg-amber-500/5 blur-sm scale-90'
            }`}
          />

          {/* Central Beat Dot ● */}
          <div
            className={`rounded-full transition-all duration-75 ease-out shadow-lg ${
              isPulseActive
                ? 'w-16 h-16 bg-amber-500 scale-110 shadow-[0_0_25px_#f59e0b]'
                : 'w-12 h-12 bg-zinc-800 scale-95 border border-white/10'
            }`}
          />
        </div>

        {/* BPM & Beat Counter Display */}
        <div className="text-center z-10 mt-1">
          <div className="text-4xl font-light font-mono text-zinc-100 tracking-tight">
            {bpm} <span className="text-sm font-sans font-medium text-amber-500">BPM</span>
          </div>
          <div className="text-xs font-mono text-zinc-400 mt-1">
            {mode === 'custom' ? t.useMyRhythm : `${(60 / bpm).toFixed(2)}s لكل نبضة`} • {t.beatCounter} {beatCount}
          </div>
        </div>

        {/* Action Buttons AT THE TOP (Prominent & Accessible) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 mt-6 w-full max-w-sm z-10">
          {onApplyRhythm && (
            <button
              onClick={handleApplyToCounter}
              id="btn-apply-visualizer-rhythm-top"
              className="flex-1 py-3 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t.useThisRhythm} ({bpm} BPM)</span>
            </button>
          )}

          <button
            onClick={toggle}
            id="btn-toggle-rhythm-beat"
            className={`py-3 px-4 rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
              isPlaying
                ? 'bg-zinc-800 text-amber-400 border border-amber-500/40 hover:bg-zinc-700'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/10'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{t.stopBeat}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{t.startBeat}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* BPM Presets up to 200 */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs font-medium text-zinc-400 mb-2">
            <span>سرعات جاهزة (Presets)</span>
            <span className="font-mono text-zinc-500 text-[11px]">40 ➔ 200 BPM</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            {presets.map((p) => {
              const isSelected = mode === 'bpm' && selectedPreset === p;
              return (
                <button
                  key={p}
                  id={`btn-preset-bpm-${p}`}
                  onClick={() => handleSelectPreset(p)}
                  className={`py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                      : 'bg-zinc-900/80 border border-white/5 text-zinc-400 hover:border-white/15 hover:text-zinc-200'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom BPM Slider up to 200 */}
        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300 flex items-center gap-1.5 font-medium">
              <Sliders className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.customBpm}</span>
            </span>
            <span className="font-mono text-amber-500 font-bold text-sm">{bpm} BPM</span>
          </div>
          <input
            type="range"
            min="30"
            max="200"
            step="1"
            value={bpm}
            onChange={(e) => handleCustomSlider(parseInt(e.target.value, 10))}
            className="w-full accent-amber-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>30 (هدوء)</span>
            <span>60 (معتدل)</span>
            <span>100 (تدفق)</span>
            <span>150 (سريع)</span>
            <span className="text-amber-400 font-bold">200 (أقصى)</span>
          </div>
        </div>

        {/* Use My Rhythm (Learned Profiles) */}
        {savedProfiles.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-amber-400/90 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.useMyRhythm}</span>
            </label>
            <div className="space-y-1.5">
              {savedProfiles.map((p) => {
                const isSelected = mode === 'custom' && selectedCustomProfileId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectSavedProfile(p.id)}
                    className={`w-full p-2.5 rounded-xl border text-xs text-left transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/60 text-amber-200'
                        : 'bg-zinc-900/50 border-white/5 text-zinc-300 hover:border-white/10'
                    }`}
                  >
                    <div>
                      <span className="font-medium text-zinc-200 block">{p.name}</span>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {p.bpm} BPM • {p.avgInterval}s avg • {p.consistency}% consistency
                      </span>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-amber-300">
                      Replay Pattern
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
