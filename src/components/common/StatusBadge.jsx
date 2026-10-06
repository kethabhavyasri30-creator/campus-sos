import React from 'react';
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

export default function StatusBadge({ status, size = "md" }) {
  const isSmall = size === "sm";
  const s = status?.toLowerCase();

  if (s === 'active') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full border border-red-500/40 bg-red-500/20 text-red-400 ${
        isSmall ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      }`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
        ACTIVE
      </span>
    );
  }

  if (s === 'responding') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full border border-amber-500/40 bg-amber-500/20 text-amber-300 ${
        isSmall ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      }`}>
        <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
        RESPONDING
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium uppercase tracking-wider rounded-full border border-emerald-500/40 bg-emerald-500/20 text-emerald-400 ${
      isSmall ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
    }`}>
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
      RESOLVED
    </span>
  );
}