'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import MainNavigation, { ActiveTab } from '../components/MainNavigation';
import LandingHero from '../components/LandingHero';
import EmergencyLogSection from '../components/EmergencyLogSection';
import AuthModal from '../components/AuthModal';
import HowItWorks from '../components/HowItWorks';
import Footer from '../components/Footer';
import ReportHazardModal from '../components/ReportHazardModal';
import MunicipalQueue from '../components/MunicipalQueue';
import { HazardReport, CATEGORY_METADATA } from '../lib/types';
import { getHazards, upvoteHazard } from '../lib/supabase';
import {
  AlertTriangle,
  Radio,
  MapPin,
  ThumbsUp,
  Maximize2,
  CheckCircle2,
  Search,
  Filter,
  ShieldCheck,
  Compass,
} from 'lucide-react';

// Dynamically import Leaflet SafetyMap to prevent SSR window reference error
const SafetyMap = dynamic(() => import('../components/SafetyMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[460px] bg-[#090d16] flex flex-col items-center justify-center text-slate-400 rounded-3xl border border-white/[0.08]">
      <Radio className="w-7 h-7 animate-pulse text-indigo-500 mb-2" />
      <p className="text-xs font-semibold text-slate-300">Loading High-Speed Spatial Radar...</p>
    </div>
  ),
});

export default function Home() {
  const [hazards, setHazards] = useState<HazardReport[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [focusedHazard, setFocusedHazard] = useState<HazardReport | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Dark Mode State
  const [isDark, setIsDark] = useState<boolean>(false);

  // Auth State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentUser, setCurrentUser] = useState<{ name: string; role: 'citizen' | 'official' } | null>(null);

  // Sync dark mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('hazardsnap_theme');
      if (savedTheme) {
        const dark = savedTheme === 'dark';
        setIsDark(dark);
        document.documentElement.classList.toggle('dark', dark);
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setIsDark(true);
        document.documentElement.classList.add('dark');
      }

      // Check saved user session
      const savedUser = localStorage.getItem('hazardsnap_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setCurrentUser(parsed);
          setActiveTab('grid');
        } catch (e) {
          // ignore
        }
      }
    }
  }, []);

  const handleToggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        if (next) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('hazardsnap_theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('hazardsnap_theme', 'light');
        }
      }
      return next;
    });
  };

  const handleAuthSuccess = (user: { name: string; role: 'citizen' | 'official' }) => {
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hazardsnap_user', JSON.stringify(user));
    }
    setActiveTab('grid');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hazardsnap_user');
    }
    setActiveTab('home');
  };

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

  // Filter hazards by search & tab
  const filteredHazards = useMemo(() => {
    return hazards.filter((h) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = h.title.toLowerCase().includes(q);
        const matchesAddress = (h.address || '').toLowerCase().includes(q);
        const matchesDesc = (h.description || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesAddress && !matchesDesc) return false;
      }

      if (activeFilterTab === 'critical') return h.severity === 'critical';
      if (activeFilterTab === 'wires') return h.category === 'live_wire';
      if (activeFilterTab === 'manholes') return h.category === 'open_manhole';
      if (activeFilterTab === 'waterlogging') return h.category === 'waterlogging';
      if (activeFilterTab === 'fixed') return h.status === 'verified_fixed';

      return true;
    });
  }, [hazards, searchQuery, activeFilterTab]);

  const criticalCount = hazards.filter(
    (h) => h.severity === 'critical' && h.status !== 'verified_fixed'
  ).length;

  return (
    <main className="min-h-screen bg-white dark:bg-[#080c14] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-slate-800 selection:text-white transition-colors">
      {/* 1. TOP PERSISTENT NAVIGATION */}
      <MainNavigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'grid') setIsMapExpanded(false);
        }}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenLogin={() => {
          setAuthMode('login');
          setIsAuthOpen(true);
        }}
        onOpenSignup={() => {
          setAuthMode('signup');
          setIsAuthOpen(true);
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
        criticalCount={criticalCount}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />

      {/* 2. AUTH-GATED VIEW: IF NOT LOGGED IN, RENDER ONLY THE STANDALONE LANDING PAGE */}
      {!currentUser ? (
        <div className="flex-1 flex flex-col">
          <LandingHero
            onGoToGrid={() => {
              setAuthMode('login');
              setIsAuthOpen(true);
            }}
            onGoToEmergency={() => {
              setAuthMode('login');
              setIsAuthOpen(true);
            }}
            onOpenReport={() => setIsReportOpen(true)}
            onGoToMunicipal={() => {
              setAuthMode('login');
              setIsAuthOpen(true);
            }}
          />
          <Footer />
        </div>
      ) : (
        /* LOGGED IN USER: FULL TABBED CIVIC COMMAND CENTER */
        <>
          {/* TAB 1: HOME */}
          {activeTab === 'home' && (
            <div className="flex-1 flex flex-col">
              <LandingHero
                onGoToGrid={() => setActiveTab('grid')}
                onGoToEmergency={() => setActiveTab('emergency')}
                onOpenReport={() => setIsReportOpen(true)}
                onGoToMunicipal={() => setActiveTab('municipal')}
              />
              <Footer />
            </div>
          )}

          {/* TAB 2: EMERGENCY COMPLAINTS LOG */}
          {activeTab === 'emergency' && (
            <div className="flex-1 flex flex-col bg-white dark:bg-[#080c14] transition-colors">
              <EmergencyLogSection
                hazards={hazards}
                onOpenReport={() => setIsReportOpen(true)}
                onSelectHazard={(hazard) => {
                  setFocusedHazard(hazard);
                  setActiveTab('grid');
                }}
                onUpvote={async (id) => {
                  await upvoteHazard(id);
                  loadData();
                }}
              />
              <Footer />
            </div>
          )}

          {/* TAB 3: SPATIAL SAFETY GRID & LIVE INCIDENT STREAM */}
          {activeTab === 'grid' && (
            <div className="flex-1 flex flex-col bg-[#f8fafc] dark:bg-[#080c14] text-slate-900 dark:text-white transition-colors">
              <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6 lg:px-8 py-6 transition-colors">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        LIVE COMMAND CENTER
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        GPS Synchronization Active
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
                      Spatial Hazard Map & Live Incident Stream
                    </h2>
                  </div>

                  {/* Search Bar & Fast Report Trigger */}
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-72">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search street, ward, or hazard..."
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-slate-400 dark:focus:border-slate-500 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-800 transition"
                      />
                    </div>

                    <button
                      onClick={() => setIsReportOpen(true)}
                      className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-xs shadow-sm transition active:scale-95 shrink-0"
                    >
                      Log Hazard (5s)
                    </button>
                  </div>
                </div>
              </div>

              {/* DUAL WORKSPACE: LEFT FEED + RIGHT INTERACTIVE MAP */}
              <div className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-4">
                  {/* Filter Tabs */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-slate-200/50 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto scrollbar-none">
                      <button
                        onClick={() => setActiveFilterTab('all')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                          activeFilterTab === 'all'
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700'
                        }`}
                      >
                        All Incidents ({hazards.length})
                      </button>
                      <button
                        onClick={() => setActiveFilterTab('critical')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 ${
                          activeFilterTab === 'critical'
                            ? 'bg-red-600 text-white shadow-sm font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                        Critical ({criticalCount})
                      </button>
                      <button
                        onClick={() => setActiveFilterTab('wires')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                          activeFilterTab === 'wires'
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700'
                        }`}
                      >
                        ⚡ Live Wires
                      </button>
                      <button
                        onClick={() => setActiveFilterTab('manholes')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                          activeFilterTab === 'manholes'
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700'
                        }`}
                      >
                        🕳️ Open Manholes
                      </button>
                      <button
                        onClick={() => setActiveFilterTab('waterlogging')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                          activeFilterTab === 'waterlogging'
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700'
                        }`}
                      >
                        🌊 Flooding
                      </button>
                      <button
                        onClick={() => setActiveFilterTab('fixed')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 ${
                          activeFilterTab === 'fixed'
                            ? 'bg-emerald-600 text-white shadow-sm font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Fixed ({hazards.filter((h) => h.status === 'verified_fixed').length})
                      </button>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden sm:block">
                      Showing {filteredHazards.length} alerts
                    </div>
                  </div>

                  {/* Split Content Area */}
                  <div className="relative flex flex-col lg:flex-row gap-5 min-h-[600px] lg:h-[700px]">
                    {/* LEFT FEED PANEL */}
                    <div
                      className={`w-full lg:w-5/12 h-full overflow-y-auto space-y-2.5 pr-1 ${
                        isMapExpanded ? 'hidden' : 'block'
                      }`}
                    >
                      {filteredHazards.length === 0 ? (
                        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 shadow-sm">
                          <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">No active incidents found</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try selecting a different filter category.</p>
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
                              className={`p-4 rounded-3xl border transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group ${
                                isSelected
                                  ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-400 dark:border-slate-600 shadow-md ring-1 ring-slate-400 dark:ring-slate-600'
                                  : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                              }`}
                            >
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                {/* Sleek Category Icon (No Fake Photos) */}
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xl shrink-0 shadow-sm">
                                  {meta.icon}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                      Score {hazard.severity_score}/100
                                    </span>
                                    {hazard.severity === 'critical' && !isFixed && (
                                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                                        Critical
                                      </span>
                                    )}
                                    {isFixed && (
                                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Fixed
                                      </span>
                                    )}
                                  </div>

                                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white mt-1 truncate">
                                    {hazard.title}
                                  </h3>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                    {hazard.address || 'Address logged'}
                                  </p>
                                </div>
                              </div>

                              {/* Card Controls */}
                              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                                <button
                                  type="button"
                                  onClick={(e) => handleUpvoteItem(e, hazard.id)}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition"
                                  title="Confirm Incident"
                                >
                                  <ThumbsUp className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                  <span>{hazard.upvotes_count || 1}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setFocusedHazard(hazard);
                                    setIsMapExpanded(true);
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-xs transition flex items-center gap-1 shadow-sm"
                                >
                                  <MapPin className="w-3 h-3" />
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
                          ? 'fixed inset-4 z-50 rounded-3xl overflow-hidden shadow-2xl border border-slate-300 dark:border-slate-700'
                          : 'w-full lg:w-7/12 h-[460px] lg:h-full rounded-3xl overflow-hidden'
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
              <Footer />
            </div>
          )}

          {/* TAB 4: MUNICIPAL TRIAGE QUEUE */}
          {activeTab === 'municipal' && (
            <div className="flex-1 bg-[#f8fafc] dark:bg-[#080c14] text-slate-900 dark:text-white py-8 transition-colors">
              <div className="max-w-6xl mx-auto px-4 mb-4 flex justify-between items-center">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Municipal Response Clearance</span>
              </div>
              <MunicipalQueue
                hazards={hazards}
                onHazardUpdated={handleHazardUpdated}
              />
              <Footer />
            </div>
          )}

          {/* TAB 5: HOW IT WORKS & CIVIC AUDIT */}
          {activeTab === 'how-it-works' && (
            <div className="flex-1 flex flex-col bg-white dark:bg-[#080c14] transition-colors">
              <HowItWorks />
              <Footer />
            </div>
          )}
        </>
      )}

      {/* AUTH MODAL */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* REPORT HAZARD MODAL */}
      <ReportHazardModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onHazardCreated={handleHazardCreated}
      />
    </main>
  );
}
