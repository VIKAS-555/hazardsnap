'use client';

import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, Github, PhoneCall, Phone, Copy, Check, X } from 'lucide-react';

interface HotlineModalData {
  title: string;
  number: string;
  description: string;
}

export default function Footer() {
  const [activeHotline, setActiveHotline] = useState<HotlineModalData | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = (num: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(num);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="border-t border-white/[0.08] bg-[#060910] py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-400 transition-colors">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
          {/* Logo & Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-rose-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full bg-[#080C14] rounded-[10px] flex items-center justify-center">
                  <AlertTriangle className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <span className="text-base font-bold text-white tracking-tight">HazardSnap</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.08] text-slate-300 border border-white/10">
                Civic Pulse v2.0
              </span>
            </div>
            <p className="text-slate-400 max-w-sm">
              Hyper-local civic hazard intelligence & rapid response grid. Built for civic safety hackathons.
            </p>
          </div>

          {/* Emergency Hotlines */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() =>
                setActiveHotline({
                  title: 'Live Wires / BESCOM',
                  number: '1912',
                  description: '24/7 Electricity Board helpline for snapped power cables and live sparking hazards.',
                })
              }
              className="p-3 rounded-2xl bg-[#0D131F]/90 border border-white/[0.08] hover:border-rose-500/40 hover:bg-rose-500/[0.04] active:scale-[0.98] transition shadow-sm flex items-center gap-2.5 text-left group cursor-pointer"
              title="Click to Call or Copy 1912"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center group-hover:scale-105 transition">
                <PhoneCall className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-mono group-hover:text-rose-400 transition">
                  Live Wires / BESCOM
                </span>
                <span className="text-xs font-bold text-slate-200 group-hover:text-white transition">
                  Dial 1912
                </span>
              </div>
            </button>

            <button
              onClick={() =>
                setActiveHotline({
                  title: 'Municipal Helpline',
                  number: '1533',
                  description: 'City Municipal Corporation emergency control room for open manholes and flood drainage.',
                })
              }
              className="p-3 rounded-2xl bg-[#0D131F]/90 border border-white/[0.08] hover:border-indigo-500/40 hover:bg-indigo-500/[0.04] active:scale-[0.98] transition shadow-sm flex items-center gap-2.5 text-left group cursor-pointer"
              title="Click to Call or Copy 1533"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:scale-105 transition">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-mono group-hover:text-indigo-400 transition">
                  Municipal Helpline
                </span>
                <span className="text-xs font-bold text-slate-200 group-hover:text-white transition">
                  Dial 1533
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Bottom Credits & Repo */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} HazardSnap Civic Grid. Released under MIT License for Public Safety.
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/VIKAS-555/hazardsnap"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition font-medium"
            >
              <Github className="w-3.5 h-3.5" />
              <span>VIKAS-555/hazardsnap</span>
            </a>
          </div>
        </div>
      </div>

      {/* CALL / COPY INTERACTIVE MODAL */}
      {activeHotline && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => {
            setActiveHotline(null);
            setCopied(false);
          }}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl bg-[#0B0F19] border border-white/10 p-6 shadow-2xl text-center space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setActiveHotline(null);
                setCopied(false);
              }}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-rose-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center text-rose-400 shadow-inner">
              <PhoneCall className="w-7 h-7" />
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                {activeHotline.title}
              </span>
              <div className="text-3xl font-extrabold text-white tracking-tight mt-1 font-mono">
                {activeHotline.number}
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {activeHotline.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                href={`tel:${activeHotline.number}`}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition active:scale-95"
              >
                <Phone className="w-4 h-4" />
                <span>Call Now</span>
              </a>

              <button
                onClick={() => handleCopy(activeHotline.number)}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-sm transition active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-300" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <button
              onClick={() => {
                setActiveHotline(null);
                setCopied(false);
              }}
              className="w-full py-2 text-xs text-slate-400 hover:text-white transition font-semibold"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}
