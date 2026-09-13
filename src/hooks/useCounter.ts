import { useState, useCallback, useEffect, useRef } from 'react';
import { Dhikr } from '../types';
import { storageService } from '../services/storageService';
import { audioService } from '../services/audioService';
import { hapticService } from '../services/hapticService';

export interface UseCounterOptions {
  initialDhikr: Dhikr;
  onTargetReached?: (dhikr: Dhikr, count: number) => void;
}

export function useCounter({ initialDhikr, onTargetReached }: UseCounterOptions) {
  const [activeDhikr, setActiveDhikr] = useState<Dhikr>(initialDhikr);
  const [target, setTarget] = useState<number>(initialDhikr.defaultTarget || 33);
  const [totalCount, setTotalCount] = useState<number>(() => {
    return storageService.getMetricForDhikr(initialDhikr.id, initialDhikr.defaultTarget || 33).totalCount || 0;
  });

  // Session Stopwatch Timer (Inspired by Counter Easy)
  const [sessionSeconds, setSessionSeconds] = useState<number>(() => {
    return storageService.getMetricForDhikr(initialDhikr.id, initialDhikr.defaultTarget || 33).timeSeconds || 0;
  });
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isTargetReached, setIsTargetReached] = useState<boolean>(false);

  const sessionStartTimeRef = useRef<number>(Date.now());

  // Mathematically accurate Rounds (Dawrat) and Lap Count (Al-3add):
  // Formula requested by user:
  // "dawRat homa ch7al mRa diRt 100 example ida kan diRt 300 sma homa 3 dawRat"
  // E.g. with target 100:
  // total 100 -> rounds = 1, count = 100
  // total 173 -> rounds = 1, count = 73
  // total 242 -> rounds = 2, count = 42
  // total 300 -> rounds = 3, count = 100
  // total 301 -> rounds = 3, count = 1
  const rounds = target > 0 ? Math.floor(totalCount / target) : 0;
  const count =
    target > 0
      ? totalCount === 0
        ? 0
        : totalCount % target === 0
        ? target
        : totalCount % target
      : totalCount;

  const progressPercentage =
    target > 0 ? Math.min(100, Math.round((count / target) * 100)) : 0;

  // Interval for Session Stopwatch
  useEffect(() => {
    if (!isTimerRunning || isPaused) return;

    const timerInterval = setInterval(() => {
      setSessionSeconds((prev) => {
        const next = prev + 1;
        // Periodically sync to storage every 10 seconds
        if (next % 10 === 0) {
          storageService.updateDhikrMetric(activeDhikr.id, 0, 0, 10);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [isTimerRunning, isPaused, activeDhikr.id]);

  // Sync when initialDhikr changes from props
  useEffect(() => {
    setActiveDhikr(initialDhikr);
  }, [initialDhikr]);

  // Update target and metrics when active Dhikr identity changes
  useEffect(() => {
    const nextTarget = activeDhikr.defaultTarget || 33;
    setTarget(nextTarget);
    const metric = storageService.getMetricForDhikr(activeDhikr.id, nextTarget);
    setTotalCount(metric.totalCount);
    setSessionSeconds(metric.timeSeconds);
    setIsTargetReached(nextTarget > 0 && metric.totalCount > 0 && metric.totalCount % nextTarget === 0);
    sessionStartTimeRef.current = Date.now();
  }, [activeDhikr.id]);

  // Sync isTargetReached when user manually changes target
  useEffect(() => {
    if (target > 0 && totalCount > 0 && totalCount % target === 0) {
      setIsTargetReached(true);
    } else {
      setIsTargetReached(false);
    }
  }, [target, totalCount]);

  const increment = useCallback(() => {
    if (isPaused) return;

    // Automatically resume timer if stopped
    if (!isTimerRunning) {
      setIsTimerRunning(true);
    }

    audioService.playTap();
    hapticService.triggerTap();
    storageService.recordTap();

    setTotalCount((prevTotal) => {
      const nextTotal = prevTotal + 1;
      storageService.setDhikrTotalAndTarget(activeDhikr.id, nextTotal, target, 0);

      const reachedTarget = target > 0 && nextTotal % target === 0;

      if (reachedTarget) {
        setIsTargetReached(true);
        audioService.playCompletionChime();
        hapticService.triggerCompletion();

        const durationSeconds = Math.round((Date.now() - sessionStartTimeRef.current) / 1000);
        storageService.addHistoryEntry({
          title: 'Dhikr Counter',
          dhikrName: activeDhikr.transliteration,
          dhikrArabic: activeDhikr.arabic,
          completedCount: nextTotal,
          targetCount: target,
          durationSeconds: Math.max(1, durationSeconds),
        });

        if (onTargetReached) {
          onTargetReached(activeDhikr, nextTotal);
        }
      } else {
        setIsTargetReached(false);
      }

      return nextTotal;
    });
  }, [isPaused, isTimerRunning, target, activeDhikr, onTargetReached]);

  const undo = useCallback(() => {
    setTotalCount((prevTotal) => {
      if (prevTotal <= 0) return 0;
      const nextTotal = prevTotal - 1;
      storageService.setDhikrTotalAndTarget(activeDhikr.id, nextTotal, target, 0);
      setIsTargetReached(target > 0 && nextTotal > 0 && nextTotal % target === 0);
      return nextTotal;
    });
  }, [target, activeDhikr.id]);

  const reset = useCallback(() => {
    setTotalCount((prevTotal) => {
      // If user is inside a lap (e.g. 173 with target 100), reset back to start of current round (100).
      // If already at start of round or <= target, reset all to 0.
      if (target > 0 && prevTotal > target && prevTotal % target !== 0) {
        const roundBase = Math.floor(prevTotal / target) * target;
        storageService.setDhikrTotalAndTarget(activeDhikr.id, roundBase, target, 0);
        setIsTargetReached(false);
        return roundBase;
      }
      storageService.setDhikrTotalAndTarget(activeDhikr.id, 0, target, 0);
      setIsTargetReached(false);
      return 0;
    });
    sessionStartTimeRef.current = Date.now();
  }, [target, activeDhikr.id]);

  const resetAll = useCallback(() => {
    setTotalCount(0);
    setSessionSeconds(0);
    setIsTargetReached(false);
    storageService.resetDhikrMetric(activeDhikr.id);
  }, [activeDhikr.id]);

  const toggleTimer = useCallback(() => {
    setIsTimerRunning((prev) => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setSessionSeconds(0);
    storageService.updateDhikrMetric(activeDhikr.id, 0, 0, -sessionSeconds);
  }, [activeDhikr.id, sessionSeconds]);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  return {
    activeDhikr,
    setActiveDhikr,
    count,
    setCount: (val: number | ((prev: number) => number)) => {
      if (typeof val === 'number') {
        setTotalCount(val);
      } else {
        setTotalCount((prev) => val(prev));
      }
    },
    totalCount,
    rounds,
    setRounds: (_val: number | ((prev: number) => number)) => {
      // rounds is derived from totalCount / target
    },
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
    resetAll,
    togglePause,
  };
}
