import React from 'react';
import { BarChart3, Award, Sparkles, Clock, CheckCircle2, Flame, Heart } from 'lucide-react';
import { Statistics } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface StatisticsPageProps {
  statistics: Statistics;
}

export const StatisticsPage: React.FC<StatisticsPageProps> = ({ statistics }) => {
  const { t } = useTranslation();

  const formatAvgTime = (seconds: number) => {
    if (!seconds) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  const statCards = [
    {
      title: t.totalDhikrCounted,
      value: statistics.totalDhikrCounted.toLocaleString(),
      icon: <CheckCircle2 className="w-5 h-5 text-amber-400" />,
      desc: 'Completed targets & milestones',
    },
    {
      title: t.totalTaps,
      value: statistics.totalTaps.toLocaleString(),
      icon: <Flame className="w-5 h-5 text-amber-500" />,
      desc: 'Total manual & rhythm taps',
    },
    {
      title: t.sessionsCompleted,
      value: statistics.sessionsCompleted.toLocaleString(),
      icon: <Award className="w-5 h-5 text-emerald-400" />,
      desc: 'Structured routines finished',
    },
    {
      title: t.bestConsistency,
      value: statistics.bestConsistency ? `${statistics.bestConsistency}%` : '—',
      icon: <Sparkles className="w-5 h-5 text-amber-300" />,
      desc: 'Highest cadence regularity score',
    },
    {
      title: t.avgSessionLength,
      value: formatAvgTime(statistics.avgSessionDurationSeconds),
      icon: <Clock className="w-5 h-5 text-blue-400" />,
      desc: 'Average time per routine',
    },
    {
      title: t.mostUsedDhikr,
      value: statistics.mostUsedDhikr || 'Subḥān Allāh',
      icon: <Heart className="w-5 h-5 text-rose-400" />,
      desc: 'Most frequent remembrance',
      isText: true,
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-4 pb-28 space-y-6">
      <div>
        <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold block mb-1">
          Insights & Flow
        </span>
        <h2 className="text-2xl sm:text-3xl font-light text-zinc-100 tracking-tight flex items-center gap-2">
          <span>{t.statsTitle}</span>
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          {t.statsSubtitle}
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 gap-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-3xl bg-zinc-900/50 border border-white/5 flex flex-col justify-between hover:border-white/10 transition ${
              card.isText ? 'col-span-2' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-zinc-400 font-medium">
                {card.title}
              </span>
              <div className="p-2 rounded-xl bg-zinc-900 border border-white/10">
                {card.icon}
              </div>
            </div>

            <div>
              <div
                className={`tracking-tight text-zinc-100 mb-1 ${
                  card.isText ? 'text-xl sm:text-2xl font-arabic text-amber-500 font-medium' : 'text-3xl sm:text-4xl font-light font-mono'
                }`}
              >
                {card.value}
              </div>
              <p className="text-[11px] text-zinc-500">
                {card.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Gentle Contemplation Note */}
      <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5 text-center">
        <p className="font-arabic text-2xl text-amber-500 mb-2 font-normal" dir="rtl">
          أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ
        </p>
        <p className="text-xs text-zinc-400 italic">
          “Unquestionably, by the remembrance of Allah hearts are assured.” (13:28)
        </p>
      </div>
    </div>
  );
};
