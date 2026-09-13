export interface Dhikr {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  defaultTarget: number;
  isCustom?: boolean;
  category?: 'daily' | 'tasbih' | 'forgiveness' | 'praise' | 'custom';
}

export interface SessionItem {
  dhikrId: string;
  arabic: string;
  transliteration: string;
  translation?: string;
  target: number;
}

export interface Session {
  id: string;
  name: string;
  nameAr?: string;
  items: SessionItem[];
  bpm?: number;
  rhythmMode: 'none' | 'bpm' | 'custom';
  enableSound: boolean;
  enableHaptic: boolean;
  isPreset?: boolean;
  createdAt: number;
}

export interface RhythmProfile {
  id: string;
  name: string;
  recordedAt: number;
  tapCount: number;
  avgInterval: number; // in seconds
  medianInterval: number;
  minInterval: number;
  maxInterval: number;
  bpm: number;
  consistency: number; // percentage 0-100
  intervals: number[]; // stored sequence of tap intervals (in seconds)
  appliedAt?: number;
}

export type SoundType =
  | 'soft-bell'
  | 'wood-click'
  | 'water-drop'
  | 'crystal'
  | 'tibetan-bowl'
  | 'bamboo'
  | 'ceramic'
  | 'gentle-pulse'
  | 'reed-pipe'
  | 'stone-pebble'
  | 'soft-click'
  | 'silent';

export interface DhikrMetric {
  totalCount: number;
  laps: number;
  timeSeconds: number;
}

export interface Settings {
  appearance: 'dark' | 'emerald' | 'light' | 'system';
  language: 'en' | 'ar';
  soundEnabled: boolean;
  soundType: SoundType;
  volume: number; // 0 to 1
  hapticEnabled: boolean;
  defaultBpm: number;
  defaultRhythmMode: 'none' | 'bpm' | 'custom';
  autoAdvance: boolean;
  keepScreenAwake: boolean;
  hasCompletedOnboarding: boolean;
  digitalDisplay?: boolean;
  showPercentageBubble?: boolean;
}

export interface HistoryEntry {
  id: string;
  title: string;
  titleAr?: string;
  dhikrName: string;
  dhikrArabic: string;
  completedCount: number;
  targetCount: number;
  bpm?: number;
  durationSeconds: number;
  timestamp: number;
  sessionId?: string;
}

export interface Statistics {
  totalDhikrCounted: number;
  sessionsCompleted: number;
  totalTaps: number;
  totalTimeSeconds: number;
  dhikrFrequency: Record<string, number>;
  bestConsistency: number;
  lastActiveDate: string;
  mostUsedDhikr?: string;
  avgSessionDurationSeconds?: number;
}

export type ActivePage = 'counter' | 'rhythm' | 'sessions' | 'history' | 'statistics' | 'settings';

export interface RhythmAssistState {
  enabled: boolean;
  bpm: number;
  mode: 'bpm' | 'custom';
  lastBeatTime: number;
  userOffset: number | null; // delta in seconds between tap and closest beat
  offsetStatus: 'perfect' | 'early' | 'late' | null;
}
