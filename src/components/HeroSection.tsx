'use client';

import React from 'react';
import {
  Flame,
  ShieldCheck,
  Footprints,
  Clock,
  Search,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  MapPin,
  Camera,
} from 'lucide-react';

interface HeroSectionProps {
  onOpenReport: () => void;
  onExploreMap: () => void;
  onOpenMunicipal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalHazards: number;
  criticalCount: number;
  fixedCount: number;
}

export default function HeroSection({
  onOpenReport,
  onExploreMap,
  onOpenMunicipal,
  searchQuery,
  onSearchChange,
  totalHazards,
  criticalCount,
  fixedCount,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden border-b border-white/[0.08] bg-[#080C14] pt-8 pb-10 sm:pt-12 sm:pb-14 px-4 sm:px-6 lg:px-8">
      {/* Subtle Ambient Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[360px] bg-gradient-to-b from-rose-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Status Pill */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md text-xs text-slate-300 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">Live Civic Grid Active</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">Ward 112–126 Command Center</span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Photographic Proof Enforced
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Zero-Friction Reporting
            </span>
          </div>
        </div>

        {/* Hero Title & Value Proposition */}
        <div className="max-w-3xl space-y-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
            Civic Hazard Intelligence &{' '}
            <span className="bg-gradient-to-r from-rose-400 via-amber-300 to-orange-400 bg-clip-text text-transparent">
              Rapid Response Grid
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl font-normal">
            Eliminating urban road risks before accidents happen. Commuters log open manholes, dangling 11kV live wires, and waterlogging in 5 seconds — feeding a live hazard-avoiding safety map and a verified municipal dispatch queue.
          </p>
        </div>

        {/* Action Buttons & Quick Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          {/* Main Action: Report */}
          <button
            onClick={onOpenReport}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-semibold text-sm shadow-xl shadow-rose-950/50 flex items-center justify-center gap-2.5 transition active:scale-[0.98] border border-white/10"
          >
            <Camera className="w-4 h-4" />
            <span>Report Hazard in 5 Seconds</span>
          </button>

          {/* Secondary Action: Safe Route */}
          <button
            onClick={onExploreMap}
            className="px-5 py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/[0.08] font-semibold text-sm transition flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Footprints className="w-4 h-4 text-emerald-400" />
            <span>Safe Route Navigator</span>
          </button>

          {/* Tertiary Action: Municipal */}
          <button
            onClick={onOpenMunicipal}
            className="px-5 py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] font-semibold text-sm transition flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Municipal Triage</span>
          </button>

          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search street, ward, or hazard..."
              className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-rose-500/60 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
            />
          </div>
        </div>

        {/* Executive KPI Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Total Logged
            </div>
            <div className="text-2xl font-bold text-white mt-1 tabular-nums">
              {totalHazards}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Real-time civic alerts</div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 backdrop-blur-sm">
            <div className="text-[11px] font-medium text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              Critical Dangers
            </div>
            <div className="text-2xl font-bold text-rose-300 mt-1 tabular-nums">
              {criticalCount}
            </div>
            <div className="text-[11px] text-rose-400/70 mt-0.5">Live wires & open drains</div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 backdrop-blur-sm">
            <div className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Photo Verified
            </div>
            <div className="text-2xl font-bold text-emerald-300 mt-1 tabular-nums">
              {fixedCount}
            </div>
            <div className="text-[11px] text-emerald-400/70 mt-0.5">Audited before/after proof</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Avg. Dispatch Time
            </div>
            <div className="text-2xl font-bold text-slate-200 mt-1 tabular-nums">
              38 mins
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Emergency crew deployment</div>
          </div>
        </div>
      </div>
    </section>
  );
}
