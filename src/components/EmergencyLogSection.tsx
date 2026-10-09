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
    <section id="emergency-log" className="bg-[#ffffff] text-[#111827] py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span>Priority 1 Civic Emergency Board</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Emergency Complaints Log
            </h2>
            <p className="text-sm text-slate-600 max-w-xl">
              Live urban infrastructure emergencies reported by commuters. Dangers ranked by lethal severity score with automated crew dispatch and photographic audit trails.
            </p>
          </div>

          {/* Quick Action: Log Emergency */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenReport}
              className="px-6 py-3 rounded-full bg-black hover:bg-slate-800 text-white font-semibold text-xs transition shadow-lg flex items-center gap-2 active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>File Emergency Complaint (5s)</span>
            </button>
          </div>
        </div>

        {/* Emergency Hotline Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center text-sm font-bold">
              ⚡
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                Live Electric Wires / Snapped Cable
              </span>
              <span className="text-sm font-bold text-slate-900">BESCOM Hotline: 1912</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center text-sm font-bold">
              🕳️
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                Open Sewers / Drain Collapse
              </span>
              <span className="text-sm font-bold text-slate-900">Control Room: 1533</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center text-sm font-bold">
              🚨
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                Immediate Road Rescue / Ambulance
              </span>
              <span className="text-sm font-bold text-slate-900">National Emergency: 112</span>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilterSeverity('all')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
              filterSeverity === 'all'
                ? 'bg-black text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Emergency Logs ({hazards.length})
          </button>
          <button
            onClick={() => setFilterSeverity('critical')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
              filterSeverity === 'critical'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Critical Threats ({hazards.filter((h) => h.severity === 'critical').length})
          </button>
          <button
            onClick={() => setFilterSeverity('in_progress')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
              filterSeverity === 'in_progress'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Top Meta */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{meta.icon}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          isCritical
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.severity} • Danger Score {item.severity_score}/100
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-slate-500">
                      Ticket #EM-{String(index + 834).padStart(4, '0')}
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-black line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Photo & Address */}
                  <div className="mt-3 flex gap-3">
                    {item.photo_url ? (
                      <div className="w-20 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <img
                          src={item.photo_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-400 shrink-0">
                        No image
                      </div>
                    )}

                    <div className="flex-1 min-w-0 flex flex-col justify-center text-xs text-slate-500 space-y-1">
                      <div className="flex items-center gap-1 truncate font-medium text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span className="truncate">{item.address || 'Address logged'}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>Reported by: {item.reported_by || 'Commuter'}</span>
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
                </div>

                {/* Status & Actions Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    {isFixed ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified Fixed (Photo Audited)</span>
                      </span>
                    ) : isInProgress ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Field Unit Dispatched (ETA 12m)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-red-600 animate-pulse">
                        <Radio className="w-3.5 h-3.5" />
                        <span>Pending Emergency Response</span>
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
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 transition"
                    >
                      <ThumbsUp className="w-3 h-3 text-blue-500" />
                      <span>{item.upvotes_count || 1} Confirmations</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectHazard(item)}
                      className="text-slate-900 font-bold hover:underline flex items-center gap-0.5 text-xs"
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
