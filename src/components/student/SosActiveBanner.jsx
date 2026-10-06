import React from 'react';
import { Radio, MapPin, Clock, Hash, PhoneCall, RotateCcw, ShieldCheck } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import CategoryIcon from '../common/CategoryIcon';

import { EMERGENCY_CONTACTS } from "../../data/constants";
import { useNow } from "../../hooks/useNow";
import { formatRelativeTime } from "../../utils/emergency";
export default function SosActiveBanner({ alert, delivery, onReset }) {
const now = useNow();
  if (!alert) return null;

  const emergencyType = alert.emergencyType || alert.type || 'Emergency';
  const alertStatus = alert.status || 'Active';

  return (
    <>
      {delivery === 'queued' && (
        <div role="status" className="mb-4 p-3 rounded-xl border border-amber-500/40 bg-amber-950/40 text-amber-200 text-xs">
          <strong>Weak connection:</strong> your SOS is saved on this device and will send automatically.
          Please also call <a className="underline font-bold" href={`tel:${EMERGENCY_CONTACTS.phone}`}>{EMERGENCY_CONTACTS.phone}</a> now.
        </div>
      )}
      <div className="w-full max-w-lg mx-auto bg-slate-900 border-2 border-red-500 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-red-950/60 relative overflow-hidden animate-fadeIn">
      {/* Top flashing banner bar */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 animate-pulse"></div>

      {/* Main Signal Pulsing Animation */}
      <div className="flex flex-col items-center text-center mt-2 mb-6">
        <div className="relative mb-4 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-red-500/20 animate-ping absolute"></div>
          <div className="w-20 h-20 rounded-full bg-red-500/30 flex items-center justify-center relative">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center shadow-lg shadow-red-900/60">
              <Radio className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>
        </div>

        <span className="text-xs uppercase tracking-widest font-extrabold text-red-400 mb-1">
          Transmission Confirmed
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Emergency Alert Sent
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-sm">
          Campus security dispatched and alert broadcasted across responders.
        </p>
      </div>

      {/* Status & Details Card */}
      <div className="bg-slate-950/90 rounded-2xl p-5 border border-slate-800 space-y-3.5 mb-6">
        {/* Status Row */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Current Status
          </span>
          <StatusBadge status={alertStatus} size="md" />
        </div>

        {/* Emergency Type */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-xs font-medium text-slate-400">Emergency Type</span>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-red-500/20 text-red-400 flex items-center justify-center">
              <CategoryIcon type={emergencyType} className="w-4 h-4" />
            </span>
            <span className="text-sm font-bold text-white">{emergencyType}</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-xs font-medium text-slate-400">Location</span>
          <div className="flex items-center gap-1.5 text-right">
            <MapPin className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-sm font-semibold text-slate-100">{alert.location}</span>
          </div>
        </div>

        {/* Alert ID */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-xs font-medium text-slate-400">Alert ID</span>
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-300 bg-slate-900 px-2 py-1 rounded border border-slate-800">
            <Hash className="w-3.5 h-3.5 text-slate-500" />
            <span>{alert.id}</span>
          </div>
        </div>

        {/* Time */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-xs font-medium text-slate-400">Time Reported</span>
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{formatRelativeTime(alert.createdAtMs, now) || 'Just now'}</span>
          </div>
        </div>

        {/* Assigned Responder */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Assigned Team</span>
          <span className="text-xs font-semibold text-amber-300">
            {alert.assignedTeam || 'Pending Dispatch'}
          </span>
        </div>
      </div>

      {/* Safety Instructions */}
      <div className="bg-red-950/30 border border-red-500/30 rounded-2xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-red-200 uppercase tracking-wider">
              Immediate Safety Steps
            </h4>
            <ul className="text-xs text-slate-300 mt-1.5 space-y-1 list-disc list-inside">
              <li>Stay calm and remain in a secure location if safe to do so.</li>
              <li>Keep your mobile device line clear for incoming responder calls.</li>
              <li>Notify anyone nearby of impending security arrival.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Direct Call & Reset Action */}
      <div className="space-y-3">
        <a
          href={`tel:${EMERGENCY_CONTACTS.phone}`}
          className="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <PhoneCall className="w-4 h-4 text-red-400" />
          <span>Call Campus Emergency Dispatch Directly</span>
        </a>

        <button
          type="button"
          onClick={onReset}
          className="w-full py-2.5 px-4 text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Submit Another Incident / Back to Form</span>
        </button>
      </div>
    </div>
    </>
  );
}