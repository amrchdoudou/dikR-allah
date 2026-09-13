import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface SessionTimerProps {
  seconds: number;
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
}

export const SessionTimer: React.FC<SessionTimerProps> = ({
  seconds,
  isRunning,
  onToggle,
  onReset,
}) => {
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  return (
    <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-2xl bg-zinc-900/80 border border-white/10 backdrop-blur-md shadow-lg select-none">
      {/* Play / Pause Toggle */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={isRunning ? 'Pause timer' : 'Start timer'}
        className="p-1 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-white/5 transition cursor-pointer"
      >
        {isRunning ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current" />
        )}
      </button>

      {/* Formatted Elapsed Time */}
      <span className="font-['Share_Tech_Mono',monospace] text-sm tracking-widest text-zinc-100 font-medium">
        {formatTime(seconds)}
      </span>

      {/* Reset Timer */}
      <button
        type="button"
        onClick={onReset}
        aria-label="Reset timer"
        className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
