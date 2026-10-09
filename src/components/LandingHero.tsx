'use client';

import React from 'react';
import AntigravityCanvas from './AntigravityCanvas';
import { ArrowRight, ChevronDown, Camera, ShieldCheck, Flame } from 'lucide-react';

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
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden bg-[#ffffff] dark:bg-[#080c14] text-[#111827] dark:text-slate-100 transition-colors">
      {/* 1. INTERACTIVE VORTEX PARTICLE CANVAS */}
      <AntigravityCanvas />

      {/* 2. HERO CENTER CONTENT */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-12 sm:py-24 text-center flex flex-col items-center space-y-6 my-auto">
        {/* Top Centered Brand Badge */}
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 mb-1">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
            <path d="M12 2L3 21h18L12 2z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M12 8l-4 9h8l-4-9z" fill="currentColor" />
          </svg>
          <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-slate-100">
            HazardSnap Civic Grid
          </span>
        </div>

        {/* Huge Modern Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-semibold text-slate-950 dark:text-white tracking-[-0.035em] leading-[1.12] max-w-3xl">
          Experience rapid response with the next-gen civic safety grid
        </h1>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3.5">
          {/* Button 1: Switch to Emergency Log tab */}
          <button
            onClick={onGoToEmergency}
            className="px-7 py-3.5 rounded-full bg-[#111827] dark:bg-white hover:bg-black dark:hover:bg-slate-200 text-white dark:text-slate-900 text-sm font-medium transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            <span>Emergency Complaints Log</span>
            <span className="text-xs">⤓</span>
          </button>

          {/* Button 2: Switch to Safety Grid tab */}
          <button
            onClick={onGoToGrid}
            className="px-6 py-3.5 rounded-full bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-transparent dark:border-slate-700 text-sm font-medium transition active:scale-95 flex items-center gap-1.5"
          >
            <span>Launch Live Safety Grid</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. BOTTOM SUBTLE TICKER */}
      <div className="relative z-10 w-full py-4 text-center border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 font-medium bg-white/70 dark:bg-slate-950/70 backdrop-blur-sm transition-colors">
        <span>Ward 112–126 Real-Time Emergency Monitoring Active • Sub-Meter GPS Auto-Lock</span>
      </div>
    </div>
  );
}
