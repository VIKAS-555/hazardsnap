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
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo Left */}
        <div
          onClick={() => onTabChange('home')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 group-hover:scale-105 transition" fill="none">
              <path d="M12 2L3 21h18L12 2z" stroke="#0f172a" strokeWidth="2.2" strokeLinejoin="round" />
              <path d="M12 8l-4 9h8l-4-9z" fill="#0f172a" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-slate-900">
              HazardSnap
            </span>
          </div>
        </div>

        {/* Center Tabs Navigation (Image 1 Style) */}
        <nav className="hidden md:flex items-center gap-1.5 sm:gap-3 text-[13px] font-medium text-slate-700">
          {/* Home Tab */}
          <button
            onClick={() => onTabChange('home')}
            className={`px-3 py-1.5 rounded-full transition ${
              activeTab === 'home'
                ? 'bg-slate-100 text-black font-semibold'
                : 'hover:text-black hover:bg-slate-50'
            }`}
          >
            Home
          </button>

          {/* Safety Grid Tab (Image 3) */}
          <button
            onClick={() => onTabChange('grid')}
            className={`px-3.5 py-1.5 rounded-full transition flex items-center gap-1 ${
              activeTab === 'grid'
                ? 'bg-slate-900 text-white font-semibold shadow-sm'
                : 'hover:text-black hover:bg-slate-50'
            }`}
          >
            <span>Safety Grid</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>

          {/* Emergency Logs Tab (Image 2) */}
          <button
            onClick={() => onTabChange('emergency')}
            className={`px-3.5 py-1.5 rounded-full transition flex items-center gap-1.5 relative ${
              activeTab === 'emergency'
                ? 'bg-red-600 text-white font-semibold shadow-sm'
                : 'hover:text-black hover:bg-slate-50'
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
            className={`px-3 py-1.5 rounded-full transition flex items-center gap-1 ${
              activeTab === 'municipal'
                ? 'bg-slate-100 text-black font-semibold'
                : 'hover:text-black hover:bg-slate-50'
            }`}
          >
            <span>Municipal Triage</span>
          </button>

          {/* How It Works Tab */}
          <button
            onClick={() => onTabChange('how-it-works')}
            className={`px-3 py-1.5 rounded-full transition ${
              activeTab === 'how-it-works'
                ? 'bg-slate-100 text-black font-semibold'
                : 'hover:text-black hover:bg-slate-50'
            }`}
          >
            How It Works
          </button>
        </nav>

        {/* Right Auth Controls: Sign In, Log In, Sign Up */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">{currentUser.name}</span>
              </span>
              <button
                onClick={onLogout}
                className="text-xs text-slate-500 hover:text-slate-900 transition"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={onOpenLogin}
                className="text-xs sm:text-[13px] font-medium text-slate-700 hover:text-black transition px-2 py-1"
              >
                Sign In
              </button>

              <button
                onClick={onOpenLogin}
                className="text-xs sm:text-[13px] font-medium text-slate-700 hover:text-black transition px-2 py-1 hidden sm:inline"
              >
                Log In
              </button>

              <button
                onClick={onOpenSignup}
                className="px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-[#111827] hover:bg-black text-white text-xs sm:text-[13px] font-medium transition shadow-sm active:scale-95 flex items-center gap-1"
              >
                <span>Sign Up</span>
                <span className="text-xs">→</span>
              </button>
            </>
          )}

          {/* Quick Action Button */}
          <button
            onClick={onOpenReport}
            className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition flex items-center gap-1 shadow-sm shrink-0"
            title="Log Hazard in 5s"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Report (5s)</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar for Tabs */}
      <div className="md:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-slate-100 bg-slate-50/80 scrollbar-none text-xs">
        <button
          onClick={() => onTabChange('home')}
          className={`px-3 py-1 rounded-full whitespace-nowrap ${
            activeTab === 'home' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600'
          }`}
        >
          Home
        </button>
        <button
          onClick={() => onTabChange('grid')}
          className={`px-3 py-1 rounded-full whitespace-nowrap ${
            activeTab === 'grid' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600'
          }`}
        >
          Safety Grid
        </button>
        <button
          onClick={() => onTabChange('emergency')}
          className={`px-3 py-1 rounded-full whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'emergency' ? 'bg-red-600 text-white font-semibold' : 'text-slate-600'
          }`}
        >
          Emergency Logs
          {criticalCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
        </button>
        <button
          onClick={() => onTabChange('municipal')}
          className={`px-3 py-1 rounded-full whitespace-nowrap ${
            activeTab === 'municipal' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600'
          }`}
        >
          Municipal
        </button>
        <button
          onClick={() => onTabChange('how-it-works')}
          className={`px-3 py-1 rounded-full whitespace-nowrap ${
            activeTab === 'how-it-works' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600'
          }`}
        >
          How It Works
        </button>
      </div>
    </header>
  );
}
