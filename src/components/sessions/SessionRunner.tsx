import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, X, CheckCircle2 } from 'lucide-react';
import { Session, SessionItem } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { useRhythmEngine } from '../../hooks/useRhythmEngine';
import { audioService } from '../../services/audioService';
import { hapticService } from '../../services/hapticService';
import { storageService } from '../../services/storageService';
import { wakeLockService } from '../../services/wakeLockService';

interface SessionRunnerProps {
  session: Session;
  onExit: () => void;
}

export const SessionRunner: React.FC<SessionRunnerProps> = ({ session, onExit }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const sessionStartRef = useRef(Date.now());
  const totalSessionCountRef = useRef(0);

  const currentItem: SessionItem | undefined = session.items[currentIndex];
  const target = currentItem ? currentItem.target : 33;
  const bpm = session.bpm || 65;

  // Initialize rhythm engine for the session
  const {
    isPlaying: isRhythmPlaying,
    isPulseActive,
    start: startRhythm,
    stop: stopRhythm,
    toggle: toggleRhythm,
  } = useRhythmEngine({
    bpm,
    mode: 'bpm',
  });

  // Start rhythm and wake lock when session mounts
  useEffect(() => {
    wakeLockService.request();
    if (session.rhythmMode !== 'none') {
      startRhythm();
    }
    return () => {
      stopRhythm();
      wakeLockService.release();
    };
  }, [session, startRhythm, stopRhythm]);

  const handleTap = (e?: React.PointerEvent<HTMLButtonElement>) => {
    if (isPaused || isCompleted || !currentItem) return;

    audioService.playTap();
    hapticService.triggerTap();
    storageService.recordTap();
    totalSessionCountRef.current += 1;

    // Visual ripple
    const newRipple = {
      id: Date.now() + Math.random(),
      x: e ? e.nativeEvent.offsetX : 130,
      y: e ? e.nativeEvent.offsetY : 130,
    };
    setRipples((prev) => [...prev.slice(-3), newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 500);

    const nextCount = count + 1;
    setCount(nextCount);

    if (nextCount >= target) {
      audioService.playCompletionChime();
      hapticService.triggerCompletion();

      // Check if there is a next Dhikr
      if (currentIndex < session.items.length - 1) {
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
          setCount(0);
        }, 350);
      } else {
        // Entire session completed!
        setIsCompleted(true);
        stopRhythm();

        const durationSec = Math.max(1, Math.round((Date.now() - sessionStartRef.current) / 1000));
        storageService.addHistoryEntry({
          title: session.name,
          titleAr: session.nameAr,
          dhikrName: session.items.map((i) => i.transliteration).join(', '),
          dhikrArabic: session.items.map((i) => i.arabic).join(' • '),
          completedCount: totalSessionCountRef.current,
          targetCount: session.items.reduce((acc, it) => acc + it.target, 0),
          bpm,
          durationSeconds: durationSec,
          sessionId: session.id,
        });
        storageService.recordSessionCompleted();
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setCount(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < session.items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setCount(0);
    } else {
      setIsCompleted(true);
    }
  };

  const handleTogglePause = () => {
    setIsPaused((prev) => {
      const next = !prev;
      if (next) {
        stopRhythm();
      } else {
        startRhythm();
      }
      return next;
    });
  };

  if (isCompleted) {
    return (
      <div className="fixed inset-0 z-50 bg-[#080808] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6 text-emerald-400">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h2 className="text-3xl font-light text-zinc-100 tracking-tight mb-2">
          {t.sessionCompletedTitle}
        </h2>
        <p className="text-sm text-zinc-400 max-w-sm leading-relaxed mb-8">
          {t.sessionCompletedSubtitle}
        </p>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 text-xs text-zinc-400 space-y-1 mb-8 w-full max-w-xs font-mono">
          <div className="text-zinc-200">{session.name}</div>
          <div className="text-amber-500 font-bold">{totalSessionCountRef.current} repetitions completed</div>
        </div>

        <button
          onClick={onExit}
          id="btn-finish-session-completed"
          className="px-8 py-3.5 rounded-2xl bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10 active:scale-95 cursor-pointer"
        >
          {t.finishAndSave}
        </button>
      </div>
    );
  }

  const overallProgress = Math.round(((currentIndex + count / target) / session.items.length) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-[#080808] flex flex-col justify-between p-4 sm:p-8 select-none">
      {/* Top Header matching design HTML */}
      <div className="w-full max-w-3xl mx-auto flex items-start justify-between">
        <div className="space-y-1.5 flex-1 pr-4">
          <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">
            Current Session
          </span>
          <h2 className="text-2xl sm:text-3xl font-light text-zinc-100 tracking-tight">
            {session.name}
          </h2>
          <p className="text-zinc-500 text-xs sm:text-sm">
            Progressing through {currentIndex + 1} of {session.items.length} Dhikr
          </p>
          <div className="h-1 w-full max-w-md bg-zinc-900 rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        <button
          onClick={onExit}
          id="btn-exit-session"
          className="p-2.5 rounded-full bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
          title="Exit session"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Center Section: Dhikr text & Glowing circular tap button */}
      <div className="flex flex-col items-center text-center my-auto relative">
        <div className="absolute inset-0 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

        <button
          onClick={handleTap}
          id="btn-session-tap"
          disabled={isPaused}
          className={`relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-full border border-white/10 flex flex-col items-center justify-center bg-zinc-900/20 backdrop-blur-sm cursor-pointer select-none overflow-hidden touch-manipulation active:scale-95 transition-transform ${
            isPaused ? 'opacity-60' : 'hover:border-amber-500/30'
          }`}
        >
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              className="absolute rounded-full bg-amber-500/20 pointer-events-none animate-ping duration-500"
              style={{
                width: 140,
                height: 140,
                left: ripple.x - 70,
                top: ripple.y - 70,
              }}
            />
          ))}

          {/* Concentric subtle tasbih ring */}
          <div className="absolute inset-3 rounded-full border border-white/5 pointer-events-none" />

          {/* Arabic text */}
          <div
            className="text-3xl sm:text-4xl md:text-5xl font-arabic text-amber-500 leading-tight rtl px-4 text-center line-clamp-1 mb-1 drop-shadow-sm"
            dir="rtl"
          >
            {currentItem?.arabic}
          </div>

          <div className="flex flex-col items-center">
            <span className="text-5xl sm:text-6xl md:text-7xl font-light leading-none tracking-tight text-zinc-100 font-mono">
              {count}
            </span>
            <span className="text-lg sm:text-xl text-zinc-500 mt-1 font-light font-mono">
              / {target}
            </span>
          </div>

          <div className="text-zinc-500 text-[10px] sm:text-xs tracking-[0.25em] uppercase font-medium mt-2.5">
            {t.tapPrompt}
          </div>
        </button>

        <div className="text-xs text-zinc-400 mt-4 max-w-xs line-clamp-1">
          {currentItem?.transliteration}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className="font-mono text-xs text-zinc-500">{bpm} BPM</span>
          <span
            className={`w-2 h-2 rounded-full transition-all duration-100 ${
              isPulseActive
                ? 'bg-amber-400 scale-150 shadow-[0_0_8px_#f59e0b]'
                : 'bg-zinc-700 scale-95'
            }`}
          />
        </div>
      </div>

      {/* Bottom Controls: Previous | Pause | Next */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between pb-safe pt-4">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          id="btn-session-prev"
          className="flex items-center gap-1 px-4 py-2.5 rounded-2xl bg-zinc-900 border border-white/10 text-xs font-semibold text-zinc-400 hover:text-white disabled:opacity-30 transition"
        >
          <ChevronLeft className="w-4 h-4 text-amber-500" />
          <span>{t.previousDhikr}</span>
        </button>

        <button
          onClick={handleTogglePause}
          id="btn-session-pause"
          className="flex items-center gap-1.5 px-6 py-2.5 rounded-2xl bg-zinc-900 border border-white/10 text-xs font-bold text-zinc-200 hover:text-white active:scale-95 transition"
        >
          {isPaused ? <Play className="w-4 h-4 text-amber-400 fill-amber-400" /> : <Pause className="w-4 h-4 text-amber-500" />}
          <span>{isPaused ? t.resume : t.pause}</span>
        </button>

        <button
          onClick={handleNext}
          id="btn-session-next"
          className="flex items-center gap-1 px-4 py-2.5 rounded-2xl bg-zinc-900 border border-white/10 text-xs font-semibold text-zinc-400 hover:text-white transition"
        >
          <span>{t.nextDhikr}</span>
          <ChevronRight className="w-4 h-4 text-amber-500" />
        </button>
      </div>
    </div>
  );
};
