'use client';

import React, { useState } from 'react';
import {
  Navigation,
  ShieldAlert,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowRight,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Footprints,
} from 'lucide-react';
import { HazardReport, CATEGORY_METADATA } from '../lib/types';
import { SafeNavigationPlan, calculateSafeRoute, RouteCoordinate } from '../lib/routing';

interface SafeRoutePlannerProps {
  userLocation: { lat: number; lng: number };
  hazards: HazardReport[];
  onRouteCalculated: (plan: SafeNavigationPlan | null) => void;
  onStartSimulation: () => void;
  isSimulating: boolean;
  onResetSimulation: () => void;
}

const PRESET_DESTINATIONS = [
  { name: 'Central Metro Station', lat: 12.9756, lng: 77.6066 },
  { name: 'City Hospital & Trauma Center', lat: 12.9648, lng: 77.5925 },
  { name: 'Tech Park Gate 2', lat: 12.9789, lng: 77.5902 },
  { name: 'Underpass Transit Hub', lat: 12.9672, lng: 77.6124 },
];

export default function SafeRoutePlanner({
  userLocation,
  hazards,
  onRouteCalculated,
  onStartSimulation,
  isSimulating,
  onResetSimulation,
}: SafeRoutePlannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(PRESET_DESTINATIONS[0]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [plan, setPlan] = useState<SafeNavigationPlan | null>(null);

  const handleComputeRoute = async () => {
    setIsCalculating(true);
    const start: RouteCoordinate = { lat: userLocation.lat, lng: userLocation.lng };
    const end: RouteCoordinate = {
      lat: selectedDestination.lat,
      lng: selectedDestination.lng,
    };

    const calculatedPlan = await calculateSafeRoute(start, end, hazards);
    setPlan(calculatedPlan);
    setIsCalculating(false);
    onRouteCalculated(calculatedPlan);
  };

  const handleClearRoute = () => {
    setPlan(null);
    onRouteCalculated(null);
    onResetSimulation();
  };

  if (!isOpen) {
    return (
      <div className="absolute top-20 left-4 z-20 pointer-events-auto">
        <button
          onClick={() => {
            setIsOpen(true);
            handleComputeRoute();
          }}
          className="px-4 py-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 hover:bg-white dark:hover:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-lg backdrop-blur-md flex items-center gap-2 text-xs font-bold transition group"
        >
          <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 group-hover:scale-105 transition">
            <Footprints className="w-3.5 h-3.5" />
          </div>
          <span>Safe Route Navigator</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-semibold">
            Hazard-Free
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-20 left-4 right-4 sm:right-auto sm:w-96 z-20 pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl text-slate-900 dark:text-white animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
            <Footprints className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              Safe Route Navigator
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Avoid live wires, open manholes & floods</p>
          </div>
        </div>
        <button
          onClick={() => {
            setIsOpen(false);
            handleClearRoute();
          }}
          className="text-xs text-slate-400 hover:text-slate-800 dark:hover:text-white p-1"
        >
          ✕
        </button>
      </div>

      {/* Destination Select */}
      <div className="mt-3 space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-red-500" />
          Choose Destination
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {PRESET_DESTINATIONS.map((dest) => (
            <button
              key={dest.name}
              onClick={() => setSelectedDestination(dest)}
              className={`p-2 rounded-xl text-left text-xs transition border truncate ${
                selectedDestination.name === dest.name
                  ? 'bg-slate-900 border-slate-900 text-white font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="truncate font-medium">{dest.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={handleComputeRoute}
          disabled={isCalculating}
          className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
        >
          {isCalculating ? (
            <span>Analyzing Danger Zones...</span>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Calculate Safe Route</span>
            </>
          )}
        </button>

        {plan && (
          <button
            onClick={handleClearRoute}
            className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition text-xs"
            title="Reset Route"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Route Comparison Card */}
      {plan && (
        <div className="mt-4 space-y-3">
          {plan.isDetourRequired ? (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  Direct Path Has Critical Risks!
                </span>
                <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200 font-bold">
                  +{Math.round(plan.extraTimeSeconds / 60)} min Detour
                </span>
              </div>

              {/* Hazards list avoided */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">
                  Hazards Safely Bypassed:
                </span>
                {plan.hazardsAvoided.map((h) => {
                  const meta = CATEGORY_METADATA[h.category] || CATEGORY_METADATA.other;
                  return (
                    <div
                      key={h.id}
                      className="flex items-center justify-between text-xs bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span>{meta.icon}</span>
                        <span className="truncate text-slate-800 font-medium">{h.title}</span>
                      </div>
                      <span className="text-[10px] text-red-600 font-bold shrink-0 font-mono">
                        {h.severity_score}/100 Risk
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Safe Route Perks */}
              <div className="text-[11px] text-emerald-700 flex items-center gap-1 pt-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                <span>Green path routes you 100m away from danger zones.</span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs font-semibold">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Direct path is clear! No active hazards intercepted.</span>
            </div>
          )}

          {/* Metrics summary */}
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="bg-slate-50 border border-slate-200 p-2 rounded-xl">
              <span className="text-[10px] text-slate-500 block font-medium">Distance</span>
              <span className="font-bold text-slate-900">
                {(plan.safeRoute.distanceMeters / 1000).toFixed(2)} km
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-2 rounded-xl">
              <span className="text-[10px] text-slate-500 block font-medium">Estimated Walk</span>
              <span className="font-bold text-slate-900">
                {Math.ceil(plan.safeRoute.durationSeconds / 60)} mins
              </span>
            </div>
          </div>

          {/* Simulate Walking Tour CTA */}
          <button
            onClick={isSimulating ? onResetSimulation : onStartSimulation}
            className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border ${
              isSimulating
                ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-sm'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isSimulating ? 'fill-current' : ''}`} />
            <span>{isSimulating ? 'Simulating Commuter Walk...' : 'Simulate Walking Route'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
