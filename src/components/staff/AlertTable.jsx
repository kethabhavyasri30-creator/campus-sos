import React from 'react';
import { MapPin, Clock, Shield, Check, Navigation } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import CategoryIcon from '../common/CategoryIcon';

import { formatRelativeTime } from "../../utils/emergency";

export default function AlertTable({ alerts, onRespond, onResolve, pendingIds, now }) {
  if (alerts.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
        <Shield className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-300">No emergency alerts matching criteria</p>
        <p className="text-xs text-slate-500 mt-1">All clear across campus monitoring sectors.</p>
      </div>
    );
  }

  return (
    <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-4 px-4 sm:px-6">Type & ID</th>
              <th className="py-4 px-4">Student</th>
              <th className="py-4 px-4">Location</th>
              <th className="py-4 px-4">Time</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-4">Assigned Team</th>
              <th className="py-4 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {alerts.map((alert) => {
              const statusLower = alert.status?.toLowerCase();
              const isActive = statusLower === 'active';
              const isResponding = statusLower === 'responding';
              const isResolved = statusLower === 'resolved';
              const emergencyType = alert.emergencyType || alert.type || 'Emergency';
              const isPending = pendingIds?.has(alert.docId);

              return (
                <tr
                  key={alert.docId}
                  className={`transition-colors hover:bg-slate-800/40 ${
                    isActive ? 'bg-red-950/10' : ''
                  }`}
                >
                  {/* Type & ID */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
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
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{emergencyType}</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">{alert.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Student Name & ID */}
                  <td className="py-4 px-4">
                    <div className="font-semibold text-slate-200">{alert.studentName}</div>
                    <div className="text-xs text-slate-500 font-mono">{alert.studentId}</div>
                  </td>

                  {/* Location */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 text-slate-200 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span className="font-medium text-xs sm:text-sm">{alert.location}</span>
                    </div>
                    {alert.gpsCoords && (
                      <a 
                        href={`https://maps.google.com/?q=${alert.gpsCoords.lat},${alert.gpsCoords.lng}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded hover:text-blue-300 transition-colors"
                      >
                        <Navigation className="w-3 h-3" /> Map
                      </a>
                    )}
                    {alert.description && (
                      <p className="text-[11px] text-slate-400 italic max-w-xs truncate mt-1" title={alert.description}>
                        "{alert.description}"
                      </p>
                    )}
                  </td>

                  {/* Time */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formatRelativeTime(alert.createdAtMs, now)}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <StatusBadge status={alert.status} size="sm" />
                  </td>

                  {/* Assigned Team */}
                  <td className="py-4 px-4">
                    <span className={`text-xs font-medium ${
                      isActive ? 'text-slate-400 italic' : 'text-amber-300'
                    }`}>
                      {alert.assignedTeam}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {/* Respond Button */}
                      {!isResolved && (
                        <button
                          type="button"
                          onClick={() => onRespond(alert.docId)}
                          disabled={isResponding || isPending}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isActive
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-950/40 cursor-pointer active:scale-[0.95]'
                              : 'bg-slate-800 text-slate-400 cursor-default opacity-80'
                          }`}
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>{isResponding ? 'Responding' : 'Respond'}</span>
                        </button>
                      )}

                      {/* Resolve Button */}
                      {!isResolved ? (
                        <button
                          type="button"
                          onClick={() => onResolve(alert.docId)}
                          disabled={isPending}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40 transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.95] disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Resolve</span>
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-400/80 font-medium inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-950/20 border border-emerald-500/20">
                          <Check className="w-3.5 h-3.5" /> Closed
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}