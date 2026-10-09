'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '../components/Navbar';
import ReportHazardModal from '../components/ReportHazardModal';
import MunicipalQueue from '../components/MunicipalQueue';
import { HazardReport, CATEGORY_METADATA } from '../lib/types';
import { getHazards, upvoteHazard } from '../lib/supabase';
import {
  AlertTriangle,
  Radio,
  MapPin,
  Flame,
  ThumbsUp,
  Maximize2,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

// Dynamically import Leaflet SafetyMap to prevent SSR window reference error
const SafetyMap = dynamic(() => import('../components/SafetyMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-zinc-950 flex flex-col items-center justify-center text-zinc-500 rounded-3xl border border-zinc-800">
      <Radio className="w-8 h-8 animate-pulse text-red-500 mb-2" />
      <p className="text-xs font-semibold">Connecting to High-Speed Civic Radar...</p>
    </div>
  ),
});

export default function Home() {
  const [hazards, setHazards] = useState<HazardReport[]>([]);
  const [currentView, setCurrentView] = useState<'map' | 'municipal'>('map');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [focusedHazard, setFocusedHazard] = useState<HazardReport | null>(null);
  const [loading, setLoading] = useState(true);

  // Load initial hazards
  const loadData = async () => {
    const list = await getHazards();
    setHazards(list);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleHazardCreated = (newHazard: HazardReport) => {
    setHazards((prev) => [newHazard, ...prev]);
    setFocusedHazard(newHazard);
  };

  const handleHazardUpdated = () => {
    loadData();
  };

  const handleUpvoteItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await upvoteHazard(id);
    loadData();
  };

  const handleCardClick = (hazard: HazardReport) => {
    setFocusedHazard(hazard);
  };

  const criticalCount = hazards.filter(
    (h) => h.severity === 'critical' && h.status !== 'verified_fixed'
  ).length;

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col selection:bg-red-500 selection:text-white">
      {/* TOP NAVBAR */}
      <Navbar
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          if (view === 'municipal') setIsMapExpanded(false);
        }}
        onOpenReport={() => setIsReportOpen(true)}
        criticalCount={criticalCount}
      />

      {/* EMERGENCY TICKER BANNER */}
      {criticalCount > 0 && currentView === 'map' && (
        <div className="bg-red-950/70 border-b border-red-900/60 px-4 py-2 text-xs flex items-center justify-between text-red-300">
          <div className="flex items-center gap-2 truncate">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="font-bold text-red-200">URGENT HAZARD ALERT:</span>
            <span className="truncate">
              {criticalCount} critical danger zones detected (open manholes / live wires).
            </span>
          </div>
          <button
            onClick={() => setCurrentView('municipal')}
            className="shrink-0 ml-3 underline font-semibold text-red-200 hover:text-white"
          >
            Municipal Queue →
          </button>
        </div>
      )}

      {/* VIEW 1: MUNICIPAL QUEUE */}
      {currentView === 'municipal' ? (
        <div className="flex-1">
          <MunicipalQueue
            hazards={hazards}
            onHazardUpdated={handleHazardUpdated}
          />
        </div>
      ) : (
        /* VIEW 2: SPLIT COMMUTER DASHBOARD & EXPANDABLE SIDE MAP */
        <div className="flex-1 relative flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden">
          {/* LEFT / MAIN SECTION: CIVIC FEED & STATS (Hidden or collapsed when map is expanded) */}
          <section
            className={`w-full lg:w-7/12 h-full overflow-y-auto p-4 sm:p-6 space-y-6 transition-all duration-300 ${
              isMapExpanded ? 'hidden' : 'block'
            }`}
          >
            {/* HERO QUICK REPORT ACTION */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-950/50 via-zinc-900 to-zinc-950 border border-red-500/20 p-5 sm:p-6 shadow-2xl">
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] font-bold uppercase tracking-wider">
                      Live Civic Protection
                    </span>
                    <span className="text-xs text-zinc-400">Bangalore Grid</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    HazardSnap Network
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-300 max-w-md">
                    Spot open manholes, live wires, or broken pavements? Log it in 5 seconds to feed the safety grid.
                  </p>
                </div>

                <button
                  onClick={() => setIsReportOpen(true)}
                  className="shrink-0 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-sm shadow-xl shadow-red-950/60 flex items-center justify-center gap-2 transition active:scale-95"
                >
                  <Flame className="w-4 h-4 text-yellow-300 animate-pulse" />
                  <span>Report Hazard in 5s</span>
                </button>
              </div>

              {/* QUICK STATS COUNTERS */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-6 pt-5 border-t border-zinc-800/80">
                <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-2xl">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Active Dangers</span>
                  <span className="text-xl sm:text-2xl font-black text-white">
                    {hazards.filter((h) => h.status !== 'verified_fixed').length}
                  </span>
                </div>
                <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-2xl">
                  <span className="text-[10px] text-red-400 uppercase font-semibold block">Critical Threats</span>
                  <span className="text-xl sm:text-2xl font-black text-red-400">{criticalCount}</span>
                </div>
                <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-2xl">
                  <span className="text-[10px] text-emerald-400 uppercase font-semibold block">Photo Verified</span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-400">
                    {hazards.filter((h) => h.status === 'verified_fixed').length}
                  </span>
                </div>
              </div>
            </div>

            {/* LIVE CIVIC HAZARDS FEED */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Priority Hazard Feed</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
                      {hazards.length}
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-400">Click any card to inspect or locate on the safety map</p>
                </div>

                {/* Mobile Expand Map Button */}
                <button
                  onClick={() => setIsMapExpanded(true)}
                  className="lg:hidden text-xs text-blue-400 font-bold flex items-center gap-1 hover:underline"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Open Full Map</span>
                </button>
              </div>

              <div className="space-y-3">
                {hazards.map((hazard) => {
                  const meta = CATEGORY_METADATA[hazard.category] || CATEGORY_METADATA.other;
                  const isSelected = focusedHazard?.id === hazard.id;
                  const isFixed = hazard.status === 'verified_fixed';

                  return (
                    <div
                      key={hazard.id}
                      onClick={() => handleCardClick(hazard)}
                      className={`p-4 rounded-3xl border transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group ${
                        isSelected
                          ? 'bg-zinc-900/90 border-red-500 shadow-xl ring-1 ring-red-500'
                          : 'bg-zinc-950/80 border-zinc-800/80 hover:bg-zinc-900/60 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {hazard.photo_url ? (
                          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0">
                            <img
                              src={hazard.photo_url}
                              alt={hazard.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl shrink-0">
                            {meta.icon}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${meta.badgeColor}`}
                            >
                              {hazard.severity} • {hazard.severity_score}/100
                            </span>
                            {isFixed && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Fix Verified
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-sm text-zinc-100 mt-1 truncate">
                            {hazard.title}
                          </h3>
                          <p className="text-xs text-zinc-400 truncate mt-0.5">
                            {hazard.address || 'Address recorded'}
                          </p>
                        </div>
                      </div>

                      {/* Card Action Controls */}
                      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-800/60">
                        <button
                          type="button"
                          onClick={(e) => handleUpvoteItem(e, hazard.id)}
                          className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300 flex items-center gap-1.5 transition"
                          title="Confirm Hazard"
                        >
                          <ThumbsUp className="w-3.5 h-3.5 text-blue-400" />
                          <span>{hazard.upvotes_count || 1}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setFocusedHazard(hazard);
                            setIsMapExpanded(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 text-xs font-bold flex items-center gap-1 transition"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>View on Map</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* RIGHT / SIDE SECTION: INTERACTIVE SAFETY MAP (Expandable to Full Screen) */}
          <section
            className={`transition-all duration-300 p-2 sm:p-4 ${
              isMapExpanded
                ? 'absolute inset-0 z-30 w-full h-full bg-zinc-950 p-2 sm:p-4'
                : 'w-full lg:w-5/12 h-[380px] lg:h-full shrink-0'
            }`}
          >
            <div className="relative w-full h-full rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
              <SafetyMap
                hazards={hazards}
                onUpvote={() => loadData()}
                onRequestReport={() => setIsReportOpen(true)}
                isExpanded={isMapExpanded}
                onToggleExpand={() => setIsMapExpanded(!isMapExpanded)}
                focusedHazard={focusedHazard}
              />
            </div>
          </section>
        </div>
      )}

      {/* REPORT HAZARD MODAL */}
      <ReportHazardModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onHazardCreated={handleHazardCreated}
      />
    </main>
  );
}
