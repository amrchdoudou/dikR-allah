/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActivePage, Dhikr, Session, RhythmProfile, Settings, HistoryEntry, Statistics } from './types';
import { storageService } from './services/storageService';
import { audioService } from './services/audioService';
import { hapticService } from './services/hapticService';
import { wakeLockService } from './services/wakeLockService';
import { useTranslation } from './hooks/useTranslation';

import { Header } from './components/common/Header';
import { Navbar } from './components/common/Navbar';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { OnboardingModal } from './components/common/OnboardingModal';
import { SessionRunner } from './components/sessions/SessionRunner';

import { CounterPage } from './pages/CounterPage';
import { RhythmPage } from './pages/RhythmPage';
import { SessionsPage } from './pages/SessionsPage';
import { HistoryPage } from './pages/HistoryPage';
import { StatisticsPage } from './pages/StatisticsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  const { lang } = useTranslation();

  // Primary State
  const [activePage, setActivePage] = useState<ActivePage>('counter');
  const [adhkar, setAdhkar] = useState<Dhikr[]>([]);
  const [activeDhikr, setActiveDhikr] = useState<Dhikr | null>(null);
  const [savedRhythms, setSavedRhythms] = useState<RhythmProfile[]>([]);
  const [activeRhythmProfile, setActiveRhythmProfile] = useState<RhythmProfile | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeRunningSession, setActiveRunningSession] = useState<Session | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [statistics, setStatistics] = useState<Statistics>(storageService.getStatistics());
  const [settings, setSettings] = useState<Settings>(storageService.getSettings());
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(true);

  // Initial Data Load
  useEffect(() => {
    const loadedAdhkar = storageService.getAdhkar();
    const loadedRhythms = storageService.getRhythms();
    const loadedSessions = storageService.getSessions();
    const loadedHistory = storageService.getHistory();
    const loadedStats = storageService.getStatistics();
    const loadedSettings = storageService.getSettings();
    const onboardingDone = storageService.hasCompletedOnboarding();

    setAdhkar(loadedAdhkar);
    setActiveDhikr(loadedAdhkar[0] || null);
    setSavedRhythms(loadedRhythms);
    setSessions(loadedSessions);
    setHistory(loadedHistory);
    setStatistics(loadedStats);
    setSettings(loadedSettings);
    setHasCompletedOnboarding(onboardingDone);

    // Synchronize services with loaded settings
    audioService.setEnabled(loadedSettings.soundEnabled);
    audioService.setVolume(loadedSettings.volume);
    audioService.setSoundType(loadedSettings.soundType);
    hapticService.setEnabled(loadedSettings.hapticEnabled);

    if (loadedSettings.keepScreenAwake) {
      wakeLockService.request();
    }
  }, []);

  // Sync html dir attribute for Arabic layout support
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const handleToggleSound = () => {
    const updated = !settings.soundEnabled;
    const newSettings = { ...settings, soundEnabled: updated };
    setSettings(newSettings);
    storageService.saveSettings(newSettings);
    audioService.setEnabled(updated);
  };

  const handleSelectDhikr = (dhikr: Dhikr) => {
    setActiveDhikr(dhikr);
  };

  const handleAddCustomDhikr = (custom: Omit<Dhikr, 'id'>) => {
    const created = storageService.addCustomDhikr(custom);
    setAdhkar(storageService.getAdhkar());
    setActiveDhikr(created);
  };

  const handleDeleteCustomDhikr = (id: string) => {
    storageService.deleteCustomDhikr(id);
    const updated = storageService.getAdhkar();
    setAdhkar(updated);
    if (activeDhikr?.id === id) {
      setActiveDhikr(updated[0] || null);
    }
  };

  const handleSaveRhythm = (profile: RhythmProfile) => {
    setSavedRhythms(storageService.getRhythms());
    setActiveRhythmProfile(profile);
  };

  const handleDeleteRhythm = (id: string) => {
    storageService.deleteRhythm(id);
    setSavedRhythms(storageService.getRhythms());
    if (activeRhythmProfile?.id === id) {
      setActiveRhythmProfile(null);
    }
  };

  const handleSelectActiveRhythm = (profile: RhythmProfile) => {
    setActiveRhythmProfile({ ...profile, appliedAt: Date.now() });
    setActivePage('counter');
  };

  const handleSaveSession = (newSession: Omit<Session, 'id' | 'createdAt'>) => {
    storageService.addSession(newSession);
    setSessions(storageService.getSessions());
  };

  const handleDeleteSession = (id: string) => {
    storageService.deleteSession(id);
    setSessions(storageService.getSessions());
  };

  const handleClearHistory = () => {
    storageService.clearHistory();
    setHistory([]);
  };

  const handleDeleteHistoryEntry = (id: string) => {
    storageService.deleteHistoryEntry(id);
    setHistory(storageService.getHistory());
  };

  const handleOnboardingComplete = (chosenDhikr: Dhikr) => {
    storageService.setOnboardingComplete();
    setHasCompletedOnboarding(true);
    setActiveDhikr(chosenDhikr);
  };

  const handleDataReset = () => {
    setAdhkar(storageService.getAdhkar());
    setActiveDhikr(storageService.getAdhkar()[0]);
    setSavedRhythms([]);
    setActiveRhythmProfile(null);
    setSessions(storageService.getSessions());
    setHistory([]);
    setStatistics(storageService.getStatistics());
  };

  // If a session is actively running, show the dedicated full-screen calm session interface
  if (activeRunningSession) {
    return (
      <SessionRunner
        session={activeRunningSession}
        onExit={() => {
          setActiveRunningSession(null);
          setHistory(storageService.getHistory());
          setStatistics(storageService.getStatistics());
        }}
      />
    );
  }

  const isEmerald = settings.appearance === 'emerald';
  const isLight = settings.appearance === 'light';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans selection:bg-amber-500 selection:text-black overflow-x-hidden transition-colors duration-300 ${
        isEmerald
          ? 'bg-[#082624] text-white bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0d3b37] via-[#092b28] to-[#061e1c]'
          : isLight
          ? 'bg-zinc-100 text-zinc-900'
          : 'bg-[#080808] text-white'
      }`}
    >
      <OfflineIndicator />

      {/* Top Header */}
      <Header
        soundEnabled={settings.soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main View Container */}
      <main className="flex-1 flex flex-col">
        {activePage === 'counter' && activeDhikr && (
          <CounterPage
            adhkar={adhkar}
            activeDhikr={activeDhikr}
            onSelectDhikr={handleSelectDhikr}
            onAddCustomDhikr={handleAddCustomDhikr}
            onDeleteCustomDhikr={handleDeleteCustomDhikr}
            activeRhythmProfile={activeRhythmProfile}
            defaultBpm={settings.defaultBpm}
            settings={settings}
            onUpdateSettings={(newS) => {
              setSettings(newS);
              storageService.saveSettings(newS);
            }}
            onNavigate={(page) => setActivePage(page)}
          />
        )}

        {activePage === 'rhythm' && (
          <RhythmPage
            savedRhythms={savedRhythms}
            onSaveRhythm={handleSaveRhythm}
            onDeleteRhythm={handleDeleteRhythm}
            onSelectActiveRhythm={handleSelectActiveRhythm}
            activeRhythmId={activeRhythmProfile?.id}
            defaultBpm={settings.defaultBpm}
          />
        )}

        {activePage === 'sessions' && (
          <SessionsPage
            sessions={sessions}
            allAdhkar={adhkar}
            onStartSession={(session) => setActiveRunningSession(session)}
            onSaveSession={handleSaveSession}
            onDeleteSession={handleDeleteSession}
          />
        )}

        {activePage === 'history' && (
          <HistoryPage
            history={history}
            onClearHistory={handleClearHistory}
            onDeleteEntry={handleDeleteHistoryEntry}
          />
        )}

        {activePage === 'statistics' && (
          <StatisticsPage statistics={statistics} />
        )}

        {activePage === 'settings' && (
          <SettingsPage
            settings={settings}
            onUpdateSettings={(s) => setSettings(s)}
            onDataReset={handleDataReset}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation */}
      <Navbar
        activePage={activePage}
        onSelectPage={(page) => {
          setActivePage(page);
          // Refresh statistics and history when switching to those tabs
          if (page === 'statistics') {
            setStatistics(storageService.getStatistics());
          }
          if (page === 'history') {
            setHistory(storageService.getHistory());
          }
        }}
      />

      {/* First-Run Onboarding Experience */}
      {!hasCompletedOnboarding && adhkar.length > 0 && (
        <OnboardingModal
          adhkar={adhkar}
          onComplete={handleOnboardingComplete}
        />
      )}
    </div>
  );
}
