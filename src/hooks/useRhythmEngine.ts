import { useState, useEffect, useRef, useCallback } from 'react';
import { audioService } from '../services/audioService';
import { hapticService } from '../services/hapticService';
import { RhythmProfile } from '../types';

export interface RhythmTimingFeedback {
  delta: number; // in seconds, e.g. +0.04 or -0.12
  status: 'perfect' | 'early' | 'late';
  timestamp: number;
}

export interface RhythmEngineOptions {
  bpm?: number;
  mode?: 'bpm' | 'custom';
  profile?: RhythmProfile | null;
  enableAudio?: boolean;
  enableHaptic?: boolean;
  onBeat?: (beatNumber: number) => void;
}

export function useRhythmEngine(initialOptions?: RhythmEngineOptions) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState<number>(initialOptions?.bpm || 60);
  const [mode, setMode] = useState<'bpm' | 'custom'>(initialOptions?.mode || 'bpm');
  const [customProfile, setCustomProfile] = useState<RhythmProfile | null>(initialOptions?.profile || null);
  const [beatCount, setBeatCount] = useState<number>(0);
  const [isPulseActive, setIsPulseActive] = useState<boolean>(false);
  const [lastFeedback, setLastFeedback] = useState<RhythmTimingFeedback | null>(null);

  const isPlayingRef = useRef<boolean>(false);
  const bpmRef = useRef<number>(bpm);
  const modeRef = useRef<'bpm' | 'custom'>(mode);
  const profileRef = useRef<RhythmProfile | null>(customProfile);
  const beatCountRef = useRef<number>(0);
  const patternIndexRef = useRef<number>(0);
  const nextBeatTimeRef = useRef<number>(0);
  const timerWorkerIdRef = useRef<number | null>(null);
  const pulseTimeoutRef = useRef<number | null>(null);
  const scheduledTimeoutsRef = useRef<number[]>([]);
  const onBeatRef = useRef<((beatNumber: number) => void) | undefined>(initialOptions?.onBeat);

  // Array of recent beat real-world timestamps (performance.now()) for tap accuracy calculation
  const recentBeatTimestampsRef = useRef<number[]>([]);

  // Keep refs up-to-date
  useEffect(() => {
    onBeatRef.current = initialOptions?.onBeat;
  }, [initialOptions?.onBeat]);
  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    profileRef.current = customProfile;
  }, [customProfile]);

  // Synchronize options when props update (e.g., when a rhythm profile is selected)
  useEffect(() => {
    if (initialOptions?.bpm !== undefined && initialOptions.bpm > 0) {
      setBpm(initialOptions.bpm);
      bpmRef.current = initialOptions.bpm;
    }
    if (initialOptions?.mode !== undefined) {
      setMode(initialOptions.mode);
      modeRef.current = initialOptions.mode;
    }
    if (initialOptions?.profile !== undefined) {
      setCustomProfile(initialOptions.profile);
      profileRef.current = initialOptions.profile;
      if (initialOptions.profile?.bpm) {
        setBpm(initialOptions.profile.bpm);
        bpmRef.current = initialOptions.profile.bpm;
      }
    }
  }, [initialOptions?.bpm, initialOptions?.mode, initialOptions?.profile]);

  const scheduleNextBeats = useCallback(() => {
    if (!isPlayingRef.current) return;

    const now = performance.now();
    const lookAheadMs = 60; // 60ms scheduler interval

    while (nextBeatTimeRef.current <= now + lookAheadMs) {
      const scheduledTime = nextBeatTimeRef.current;
      const delay = Math.max(0, scheduledTime - now);

      // Schedule beat trigger
      const timeoutId = window.setTimeout(() => {
        scheduledTimeoutsRef.current = scheduledTimeoutsRef.current.filter((id) => id !== timeoutId);
        if (!isPlayingRef.current) return;

        beatCountRef.current += 1;
        setBeatCount(beatCountRef.current);

        // Record beat timestamp
        const beatNow = performance.now();
        recentBeatTimestampsRef.current.push(beatNow);
        if (recentBeatTimestampsRef.current.length > 10) {
          recentBeatTimestampsRef.current.shift();
        }

        // Trigger Audio & Haptic
        audioService.playBeatTick();
        hapticService.triggerBeat();

        // Optional onBeat callback (for auto-counting with rhythm)
        if (onBeatRef.current) {
          onBeatRef.current(beatCountRef.current);
        }

        // Visual pulse state
        setIsPulseActive(true);
        if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
        const dynamicPulseMs = Math.min(100, Math.max(35, Math.floor((60000 / bpmRef.current) * 0.2)));
        pulseTimeoutRef.current = window.setTimeout(() => {
          setIsPulseActive(false);
        }, dynamicPulseMs);
      }, delay);

      scheduledTimeoutsRef.current.push(timeoutId);

      // Determine next interval
      let intervalSec = 60 / bpmRef.current;
      if (modeRef.current === 'custom' && profileRef.current && profileRef.current.intervals.length > 0) {
        const intervals = profileRef.current.intervals;
        intervalSec = intervals[patternIndexRef.current % intervals.length];
        patternIndexRef.current += 1;
      }

      nextBeatTimeRef.current += intervalSec * 1000;
    }
  }, []);

  const start = useCallback(() => {
    if (isPlayingRef.current) return;

    // Ensure audio is initialized on user click
    audioService.init();

    isPlayingRef.current = true;
    setIsPlaying(true);
    beatCountRef.current = 0;
    patternIndexRef.current = 0;
    setBeatCount(0);
    recentBeatTimestampsRef.current = [];

    const now = performance.now();
    nextBeatTimeRef.current = now; // First beat starts immediately

    scheduleNextBeats();

    // High frequency scheduler loop (25ms) for drift-free timing
    timerWorkerIdRef.current = window.setInterval(() => {
      scheduleNextBeats();
    }, 25);
  }, [scheduleNextBeats]);

  const stop = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    if (timerWorkerIdRef.current) {
      clearInterval(timerWorkerIdRef.current);
      timerWorkerIdRef.current = null;
    }
    // Cancel all scheduled beat timeouts immediately
    scheduledTimeoutsRef.current.forEach((id) => clearTimeout(id));
    scheduledTimeoutsRef.current = [];

    if (pulseTimeoutRef.current) {
      clearTimeout(pulseTimeoutRef.current);
      pulseTimeoutRef.current = null;
    }
    setIsPulseActive(false);
  }, []);

  const toggle = useCallback(() => {
    if (isPlayingRef.current) {
      stop();
    } else {
      start();
    }
  }, [start, stop]);

  // Rhythm Assist timing evaluation on user tap
  const registerUserTap = useCallback(() => {
    if (!isPlayingRef.current) return null;

    const tapTime = performance.now();
    const beats = recentBeatTimestampsRef.current;

    // Also consider next upcoming beat
    const candidates = [...beats, nextBeatTimeRef.current];
    if (candidates.length === 0) return null;

    let closestDelta = Infinity;
    candidates.forEach((beatTime) => {
      const delta = (tapTime - beatTime) / 1000; // in seconds
      if (Math.abs(delta) < Math.abs(closestDelta)) {
        closestDelta = delta;
      }
    });

    const roundedDelta = Number(closestDelta.toFixed(2));
    let status: 'perfect' | 'early' | 'late' = 'perfect';

    if (roundedDelta < -0.07) {
      status = 'early';
    } else if (roundedDelta > 0.07) {
      status = 'late';
    } else {
      status = 'perfect';
    }

    const feedback: RhythmTimingFeedback = {
      delta: roundedDelta,
      status,
      timestamp: tapTime,
    };

    setLastFeedback(feedback);
    return feedback;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerWorkerIdRef.current) {
        clearInterval(timerWorkerIdRef.current);
      }
      if (pulseTimeoutRef.current) {
        clearTimeout(pulseTimeoutRef.current);
      }
    };
  }, []);

  return {
    isPlaying,
    bpm,
    setBpm,
    mode,
    setMode,
    customProfile,
    setCustomProfile,
    beatCount,
    isPulseActive,
    lastFeedback,
    start,
    stop,
    toggle,
    registerUserTap,
  };
}
