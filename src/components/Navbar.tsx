'use client';

import React from 'react';
import { AlertTriangle, Map, ShieldCheck, Flame, Compass, ExternalLink } from 'lucide-react';

interface NavbarProps {
  currentView: 'map' | 'municipal';
  onViewChange: (view: 'map' | 'municipal') => void;
  onOpenReport: () => void;
  criticalCount: number;
}

export default function Navbar({
  currentView,
  onViewChange,
  onOpenReport,
  criticalCount,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#080C14]/85 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* LOGO & BRAND */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-950/40 text-white">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">HazardSnap</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.08]">
                Civic Grid
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time Rapid Response</span>
            </div>
          </div>
        </div>

        {/* CENTER VIEW SWITCHER */}
        <div className="hidden sm:flex items-center bg-white/[0.03] border border-white/[0.08] p-1 rounded-2xl">
          <button
            onClick={() => onViewChange('map')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              currentView === 'map'
                ? 'bg-white/[0.1] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span>Public Safety Grid</span>
          </button>

          <button
            onClick={() => onViewChange('municipal')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              currentView === 'municipal'
                ? 'bg-white/[0.1] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Municipal Triage</span>
            {criticalCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                {criticalCount}
              </span>
            )}
          </button>
        </div>

        {/* RIGHT ACTION: REPORT BUTTON */}
        <div className="flex items-center gap-2">
          {/* Mobile switcher */}
          <div className="flex sm:hidden items-center bg-white/[0.04] border border-white/[0.08] rounded-xl p-0.5">
            <button
              onClick={() => onViewChange('map')}
              className={`p-1.5 rounded-lg text-xs ${
                currentView === 'map' ? 'bg-white/[0.12] text-white' : 'text-slate-400'
              }`}
              title="Safety Grid"
            >
              <Compass className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewChange('municipal')}
              className={`p-1.5 rounded-lg text-xs ${
                currentView === 'municipal' ? 'bg-white/[0.12] text-white' : 'text-slate-400'
              }`}
              title="Municipal Triage"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenReport}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white text-xs font-semibold shadow-lg shadow-rose-950/40 flex items-center gap-1.5 transition active:scale-95 border border-white/10"
          >
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            <span>Report Hazard</span>
          </button>
        </div>
      </div>
    </header>
  );
}
