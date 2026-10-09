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
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden bg-[#ffffff] text-[#111827]">
      {/* 1. INTERACTIVE VORTEX PARTICLE CANVAS (MATCHING IMAGE 1 & 2) */}
      <AntigravityCanvas />

      {/* 2. HERO CENTER CONTENT (EXACT MATCH FOR IMAGE 1) */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-12 sm:py-24 text-center flex flex-col items-center space-y-6 my-auto">
        {/* Top Centered Brand Badge */}
        <div className="flex items-center gap-2 text-slate-800 mb-1">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
            <path d="M12 3L4 20h16L12 3z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M12 7l-5 11h10l-5-11z" fill="url(#heroGrad2)" />
            <defs>
              <linearGradient id="heroGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4338ca" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
          <span className="font-bold text-base tracking-tight text-slate-900">
            HazardSnap Civic Grid
          </span>
        </div>

        {/* Huge Modern Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-semibold text-slate-950 tracking-[-0.035em] leading-[1.12] max-w-3xl">
          Experience rapid response with the next-gen civic safety grid
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-600 max-w-xl font-normal leading-relaxed">
          A hyper-local civic infrastructure network. Log open manholes, live wires, and waterlogging in 5 seconds to feed real-time public safety navigation and verified municipal dispatch.
        </p>

        {/* Action Buttons (Image 1 Style) */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3.5">
          {/* Button 1: Switch to Emergency Log tab */}
          <button
            onClick={onGoToEmergency}
            className="px-7 py-3.5 rounded-full bg-[#111827] hover:bg-black text-white text-sm font-medium transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            <span>Emergency Complaints Log</span>
            <span className="text-xs">⤓</span>
          </button>

          {/* Button 2: Switch to Safety Grid tab */}
          <button
            onClick={onGoToGrid}
            className="px-6 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-medium transition active:scale-95 flex items-center gap-1.5"
          >
            <span>Launch Live Safety Grid</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. BOTTOM SUBTLE TICKER */}
      <div className="relative z-10 w-full py-4 text-center border-t border-slate-100 text-xs text-slate-500 font-medium bg-white/70 backdrop-blur-sm">
        <span>Ward 112–126 Real-Time Emergency Monitoring Active • Sub-Meter GPS Auto-Lock</span>
      </div>
    </div>
  );
}
