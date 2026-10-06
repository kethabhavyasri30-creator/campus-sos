import React from 'react';
import { AlertCircle, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function StatCards({ stats, activeFilter, onSelectFilter }) {
  const normalizedActiveFilter = activeFilter?.toUpperCase() || 'ALL';

  const cards = [
    {
      id: 'ALL',
      title: 'Total Emergencies',
      value: stats.total,
      icon: ShieldAlert,
      textColor: 'text-white',
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
      activeBorder: 'border-slate-500 bg-slate-900',
      glow: 'shadow-slate-900/40'
    },
    {
      id: 'ACTIVE',
      title: 'Active Emergencies',
      value: stats.active,
      icon: AlertCircle,
      textColor: 'text-red-400',
      badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
      activeBorder: 'border-red-500 bg-red-950/20',
      glow: 'shadow-red-950/50',
      pulse: stats.active > 0
    },
    {
      id: 'RESPONDING',
      title: 'Responding',
      value: stats.responding,
      icon: Clock,
      textColor: 'text-amber-300',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      activeBorder: 'border-amber-500 bg-amber-950/20',
      glow: 'shadow-amber-950/50'
    },
    {
      id: 'RESOLVED',
      title: 'Resolved',
      value: stats.resolved,
      icon: CheckCircle2,
      textColor: 'text-emerald-400',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      activeBorder: 'border-emerald-500 bg-emerald-950/20',
      glow: 'shadow-emerald-950/50'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = normalizedActiveFilter === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectFilter(card.id)}
            className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer relative overflow-hidden group ${
              isSelected
                ? `${card.activeBorder} shadow-lg ${card.glow} ring-1 ring-offset-2 ring-offset-slate-950 ring-slate-500/30`
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {card.title}
              </span>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 border ${card.badgeColor}`}
              >
                <Icon className={`w-4 h-4 ${card.textColor} ${card.pulse ? 'animate-pulse' : ''}`} />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className={`text-2xl sm:text-3xl font-black tracking-tight ${card.textColor}`}>
                {card.value}
              </span>
              <span className="text-[11px] text-slate-500">records</span>
            </div>

            {card.pulse && (
              <span className="absolute bottom-2 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}