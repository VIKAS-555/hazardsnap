'use client';

import React from 'react';
import { AlertTriangle, ShieldCheck, Github, PhoneCall } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          {/* Logo & Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <span className="text-base font-bold text-slate-900 tracking-tight">HazardSnap</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                Civic Pulse v2.0
              </span>
            </div>
            <p className="text-slate-600 max-w-sm">
              Hyper-local civic hazard intelligence & rapid response grid. Built for civic safety hackathons.
            </p>
          </div>

          {/* Emergency Hotlines */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-2.5">
              <PhoneCall className="w-4 h-4 text-red-600" />
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Live Wires / BESCOM</span>
                <span className="text-xs font-bold text-slate-900">Dial 1912</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-slate-700" />
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Municipal Helpline</span>
                <span className="text-xs font-bold text-slate-900">Dial 1533</span>
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
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition font-medium"
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
