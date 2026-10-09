'use client';

import React from 'react';
import AntigravityCanvas from './AntigravityCanvas';
import { ArrowRight, ChevronDown, Camera, ShieldCheck, Flame, Radio } from 'lucide-react';

interface LandingHeroProps {
  onGoToGrid: () => void;
  onGoToEmergency: () => void;
  onOpenReport: () => void;
  onGoToMunicipal: () => void;
}

export default function LandingHero({
  onGoToGrid,
  onGoToEmergency,
  onOpenReport,
  onGoToMunicipal,
}: LandingHeroProps) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden bg-[#080C14] text-white transition-colors">
      {/* 1. INTERACTIVE VORTEX PARTICLE CANVAS */}
      <AntigravityCanvas />

      {/* 2. HERO CENTER CONTENT */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-16 sm:py-24 text-center flex flex-col items-center space-y-6 my-auto">
        {/* Top Centered Brand Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.1] text-slate-200 backdrop-blur-md mb-2 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold text-xs tracking-tight text-slate-200">
            HazardSnap Civic Intelligence Grid
          </span>
          <span className="text-[10px] font-mono text-slate-400">• Ward 112–126 Live</span>
        </div>

        {/* Huge Modern Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-[70px] font-bold text-white tracking-[-0.035em] leading-[1.1] max-w-3xl">
          Experience rapid response with the next-gen civic safety grid
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
          Real-time hyper-local road telemetry, live open manhole radar, and verified municipal field dispatch.
        </p>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3.5">
          {/* Button 1: Switch to Emergency Log tab */}
          <button
            onClick={onGoToEmergency}
            className="px-7 py-3.5 rounded-full bg-white hover:bg-slate-200 text-slate-950 text-sm font-bold transition-all shadow-xl shadow-white/10 active:scale-95 flex items-center gap-2"
          >
            <span>Emergency Complaints Log</span>
            <span className="text-xs">⤓</span>
          </button>

          {/* Button 2: Switch to Safety Grid tab */}
          <button
            onClick={onGoToGrid}
            className="px-6 py-3.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.12] text-sm font-semibold transition active:scale-95 flex items-center gap-1.5 backdrop-blur-sm"
          >
            <span>Launch Live Safety Grid</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. BOTTOM SUBTLE TICKER */}
      <div className="relative z-10 w-full py-4 text-center border-t border-white/[0.08] text-xs text-slate-400 font-medium bg-[#080C14]/80 backdrop-blur-md transition-colors">
        <span className="font-mono text-[11px] tracking-wide">
          WARD 112–126 REAL-TIME EMERGENCY MONITORING ACTIVE • SUB-METER GPS AUTO-LOCK • BBMP DISPATCH INTEGRATED
        </span>
      </div>
    </div>
  );
}
