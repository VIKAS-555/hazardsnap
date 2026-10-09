'use client';

import React from 'react';
import {
  ChevronDown,
  Camera,
  ShieldCheck,
  User,
  Radio,
  Flame,
} from 'lucide-react';

export type ActiveTab = 'home' | 'emergency' | 'grid' | 'municipal' | 'how-it-works';

interface MainNavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenReport: () => void;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  currentUser: { name: string; role: 'citizen' | 'official' } | null;
  onLogout: () => void;
  criticalCount: number;
}

export default function MainNavigation({
  activeTab,
  onTabChange,
  onOpenReport,
  onOpenLogin,
  onOpenSignup,
  currentUser,
  onLogout,
  criticalCount,
}: MainNavigationProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#080C14]/90 backdrop-blur-md border-b border-white/[0.08] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo Left */}
        <div
          onClick={() => onTabChange(currentUser ? 'grid' : 'home')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-rose-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition">
            <div className="w-full h-full bg-[#080C14] rounded-[10px] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none">
                <path d="M12 2L3 21h18L12 2z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
                <path d="M12 8l-4 9h8l-4-9z" fill="currentColor" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-tight text-white">
              HazardSnap
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              GRID v2
            </span>
          </div>
        </div>

        {/* Center Tabs Navigation (Only visible when user is logged in) */}
        {currentUser && (
          <nav className="hidden md:flex items-center gap-1.5 sm:gap-2.5 text-[13px] font-medium text-slate-300">
            {/* Safety Grid Tab */}
            <button
              onClick={() => onTabChange('grid')}
              className={`px-3.5 py-1.5 rounded-full transition flex items-center gap-1 ${
                activeTab === 'grid'
                  ? 'bg-white text-slate-950 font-bold shadow-sm'
                  : 'hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <span>Safety Grid</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {/* Emergency Logs Tab */}
            <button
              onClick={() => onTabChange('emergency')}
              className={`px-3.5 py-1.5 rounded-full transition flex items-center gap-1.5 relative ${
                activeTab === 'emergency'
                  ? 'bg-red-600 text-white font-bold shadow-sm shadow-red-500/30'
                  : 'hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <span>Emergency Logs</span>
              {criticalCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              )}
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {/* Municipal Triage Tab */}
            <button
              onClick={() => onTabChange('municipal')}
              className={`px-3.5 py-1.5 rounded-full transition flex items-center gap-1 ${
                activeTab === 'municipal'
                  ? 'bg-white/[0.15] text-white font-bold border border-white/20'
                  : 'hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <span>Municipal Triage</span>
            </button>

            {/* How It Works Tab */}
            <button
              onClick={() => onTabChange('how-it-works')}
              className={`px-3 py-1.5 rounded-full transition ${
                activeTab === 'how-it-works'
                  ? 'bg-white/[0.15] text-white font-bold border border-white/20'
                  : 'hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              How It Works
            </button>
          </nav>
        )}

        {/* Right Controls: Auth Controls & Action */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-200 bg-[#0F172A] border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline max-w-[140px] truncate">{currentUser.name}</span>
              </span>
              <button
                onClick={onLogout}
                className="text-xs text-slate-400 hover:text-white transition px-2 py-1 rounded-lg hover:bg-white/[0.06]"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={onOpenLogin}
                className="text-xs sm:text-[13px] font-semibold text-slate-300 hover:text-white transition px-2.5 py-1.5 rounded-xl hover:bg-white/[0.06]"
              >
                Log In
              </button>

              <button
                onClick={onOpenSignup}
                className="px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-white hover:bg-slate-200 text-slate-950 text-xs sm:text-[13px] font-bold transition shadow-sm active:scale-95 flex items-center gap-1"
              >
                <span>Sign Up</span>
                <span className="text-xs">→</span>
              </button>
            </>
          )}

          {/* Quick Action Button */}
          <button
            onClick={onOpenReport}
            className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-rose-600/30 shrink-0 active:scale-95"
            title="Log Hazard in 5s"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Report (5s)</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar for Tabs (Only if logged in) */}
      {currentUser && (
        <div className="md:hidden flex items-center gap-1.5 overflow-x-auto px-4 py-2 border-t border-white/[0.08] bg-[#0A0F1A] scrollbar-none text-xs">
          <button
            onClick={() => onTabChange('grid')}
            className={`px-3 py-1 rounded-full whitespace-nowrap font-medium ${
              activeTab === 'grid'
                ? 'bg-white text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Safety Grid
          </button>
          <button
            onClick={() => onTabChange('emergency')}
            className={`px-3 py-1 rounded-full whitespace-nowrap flex items-center gap-1 font-medium ${
              activeTab === 'emergency'
                ? 'bg-red-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Emergency Logs
            {criticalCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
          </button>
          <button
            onClick={() => onTabChange('municipal')}
            className={`px-3 py-1 rounded-full whitespace-nowrap font-medium ${
              activeTab === 'municipal'
                ? 'bg-white text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Municipal
          </button>
          <button
            onClick={() => onTabChange('how-it-works')}
            className={`px-3 py-1 rounded-full whitespace-nowrap font-medium ${
              activeTab === 'how-it-works'
                ? 'bg-white text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            How It Works
          </button>
        </div>
      )}
    </header>
  );
}
