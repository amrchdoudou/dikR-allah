import React, { useState } from 'react';
import { Plus, Play, Layers, Trash2, Clock, Activity, Volume2, Smartphone } from 'lucide-react';
import { Session, Dhikr } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { SessionBuilderModal } from '../components/sessions/SessionBuilderModal';

interface SessionsPageProps {
  sessions: Session[];
  allAdhkar: Dhikr[];
  onStartSession: (session: Session) => void;
  onSaveSession: (session: Omit<Session, 'id' | 'createdAt'>) => void;
  onDeleteSession: (id: string) => void;
}

export const SessionsPage: React.FC<SessionsPageProps> = ({
  sessions,
  allAdhkar,
  onStartSession,
  onSaveSession,
  onDeleteSession,
}) => {
  const { t, lang } = useTranslation();
  const [showBuilder, setShowBuilder] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-4 pb-28 space-y-6">
      {/* Header & Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold block mb-1">
            Guided Routines
          </span>
          <h2 className="text-2xl sm:text-3xl font-light text-zinc-100 tracking-tight">
            {t.navSessions}
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Structured Dhikr routines with automated pacing
          </p>
        </div>

        <button
          onClick={() => setShowBuilder(true)}
          id="btn-create-session"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition shadow-lg shadow-amber-500/10 active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.createSession}</span>
        </button>
      </div>

      {/* Sessions Grid / List */}
      <div className="space-y-4">
        {sessions.map((session) => {
          const totalTarget = session.items.reduce((acc, it) => acc + it.target, 0);
          const displayName = lang === 'ar' && session.nameAr ? session.nameAr : session.name;

          return (
            <div
              key={session.id}
              className="rounded-3xl bg-zinc-900/50 border border-white/5 p-6 shadow-xl hover:border-white/10 transition flex flex-col justify-between group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-zinc-100">
                    {displayName}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono mt-1">
                    <span>{session.items.length} Adhkar</span>
                    <span>•</span>
                    <span>{totalTarget} {t.repetitions}</span>
                    <span>•</span>
                    <span className="text-amber-500 font-semibold">{session.bpm} BPM</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-zinc-500">
                  {session.enableSound && <Volume2 className="w-3.5 h-3.5 text-zinc-400" />}
                  {session.enableHaptic && <Smartphone className="w-3.5 h-3.5 text-zinc-400" />}
                  {!session.isDefault && (
                    <button
                      onClick={() => onDeleteSession(session.id)}
                      className="p-1 hover:text-red-400 transition ml-1"
                      title="Delete session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Items preview preview pills */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {session.items.map((item, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-xl bg-zinc-900 border border-white/5 text-zinc-300 font-arabic flex items-center gap-1.5"
                    dir="rtl"
                  >
                    <span>{item.arabic}</span>
                    <span className="font-mono text-[10px] text-amber-500">×{item.target}</span>
                  </span>
                ))}
              </div>

              {/* Start Session Action */}
              <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-end">
                <button
                  onClick={() => onStartSession(session)}
                  id={`btn-start-session-${session.id}`}
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-amber-500 hover:text-black text-amber-500 border border-white/10 text-xs font-bold flex items-center gap-2 transition duration-150 active:scale-95 shadow-sm cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{t.startSession}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showBuilder && (
        <SessionBuilderModal
          allAdhkar={allAdhkar}
          onSaveSession={onSaveSession}
          onClose={() => setShowBuilder(false)}
        />
      )}
    </div>
  );
};
