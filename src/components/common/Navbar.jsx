import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, Radio, PhoneCall, LogOut, User } from 'lucide-react';
import { EMERGENCY_CONTACTS } from '../../data/constants';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { currentUser, userData, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 shadow-md shadow-red-900/50">
              <Radio className="w-5 h-5 text-white animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-slate-900"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                  CAMPUS <span className="text-red-500">SOS</span>
                </span>
                <span className="hidden sm:inline-flex text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                  Network v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Rapid Emergency Response Portal</p>
            </div>
          </div>

          {/* Navigation / User Status */}
          {currentUser ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700">
                <User className="w-4 h-4 text-slate-400" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-200">{userData?.name || 'User'}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">{userData?.role || 'Student'}</span>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:text-white hover:bg-red-500/20 transition-all border border-transparent hover:border-red-500/30"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink
                to="/login"
                className="px-4 py-1.5 rounded-lg text-sm font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Log In
              </NavLink>
              <NavLink
                to="/signup"
                className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-500 text-white shadow-md transition-colors"
              >
                Sign Up
              </NavLink>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
