import { useState, useCallback, useRef } from 'react';
import { RhythmProfile } from '../types';
import { storageService } from '../services/storageService';
import { audioService } from '../services/audioService';
import { hapticService } from '../services/hapticService';

export interface RecordedAnalysis {
  tapCount: number;
  avgInterval: number; // in seconds
  medianInterval: number;
  minInterval: number;
  maxInterval: number;
  bpm: number;
  consistency: number; // percentage 0-100
  intervals: number[];
}

export function useRhythmRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [analysis, setAnalysis] = useState<RecordedAnalysis | null>(null);
  const timestampsRef = useRef<number[]>([]);

  const startRecording = useCallback(() => {
    timestampsRef.current = [];
    setTapCount(0);
    setAnalysis(null);
    setIsRecording(true);
  }, []);

  const cancelRecording = useCallback(() => {
    timestampsRef.current = [];
    setTapCount(0);
    setIsRecording(false);
  }, []);

  const recordTap = useCallback(() => {
    if (!isRecording) return;

    const now = performance.now();
    audioService.playTap();
    hapticService.triggerTap();

    // Ignore accidental double clicks within 150ms
    const timestamps = timestampsRef.current;
    if (timestamps.length > 0) {
      const last = timestamps[timestamps.length - 1];
      if (now - last < 150) {
        return;
      }
    }

    timestamps.push(now);
    setTapCount(timestamps.length);
  }, [isRecording]);

  const finishRecording = useCallback((): RecordedAnalysis | null => {
    setIsRecording(false);
    const timestamps = timestampsRef.current;

    // We need at least 3 taps to compute meaningful intervals
    if (timestamps.length < 3) {
      timestampsRef.current = [];
      setTapCount(0);
      return null;
    }

    // Calculate intervals in seconds between consecutive taps
    // Important per prompt: "Do not calculate BPM from the first tap. Use intervals between consecutive taps. Ignore the first tap when calculating the average interval."
    // Also ignore extreme outliers (> 4s or < 0.2s)
    const rawIntervals: number[] = [];
    for (let i = 1; i < timestamps.length; i++) {
      const deltaSec = (timestamps[i] - timestamps[i - 1]) / 1000;
      if (deltaSec >= 0.18 && deltaSec <= 4.5) {
        rawIntervals.push(deltaSec);
      }
    }

    if (rawIntervals.length < 2) {
      return null;
    }

    // Outlier rejection using standard deviation
    const initialMean = rawIntervals.reduce((a, b) => a + b, 0) / rawIntervals.length;
    const initialVariance = rawIntervals.reduce((acc, v) => acc + Math.pow(v - initialMean, 2), 0) / rawIntervals.length;
    const initialStdDev = Math.sqrt(initialVariance);

    const validIntervals = rawIntervals.filter(v => {
      // Keep within 2.2 std deviations if variance is significant
      if (initialStdDev < 0.05) return true;
      return Math.abs(v - initialMean) <= 2.2 * initialStdDev;
    });

    const finalIntervals = validIntervals.length >= 2 ? validIntervals : rawIntervals;

    // Statistical calculations
    const sum = finalIntervals.reduce((a, b) => a + b, 0);
    const avgInterval = Number((sum / finalIntervals.length).toFixed(3));

    const sorted = [...finalIntervals].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const medianInterval = sorted.length % 2 !== 0
      ? Number(sorted[mid].toFixed(3))
      : Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(3));

    const minInterval = Number(sorted[0].toFixed(3));
    const maxInterval = Number(sorted[sorted.length - 1].toFixed(3));

    // Estimated BPM = 60 / avgInterval (clamped to realistic dhikr pace between 30 and 140 BPM)
    const estimatedBpm = Math.min(140, Math.max(30, Math.round(60 / avgInterval)));

    // Consistency score (0-100%):
    // Based on coefficient of variation (stdDev / mean)
    const variance = finalIntervals.reduce((acc, v) => acc + Math.pow(v - avgInterval, 2), 0) / finalIntervals.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / avgInterval;
    // cv of 0 is 100% consistency, cv of 0.35 or higher is ~20%
    const rawConsistency = Math.round((1 - Math.min(1, cv * 2.2)) * 100);
    const consistency = Math.max(25, Math.min(99, rawConsistency));

    const result: RecordedAnalysis = {
      tapCount: timestamps.length,
      avgInterval,
      medianInterval,
      minInterval,
      maxInterval,
      bpm: estimatedBpm,
      consistency,
      intervals: finalIntervals,
    };

    setAnalysis(result);
    storageService.updateBestConsistency(consistency);
    return result;
  }, []);

  const saveRhythm = useCallback((name: string, customAnalysis?: RecordedAnalysis): RhythmProfile | null => {
    const data = customAnalysis || analysis;
    if (!data) return null;

    const profile: Omit<RhythmProfile, 'id'> = {
      name: name.trim() || `Rhythm ${data.bpm} BPM`,
      recordedAt: Date.now(),
      tapCount: data.tapCount,
      avgInterval: data.avgInterval,
      medianInterval: data.medianInterval,
      minInterval: data.minInterval,
      maxInterval: data.maxInterval,
      bpm: data.bpm,
      consistency: data.consistency,
      intervals: data.intervals,
    };

    return storageService.addRhythm(profile);
  }, [analysis]);

  return {
    isRecording,
    tapCount,
    analysis,
    startRecording,
    recordTap,
    finishRecording,
    cancelRecording,
    saveRhythm,
    setAnalysis,
  };
}
