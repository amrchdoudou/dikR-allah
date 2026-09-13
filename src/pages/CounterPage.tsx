import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, ChevronRight, RotateCcw, Play, Sparkles, Square } from 'lucide-react';
import { Dhikr, RhythmProfile, Settings, ActivePage } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { useCounter } from '../hooks/useCounter';
import { useRhythmEngine } from '../hooks/useRhythmEngine';
import { CircularProgress } from '../components/counter/CircularProgress';
import { TapButton } from '../components/counter/TapButton';
import { SessionTimer } from '../components/counter/SessionTimer';
import { QuickActionBar } from '../components/counter/QuickActionBar';
import { CounterBottomDock } from '../components/counter/CounterBottomDock';
import { RhythmFeedbackBadge } from '../components/counter/RhythmFeedbackBadge';
import { DhikrSelectorModal } from '../components/adhkar/DhikrSelectorModal';
import { CustomDhikrModal } from '../components/adhkar/CustomDhikrModal';
import { storageService } from '../services/storageService';
import { audioService } from '../services/audioService';
import { hapticService } from '../services/hapticService';

type TargetAdvanceMode = 'stop' | 'repeat-same' | 'continuous' | 'auto-advance';

interface CounterPageProps {
  adhkar: Dhikr[];
  activeDhikr: Dhikr;
  onSelectDhikr: (dhikr: Dhikr) => void;
  onAddCustomDhikr: (dhikr: Omit<Dhikr, 'id'>) => void;
  onDeleteCustomDhikr: (id: string) => void;
  activeRhythmProfile: RhythmProfile | null;
  defaultBpm: number;
  settings?: Settings;
  onUpdateSettings?: (newSettings: Settings) => void;
  onNavigate?: (page: ActivePage) => void;
}

export const CounterPage: React.FC<CounterPageProps> = ({
  adhkar,
  activeDhikr,
  onSelectDhikr,
  onAddCustomDhikr,
  onDeleteCustomDhikr,
  activeRhythmProfile,
  defaultBpm,
  settings,
  onUpdateSettings,
  onNavigate,
}) => {
  const { t, lang } = useTranslation();
  const [showSelector, setShowSelector] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [rhythmAssistActive, setRhythmAssistActive] = useState(false);
  const [autoCountEnabled, setAutoCountEnabled] = useState(false);

  // Display options inspired by Counter Easy
  const [displayMode, setDisplayMode] = useState<'total' | 'lap'>('total');
  const [isDigitalFont, setIsDigitalFont] = useState<boolean>(() => {
    return settings?.digitalDisplay !== false;
  });
  const [showPercentage, setShowPercentage] = useState<boolean>(() => {
    return settings?.showPercentageBubble !== false;
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Advance mode: strictly 'stop' by default so Dhikr never switches automatically!
  const [advanceMode, setAdvanceMode] = useState<TargetAdvanceMode>(() => {
    try {
      const saved = localStorage.getItem('tasbih_advance_mode') as TargetAdvanceMode;
      if (saved && ['stop', 'repeat-same', 'continuous', 'auto-advance'].includes(saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    const s = storageService.getSettings();
    return s.autoAdvance ? 'auto-advance' : 'stop';
  });

  const handleSetAdvanceMode = (mode: TargetAdvanceMode) => {
    setAdvanceMode(mode);
    try {
      localStorage.setItem('tasbih_advance_mode', mode);
    } catch {
      // ignore
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const [transitionNotification, setTransitionNotification] = useState<string | null>(null);
  const isTransitioningRef = useRef<boolean>(false);
  const lastAppliedProfileRef = useRef<string | null>(null);

  // Next Dhikr in sequential flow
  const currentIndex = adhkar.findIndex((d) => d.id === activeDhikr.id);
  const nextDhikr = adhkar.length > 0 ? adhkar[(currentIndex + 1) % adhkar.length] : activeDhikr;

  // Counter Hook with Total Count, Rounds and Session Timer
  const {
    count,
    totalCount,
    rounds,
    sessionSeconds,
    isTimerRunning,
    toggleTimer,
    resetTimer,
    target,
    setTarget,
    isPaused,
    isTargetReached,
    progressPercentage,
    increment,
    undo,
    reset,
    togglePause,
  } = useCounter({
    initialDhikr: activeDhikr,
  });

  // Sound & Haptic quick toggle handlers
  const handleToggleSound = () => {
    if (!settings || !onUpdateSettings) return;
    const nextState = !settings.soundEnabled;
    const updated = { ...settings, soundEnabled: nextState };
    onUpdateSettings(updated);
    audioService.setEnabled(nextState);
    showToast(
      nextState
        ? (lang === 'ar' ? 'تم تفعيل الصوت' : 'Sound Enabled')
        : (lang === 'ar' ? 'تم كتم الصوت' : 'Sound Muted')
    );
  };

  const handleToggleHaptic = () => {
    if (!settings || !onUpdateSettings) return;
    const nextState = !settings.hapticEnabled;
    const updated = { ...settings, hapticEnabled: nextState };
    onUpdateSettings(updated);
    hapticService.setEnabled(nextState);
    if (nextState) {
      hapticService.triggerTap();
    }
    showToast(
      nextState
        ? (lang === 'ar' ? 'الاهتزاز مفعل' : 'Vibration Enabled')
        : (lang === 'ar' ? 'الاهتزاز معطل' : 'Vibration Disabled')
    );
  };

  // Advance to next Dhikr
  const advanceToNextDhikr = useCallback(() => {
    if (!nextDhikr) return;
    isTransitioningRef.current = false;
    setTransitionNotification(null);
    onSelectDhikr(nextDhikr);
    reset();
  }, [nextDhikr, onSelectDhikr, reset]);

  // Repeat current Dhikr
  const repeatCurrentDhikr = useCallback(() => {
    isTransitioningRef.current = false;
    setTransitionNotification(null);
    reset();
  }, [reset]);

  // Continue counting past target
  const continueCounting = useCallback(() => {
    isTransitioningRef.current = false;
    setTransitionNotification(null);
    setTarget((prev) => prev + (activeDhikr.defaultTarget || 33));
  }, [setTarget, activeDhikr]);

  // Rhythm Engine for Cadence Assist
  const {
    bpm: rhythmBpm,
    isPulseActive,
    lastFeedback,
    start: startRhythm,
    stop: stopRhythm,
    registerUserTap,
  } = useRhythmEngine({
    bpm: activeRhythmProfile?.bpm || defaultBpm || 65,
    mode: activeRhythmProfile ? 'custom' : 'bpm',
    profile: activeRhythmProfile,
    onBeat: () => {
      if (rhythmAssistActive && autoCountEnabled && !isPaused) {
        if (advanceMode === 'continuous') {
          increment();
        } else if (advanceMode === 'repeat-same') {
          if (count >= target) {
            reset();
            increment();
          } else {
            increment();
          }
        } else if (advanceMode === 'auto-advance') {
          if (!isTargetReached && count < target && !isTransitioningRef.current) {
            increment();
          }
        } else {
          // Default 'stop' mode: do not count past target
          if (!isTargetReached && count < target) {
            increment();
          }
        }
      }
    },
  });

  // Dedicated immediate sound and auto-count stopping handler
  const handleStopAutoAndSound = useCallback(() => {
    setAutoCountEnabled(false);
    setRhythmAssistActive(false);
    stopRhythm();
    audioService.stopAll();
    showToast(lang === 'ar' ? 'تم إيقاف الصوت والعد التلقائي ⏹' : 'Sound & auto-count stopped');
  }, [lang, stopRhythm]);

  const handleToggleAutoCount = useCallback(() => {
    if (autoCountEnabled || rhythmAssistActive) {
      handleStopAutoAndSound();
    } else {
      setAutoCountEnabled(true);
      setRhythmAssistActive(true);
      startRhythm();
      showToast(lang === 'ar' ? 'تم تفعيل العد التلقائي ▶' : 'Auto-count started');
    }
  }, [autoCountEnabled, rhythmAssistActive, handleStopAutoAndSound, startRhythm, lang]);

  const handleToggleTimer = useCallback(() => {
    toggleTimer();
    // If timer was running and user paused it, also pause/stop cadence sound
    if (isTimerRunning && (autoCountEnabled || rhythmAssistActive)) {
      handleStopAutoAndSound();
    }
  }, [toggleTimer, isTimerRunning, autoCountEnabled, rhythmAssistActive, handleStopAutoAndSound]);

  // Handle target reached based on advanceMode (strictly adheres to user's setting)
  useEffect(() => {
    if (!isTargetReached) {
      setTransitionNotification(null);
      isTransitioningRef.current = false;
      return;
    }

    if (advanceMode === 'auto-advance') {
      isTransitioningRef.current = true;
      const nextName = lang === 'ar' ? nextDhikr.arabic : nextDhikr.transliteration;
      setTransitionNotification(nextName);

      const timer = setTimeout(() => {
        advanceToNextDhikr();
      }, 1400);

      return () => {
        clearTimeout(timer);
      };
    } else if (advanceMode === 'repeat-same') {
      const timer = setTimeout(() => {
        repeatCurrentDhikr();
      }, 1000);
      return () => {
        clearTimeout(timer);
      };
    } else if (advanceMode === 'stop') {
      // Default stop mode: stop any cadence sound and auto-count immediately
      handleStopAutoAndSound();
    }
  }, [isTargetReached, advanceMode, advanceToNextDhikr, repeatCurrentDhikr, nextDhikr, lang, handleStopAutoAndSound]);

  // Rhythm profile activation
  useEffect(() => {
    if (activeRhythmProfile) {
      const stamp = `${activeRhythmProfile.id}-${activeRhythmProfile.appliedAt || activeRhythmProfile.bpm}`;
      if (lastAppliedProfileRef.current !== stamp) {
        lastAppliedProfileRef.current = stamp;
        setRhythmAssistActive(true);
        setAutoCountEnabled(true);
        startRhythm();
      }
    }
  }, [activeRhythmProfile, startRhythm]);

  useEffect(() => {
    return () => {
      stopRhythm();
    };
  }, [stopRhythm]);

  const toggleRhythmAssist = () => {
    if (rhythmAssistActive) {
      stopRhythm();
      setRhythmAssistActive(false);
    } else {
      startRhythm();
      setRhythmAssistActive(true);
    }
  };

  const handleTogglePause = () => {
    togglePause();
    if (rhythmAssistActive) {
      if (!isPaused) {
        stopRhythm();
      } else {
        startRhythm();
      }
    }
  };

  const handleTap = () => {
    if (isTargetReached && advanceMode !== 'continuous') {
      // Tapping at target repeats the SAME Dhikr (never auto-switches to another dhikr without input!)
      repeatCurrentDhikr();
      increment();
      if (rhythmAssistActive) {
        registerUserTap();
      }
      return;
    }

    increment();
    if (rhythmAssistActive) {
      registerUserTap();
    }
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-2 sm:py-4 pb-24 select-none flex flex-col justify-between items-center">
      {/* Toast Notification (e.g. الاهتزاز مفعل) */}
      {toastMessage && (
        <div className="fixed top-20 z-50 px-4 py-2 rounded-full bg-zinc-900/90 border border-amber-500/40 text-amber-300 text-xs font-semibold shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Target Reached / Auto-Advance Transition Banner */}
      {transitionNotification && (
        <div className="w-full max-w-md mb-2 p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 font-medium">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
            <span>{t.targetCompleted}</span>
            <span className="text-zinc-400 font-normal">➔ {transitionNotification}</span>
          </div>
          <button
            onClick={advanceToNextDhikr}
            className="px-2.5 py-1 rounded-lg bg-amber-500 text-black font-bold text-[11px] hover:bg-amber-400 transition cursor-pointer"
          >
            {t.skip}
          </button>
        </div>
      )}

      {/* 1. Top Section: Session Stopwatch & Target Pill (Inspired by Counter Easy [ ⏸ 01:35:19 ↻ ]) */}
      <div className="w-full flex items-center justify-between gap-3 mb-2">
        {/* Session Stopwatch */}
        <SessionTimer
          seconds={sessionSeconds}
          isRunning={isTimerRunning}
          onToggle={handleToggleTimer}
          onReset={resetTimer}
        />

        {/* Current Dhikr Selector Trigger & Target Limit */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSelector(true)}
            id="btn-select-dhikr"
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition cursor-pointer px-3 py-1.5 rounded-2xl bg-zinc-900/70 border border-amber-500/20 backdrop-blur-sm"
          >
            <span>{lang === 'ar' ? 'الأذكار' : 'Adhkar'}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-xl bg-zinc-900/60 border border-white/10 text-zinc-400">
            {target} {lang === 'ar' ? 'تسبيحة' : 'target'}
          </span>
        </div>
      </div>

      {/* 2. Dhikr Title Header */}
      <div className="w-full text-center space-y-1 mb-2">
        <h1
          className="font-arabic text-2xl sm:text-3xl md:text-4xl text-amber-300 font-medium tracking-wide drop-shadow-sm transition-all"
          dir="rtl"
        >
          {activeDhikr.arabic}
        </h1>
        <p className="text-zinc-400 text-xs sm:text-sm font-sans tracking-wide">
          {activeDhikr.transliteration}
        </p>
      </div>

      {/* 3. Quick Action Bar (Auto-Count, %, Haptic, Sound, LCD, Display Mode) */}
      <div className="mb-2">
        <QuickActionBar
          soundEnabled={!!settings?.soundEnabled}
          onToggleSound={handleToggleSound}
          hapticEnabled={!!settings?.hapticEnabled}
          onToggleHaptic={handleToggleHaptic}
          autoCountActive={autoCountEnabled}
          onToggleAutoCount={handleToggleAutoCount}
          showPercentage={showPercentage}
          onTogglePercentage={() => setShowPercentage((prev) => !prev)}
          isDigitalFont={isDigitalFont}
          onToggleDigitalFont={() => setIsDigitalFont((prev) => !prev)}
          displayMode={displayMode}
          onToggleDisplayMode={() => setDisplayMode((prev) => (prev === 'total' ? 'lap' : 'total'))}
        />
      </div>

      {/* Prominent Stop Banner when Auto-Count or Rhythm Cadence is actively running */}
      {(autoCountEnabled || rhythmAssistActive) && (
        <div className="mb-2 flex items-center justify-center animate-in fade-in zoom-in-95 duration-200">
          <button
            type="button"
            onClick={handleStopAutoAndSound}
            id="btn-stop-cadence-banner"
            className="px-4 py-1.5 rounded-full bg-red-500/25 hover:bg-red-500/35 border border-red-500/50 text-red-200 flex items-center gap-2 text-xs font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] cursor-pointer active:scale-95"
          >
            <Square className="w-3.5 h-3.5 fill-current text-red-400" />
            <span>{lang === 'ar' ? 'إيقاف الصوت والعد التلقائي (Stop)' : 'Stop Sound & Auto-Count'}</span>
          </button>
        </div>
      )}

      {/* 4. Center Circular Counter Stage */}
      <div className="relative flex flex-col items-center justify-center my-auto">
        <CircularProgress
          percentage={progressPercentage}
          size={310}
          strokeWidth={3.5}
          isCompleted={isTargetReached}
          showPercentageBadge={showPercentage}
        >
          <TapButton
            onTap={handleTap}
            count={count}
            target={target}
            totalCount={totalCount}
            rounds={rounds}
            displayMode={displayMode}
            isDigitalFont={isDigitalFont}
            onToggleDisplayMode={() => setDisplayMode((prev) => (prev === 'total' ? 'lap' : 'total'))}
            arabicText={undefined} // Already displayed prominently at the top like in Counter Easy!
            isCompleted={isTargetReached}
            disabled={isPaused}
            isRhythmActive={rhythmAssistActive}
            isPulse={isPulseActive}
            rhythmFeedback={lastFeedback}
            rhythmBpm={rhythmBpm}
            isAutoCounting={autoCountEnabled}
            onStopAutoCount={handleStopAutoAndSound}
          />
        </CircularProgress>

        {/* 5. Rounds & Lap Count Status Bar (Directly beneath circular ring - Image 1 & 3) */}
        <div className="flex items-center justify-between w-full max-w-xs sm:max-w-sm px-4 py-2 mt-3 rounded-2xl bg-zinc-950/70 border border-white/5 text-xs font-mono shadow-md backdrop-blur-sm select-none">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <span className="text-zinc-500 font-sans">{lang === 'ar' ? 'الدورات:' : 'Rounds:'}</span>
            <span className="text-amber-400 font-bold text-sm tracking-wide">{rounds}</span>
          </div>

          <div className="flex items-center gap-1.5 text-zinc-300">
            <span className="text-zinc-500 font-sans">{lang === 'ar' ? 'العد:' : 'Count:'}</span>
            <span className="text-zinc-100 font-bold text-sm tracking-wide">{count}</span>
            <span className="text-zinc-500">/ {target}</span>
          </div>
        </div>

        {/* Target Reached Action Bar */}
        {isTargetReached && advanceMode !== 'continuous' && (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-zinc-900/95 border border-amber-500/40 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={repeatCurrentDhikr}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-zinc-950 text-xs font-bold hover:bg-amber-400 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.repeatDhikrBtn}</span>
            </button>
            <button
              onClick={advanceToNextDhikr}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-700 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>{t.nextDhikrBtn}</span>
              <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
            <button
              onClick={continueCounting}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-700 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{t.continueCountingBtn}</span>
            </button>
          </div>
        )}
      </div>

      {/* 6. Counter Bottom Action Dock (Reset, Undo, Big Gold Plus, List, Settings - Image 1 & 3) */}
      <div className="w-full mt-4">
        <CounterBottomDock
          onTap={handleTap}
          onUndo={undo}
          onReset={reset}
          onOpenList={() => setShowSelector(true)}
          onOpenSettings={() => onNavigate?.('settings')}
          canUndo={totalCount > 0}
          disabled={isPaused}
        />
      </div>

      {/* Modals */}
      {showSelector && (
        <DhikrSelectorModal
          adhkar={adhkar}
          selectedId={activeDhikr.id}
          onSelect={onSelectDhikr}
          onClose={() => setShowSelector(false)}
          onOpenCreateCustom={() => setShowCustomModal(true)}
          onDeleteCustom={onDeleteCustomDhikr}
        />
      )}

      {showCustomModal && (
        <CustomDhikrModal
          onSave={onAddCustomDhikr}
          onClose={() => setShowCustomModal(false)}
        />
      )}
    </div>
  );
};
