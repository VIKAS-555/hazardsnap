'use client';

import React from 'react';
import { AlertTriangle, ShieldCheck, Heart, Github, ExternalLink, PhoneCall } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#06090F] py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.06]">
          {/* Logo & Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span className="text-base font-extrabold text-white tracking-tight">HazardSnap</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.08]">
                Civic Pulse v2.0
              </span>
            </div>
            <p className="text-slate-400 max-w-sm">
              Hyper-local civic hazard intelligence & rapid response grid. Built for civic safety hackathons.
            </p>
          </div>

          {/* Emergency Hotlines */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-2.5">
              <PhoneCall className="w-4 h-4 text-rose-400" />
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Live Wires / Power (BESCOM)</span>
                <span className="text-xs font-bold text-white">Dial 1912</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Municipal 24/7 Helpline</span>
                <span className="text-xs font-bold text-white">Dial 1533</span>
              </div>
            </div>
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
    </footer>
  );
}
