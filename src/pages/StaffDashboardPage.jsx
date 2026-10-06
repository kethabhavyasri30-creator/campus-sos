import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Shield, Search, Radio, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { useEmergencyFeed } from '../hooks/useEmergencyFeed';
import { useNow } from '../hooks/useNow';
import { respondToEmergency, resolveEmergency } from '../services/emergencyService';
import { filterAlerts } from '../utils/emergency';
import { EMERGENCY_TYPES, EMERGENCY_CONTACTS } from '../data/constants';
import StatCards from '../components/staff/StatCards';
import AlertTable from '../components/staff/AlertTable';
import AlertCardMobile from '../components/staff/AlertCardMobile';

export default function StaffDashboardPage() {
  const { alerts, stats, loading, error } = useEmergencyFeed();
  const now = useNow();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [pendingIds, setPendingIds] = useState(() => new Set());
  const [actionError, setActionError] = useState(null);
  
  // Siren Logic
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Initialize audio object once
    if (!audioRef.current) {
      audioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/spaceship_alarm.ogg');
      audioRef.current.loop = true;
    }

    if (stats.active > 0 && !isMuted) {
      // Play siren if there are active emergencies and it's not muted
      audioRef.current.play().catch(e => console.log('Autoplay blocked by browser until user interaction.'));
    } else {
      // Pause siren if no active emergencies or if muted
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // reset
    }

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [stats.active, isMuted]);

  const filteredAlerts = useMemo(
    () => filterAlerts(alerts, { status: statusFilter, type: categoryFilter, query: searchQuery }),
    [alerts, statusFilter, categoryFilter, searchQuery]
  );

  const runAction = useCallback(async (docId, action) => {
    if (pendingIds.has(docId)) return;
    setActionError(null);
    setPendingIds((prev) => new Set(prev).add(docId));
    try {
      await action(docId);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setPendingIds((prev) => { const next = new Set(prev); next.delete(docId); return next; });
    }
  }, [pendingIds]);

  const handleRespond = (docId) => runAction(docId, respondToEmergency);
  const handleResolve = (docId) => runAction(docId, resolveEmergency);

  return (
    <div className="min-h-[calc(100vh-4rem)] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Banner / Dashboard Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Campus Security & Emergency Response Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Staff Dispatch Dashboard</span>
            {stats.active > 0 && (
              <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-2.5 py-1 rounded-full animate-pulse">
                {stats.active} Action{stats.active > 1 ? 's' : ''} Required
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time feed of campus emergency transmissions, responder team deployments, and incident tracking.
          </p>
        </div>

        {/* Quick Hotline, Siren Toggle & Station details */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
              isMuted 
              ? 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white' 
              : 'bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
            {isMuted ? 'Siren Muted' : 'Siren Active'}
          </button>

          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-right hidden sm:block">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Control Station
            </span>
            <span className="text-xs font-semibold text-slate-200">Main Gate Post Alpha</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-right">
            <span className="text-[10px] uppercase font-bold text-red-400 block tracking-wider">
              Emergency Hotkey
            </span>
            <span className="text-xs font-mono font-bold text-white">Ext. {EMERGENCY_CONTACTS.controlRoomExt || EMERGENCY_CONTACTS.phone}</span>
          </div>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <StatCards
        stats={stats}
        activeFilter={statusFilter}
        onSelectFilter={(filter) => setStatusFilter(filter)}
      />

      {/* Search & Category Filter Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6 space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student, ID, location, or emergency ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 focus:border-red-500 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          {/* Quick Clear Button if searching */}
          {(searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setCategoryFilter('ALL');
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider shrink-0 mr-1">
            Type:
          </span>
          {['ALL', ...EMERGENCY_TYPES].map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setCategoryFilter(category)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                categoryFilter === category
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Emergency Alerts Feed Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Live Emergency Queue</h2>
            <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
              {filteredAlerts.length}
            </span>
          </div>

          <span className="text-xs text-slate-400 hidden sm:block">
            {error ? 'Feed Offline' : 'Firestore Real-Time Sync Active'}
          </span>
        </div>

        {/* Action error or feed error */}
        {(error || actionError) && (
          <div role="alert" className="mb-4 p-3 rounded-xl border border-red-500/40 bg-red-950/50 text-red-200 text-xs">
            {actionError ?? `Live feed error: ${error}`}
          </div>
        )}

        {/* Loading state if fetching initial Firestore snapshot */}
        {loading && (
          <div className="py-12 text-center text-slate-400 text-sm">
            <Radio className="w-6 h-6 animate-spin text-red-500 mx-auto mb-2" />
            Connecting to Firestore emergency queue...
          </div>
        )}

        {/* Desktop View: Rich Table */}
        {!loading && (
          <AlertTable
            alerts={filteredAlerts}
            pendingIds={pendingIds}
            onRespond={handleRespond}
            onResolve={handleResolve}
            now={now}
          />
        )}

        {/* Mobile View: High-Density Emergency Cards */}
        {!loading && (
          <div className="md:hidden space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800 p-4">
                <Shield className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">No emergency alerts found</p>
                <p className="text-xs text-slate-500 mt-1">Try resetting search or filter criteria.</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <AlertCardMobile
                  key={alert.docId}
                  alert={alert}
                  pendingIds={pendingIds}
                  onRespond={handleRespond}
                  onResolve={handleResolve}
                  now={now}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}