'use client';

import React from 'react';
import { AlertTriangle, Map, ShieldCheck, Flame } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* LOGO & BADGE */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center shadow-lg shadow-red-950/40">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">HazardSnap</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 uppercase tracking-wider">
                Civic Pulse
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-time Commuter Safety Grid</span>
            </div>
          </div>
        </div>

        {/* CENTER VIEW SWITCHER */}
        <div className="hidden sm:flex items-center bg-zinc-900/90 border border-zinc-800 p-1 rounded-2xl">
          <button
            onClick={() => onViewChange('map')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              currentView === 'map'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Map className="w-3.5 h-3.5 text-blue-400" />
            <span>Public Safety Map</span>
          </button>

          <button
            onClick={() => onViewChange('municipal')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              currentView === 'municipal'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Municipal Queue</span>
            {criticalCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">
                {criticalCount}
              </span>
            )}
          </button>
        </div>

        {/* RIGHT ACTION: REPORT BUTTON */}
        <div className="flex items-center gap-2">
          {/* Mobile switcher */}
          <div className="flex sm:hidden items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            <button
              onClick={() => onViewChange('map')}
              className={`p-2 rounded-lg text-xs ${
                currentView === 'map' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
              }`}
              title="Safety Map"
            >
              <Map className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewChange('municipal')}
              className={`p-2 rounded-lg text-xs ${
                currentView === 'municipal' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
              }`}
              title="Municipal Queue"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenReport}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-xs font-bold shadow-lg shadow-red-950/50 flex items-center gap-1.5 transition active:scale-95"
          >
            <Flame className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            <span>Report Hazard</span>
          </button>
        </div>
      </div>
    </header>
  );
}
