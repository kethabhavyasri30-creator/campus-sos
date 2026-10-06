import React from 'react';
import { MapPin, Clock, Shield, Check, Navigation } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import CategoryIcon from '../common/CategoryIcon';

import { formatRelativeTime } from "../../utils/emergency";
export default function AlertCardMobile({ alert, onRespond, onResolve, pendingIds, now }) {
  const statusLower = alert.status?.toLowerCase();
  const isActive = statusLower === 'active';
  const isResponding = statusLower === 'responding';
  const isResolved = statusLower === 'resolved';
  const emergencyType = alert.emergencyType || alert.type || 'Emergency';
  const isPending = pendingIds?.has(alert.docId);

  return (
    <div
      className={`p-4 rounded-2xl border transition-all duration-200 ${
        isActive
          ? 'bg-slate-900 border-red-500/50 shadow-lg shadow-red-950/40 ring-1 ring-red-500/20'
          : isResponding
          ? 'bg-slate-900 border-amber-500/40'
          : 'bg-slate-900/60 border-slate-800'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isActive
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : isResponding
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            <CategoryIcon type={emergencyType} className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">{emergencyType} Emergency</h4>
            <span className="text-[11px] font-mono text-slate-400">{alert.id}</span>
          </div>
        </div>

        <StatusBadge status={alert.status} size="sm" />
      </div>

      <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 space-y-2 mb-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Student:</span>
          <span className="font-semibold text-slate-200">
            {alert.studentName} <span className="font-mono text-slate-500">({alert.studentId})</span>
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">Location:</span>
          <span className="font-semibold text-slate-200 flex items-center gap-1 text-right">
            <MapPin className="w-3.5 h-3.5 text-red-400" />
            {alert.location}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">Time:</span>
          <span className="text-slate-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            {formatRelativeTime(alert.createdAtMs, now)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">Assigned Team:</span>
          <span className={`font-medium ${isActive ? 'text-slate-400 italic' : 'text-amber-300'}`}>
            {alert.assignedTeam}
          </span>
        </div>

        {alert.gpsCoords && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-400">Live Map:</span>
            <a 
              href={`https://maps.google.com/?q=${alert.gpsCoords.lat},${alert.gpsCoords.lng}`} 
              target="_blank" 
              rel="noreferrer"
              className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded"
            >
              <Navigation className="w-3 h-3" /> View on Map
            </a>
          </div>
        )}

        {alert.description && (
          <div className="pt-1.5 border-t border-slate-800 text-slate-300 italic">
            "{alert.description}"
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        {!isResolved && (
          <button
            type="button"
            onClick={() => onRespond(alert.docId)}
            disabled={isResponding || isPending}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              isActive
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-[0.98] shadow-md shadow-amber-950/30'
                : 'bg-slate-800 text-slate-400 cursor-default opacity-80'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{isResponding ? 'Responding' : 'Respond'}</span>
          </button>
        )}

        {!isResolved ? (
          <button
            type="button"
            onClick={() => onResolve(alert.docId)}
            disabled={isPending}
            className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white active:scale-[0.98] shadow-md shadow-emerald-950/30 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Resolve</span>
          </button>
        ) : (
          <div className="w-full py-2 text-center text-xs text-emerald-400 font-medium bg-emerald-950/20 border border-emerald-500/20 rounded-xl">
            Incident Resolved & Archived
          </div>
        )}
      </div>
    </div>
  );
}