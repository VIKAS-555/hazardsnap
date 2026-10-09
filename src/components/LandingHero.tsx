'use client';

import React from 'react';
import AntigravityCanvas from './AntigravityCanvas';
import {
  ChevronDown,
  Camera,
  ShieldCheck,
  User,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

interface LandingHeroProps {
  onEnterGrid: () => void;
  onOpenReport: () => void;
  onOpenMunicipal: () => void;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onScrollToEmergencyLog: () => void;
  currentUser: { name: string; role: 'citizen' | 'official' } | null;
  onLogout: () => void;
}

export default function LandingHero({
  onEnterGrid,
  onOpenReport,
  onOpenMunicipal,
  onOpenLogin,
  onOpenSignup,
  onScrollToEmergencyLog,
  currentUser,
  onLogout,
}: LandingHeroProps) {
  return (
    <div className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden bg-[#ffffff] text-[#111827]">
      {/* 1. INTERACTIVE VORTEX PARTICLE CANVAS (MATCHING IMAGE 2) */}
      <AntigravityCanvas />

      {/* 2. TOP NAVIGATION BAR (MATCHING GOOGLE ANTIGRAVITY COMPOSITION) */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-5 flex items-center justify-between gap-6">
        {/* Brand Logo Left */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={onEnterGrid}>
          {/* Multi-color Google-style geometric accent */}
          <div className="w-6 h-6 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
              <path d="M12 2L3 21h18L12 2z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
              <path d="M12 7l-5 11h10l-5-11z" fill="url(#brandGrad)" />
              <defs>
                <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4338ca" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">
            HazardSnap
          </span>
        </div>

        {/* Center Navigation Links with Dropdown Carats (As in Image 2) */}
        <nav className="hidden lg:flex items-center gap-8 text-[13px] font-medium text-slate-700">
          <button
            onClick={onEnterGrid}
            className="flex items-center gap-1 hover:text-black transition"
          >
            <span>Safety Grid</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            onClick={onScrollToEmergencyLog}
            className="flex items-center gap-1 hover:text-black transition font-semibold text-slate-900"
          >
            <span>Emergency Logs</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <a
            href="#how-it-works"
            className="hover:text-black transition"
          >
            How It Works
          </a>

          <button
            onClick={onOpenMunicipal}
            className="hover:text-black transition"
          >
            Municipal Triage
          </button>

          <a
            href="#emergency-log"
            className="flex items-center gap-1 hover:text-black transition"
          >
            <span>Helplines</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </nav>

        {/* Right Auth Controls: Log In, Sign In, Sign Up */}
        <div className="flex items-center gap-3">
          <span className="text-sm">🚨</span>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>{currentUser.name}</span>
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
              {/* Sign In & Log In links */}
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

              {/* Black Rounded Pill Button (Exact match for Download button in Image 2) */}
              <button
                onClick={onOpenSignup}
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-[#111827] hover:bg-black text-white text-xs sm:text-[13px] font-medium transition shadow-sm active:scale-95 flex items-center gap-1.5"
              >
                <span>Sign Up</span>
                <span className="text-xs">→</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* 3. HERO CENTER CONTENT (MATCHING GOOGLE ANTIGRAVITY HERO TYPOGRAPHY & LAYOUT) */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-12 sm:py-20 text-center flex flex-col items-center space-y-6 my-auto">
        {/* Top Centered Brand Badge (Matching the Google Antigravity logo in Image 2) */}
        <div className="flex items-center gap-2 text-slate-800 mb-1">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
            <path d="M12 3L4 20h16L12 3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M12 7l-5 11h10l-5-11z" fill="url(#heroGrad)" />
            <defs>
              <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
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

        {/* Huge Modern Headline (Exact Font Style from Image 2: "Experience liftoff with the next-gen agent platform") */}
        <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-semibold text-slate-950 tracking-[-0.035em] leading-[1.12] max-w-3xl">
          Experience rapid response with the next-gen civic safety grid
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-600 max-w-xl font-normal leading-relaxed">
          A hyper-local civic infrastructure network. Log open manholes, live wires, and waterlogging in 5 seconds to feed real-time public safety navigation and verified municipal dispatch.
        </p>

        {/* Centered Black Pill Button (Exact Match for Image 2 "Download" Button) */}
        <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onScrollToEmergencyLog}
            className="px-8 py-3 rounded-full bg-[#111827] hover:bg-black text-white text-sm font-medium transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            <span>Emergency Complaints Log</span>
            <span className="text-xs">⤓</span>
          </button>

          <button
            onClick={onEnterGrid}
            className="px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-medium transition active:scale-95 flex items-center gap-1.5"
          >
            <span>Launch Live Safety Grid</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. BOTTOM SUBTLE TICKER */}
      <div className="relative z-10 w-full py-4 text-center border-t border-slate-100 text-xs text-slate-500 font-medium">
        <span>Ward 112–126 Real-Time Emergency Monitoring Active • Sub-Meter GPS Auto-Lock</span>
      </div>
    </div>
  );
}
