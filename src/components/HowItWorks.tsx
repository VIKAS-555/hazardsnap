'use client';

import React from 'react';
import { Camera, Navigation, CheckCircle2, ShieldAlert, Cpu, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: '5-Second Photo Log',
      tagline: 'Zero-Friction Citizen Reporting',
      icon: <Camera className="w-6 h-6 text-rose-400" />,
      description:
        'No registration or 15-field forms. A commuter opens camera shutter, speaks a 3-second voice note, and GPS auto-locks the coordinates with sub-meter accuracy.',
      highlight: '98% faster than traditional grievance helplines',
    },
    {
      step: '02',
      title: 'AI Threat Triage & Safe Route',
      tagline: 'Dynamic Danger Avoidance',
      icon: <Navigation className="w-6 h-6 text-amber-400" />,
      description:
        'Gemini Vision AI classifies the threat level. Critical dangers (live wires, open manholes) emit pulsing radar rings on the public map, while the routing engine actively guides commuters around danger zones.',
      highlight: 'Proactive pedestrian & motorist injury prevention',
    },
    {
      step: '03',
      title: 'Photographic Fix Verification',
      tagline: 'Full Civic Accountability',
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />,
      description:
        'Municipal repair units cannot close a priority ticket without uploading an "After-Fix" photo and maintenance log, establishing an immutable public before/after audit trail.',
      highlight: 'Eliminates fake ticket closures completely',
    },
  ];

  return (
    <section className="border-b border-white/[0.08] bg-[#070B12] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-rose-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Civic Loop Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              How HazardSnap Closes the Governance Gap
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm">
            Bridging citizen road observations directly into municipal field action with verifiable photo proof.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {steps.map((item) => (
            <div
              key={item.step}
              className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.14] transition relative group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="text-2xl font-black text-slate-600 group-hover:text-slate-400 transition font-mono">
                    {item.step}
                  </span>
                </div>

                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  {item.tagline}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                <span className="text-slate-300 font-medium">{item.highlight}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
