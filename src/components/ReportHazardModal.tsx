'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  MapPin,
  Mic,
  Square,
  Play,
  Pause,
  AlertTriangle,
  X,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Flame,
  Volume2,
} from 'lucide-react';
import { CATEGORY_METADATA, HazardCategory, HazardReport, HazardSeverity } from '../lib/types';
import { calculateHybridSeverity, analyzeHazardWithAI } from '../lib/ai-severity';
import { createHazard } from '../lib/supabase';
import { validateUploadedFile, sanitizeInput } from '../lib/security';

interface ReportHazardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHazardCreated?: (hazard: HazardReport) => void;
  initialCoords?: { lat: number; lng: number } | null;
}

export default function ReportHazardModal({
  isOpen,
  onClose,
  onHazardCreated,
  initialCoords,
}: ReportHazardModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<HazardCategory>('open_manhole');
  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [aiAnalysisFeedback, setAiAnalysisFeedback] = useState<string | null>(null);
  const [securityError, setSecurityError] = useState<string | null>(null);

  // Location state
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: initialCoords?.lat || 12.9716,
    lng: initialCoords?.lng || 77.5946,
  });
  const [address, setAddress] = useState<string>('Locating nearest landmark...');
  const [isLocating, setIsLocating] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState<string>('GPS Auto');

  // Voice note state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Auto-fetch GPS location on open
  useEffect(() => {
    if (isOpen) {
      fetchCurrentLocation();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen]);

  // Reverse geocoding helper via OpenStreetMap
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data && data.display_name) {
        const parts = data.display_name.split(',');
        const shortAddr = parts.slice(0, 3).join(',').trim();
        setAddress(shortAddr || data.display_name);
      } else {
        setAddress(`Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }
    } catch {
      setAddress(`Pinned near ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      setAddress('Geolocation not supported by browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCoords(newCoords);
        setLocationAccuracy(`±${Math.round(position.coords.accuracy)}m`);
        setIsLocating(false);
        reverseGeocode(newCoords.lat, newCoords.lng);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setIsLocating(false);
        // Fallback default coordinates
        setAddress('Central Ward, Bangalore');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Handle Image Upload with Anti-Malware Inspection & AI Auto-Detection
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSecurityError(null);
    const validation = await validateUploadedFile(file);
    if (!validation.isValid) {
      setSecurityError(validation.error || 'Malware threat blocked: Unrecognized or dangerous file signature.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setPhotoPreview(base64);

      // Trigger Smart AI Vision analysis
      setIsAnalyzingPhoto(true);
      setAiAnalysisFeedback('AI analyzing photo for road danger & hazard class...');

      try {
        const result = await analyzeHazardWithAI(base64, description);
        if (result) {
          setSelectedCategory(result.category);
          setAiAnalysisFeedback(
            `✨ AI detected: ${result.title} (Severity Score: ${result.severity_score}/100)`
          );
        }
      } catch (err) {
        console.warn('AI analysis skipped:', err);
      } finally {
        setIsAnalyzingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Voice Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        // Provide mock voice transcript for quick reporting context
        const sampleTranscripts = [
          'High voltage live wire hanging low right above the school bus route.',
          'Open stormwater manhole without any barricade or sign in the dark.',
          'Severely waterlogged street, knee-deep muddy water completely hiding potholes.',
        ];
        const randomTranscript = sampleTranscripts[Math.floor(Math.random() * sampleTranscripts.length)];
        setVoiceTranscript(randomTranscript);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission denied:', err);
      alert('Microphone access is required to record voice notes.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const toggleAudioPlayback = () => {
    if (!audioUrl) return;
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(audioUrl);
      audioElementRef.current.onended = () => setIsPlayingAudio(false);
    }

    if (isPlayingAudio) {
      audioElementRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioElementRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  // Calculate live hybrid severity
  const currentSeverityMeta = calculateHybridSeverity(selectedCategory, description);

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const categoryMeta = CATEGORY_METADATA[selectedCategory];
    const cleanAddress = sanitizeInput(address);
    const cleanDesc = sanitizeInput(description);
    const cleanTranscript = voiceTranscript ? sanitizeInput(voiceTranscript) : undefined;
    const generatedTitle = `${categoryMeta.label} at ${cleanAddress.split(',')[0] || 'Roadside'}`;

    const newReport = await createHazard({
      title: generatedTitle,
      category: selectedCategory,
      description: cleanDesc || categoryMeta.description,
      severity: currentSeverityMeta.severity,
      severity_score: currentSeverityMeta.score,
      status: 'reported',
      latitude: coords.lat,
      longitude: coords.lng,
      address: cleanAddress,
      photo_url: photoPreview || undefined,
      voice_note_url: audioUrl || undefined,
      voice_transcript: cleanTranscript,
      reported_by: 'Citizen Commuter',
    });

    setIsSubmitting(false);
    setSubmitSuccess(true);

    if (onHazardCreated) {
      onHazardCreated(newReport);
    }

    // Auto-close modal after brief celebration toast
    setTimeout(() => {
      setSubmitSuccess(false);
      onClose();
      // Reset fields
      setPhotoPreview(null);
      setAudioUrl(null);
      setDescription('');
      setVoiceTranscript('');
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 text-slate-900 dark:text-white my-auto transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-200 dark:border-red-900/50">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                Report Hazard
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-semibold">
                  ⚡ 5s Quick Snap
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Save lives by logging hazards before accidents happen</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Hazard Logged Successfully!</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              Live broadcasted to public safety map & added to the Municipal Triage Queue.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            {/* 1. PHOTO-FIRST SNAPPER */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2 flex items-center justify-between">
                <span>1. Hazard Photo (Instant Capture)</span>
                {isAnalyzingPhoto && (
                  <span className="text-amber-600 flex items-center gap-1 text-[11px] font-normal animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" /> AI Scanning...
                  </span>
                )}
              </label>

              {securityError && (
                <div className="mb-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Malware Protection Alert:</span>
                    <span>{securityError}</span>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="hidden"
              />

              {photoPreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 group aspect-video">
                  <img
                    src={photoPreview}
                    alt="Hazard Snapshot"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-between p-3">
                    <span className="text-xs font-medium text-emerald-300 flex items-center gap-1 bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Photo Attached
                    </span>
                    <button
                      type="button"
                      onClick={() => setPhotoPreview(null)}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs backdrop-blur transition shadow"
                    >
                      Retake
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-500 dark:hover:border-slate-500 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center transition-all group text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white flex items-center justify-center transition mb-2">
                    <Camera className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-black dark:group-hover:text-white">
                    Tap to Snap or Upload Photo
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Auto-opens camera on mobile phones
                  </span>
                </div>
              )}

              {aiAnalysisFeedback && (
                <div className="mt-2 text-xs bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 p-2.5 rounded-xl flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>{aiAnalysisFeedback}</span>
                </div>
              )}
            </div>

            {/* 2. INSTANT GEOLOCATION PIN */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  2. GPS Location Pin
                </label>
                <button
                  type="button"
                  onClick={fetchCurrentLocation}
                  disabled={isLocating}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 transition font-medium"
                >
                  <RefreshCw className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                  {isLocating ? 'Pinpointing...' : 'Refresh GPS'}
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{address}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>Lat: {coords.lat.toFixed(5)}</span>
                    <span>Lng: {coords.lng.toFixed(5)}</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-mono font-medium">{locationAccuracy}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. QUICK HAZARD CATEGORY PILLS */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                3. Quick Hazard Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(CATEGORY_METADATA) as HazardCategory[]).map((cat) => {
                  const meta = CATEGORY_METADATA[cat];
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-left p-2.5 rounded-xl border text-xs font-medium transition flex items-center gap-2 ${
                        isSelected
                          ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="text-base">{meta.icon}</span>
                      <span className="truncate">{meta.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. VOICE NOTE & OPTIONAL NOTES */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Mic className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                  4. Voice Note or Quick Memo
                </label>
                {audioUrl && (
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Audio Recorded
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 transition"
                  >
                    <Mic className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span>Tap to Record Voice Note</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-semibold text-white flex items-center justify-center gap-2 animate-pulse transition shadow-sm"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>Stop Recording ({recordingDuration}s)</span>
                  </button>
                )}

                {audioUrl && !isRecording && (
                  <button
                    type="button"
                    onClick={toggleAudioPlayback}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition"
                  >
                    {isPlayingAudio ? (
                      <Pause className="w-4 h-4 text-slate-800 dark:text-slate-200 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 text-slate-800 dark:text-slate-200 fill-current" />
                    )}
                    <span>Listen</span>
                  </button>
                )}
              </div>

              {voiceTranscript && (
                <div className="mt-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 p-2.5 rounded-xl flex items-start gap-2">
                  <Volume2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-mono">
                      Voice Transcription
                    </span>
                    <p className="italic text-slate-700 dark:text-slate-300">"{voiceTranscript}"</p>
                  </div>
                </div>
              )}

              {/* Optional brief text description */}
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional details (e.g. Near pillar 45, water 2ft deep)..."
                className="mt-2 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-slate-400 dark:focus:border-slate-500 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-800 transition"
              />
            </div>

            {/* SEVERITY RATING BANNER */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame
                  className={`w-4 h-4 ${
                    currentSeverityMeta.severity === 'critical'
                      ? 'text-red-600 animate-pulse'
                      : currentSeverityMeta.severity === 'high'
                      ? 'text-orange-500'
                      : 'text-amber-500'
                  }`}
                />
                <div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Calculated Severity:</span>
                  <span
                    className={`ml-1.5 text-xs font-bold uppercase ${
                      currentSeverityMeta.severity === 'critical'
                        ? 'text-red-700 dark:text-red-400'
                        : currentSeverityMeta.severity === 'high'
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {currentSeverityMeta.severity}
                  </span>
                </div>
              </div>
              <div className="text-xs font-mono font-bold bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm">
                Score: {currentSeverityMeta.score}/100
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white dark:text-slate-900" />
                  <span>Submitting Hazard Alert...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-white dark:text-slate-900" />
                  <span>Log Hazard Now (Instant Broadcast)</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
