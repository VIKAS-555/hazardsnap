'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '../components/Navbar';
import ReportHazardModal from '../components/ReportHazardModal';
import MunicipalQueue from '../components/MunicipalQueue';
import { HazardReport } from '../lib/types';
import { getHazards } from '../lib/supabase';
import { AlertTriangle, ShieldCheck, MapPin, Radio, Sparkles } from 'lucide-react';

// Dynamically import Leaflet SafetyMap to prevent SSR window reference error
const SafetyMap = dynamic(() => import('../components/SafetyMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-4rem)] bg-zinc-950 flex flex-col items-center justify-center text-zinc-500">
      <Radio className="w-8 h-8 animate-pulse text-red-500 mb-2" />
      <p className="text-sm font-semibold">Connecting to Civic Safety Grid...</p>
    </div>
  ),
});

export default function Home() {
  const [hazards, setHazards] = useState<HazardReport[]>([]);
  const [currentView, setCurrentView] = useState<'map' | 'municipal'>('map');
  const [isReportOpen, setIsReportOpen] = useState(false);
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
  };

  const handleHazardUpdated = () => {
    loadData();
  };

  const criticalCount = hazards.filter(
    (h) => h.severity === 'critical' && h.status !== 'verified_fixed'
  ).length;

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* TOP NAVBAR */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenReport={() => setIsReportOpen(true)}
        criticalCount={criticalCount}
      />

      {/* EMERGENCY TICKER BANNER */}
      {criticalCount > 0 && (
        <div className="bg-red-950/70 border-b border-red-900/60 px-4 py-2 text-xs flex items-center justify-between text-red-300">
          <div className="flex items-center gap-2 truncate">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="font-bold text-red-200">URGENT HAZARD ALERT:</span>
            <span className="truncate">
              {criticalCount} high-risk hazards detected (open manholes / live wires). Crews dispatched.
            </span>
          </div>
          <button
            onClick={() => setCurrentView('municipal')}
            className="shrink-0 ml-3 underline font-semibold text-red-200 hover:text-white"
          >
            View Triage Queue →
          </button>
        </div>
      )}

      {/* CONTENT AREA */}
      <div className="flex-1 relative">
        {currentView === 'map' ? (
          <SafetyMap
            hazards={hazards}
            onUpvote={() => loadData()}
            onRequestReport={() => setIsReportOpen(true)}
          />
        ) : (
          <MunicipalQueue
            hazards={hazards}
            onHazardUpdated={handleHazardUpdated}
          />
        )}
      </div>

      {/* REPORT HAZARD MODAL */}
      <ReportHazardModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onHazardCreated={handleHazardCreated}
      />
    </main>
  );
}
