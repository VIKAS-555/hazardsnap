'use client';

import React from 'react';
import InteractiveCanvas from './InteractiveCanvas';
import {
  ArrowRight,
  Camera,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Compass,
  ChevronDown,
  User,
  LogIn,
  AlertTriangle,
} from 'lucide-react';

interface LandingHeroProps {
  onEnterGrid: () => void;
  onOpenReport: () => void;
  onOpenMunicipal: () => void;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  currentUser: { name: string; role: 'citizen' | 'official' } | null;
  onLogout: () => void;
  totalHazards: number;
  criticalCount: number;
  fixedCount: number;
}

export default function LandingHero({
  onEnterGrid,
  onOpenReport,
  onOpenMunicipal,
  onOpenLogin,
  onOpenSignup,
  currentUser,
  onLogout,
  totalHazards,
  criticalCount,
  fixedCount,
}: LandingHeroProps) {
  return (
    <div className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden bg-[#07090e] border-b border-white/[0.08]">
      {/* 1. INTERACTIVE MOUSE & TOUCH CANVAS BACKGROUND */}
      <InteractiveCanvas />

      {/* Subtle radial ambient gradient (non-distracting, dark obsidian) */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#07090e]/70 to-[#07090e] pointer-events-none z-0" />

      {/* 2. TOP HERO NAVIGATION BAR */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white text-zinc-950 flex items-center justify-center font-black shadow-md">
            <AlertTriangle className="w-4 h-4 text-zinc-950" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white">HazardSnap</span>
            <span className="text-[10px] text-zinc-400 block font-mono">Civic Intelligence Grid</span>
          </div>
        </div>

        {/* Navigation Anchor Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs text-zinc-400 font-medium">
          <button
            onClick={onEnterGrid}
            className="hover:text-white transition"
          >
            Safety Grid
          </button>
          <a
            href="#how-it-works"
            className="hover:text-white transition"
          >
            How It Works
          </a>
          <button
            onClick={onOpenMunicipal}
            className="hover:text-white transition"
          >
            Municipal Triage
          </button>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-2.5">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-xs text-white flex items-center gap-1.5 font-medium">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentUser.name}</span>
                <span className="text-[10px] text-zinc-400 capitalize">({currentUser.role})</span>
              </div>
              <button
                onClick={onLogout}
                className="text-xs text-zinc-400 hover:text-white transition"
              >
                Sign out
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={onOpenLogin}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white transition hover:bg-white/[0.05]"
              >
                Log In
              </button>
              <button
                onClick={onOpenSignup}
                className="px-4 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition shadow-sm"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </header>

      {/* 3. HERO BODY CONTENT */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 text-center flex flex-col items-center space-y-7 my-auto">
        {/* Eyebrow Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md text-[11px] text-zinc-300 font-medium shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Real-time Civic Grid Active</span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400">14 Municipal Wards Online</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] max-w-4xl">
          Urban hazards resolved{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-400">
            before accidents occur.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base lg:text-lg text-zinc-400 max-w-2xl leading-relaxed font-normal">
          A hyper-local civic infrastructure network. Capture open manholes, live wires, and waterlogging in 5 seconds to power live public safety navigation and verified municipal dispatch.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 w-full sm:w-auto">
          {/* Main: Enter Grid */}
          <button
            onClick={onEnterGrid}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-sm shadow-xl transition active:scale-[0.98] flex items-center justify-center gap-2 group"
          >
            <span>Launch Safety Grid</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </button>

          {/* Quick Snap */}
          <button
            onClick={onOpenReport}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-100 border border-white/[0.1] font-semibold text-sm transition active:scale-[0.98] flex items-center justify-center gap-2 backdrop-blur-md"
          >
            <Camera className="w-4 h-4 text-zinc-300" />
            <span>Log Hazard in 5 Seconds</span>
          </button>

          {/* Municipal Direct */}
          <button
            onClick={onOpenMunicipal}
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl text-zinc-400 hover:text-white text-xs font-semibold transition flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-zinc-400" />
            <span>Municipal Dispatch Portal</span>
          </button>
        </div>
      </div>

      {/* 4. KEY METRICS STRIP & SCROLL PROMPT */}
      <div className="relative z-10 w-full border-t border-white/[0.06] bg-[#07090e]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <span className="text-[11px] text-zinc-400 uppercase tracking-wider block font-medium">
                Active Incidents
              </span>
              <span className="text-2xl font-bold text-white tabular-nums mt-0.5 block">
                {totalHazards}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-zinc-400 uppercase tracking-wider block font-medium">
                Critical Threats
              </span>
              <span className="text-2xl font-bold text-red-400 tabular-nums mt-0.5 block">
                {criticalCount}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-zinc-400 uppercase tracking-wider block font-medium">
                Photo-Verified Fixes
              </span>
              <span className="text-2xl font-bold text-emerald-400 tabular-nums mt-0.5 block">
                {fixedCount}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-zinc-400 uppercase tracking-wider block font-medium">
                Avg. Dispatch Time
              </span>
              <span className="text-2xl font-bold text-zinc-200 tabular-nums mt-0.5 block">
                38 mins
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
