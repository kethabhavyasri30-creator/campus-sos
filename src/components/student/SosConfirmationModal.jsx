import React, { useEffect, useRef } from 'react';
import { AlertTriangle, ShieldAlert, X } from 'lucide-react';
import CategoryIcon from '../common/CategoryIcon';

export default function SosConfirmationModal({
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
  type,
  location,
  customLocation,
  description
}) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    confirmRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const displayLocation = location === 'Other' && customLocation ? `Other (${customLocation})` : location;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="sos-confirm-title" aria-describedby="sos-confirm-desc" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-red-500/80 rounded-3xl p-6 shadow-2xl shadow-red-950/70 overflow-hidden">
        {/* Glow indicator at top */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 animate-pulse"></div>

        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 flex-shrink-0">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 id="sos-confirm-title" className="text-lg font-bold text-white tracking-tight">Confirm Emergency SOS</h3>
            <p id="sos-confirm-desc" className="text-xs text-red-300">Are you sure you want to broadcast this alert?</p>
          </div>
        </div>

        {/* Summary box */}
        <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 mb-5 space-y-3">
          {/* Toll-Free Auto Dialer Indicator */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs text-slate-400">Auto-Dialing:</span>
            <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5 animate-pulse">
              📞 Faculty Response (+919441291655)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Emergency Type:</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/30">
              <CategoryIcon aria-hidden="true" type={type} className="w-3.5 h-3.5" />
              {type}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Campus Location:</span>
            <span className="text-xs font-semibold text-slate-200">
              {displayLocation || 'Not specified'}
            </span>
          </div>

          {description && (
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-xs text-slate-400 block mb-1">Details:</span>
              <p className="text-xs text-slate-300 bg-slate-900 p-2 rounded-lg italic">
                "{description}"
              </p>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          Broadcasting immediately alerts <strong className="text-white">Campus Security</strong> and dispatch teams. Please ensure this is a genuine emergency.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col gap-2.5">
          <button ref={confirmRef} disabled={isSubmitting} aria-busy={isSubmitting} type="button" onClick={onConfirm}
            className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-red-900/50 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShieldAlert className="w-5 h-5" />
            <span>{isSubmitting ? 'Sending...' : 'Broadcast Emergency SOS Now'}</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
