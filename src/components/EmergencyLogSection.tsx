'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Flame,
  PhoneCall,
  Clock,
  CheckCircle2,
  MapPin,
  Send,
  Camera,
  ChevronRight,
  ShieldAlert,
  Radio,
  Eye,
  ThumbsUp,
} from 'lucide-react';
import { HazardReport, CATEGORY_METADATA } from '../lib/types';

interface EmergencyLogSectionProps {
  hazards: HazardReport[];
  onOpenReport: () => void;
  onSelectHazard: (hazard: HazardReport) => void;
  onUpvote: (hazardId: string) => void;
}

export default function EmergencyLogSection({
  hazards,
  onOpenReport,
  onSelectHazard,
  onUpvote,
}: EmergencyLogSectionProps) {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'in_progress'>('all');

  // Filter emergency items
  const emergencyItems = hazards.filter((h) => {
    if (filterSeverity === 'critical') return h.severity === 'critical';
    if (filterSeverity === 'in_progress') return h.status === 'in_progress';
    return true; // show all prioritized complaints
  });

  return (
    <section id="emergency-log" className="bg-[#ffffff] dark:bg-[#080c14] text-[#111827] dark:text-slate-100 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span>Priority 1 Civic Emergency Board</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Emergency Complaints Log
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl">
              Live urban infrastructure emergencies reported by commuters. Dangers ranked by lethal severity score with automated crew dispatch and audit trails.
            </p>
          </div>

          {/* Quick Action: Log Emergency */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenReport}
              className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition shadow-sm flex items-center gap-2 active:scale-95"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>File Emergency Complaint</span>
            </button>
          </div>
        </div>

        {/* Emergency Hotline Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 flex items-center justify-center text-sm font-bold">
              ⚡
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 dark:text-slate-500 block">
                Live Electric Wires / Snapped Cable
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">BESCOM Hotline: 1912</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center text-sm font-bold">
              🕳️
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 dark:text-slate-500 block">
                Open Sewers / Drain Collapse
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Control Room: 1533</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-sm font-bold">
              🚨
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 dark:text-slate-500 block">
                Immediate Road Rescue / Ambulance
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">National Emergency: 112</span>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilterSeverity('all')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition shrink-0 ${
              filterSeverity === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Emergency Logs ({hazards.length})
          </button>
          <button
            onClick={() => setFilterSeverity('critical')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition shrink-0 flex items-center gap-1.5 ${
              filterSeverity === 'critical'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Critical Threats ({hazards.filter((h) => h.severity === 'critical').length})
          </button>
          <button
            onClick={() => setFilterSeverity('in_progress')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition shrink-0 flex items-center gap-1.5 ${
              filterSeverity === 'in_progress'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Active Field Dispatches ({hazards.filter((h) => h.status === 'in_progress').length})
          </button>
        </div>

        {/* Live Complaint Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emergencyItems.map((item, index) => {
            const meta = CATEGORY_METADATA[item.category] || CATEGORY_METADATA.other;
            const isCritical = item.severity === 'critical';
            const isFixed = item.status === 'verified_fixed';
            const isInProgress = item.status === 'in_progress';

            return (
              <div
                key={item.id}
                onClick={() => onSelectHazard(item)}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Top Meta */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg">
                        {meta.icon}
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          isCritical
                            ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400'
                        }`}
                      >
                        {item.severity} • Danger {item.severity_score}/100
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      #EM-{String(index + 834).padStart(4, '0')}
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Location & Reported Meta */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1 truncate font-medium text-slate-700 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span className="truncate">{item.address || 'GPS verified coordinate logged'}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 shrink-0">
                      <span>{item.reported_by || 'Commuter'}</span>
                      <span>•</span>
                      <span>
                        {new Date(item.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status & Actions Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    {isFixed ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified Fixed</span>
                      </span>
                    ) : isInProgress ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Dispatched (ETA 12m)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-red-600 dark:text-red-400 animate-pulse">
                        <Radio className="w-3.5 h-3.5" />
                        <span>Pending Response</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpvote(item.id);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1 transition"
                    >
                      <ThumbsUp className="w-3 h-3 text-blue-500" />
                      <span>{item.upvotes_count || 1} Confirmations</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectHazard(item)}
                      className="text-slate-900 dark:text-white font-bold hover:underline flex items-center gap-0.5 text-xs"
                    >
                      <span>Track Grid</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
