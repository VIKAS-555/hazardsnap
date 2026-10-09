'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import HowItWorks from '../components/HowItWorks';
import Footer from '../components/Footer';
import ReportHazardModal from '../components/ReportHazardModal';
import MunicipalQueue from '../components/MunicipalQueue';
import { HazardReport, CATEGORY_METADATA, HazardCategory } from '../lib/types';
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
  Search,
  Filter,
} from 'lucide-react';

// Dynamically import Leaflet SafetyMap
const SafetyMap = dynamic(() => import('../components/SafetyMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[420px] bg-[#080C14] flex flex-col items-center justify-center text-slate-500 rounded-3xl border border-white/[0.08]">
      <Radio className="w-7 h-7 animate-pulse text-rose-500 mb-2" />
      <p className="text-xs font-semibold text-slate-400">Loading High-Speed Spatial Radar...</p>
    </div>
  ),
});

export default function Home() {
  const [hazards, setHazards] = useState<HazardReport[]>([]);
  const [currentView, setCurrentView] = useState<'map' | 'municipal'>('map');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [focusedHazard, setFocusedHazard] = useState<HazardReport | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const commandCenterRef = useRef<HTMLDivElement | null>(null);

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
    if (!isMapExpanded && commandCenterRef.current) {
      commandCenterRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToCommandCenter = () => {
    commandCenterRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Filter hazards by search & tab
  const filteredHazards = useMemo(() => {
    return hazards.filter((h) => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = h.title.toLowerCase().includes(q);
        const matchesAddress = (h.address || '').toLowerCase().includes(q);
        const matchesDesc = (h.description || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesAddress && !matchesDesc) return false;
      }

      // Tab filter
      if (activeFilterTab === 'critical') return h.severity === 'critical';
      if (activeFilterTab === 'waterlogging') return h.category === 'waterlogging';
      if (activeFilterTab === 'fixed') return h.status === 'verified_fixed';
      if (activeFilterTab === 'wires') return h.category === 'live_wire';
      if (activeFilterTab === 'manholes') return h.category === 'open_manhole';

      return true;
    });
  }, [hazards, searchQuery, activeFilterTab]);

  const criticalCount = hazards.filter(
    (h) => h.severity === 'critical' && h.status !== 'verified_fixed'
  ).length;

  const fixedCount = hazards.filter((h) => h.status === 'verified_fixed').length;

  return (
    <main className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col">
      {/* NAVBAR */}
      <Navbar
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          if (view === 'municipal') setIsMapExpanded(false);
        }}
        onOpenReport={() => setIsReportOpen(true)}
        criticalCount={criticalCount}
      />

      {/* VIEW 1: MUNICIPAL QUEUE */}
      {currentView === 'municipal' ? (
        <div className="flex-1">
          <MunicipalQueue
            hazards={hazards}
            onHazardUpdated={handleHazardUpdated}
          />
        </div>
      ) : (
        /* VIEW 2: PUBLIC PLATFORM (HERO + INTERACTIVE GRID + HOW IT WORKS) */
        <div className="flex-1 flex flex-col">
          {/* 1. PROFESSIONAL EXECUTIVE HERO SECTION */}
          <HeroSection
            onOpenReport={() => setIsReportOpen(true)}
            onExploreMap={scrollToCommandCenter}
            onOpenMunicipal={() => setCurrentView('municipal')}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            totalHazards={hazards.length}
            criticalCount={criticalCount}
            fixedCount={fixedCount}
          />

          {/* 2. DUAL INTERACTIVE COMMAND CENTER (INCIDENT STREAM + EXPANDABLE SIDE MAP) */}
          <div
            ref={commandCenterRef}
            className="border-b border-white/[0.08] bg-[#070B12] py-8 sm:py-10 px-4 sm:px-6 lg:px-8"
          >
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header and Filter Tabs */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    <span>Live Incident Command Stream</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/[0.06] text-slate-400 font-mono">
                      {filteredHazards.length} Displayed
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click any incident card to pinpoint coordinates on the safety grid.
                  </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none bg-white/[0.03] p-1.5 rounded-2xl border border-white/[0.06]">
                  <button
                    onClick={() => setActiveFilterTab('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      activeFilterTab === 'all'
                        ? 'bg-white/[0.12] text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All Hazards
                  </button>
                  <button
                    onClick={() => setActiveFilterTab('critical')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
                      activeFilterTab === 'critical'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-rose-400 hover:text-rose-300'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                    Critical Only ({criticalCount})
                  </button>
                  <button
                    onClick={() => setActiveFilterTab('wires')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      activeFilterTab === 'wires'
                        ? 'bg-white/[0.12] text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ⚡ Live Wires
                  </button>
                  <button
                    onClick={() => setActiveFilterTab('manholes')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      activeFilterTab === 'manholes'
                        ? 'bg-white/[0.12] text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🕳️ Manholes
                  </button>
                  <button
                    onClick={() => setActiveFilterTab('fixed')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
                      activeFilterTab === 'fixed'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-emerald-400 hover:text-emerald-300'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Fixed ({fixedCount})
                  </button>
                </div>
              </div>

              {/* DUAL WORKSPACE: LEFT FEED + RIGHT SIDE-MAP */}
              <div className="relative flex flex-col lg:flex-row gap-6 min-h-[580px] lg:h-[680px]">
                {/* LEFT FEED PANEL */}
                <div
                  className={`w-full lg:w-1/2 h-full overflow-y-auto space-y-3 pr-1 ${
                    isMapExpanded ? 'hidden' : 'block'
                  }`}
                >
                  {filteredHazards.length === 0 ? (
                    <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-white/[0.06] text-slate-500">
                      <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400/50 mb-2" />
                      <p className="text-sm font-semibold text-slate-300">No matching hazards found</p>
                      <p className="text-xs text-slate-500 mt-1">Try clearing your search or filter.</p>
                    </div>
                  ) : (
                    filteredHazards.map((hazard) => {
                      const meta = CATEGORY_METADATA[hazard.category] || CATEGORY_METADATA.other;
                      const isSelected = focusedHazard?.id === hazard.id;
                      const isFixed = hazard.status === 'verified_fixed';

                      return (
                        <div
                          key={hazard.id}
                          onClick={() => handleCardClick(hazard)}
                          className={`p-4 rounded-3xl border transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group ${
                            isSelected
                              ? 'bg-white/[0.06] border-rose-500/80 shadow-xl ring-1 ring-rose-500/50'
                              : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12]'
                          }`}
                        >
                          <div className="flex items-start gap-3.5 flex-1 min-w-0">
                            {hazard.photo_url ? (
                              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-black/40 border border-white/[0.08] shrink-0">
                                <img
                                  src={hazard.photo_url}
                                  alt={hazard.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition"
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-xl shrink-0">
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

                              <h3 className="font-bold text-sm text-slate-100 mt-1 truncate">
                                {hazard.title}
                              </h3>
                              <p className="text-xs text-slate-400 truncate mt-0.5">
                                {hazard.address || 'Address recorded'}
                              </p>
                            </div>
                          </div>

                          {/* Card Action Controls */}
                          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-white/[0.06]">
                            <button
                              type="button"
                              onClick={(e) => handleUpvoteItem(e, hazard.id)}
                              className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition"
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
                              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold flex items-center gap-1 transition"
                            >
                              <MapPin className="w-3.5 h-3.5" />
                              <span>Pinpoint</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* RIGHT SIDE MAP (EXPANDABLE) */}
                <div
                  className={`transition-all duration-300 ${
                    isMapExpanded
                      ? 'fixed inset-4 z-50 rounded-3xl overflow-hidden shadow-2xl border border-white/[0.15]'
                      : 'w-full lg:w-1/2 h-[420px] lg:h-full rounded-3xl overflow-hidden'
                  }`}
                >
                  <SafetyMap
                    hazards={hazards}
                    onUpvote={() => loadData()}
                    onRequestReport={() => setIsReportOpen(true)}
                    isExpanded={isMapExpanded}
                    onToggleExpand={() => setIsMapExpanded(!isMapExpanded)}
                    focusedHazard={focusedHazard}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. CIVIC GOVERNANCE HOW IT WORKS SECTION */}
          <HowItWorks />

          {/* 4. FOOTER */}
          <Footer />
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
