import { Dhikr, Session, RhythmProfile, Settings, HistoryEntry, Statistics, DhikrMetric } from '../types';
import { INITIAL_ADHKAR } from '../data/initialAdhkar';
import { DEFAULT_SESSIONS } from '../data/defaultSessions';

const KEYS = {
  ADHKAR: 'dhikrflow_adhkar',
  SESSIONS: 'dhikrflow_sessions',
  RHYTHMS: 'dhikrflow_rhythms',
  SETTINGS: 'dhikrflow_settings',
  HISTORY: 'dhikrflow_history',
  STATISTICS: 'dhikrflow_statistics',
  CURRENT_DHIKR: 'dhikrflow_active_dhikr_id',
  DHIKR_METRICS: 'dhikrflow_dhikr_metrics',
};

const DEFAULT_SETTINGS: Settings = {
  appearance: 'emerald', // Inspired by Counter Easy's beautiful Islamic emerald look
  language: 'ar',
  soundEnabled: false, // Audio off by default
  soundType: 'soft-bell',
  volume: 0.6,
  hapticEnabled: true,
  defaultBpm: 60,
  defaultRhythmMode: 'bpm',
  autoAdvance: false,
  keepScreenAwake: true,
  hasCompletedOnboarding: false,
  digitalDisplay: true,
  showPercentageBubble: true,
};

const DEFAULT_STATISTICS: Statistics = {
  totalDhikrCounted: 0,
  sessionsCompleted: 0,
  totalTaps: 0,
  totalTimeSeconds: 0,
  dhikrFrequency: {},
  bestConsistency: 0,
  lastActiveDate: new Date().toISOString().split('T')[0],
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (err) {
    console.warn(`Error reading localStorage key "${key}":`, err);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing localStorage key "${key}":`, err);
  }
}

export const storageService = {
  // Adhkar
  getAdhkar(): Dhikr[] {
    const stored = safeGet<Dhikr[] | null>(KEYS.ADHKAR, null);
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      safeSet(KEYS.ADHKAR, INITIAL_ADHKAR);
      return INITIAL_ADHKAR;
    }
    return stored;
  },

  saveAdhkar(adhkar: Dhikr[]): void {
    safeSet(KEYS.ADHKAR, adhkar);
  },

  addCustomDhikr(dhikr: Omit<Dhikr, 'id'>): Dhikr {
    const all = this.getAdhkar();
    const newDhikr: Dhikr = {
      ...dhikr,
      id: `custom-${Date.now()}`,
      isCustom: true,
      category: 'custom',
    };
    all.push(newDhikr);
    this.saveAdhkar(all);
    return newDhikr;
  },

  deleteCustomDhikr(id: string): void {
    const all = this.getAdhkar().filter(d => d.id !== id);
    this.saveAdhkar(all);
  },

  getActiveDhikrId(): string {
    return safeGet<string>(KEYS.CURRENT_DHIKR, INITIAL_ADHKAR[0].id);
  },

  setActiveDhikrId(id: string): void {
    safeSet(KEYS.CURRENT_DHIKR, id);
  },

  // Per-Dhikr Metrics (Count, Laps, Timer - Inspired by Counter Easy)
  getDhikrMetrics(): Record<string, DhikrMetric> {
    return safeGet<Record<string, DhikrMetric>>(KEYS.DHIKR_METRICS, {});
  },

  getMetricForDhikr(id: string, target = 33): DhikrMetric {
    const all = this.getDhikrMetrics();
    const metric = all[id] || { totalCount: 0, laps: 0, timeSeconds: 0 };
    // Accurately sanitize laps based on user formula: rounds = Math.floor(totalCount / target)
    const validLaps = target > 0 ? Math.floor((metric.totalCount || 0) / target) : 0;
    return {
      totalCount: metric.totalCount || 0,
      laps: validLaps,
      timeSeconds: metric.timeSeconds || 0,
    };
  },

  setDhikrTotalAndTarget(id: string, totalCount: number, target = 33, deltaTimeSeconds = 0): DhikrMetric {
    const all = this.getDhikrMetrics();
    const current = all[id] || { totalCount: 0, laps: 0, timeSeconds: 0 };
    const validTotal = Math.max(0, totalCount);
    const validLaps = target > 0 ? Math.floor(validTotal / target) : 0;
    const updated: DhikrMetric = {
      totalCount: validTotal,
      laps: validLaps,
      timeSeconds: Math.max(0, current.timeSeconds + deltaTimeSeconds),
    };
    all[id] = updated;
    safeSet(KEYS.DHIKR_METRICS, all);
    return updated;
  },

  updateDhikrMetric(id: string, deltaCount: number, deltaLaps: number, deltaTimeSeconds: number): DhikrMetric {
    const all = this.getDhikrMetrics();
    const current = all[id] || { totalCount: 0, laps: 0, timeSeconds: 0 };
    const nextTotal = Math.max(0, current.totalCount + deltaCount);
    const updated: DhikrMetric = {
      totalCount: nextTotal,
      laps: Math.max(0, current.laps + deltaLaps),
      timeSeconds: Math.max(0, current.timeSeconds + deltaTimeSeconds),
    };
    all[id] = updated;
    safeSet(KEYS.DHIKR_METRICS, all);
    return updated;
  },

  resetDhikrMetric(id: string): void {
    const all = this.getDhikrMetrics();
    all[id] = { totalCount: 0, laps: 0, timeSeconds: 0 };
    safeSet(KEYS.DHIKR_METRICS, all);
  },

  // Sessions
  getSessions(): Session[] {
    const stored = safeGet<Session[] | null>(KEYS.SESSIONS, null);
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      safeSet(KEYS.SESSIONS, DEFAULT_SESSIONS);
      return DEFAULT_SESSIONS;
    }
    return stored;
  },

  saveSessions(sessions: Session[]): void {
    safeSet(KEYS.SESSIONS, sessions);
  },

  addSession(session: Omit<Session, 'id' | 'createdAt'>): Session {
    const all = this.getSessions();
    const newSession: Session = {
      ...session,
      id: `session-${Date.now()}`,
      createdAt: Date.now(),
    };
    all.push(newSession);
    this.saveSessions(all);
    return newSession;
  },

  deleteSession(id: string): void {
    const all = this.getSessions().filter(s => s.id !== id);
    this.saveSessions(all);
  },

  // Rhythms
  getRhythms(): RhythmProfile[] {
    return safeGet<RhythmProfile[]>(KEYS.RHYTHMS, []);
  },

  saveRhythms(rhythms: RhythmProfile[]): void {
    safeSet(KEYS.RHYTHMS, rhythms);
  },

  addRhythm(profile: Omit<RhythmProfile, 'id'>): RhythmProfile {
    const all = this.getRhythms();
    const newProfile: RhythmProfile = {
      ...profile,
      id: `rhythm-${Date.now()}`,
    };
    all.push(newProfile);
    this.saveRhythms(all);
    return newProfile;
  },

  deleteRhythm(id: string): void {
    const all = this.getRhythms().filter(r => r.id !== id);
    this.saveRhythms(all);
  },

  // Settings
  getSettings(): Settings {
    const stored = safeGet<Settings | null>(KEYS.SETTINGS, null);
    if (!stored) {
      safeSet(KEYS.SETTINGS, DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...stored };
  },

  saveSettings(settings: Settings): void {
    safeSet(KEYS.SETTINGS, settings);
  },

  // History
  getHistory(): HistoryEntry[] {
    return safeGet<HistoryEntry[]>(KEYS.HISTORY, []);
  },

  addHistoryEntry(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): HistoryEntry {
    const all = this.getHistory();
    const newEntry: HistoryEntry = {
      ...entry,
      id: `history-${Date.now()}`,
      timestamp: Date.now(),
    };
    all.unshift(newEntry);
    // Keep last 100 history records
    if (all.length > 100) all.length = 100;
    safeSet(KEYS.HISTORY, all);

    // Also update statistics automatically
    this.recordStatsAfterCount(
      newEntry.completedCount,
      newEntry.dhikrArabic,
      newEntry.durationSeconds
    );

    return newEntry;
  },

  clearHistory(): void {
    safeSet(KEYS.HISTORY, []);
  },

  deleteHistoryEntry(id: string): void {
    const all = this.getHistory().filter(h => h.id !== id);
    safeSet(KEYS.HISTORY, all);
  },

  // Statistics
  getStatistics(): Statistics {
    const stored = safeGet<Statistics | null>(KEYS.STATISTICS, null);
    const stats = stored ? { ...DEFAULT_STATISTICS, ...stored } : { ...DEFAULT_STATISTICS };

    // Calculate most used Dhikr
    let topDhikr = '';
    let topCount = 0;
    Object.entries(stats.dhikrFrequency || {}).forEach(([dhikr, cnt]) => {
      if (cnt > topCount) {
        topCount = cnt;
        topDhikr = dhikr;
      }
    });
    stats.mostUsedDhikr = topDhikr || undefined;

    // Calculate average session duration
    if (stats.sessionsCompleted > 0) {
      stats.avgSessionDurationSeconds = Math.round(stats.totalTimeSeconds / stats.sessionsCompleted);
    } else {
      stats.avgSessionDurationSeconds = stats.totalTimeSeconds;
    }

    return stats;
  },

  saveStatistics(stats: Statistics): void {
    safeSet(KEYS.STATISTICS, stats);
  },

  hasCompletedOnboarding(): boolean {
    return this.getSettings().hasCompletedOnboarding;
  },

  setOnboardingComplete(): void {
    const current = this.getSettings();
    this.saveSettings({ ...current, hasCompletedOnboarding: true });
  },

  exportAllData(): string {
    return this.exportFullData();
  },

  importData(jsonString: string): boolean {
    return this.importFullData(jsonString).success;
  },

  recordTap(): void {
    const stats = this.getStatistics();
    stats.totalTaps += 1;
    this.saveStatistics(stats);
  },

  recordStatsAfterCount(count: number, dhikrName: string, durationSeconds: number): void {
    const stats = this.getStatistics();
    stats.totalDhikrCounted += count;
    stats.totalTimeSeconds += Math.max(0, durationSeconds);
    stats.dhikrFrequency[dhikrName] = (stats.dhikrFrequency[dhikrName] || 0) + count;
    stats.lastActiveDate = new Date().toISOString().split('T')[0];
    this.saveStatistics(stats);
  },

  recordSessionCompleted(): void {
    const stats = this.getStatistics();
    stats.sessionsCompleted += 1;
    this.saveStatistics(stats);
  },

  updateBestConsistency(score: number): void {
    const stats = this.getStatistics();
    if (score > stats.bestConsistency) {
      stats.bestConsistency = Math.round(score);
      this.saveStatistics(stats);
    }
  },

  // Export / Import
  exportFullData(): string {
    const bundle = {
      version: 1,
      exportedAt: new Date().toISOString(),
      adhkar: this.getAdhkar(),
      sessions: this.getSessions(),
      rhythms: this.getRhythms(),
      settings: this.getSettings(),
      history: this.getHistory(),
      statistics: this.getStatistics(),
    };
    return JSON.stringify(bundle, null, 2);
  },

  importFullData(jsonString: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, message: 'Invalid JSON file structure.' };
      }

      if (Array.isArray(parsed.adhkar)) safeSet(KEYS.ADHKAR, parsed.adhkar);
      if (Array.isArray(parsed.sessions)) safeSet(KEYS.SESSIONS, parsed.sessions);
      if (Array.isArray(parsed.rhythms)) safeSet(KEYS.RHYTHMS, parsed.rhythms);
      if (parsed.settings && typeof parsed.settings === 'object') safeSet(KEYS.SETTINGS, parsed.settings);
      if (Array.isArray(parsed.history)) safeSet(KEYS.HISTORY, parsed.history);
      if (parsed.statistics && typeof parsed.statistics === 'object') safeSet(KEYS.STATISTICS, parsed.statistics);

      return { success: true, message: 'Data restored successfully.' };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown parsing error';
      return { success: false, message: `Import error: ${errorMsg}` };
    }
  },

  clearAllData(): void {
    try {
      Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    } catch (err) {
      console.warn('Error clearing localStorage:', err);
    }
  },
};
