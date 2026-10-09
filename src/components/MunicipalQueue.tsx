'use client';

import React, { useState } from 'react';
import { HazardReport, CATEGORY_METADATA } from '../lib/types';
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  Camera,
  MapPin,
  Send,
  AlertOctagon,
  ArrowRight,
  Filter,
  Check,
} from 'lucide-react';
import { updateHazardStatus } from '../lib/supabase';

interface MunicipalQueueProps {
  hazards: HazardReport[];
  onHazardUpdated?: () => void;
}

export default function MunicipalQueue({ hazards, onHazardUpdated }: MunicipalQueueProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'in_progress' | 'verified_fixed'>('pending');
  const [selectedFixHazard, setSelectedFixHazard] = useState<HazardReport | null>(null);
  const [fixPhotoPreview, setFixPhotoPreview] = useState<string | null>(null);
  const [fixNotes, setFixNotes] = useState('');
  const [isSubmittingFix, setIsSubmittingFix] = useState(false);

  // Filter hazards by status
  const filtered = hazards.filter((h) => {
    if (activeTab === 'pending') return h.status === 'reported';
    if (activeTab === 'in_progress') return h.status === 'in_progress';
    if (activeTab === 'verified_fixed') return h.status === 'verified_fixed';
    return true;
  });

  // Action: Dispatch crew
  const handleDispatchCrew = async (hazardId: string) => {
    await updateHazardStatus(hazardId, 'in_progress');
    if (onHazardUpdated) onHazardUpdated();
  };

  // Action: Open fix proof modal
  const handleOpenFixModal = (hazard: HazardReport) => {
    setSelectedFixHazard(hazard);
    setFixPhotoPreview(null);
    setFixNotes('');
  };

  // Handle fix photo input
  const handleFixPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFixPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit fix verification
  const handleSubmitFix = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFixHazard) return;

    setIsSubmittingFix(true);
    await updateHazardStatus(selectedFixHazard.id, 'verified_fixed', {
      fix_photo_url:
        fixPhotoPreview ||
        'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=600&q=80',
      fix_notes: fixNotes || 'Field unit verified and completed emergency repair.',
    });

    setIsSubmittingFix(false);
    setSelectedFixHazard(null);
    if (onHazardUpdated) onHazardUpdated();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold">
              Municipal Response Authority
            </span>
            <span className="text-xs text-zinc-500">Live AI Priority Dispatch</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
            Civic Hazard Triage Queue
          </h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            Real-time ranked municipal queue. Resolved items require photographic before/after proof.
          </p>
        </div>

        {/* STATS PILLS */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-2xl text-center">
            <div className="text-xs text-red-400 font-semibold">Critical</div>
            <div className="text-lg font-bold text-white">
              {hazards.filter((h) => h.severity === 'critical' && h.status !== 'verified_fixed').length}
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-2xl text-center">
            <div className="text-xs text-amber-400 font-semibold">In Progress</div>
            <div className="text-lg font-bold text-white">
              {hazards.filter((h) => h.status === 'in_progress').length}
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-2xl text-center">
            <div className="text-xs text-emerald-400 font-semibold">Verified Fixed</div>
            <div className="text-lg font-bold text-white">
              {hazards.filter((h) => h.status === 'verified_fixed').length}
            </div>
          </div>
        </div>
      </div>

      {/* STATUS TABS */}
      <div className="flex items-center gap-2 mt-6 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-red-600 text-white shadow-lg shadow-red-950/50'
              : 'bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-850'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>Pending Action ({hazards.filter((h) => h.status === 'reported').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('in_progress')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'in_progress'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/50'
              : 'bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-850'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Crew Dispatched ({hazards.filter((h) => h.status === 'in_progress').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('verified_fixed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'verified_fixed'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
              : 'bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-850'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Verified Fixed ({hazards.filter((h) => h.status === 'verified_fixed').length})</span>
        </button>
      </div>

      {/* CARDS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-zinc-500">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500/40 mb-3" />
            <p className="text-base font-semibold text-zinc-300">Queue is Clear for this status</p>
            <p className="text-xs text-zinc-500 mt-1">
              All reported hazards in this category have been addressed.
            </p>
          </div>
        ) : (
          filtered.map((hazard) => {
            const meta = CATEGORY_METADATA[hazard.category] || CATEGORY_METADATA.other;
            return (
              <div
                key={hazard.id}
                className="bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700 rounded-3xl p-5 shadow-xl transition flex flex-col justify-between"
              >
                <div>
                  {/* Card top */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{meta.icon}</span>
                      <div>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${meta.badgeColor}`}
                        >
                          {hazard.severity} • Score: {hazard.severity_score}/100
                        </span>
                        <h3 className="font-bold text-sm text-zinc-100 mt-1 line-clamp-1">
                          {hazard.title}
                        </h3>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-mono text-zinc-500 block">
                        {new Date(hazard.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        👍 {hazard.upvotes_count || 1} Confirmations
                      </span>
                    </div>
                  </div>

                  {/* Photo Preview & Location */}
                  <div className="mt-3 flex gap-3">
                    {hazard.photo_url ? (
                      <div className="w-28 h-24 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0">
                        <img
                          src={hazard.photo_url}
                          alt="Citizen Report"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-28 h-24 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 text-xs shrink-0">
                        No photo
                      </div>
                    )}

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="text-xs text-zinc-300 line-clamp-2">
                        {hazard.description}
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-2 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                        <span className="truncate">{hazard.address || 'Address logged'}</span>
                      </p>
                      {hazard.voice_transcript && (
                        <p className="text-[10px] text-amber-300 italic mt-1 truncate">
                          🎙️ "{hazard.voice_transcript}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Before / After View for Fixed Hazards */}
                  {hazard.status === 'verified_fixed' && (
                    <div className="mt-4 p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Fix Verified by Field Unit</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-zinc-400 block mb-1">Before:</span>
                          <div className="rounded-xl overflow-hidden h-20 bg-zinc-900 border border-zinc-800">
                            <img
                              src={hazard.photo_url}
                              alt="Before"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-400 block mb-1">After Fix:</span>
                          <div className="rounded-xl overflow-hidden h-20 bg-zinc-900 border border-emerald-600/40">
                            <img
                              src={hazard.fix_photo_url || hazard.photo_url}
                              alt="After Fix"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      </div>
                      {hazard.fix_notes && (
                        <p className="text-xs text-zinc-300 italic mt-2">
                          "{hazard.fix_notes}"
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-end gap-2">
                  {hazard.status === 'reported' && (
                    <button
                      onClick={() => handleDispatchCrew(hazard.id)}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Field Crew</span>
                    </button>
                  )}

                  {hazard.status === 'in_progress' && (
                    <button
                      onClick={() => handleOpenFixModal(hazard)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Upload Fix Photo Verification</span>
                    </button>
                  )}

                  {hazard.status === 'verified_fixed' && (
                    <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Resolved & Archival Stored
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FIX PROOF VERIFICATION MODAL */}
      {selectedFixHazard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-white">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-400" />
              Upload Photographic Fix Proof
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Required by civic audit: provide an 'After' photograph showing the repaired manhole, insulated wire, or cleared drain.
            </p>

            <form onSubmit={handleSubmitFix} className="mt-4 space-y-4">
              {/* Photo Input */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  After-Fix Photograph
                </label>
                {fixPhotoPreview ? (
                  <div className="relative rounded-2xl overflow-hidden aspect-video border border-emerald-500/40">
                    <img
                      src={fixPhotoPreview}
                      alt="Fix Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFixPhotoPreview(null)}
                      className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 text-xs text-white"
                    >
                      Change Photo
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer border-2 border-dashed border-zinc-700 hover:border-emerald-500/60 rounded-2xl p-6 flex flex-col items-center justify-center bg-zinc-900/60">
                    <Camera className="w-8 h-8 text-zinc-400 mb-2" />
                    <span className="text-xs text-zinc-300 font-semibold">
                      Take or Select Repaired Photo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFixPhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Maintenance Notes */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Field Maintenance Log / Notes
                </label>
                <textarea
                  value={fixNotes}
                  onChange={(e) => setFixNotes(e.target.value)}
                  placeholder="e.g. Spliced wire re-elevated to 18ft clearance, transformer fuse replaced."
                  rows={3}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedFixHazard(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFix}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify & Close Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
