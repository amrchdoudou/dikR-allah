import React, { useState } from 'react';
import { Play, RotateCcw, Check, Sparkles, BookmarkPlus } from 'lucide-react';
import { useRhythmRecorder } from '../../hooks/useRhythmRecorder';
import { useTranslation } from '../../hooks/useTranslation';
import { RhythmProfile } from '../../types';

interface RhythmRecorderProps {
  onSaveProfile: (profile: RhythmProfile) => void;
  onApplyRhythm: (profile: RhythmProfile) => void;
}

export const RhythmRecorder: React.FC<RhythmRecorderProps> = ({ onSaveProfile, onApplyRhythm }) => {
  const { t } = useTranslation();
  const {
    isRecording,
    tapCount,
    analysis,
    startRecording,
    recordTap,
    finishRecording,
    cancelRecording,
    saveRhythm,
  } = useRhythmRecorder();

  const [profileName, setProfileName] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleFinish = () => {
    const res = finishRecording();
    if (res) {
      setProfileName(`My Rhythm (${res.bpm} BPM)`);
    }
  };

  const handleSave = () => {
    if (!analysis) return;
    const saved = saveRhythm(profileName);
    if (saved) {
      onSaveProfile(saved);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const handleApply = () => {
    if (!analysis) return;
    const tempProfile: RhythmProfile = {
      id: `temp-${Date.now()}`,
      name: profileName || `Rhythm ${analysis.bpm} BPM`,
      recordedAt: Date.now(),
      tapCount: analysis.tapCount,
      avgInterval: analysis.avgInterval,
      medianInterval: analysis.medianInterval,
      minInterval: analysis.minInterval,
      maxInterval: analysis.maxInterval,
      bpm: analysis.bpm,
      consistency: analysis.consistency,
      intervals: analysis.intervals,
      appliedAt: Date.now(),
    };
    onApplyRhythm(tempProfile);
  };

  // Helper for rendering consistency bar
  const renderConsistencyBar = (percent: number) => {
    const blocksTotal = 10;
    const filledCount = Math.round((percent / 100) * blocksTotal);
    return (
      <div className="flex items-center gap-1 font-mono text-sm tracking-widest text-amber-400">
        <span>{'█'.repeat(filledCount)}</span>
        <span className="opacity-30">{'░'.repeat(blocksTotal - filledCount)}</span>
        <span className="text-xs text-stone-300 ml-1.5 font-sans font-medium">{percent}%</span>
      </div>
    );
  };

  return (
    <div className="rounded-3xl bg-zinc-900/50 border border-white/5 p-6 shadow-xl space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
        <h3 className="text-base font-semibold text-zinc-100">{t.mode1Title}</h3>
      </div>
      <p className="text-xs text-zinc-500 leading-relaxed mb-4">
        {t.mode1Desc}
      </p>

      {!isRecording && !analysis && (
        <div className="text-center py-6">
          <button
            onClick={startRecording}
            id="btn-start-record-rhythm"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t.recordRhythmBtn}</span>
          </button>
        </div>
      )}

      {/* Active Recording View */}
      {isRecording && (
        <div className="flex flex-col items-center justify-center py-4">
          <p className="text-sm font-medium text-amber-500 animate-pulse mb-4">
            {t.recordingPrompt}
          </p>

          <button
            onClick={recordTap}
            id="btn-record-tap-pad"
            className="w-44 h-44 sm:w-48 sm:h-48 rounded-full border border-dashed border-amber-500/60 bg-zinc-900/40 flex flex-col items-center justify-center select-none active:scale-90 transition-transform touch-manipulation cursor-pointer shadow-[0_0_30px_rgba(245,158,11,0.15)]"
          >
            <span className="text-4xl font-light font-mono text-zinc-100 mb-1">
              {tapCount}
            </span>
            <span className="text-[11px] uppercase tracking-wider text-amber-500/80 font-bold">
              {t.tapsRecorded}
            </span>
          </button>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={cancelRecording}
              className="px-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 text-xs hover:text-white transition"
            >
              {t.cancelRecording}
            </button>
            <button
              onClick={handleFinish}
              disabled={tapCount < 3}
              id="btn-finish-recording"
              className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
                tapCount >= 3
                  ? 'bg-amber-500 text-black hover:bg-amber-400 active:scale-95'
                  : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              }`}
            >
              {t.finishRecording}
            </button>
          </div>
        </div>
      )}

      {/* Analysis Result View */}
      {analysis && !isRecording && (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 text-center">
            <span className="text-xs uppercase tracking-wider text-amber-500 font-bold block mb-1">
              {t.rhythmDetected}
            </span>
            <div className="text-4xl font-light font-mono text-white">
              {analysis.bpm} <span className="text-lg font-sans font-normal text-amber-500">BPM</span>
            </div>
            <p className="text-xs text-zinc-500 mt-1 font-mono">
              {analysis.avgInterval}s {t.avgInterval.toLowerCase()}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5">
              <span className="text-zinc-500 block mb-0.5">{t.medianInterval}</span>
              <span className="font-mono text-zinc-200 font-semibold">{analysis.medianInterval}s</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5">
              <span className="text-zinc-500 block mb-0.5">{t.tapsRecorded}</span>
              <span className="font-mono text-zinc-200 font-semibold">{analysis.tapCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5">
              <span className="text-zinc-500 block mb-0.5">{t.minInterval}</span>
              <span className="font-mono text-zinc-200 font-semibold">{analysis.minInterval}s</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5">
              <span className="text-zinc-500 block mb-0.5">{t.maxInterval}</span>
              <span className="font-mono text-zinc-200 font-semibold">{analysis.maxInterval}s</span>
            </div>
          </div>

          {/* Consistency Bar */}
          <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 flex items-center justify-between">
            <span className="text-xs text-zinc-500">{t.consistency}</span>
            {renderConsistencyBar(analysis.consistency)}
          </div>

          {/* Save rhythm input */}
          <div className="pt-2 flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder={t.rhythmNamePlaceholder}
                className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-200 text-xs focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleSave}
                id="btn-save-rhythm"
                className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-amber-500 text-xs font-bold flex items-center gap-1.5 transition"
              >
                {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                <span>{savedSuccess ? 'Saved' : t.save}</span>
              </button>
            </div>

            <div className="flex gap-2 mt-1">
              <button
                onClick={startRecording}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Re-Record</span>
              </button>

              <button
                onClick={handleApply}
                id="btn-use-this-rhythm"
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-black text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-amber-400 transition"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{t.useThisRhythm}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
